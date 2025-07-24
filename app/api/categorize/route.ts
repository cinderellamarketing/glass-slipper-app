import { NextResponse } from 'next/server';

// TypeScript interfaces
interface Contact {
  id: number;
  name: string;
  company: string;
  position: string;
  email: string;
  category?: string;
  isEnriched?: boolean;
  phone?: string;
  website?: string;
  lastName?: string;
  industry?: string;
}

interface UserProfile {
  targetMarket: string;
  referralPartners: string;
  businessType: string;
  company: string;
}

interface CategoryResult {
  id: number;
  category: string;
  categoryReason: string;
}

// Main API endpoint for company-aware contact categorization
export async function POST(request: Request) {
  try {
    console.log('🔍 CATEGORIZE API: Starting company-aware contact categorization...');
    
    const { contacts, userProfile } = await request.json();
    
    // Validate inputs
    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      console.log('❌ CATEGORIZE API: No enriched contacts provided');
      return NextResponse.json({ 
        success: false, 
        error: 'No enriched contacts provided for categorization' 
      }, { status: 400 });
    }

    if (!userProfile || !userProfile.targetMarket || !userProfile.referralPartners) {
      console.log('❌ CATEGORIZE API: Incomplete user profile');
      return NextResponse.json({ 
        success: false, 
        error: 'Complete user profile (Target Market and Referral Partners) required for categorization' 
      }, { status: 400 });
    }

    console.log(`🔍 CATEGORIZE API: Processing ${contacts.length} contacts for company-aware categorization`);
    console.log(`🔍 CATEGORIZE API: User profile:`, {
      targetMarket: userProfile.targetMarket,
      businessType: userProfile.businessType,
      referralPartners: userProfile.referralPartners
    });

    // Analyze company distribution for logging
    const companiesMap = new Map<string, Contact[]>();
    contacts.forEach(contact => {
      const company = contact.company.toLowerCase().trim();
      if (!companiesMap.has(company)) {
        companiesMap.set(company, []);
      }
      companiesMap.get(company)!.push(contact);
    });

    console.log(`🔍 CATEGORIZE API: Company analysis: ${companiesMap.size} unique companies`);
    console.log(`🔍 CATEGORIZE API: Companies with multiple contacts:`, 
      Array.from(companiesMap.entries())
        .filter(([, contacts]) => contacts.length > 1)
        .map(([company, contacts]) => `${company} (${contacts.length} contacts)`)
    );

    const categorizedContacts: CategoryResult[] = [];
    
    // Process contacts in batches to avoid overwhelming Claude API
    const batchSize = 5;
    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize);
      console.log(`🔍 CATEGORIZE API: Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(contacts.length/batchSize)} with company-aware logic`);
      
      try {
        const batchPrompt = createBatchCategorizationPrompt(batch, userProfile);
        const claudeResponse = await performClaudeAnalysis(batchPrompt);
        const batchResults = parseBatchCategoryResponse(claudeResponse, batch);
        
        categorizedContacts.push(...batchResults);
        
        // Rate limiting between batches
        if (i + batchSize < contacts.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (batchError) {
        console.error(`❌ CATEGORIZE API: Batch ${Math.floor(i/batchSize) + 1} failed:`, batchError);
        
        // Fallback: categorize individually if batch fails
        for (const contact of batch) {
          try {
            const individualPrompt = createIndividualCategorizationPrompt(contact, userProfile);
            const individualResponse = await performClaudeAnalysis(individualPrompt);
            const individualResult = parseIndividualCategoryResponse(individualResponse, contact);
            categorizedContacts.push(individualResult);
            
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (individualError) {
            console.error(`❌ CATEGORIZE API: Individual categorization failed for ${contact.name}:`, individualError);
            
            // Ultimate fallback
            categorizedContacts.push({
              id: contact.id,
              category: 'Other',
              categoryReason: 'Categorization failed - manual review needed'
            });
          }
        }
      }
    }

    // Log categorization results
    const categoryStats = categorizedContacts.reduce((stats, contact) => {
      stats[contact.category] = (stats[contact.category] || 0) + 1;
      return stats;
    }, {} as Record<string, number>);

    console.log(`✅ CATEGORIZE API: Successfully categorized ${categorizedContacts.length} contacts`);
    console.log(`🔍 CATEGORIZE API: Results breakdown:`, categoryStats);

    return NextResponse.json({
      success: true,
      contacts: categorizedContacts
    });
    
  } catch (error) {
    console.error('❌ CATEGORIZE API: Categorization process failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({
      success: false,
      error: 'Contact categorization failed',
      details: errorMessage
    }, { status: 500 });
  }
}

// Create batch categorization prompt for multiple contacts with company-aware logic
function createBatchCategorizationPrompt(contacts: Contact[], userProfile: UserProfile): string {
  // Group contacts by company for company-aware categorization
  const companiesMap = new Map<string, Contact[]>();
  contacts.forEach(contact => {
    const company = contact.company.toLowerCase().trim();
    if (!companiesMap.has(company)) {
      companiesMap.set(company, []);
    }
    companiesMap.get(company)!.push(contact);
  });

  const companiesAnalysis = Array.from(companiesMap.entries()).map(([company, contactsInCompany]) => 
    `Company: ${contactsInCompany[0].company}\nContacts:\n${contactsInCompany.map((c, idx) => 
      `  ${idx + 1}. ${c.name} (${c.position}) - Industry: ${c.industry || 'Unknown'}`
    ).join('\n')}`
  ).join('\n\n');

  // Create a lookup list for response matching
  const contactsList = contacts.map((contact, index) => 
    `${index + 1}. ${contact.name} - ${contact.company} - ${contact.position} - Industry: ${contact.industry || 'Unknown'}`
  ).join('\n');

  return `
Categorize these contacts using company-aware logic:

USER BUSINESS PROFILE:
- Business Type: ${userProfile.businessType}
- Company: ${userProfile.company}
- Target Market: ${userProfile.targetMarket}
- Referral Partners: ${userProfile.referralPartners}

CONTACTS GROUPED BY COMPANY:
${companiesAnalysis}

FULL CONTACT LIST FOR REFERENCE:
${contactsList}

CATEGORIZATION RULES:
1. **Ideal Client**: Decision makers/buyers in companies that match target market (${userProfile.targetMarket})
   - Look for roles like: CEO, Managing Director, Founder, Director, VP, C-Suite executives
   - Must be in companies that fit the target market profile
   - These are the people who make purchasing decisions

2. **Champions**: People in target market companies who could influence decision makers
   - In companies that match the target market (${userProfile.targetMarket})
   - NOT decision makers themselves, but people who could influence them
   - Examples: Head of Operations, Senior Managers, Department Heads, Team Leaders
   - IMPORTANT: They qualify as Champions simply by being in a target market company, regardless of whether we have the actual decision maker in our database

3. **Referral Partners**: External people who match referral partner types (${userProfile.referralPartners})
   - People who could refer business to you
   - NOT in target market companies (those would be Champions or Ideal Clients)
   - Must match the referral partner profile described

4. **Competitors**: Companies/people similar to user's business (${userProfile.businessType})
   - Direct competitors or similar service providers

5. **Other**: Everything else that doesn't fit the above categories

PROCESS:
1. First identify companies that match the target market
2. Within target market companies: categorize decision makers as Ideal Client, others as Champions
3. Outside target market companies: apply Referral Partners, Competitors, or Other rules

Respond with ONLY this JSON format:
{
  "categorizations": [
    {
      "contactNumber": 1,
      "category": "Ideal Client|Champions|Referral Partners|Competitors|Other",
      "reason": "detailed explanation including company analysis (e.g., 'Champion in target market company - could influence decision makers')"
    },
    {
      "contactNumber": 2,
      "category": "Ideal Client|Champions|Referral Partners|Competitors|Other", 
      "reason": "detailed explanation including company analysis"
    }
  ]
}`;
}

// Create individual categorization prompt for single contact
function createIndividualCategorizationPrompt(contact: Contact, userProfile: UserProfile): string {
  return `
Categorize this contact based on the user's business profile:

USER BUSINESS PROFILE:
- Business Type: ${userProfile.businessType}
- Company: ${userProfile.company}
- Target Market: ${userProfile.targetMarket}
- Referral Partners: ${userProfile.referralPartners}

CONTACT TO CATEGORIZE:
- Name: ${contact.name}
- Company: ${contact.company}  
- Position: ${contact.position}
- Industry: ${contact.industry || 'Unknown'}

CATEGORIZATION RULES:
1. **Ideal Client**: Decision makers/buyers in companies that match target market (${userProfile.targetMarket})
   - Look for roles like: CEO, Managing Director, Founder, Director, VP, C-Suite executives
   - Must be in companies that fit the target market profile
   - These are the people who make purchasing decisions

2. **Champions**: People in target market companies who could influence decision makers
   - In companies that match the target market (${userProfile.targetMarket})
   - NOT decision makers themselves, but people who could influence them
   - Examples: Head of Operations, Senior Managers, Department Heads, Team Leaders
   - IMPORTANT: They qualify as Champions simply by being in a target market company, regardless of whether we have the actual decision maker in our database

3. **Referral Partners**: External people who match referral partner types (${userProfile.referralPartners})
   - People who could refer business to you
   - NOT in target market companies (those would be Champions or Ideal Clients)
   - Must match the referral partner profile described

4. **Competitors**: Companies/people similar to user's business (${userProfile.businessType})
   - Direct competitors or similar service providers

5. **Other**: Everything else that doesn't fit the above categories

ANALYSIS PROCESS:
1. First determine if their company matches the target market
2. If YES and they're a decision maker → Ideal Client
3. If YES and they're not a decision maker → Champions
4. If NO, apply other categorization rules

Respond with ONLY this JSON format:
{
  "category": "Ideal Client|Champions|Referral Partners|Competitors|Other",
  "reason": "detailed explanation including company analysis (e.g., 'Champion in target market company - could influence decision makers')"
}`;
}

// Perform Claude analysis
async function performClaudeAnalysis(prompt: string): Promise<string> {
  try {
    console.log('🔍 CLAUDE CATEGORIZE: Making Claude API call...');
    
    if (!process.env.CLAUDE_API_KEY) {
      console.log('❌ CLAUDE CATEGORIZE: API key not found in environment');
      throw new Error('CLAUDE_API_KEY not configured');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // Using Haiku for faster categorization
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    console.log('🔍 CLAUDE CATEGORIZE: Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ CLAUDE CATEGORIZE: Error response:', errorText);
      throw new Error(`Claude API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ CLAUDE CATEGORIZE: Analysis successful');
    return data.content[0].text;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown Claude error';
    console.error('❌ CLAUDE CATEGORIZE: API failed:', errorMessage);
    throw error;
  }
}

// Parse batch categorization response
function parseBatchCategoryResponse(claudeResponse: string, contacts: Contact[]): CategoryResult[] {
  try {
    console.log('🔍 PARSE BATCH: Processing Claude batch response...');
    
    // Extract JSON from Claude's response
    const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log('❌ PARSE BATCH: No JSON found in Claude response');
      throw new Error('No JSON found in Claude response');
    }

    const jsonString = jsonMatch[0];
    const parsed = JSON.parse(jsonString);
    
    if (!parsed.categorizations || !Array.isArray(parsed.categorizations)) {
      throw new Error('Invalid categorization format');
    }

    const results: CategoryResult[] = [];
    
    parsed.categorizations.forEach((cat: any, index: number) => {
      if (index < contacts.length) {
        results.push({
          id: contacts[index].id,
          category: cat.category || 'Other',
          categoryReason: cat.reason || 'No reason provided'
        });
      }
    });

    console.log(`✅ PARSE BATCH: Successfully parsed ${results.length} categorizations`);
    return results;
    
  } catch (error) {
    console.error('❌ PARSE BATCH: Failed to parse batch response:', error);
    
    // Fallback: return 'Other' for all contacts
    return contacts.map(contact => ({
      id: contact.id,
      category: 'Other',
      categoryReason: 'Parsing failed - manual review needed'
    }));
  }
}

// Parse individual categorization response
function parseIndividualCategoryResponse(claudeResponse: string, contact: Contact): CategoryResult {
  try {
    console.log(`🔍 PARSE INDIVIDUAL: Processing Claude response for ${contact.name}...`);
    
    // Extract JSON from Claude's response
    const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log(`❌ PARSE INDIVIDUAL: No JSON found in Claude response for ${contact.name}`);
      throw new Error('No JSON found in Claude response');
    }

    const jsonString = jsonMatch[0];
    const parsed = JSON.parse(jsonString);
    
    console.log(`✅ PARSE INDIVIDUAL: Successfully parsed categorization for ${contact.name}`);
    
    return {
      id: contact.id,
      category: parsed.category || 'Other',
      categoryReason: parsed.reason || 'No reason provided'
    };
    
  } catch (error) {
    console.error(`❌ PARSE INDIVIDUAL: Failed to parse response for ${contact.name}:`, error);
    
    // Fallback
    return {
      id: contact.id,
      category: 'Other',
      categoryReason: 'Parsing failed - manual review needed'
    };
  }
}