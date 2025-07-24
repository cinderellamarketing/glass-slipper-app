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

interface SearchResult {
  title?: string;
  link?: string;
  snippet?: string;
}

interface SearchResponse {
  organic?: SearchResult[];
}

interface WebsiteCandidate {
  url: string;
  score: number;
}

// Main API endpoint
export async function POST(request: Request) {
  try {
    console.log('🔍 API: Starting enrichment process...');
    
    const { contacts, userProfile } = await request.json();
    
    if (!contacts || !Array.isArray(contacts)) {
      console.log('❌ API: Invalid contacts data provided');
      return NextResponse.json({ 
        success: false,
        error: 'Invalid contacts data' 
      }, { status: 400 });
    }

    if (!userProfile) {
      console.log('❌ API: User profile required for categorisation');
      return NextResponse.json({ 
        success: false,
        error: 'User profile required for categorisation' 
      }, { status: 400 });
    }

    console.log(`🔍 API: Processing ${contacts.length} contacts with user profile:`, {
      targetMarket: userProfile.targetMarket,
      businessType: userProfile.businessType,
      referralPartners: userProfile.referralPartners
    });

    const enrichedContacts: Contact[] = [];

    for (const contact of contacts) {
      try {
        console.log(`🔍 API: Starting enrichment for ${contact.name} at ${contact.company}`);
        
        // Extract last name from full name
        const nameParts = contact.name.split(' ');
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
        console.log(`🔍 API: Name parsing:`, {
          fullName: contact.name,
          nameParts: nameParts,
          extractedLastName: lastName
        });
        
        // STAGE 3: Enhanced search query for better website detection
        const searchQuery = `"${contact.company}" official website contact information business phone`;
        console.log('🔍 API: Search query prepared:', searchQuery);

        // Perform web search
        console.log('🔍 API: Starting web search...');
        const searchStartTime = Date.now();
        const searchResults = await performWebSearch(searchQuery);
        const searchDuration = Date.now() - searchStartTime;
        
        const resultCount = searchResults.organic ? searchResults.organic.length : 0;
        console.log('🔍 API: Web search completed:', { 
          resultCount,
          duration: `${searchDuration}ms`,
          hasOrganic: !!searchResults.organic
        });

        // Log first result for debugging
        if (searchResults.organic && searchResults.organic.length > 0) {
          const firstResult = searchResults.organic[0];
          console.log('🔍 API: First search result analysis:', {
            title: firstResult.title || 'No title',
            link: firstResult.link || 'No link',
            domain: firstResult.link ? new URL(firstResult.link).hostname : 'No domain',
            snippetLength: (firstResult.snippet || '').length,
            hasAllFields: !!(firstResult.title && firstResult.link && firstResult.snippet)
          });
        } else {
          console.log('⚠️ API: No search results found - enrichment will use fallbacks');
        }

        // STAGE 3: Extract potential websites from search results
        console.log('🔍 API: Starting website extraction...');
        const extractedWebsites = extractWebsitesFromSearchResults(searchResults, contact.company);
        console.log('🔍 API: Website extraction completed:', {
          extractedCount: extractedWebsites.length,
          websites: extractedWebsites
        });

        // STAGE 3: Enhanced Claude prompt with website detection instructions
        console.log('🔍 API: Preparing Claude analysis prompt...');
        const analysisPrompt = createAnalysisPrompt(contact.company, searchResults, extractedWebsites, userProfile);
        console.log('🔍 API: Claude prompt prepared, length:', analysisPrompt.length);
        
        console.log('🔍 API: Starting Claude analysis...');
        const claudeStartTime = Date.now();
        const enrichmentData = await performClaudeAnalysis(analysisPrompt);
        const claudeDuration = Date.now() - claudeStartTime;
        
        console.log('🔍 API: Claude analysis completed:', {
          duration: `${claudeDuration}ms`,
          responseLength: enrichmentData.length,
          preview: enrichmentData.substring(0, 100) + '...'
        });
        
        // Parse Claude's response with error handling
        console.log('🔍 API: Parsing Claude response...');
        const parsedData = parseClaudeResponse(enrichmentData, extractedWebsites, contact.name);
        console.log('🔍 API: Claude response parsed:', {
          website: parsedData.website,
          phone: parsedData.phone,
          industry: parsedData.industry,
          category: parsedData.category,
          categoryReason: parsedData.categoryReason
        });

        // STAGE 3: Post-process website URL
        console.log('🔍 API: Validating and improving website URL...');
        const finalWebsite = validateAndImproveWebsiteURL(parsedData.website, extractedWebsites, contact.company);
        console.log('🔍 API: Website validation completed:', {
          original: parsedData.website,
          final: finalWebsite,
          wasImproved: finalWebsite !== parsedData.website
        });

        // INDUSTRY FIX: Analyze contact position if company search didn't find industry
        console.log('🔍 API: Analyzing industry from position...');
        const finalIndustry = analyzeIndustryFromPosition(parsedData.industry, contact.position, contact.company);
        console.log('🔍 API: Industry analysis completed:', {
          original: parsedData.industry,
          final: finalIndustry,
          wasAnalyzed: finalIndustry !== parsedData.industry,
          analysisSource: finalIndustry !== parsedData.industry ? 'position-analysis' : 'company-search'
        });

        // STAGE 2: Create enriched contact with explicit data preservation
        const enrichedContact: Contact = {
          // Preserve ALL original data
          id: contact.id,
          name: contact.name,
          company: contact.company,
          position: contact.position,
          email: contact.email, // STAGE 2: Always preserve original email
          category: parsedData.category || contact.category || 'Other', // Use Claude's decision
          // Add enriched data
          lastName: lastName || undefined,
          isEnriched: true,
          phone: parsedData.phone || 'Not found',
          website: finalWebsite,
          industry: finalIndustry
        };

        console.log(`✅ API: Successfully enriched ${contact.name} with data:`, {
          lastName: enrichedContact.lastName,
          phone: enrichedContact.phone,
          website: enrichedContact.website,
          industry: enrichedContact.industry,
          category: enrichedContact.category,
          categoryReason: parsedData.categoryReason,
          industrySource: finalIndustry !== parsedData.industry ? 'position-analysis' : 'company-search',
          originalEmailPreserved: enrichedContact.email === contact.email
        });

        enrichedContacts.push(enrichedContact);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (contactError) {
        const errorMessage = contactError instanceof Error ? contactError.message : 'Unknown contact error';
        console.error(`❌ API: Failed to enrich ${contact.name}:`, errorMessage);
        
        // Create fallback enriched contact
        const nameParts = contact.name.split(' ');
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
        
        const failedContact: Contact = {
          id: contact.id,
          name: contact.name,
          company: contact.company,
          position: contact.position,
          email: contact.email, // STAGE 2: Always preserve original email
          category: contact.category || 'Other',
          lastName: lastName || undefined,
          isEnriched: true,
          phone: 'Search failed',
          website: 'Search failed',
          industry: analyzeIndustryFromPosition('Search failed', contact.position, contact.company)
        };

        enrichedContacts.push(failedContact);
      }
    }

    console.log(`✅ API: Enrichment complete. Returning ${enrichedContacts.length} contacts`);
    
    return NextResponse.json({ 
      success: true,
      contacts: enrichedContacts 
    });

  } catch (error) {
    console.error('❌ API: Enrichment process failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({
      success: false,
      error: 'Enrichment failed',
      details: errorMessage
    }, { status: 500 });
  }
}

// Perform web search using Serper API
async function performWebSearch(query: string): Promise<SearchResponse> {
  try {
    console.log('🔍 SERPER: Starting search for query:', query);
    
    if (!process.env.SERPER_API_KEY) {
      console.log('❌ SERPER: API key not found in environment');
      throw new Error('SERPER_API_KEY not configured');
    }

    console.log('🔍 SERPER: Using API key:', process.env.SERPER_API_KEY.substring(0, 8) + '...');
    
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: query,
        num: 10
      })
    });

    console.log('🔍 SERPER: Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ SERPER: Error response:', errorText);
      throw new Error(`Serper API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const resultCount = data.organic ? data.organic.length : 0;
    console.log('✅ SERPER: Search successful, results:', resultCount);
    
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown search error';
    console.error('❌ SERPER: Search failed for query:', query, errorMessage);
    throw error;
  }
}

// Enhanced Claude prompt with categorisation logic
function createAnalysisPrompt(companyName: string, searchResults: SearchResponse, extractedWebsites: string[], userProfile: UserProfile): string {
  const searchText = searchResults.organic?.slice(0, 3).map(result => 
    `Title: ${result.title || 'N/A'}\nURL: ${result.link || 'N/A'}\nSnippet: ${result.snippet || 'N/A'}`
  ).join('\n---\n') || 'No search results available';

  return `
Analyze this company and provide enrichment data AND categorization:

COMPANY: ${companyName}

SEARCH RESULTS:
${searchText}

EXTRACTED POTENTIAL WEBSITES: ${extractedWebsites.length > 0 ? extractedWebsites.join(', ') : 'None found'}

USER PROFILE:
- Target Market: ${userProfile.targetMarket}
- Business Type: ${userProfile.businessType}  
- User Company: ${userProfile.company}
- Referral Partners: ${userProfile.referralPartners}

CATEGORISATION RULES:
- Ideal Client: Companies that match the user's target market (${userProfile.targetMarket})
- Referral Partners: Companies that match referral partner types (${userProfile.referralPartners})
- Champions: Companies that could refer clients to the user but aren't direct referral partners
- Competitors: Companies similar to user's business type (${userProfile.businessType})
- Other: Everything else that doesn't fit the above categories

INSTRUCTIONS:
1. Extract phone number from search results (UK format preferred)
2. Find the main company website (clean URL, remove paths like /contact or /about)
3. Determine the company's industry based on what they do
4. Categorize the company according to the rules above
5. Provide a brief reason for your categorisation choice

Respond with ONLY this JSON format (no additional text):
{
  "phone": "phone number or 'Not found'",
  "website": "clean main website URL or 'Not found'",
  "industry": "specific industry name",
  "category": "Ideal Client|Referral Partners|Champions|Competitors|Other",
  "categoryReason": "brief explanation for categorisation choice"
}`;
}

// Perform Claude analysis
async function performClaudeAnalysis(prompt: string): Promise<string> {
  try {
    console.log('🔍 CLAUDE: Making Claude API call...');
    
    if (!process.env.CLAUDE_API_KEY) {
      console.log('❌ CLAUDE: API key not found in environment');
      throw new Error('CLAUDE_API_KEY not configured');
    }

    console.log('🔍 CLAUDE: Using API key:', process.env.CLAUDE_API_KEY.substring(0, 8) + '...');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    console.log('🔍 CLAUDE: Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ CLAUDE: Error response:', errorText);
      throw new Error(`Claude API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ CLAUDE: Analysis successful');
    return data.content[0].text;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown Claude error';
    console.error('❌ CLAUDE: API failed:', errorMessage);
    throw error;
  }
}

// Parse Claude's response with category support
function parseClaudeResponse(claudeResponse: string, extractedWebsites: string[], contactName: string): any {
  try {
    console.log(`🔍 PARSE: Processing Claude response for ${contactName}:`, claudeResponse.substring(0, 200) + '...');
    
    // Extract JSON from Claude's response
    const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log(`❌ PARSE: No JSON found in Claude response for ${contactName}`);
      throw new Error('No JSON found in Claude response');
    }

    const jsonString = jsonMatch[0];
    console.log(`🔍 PARSE: Extracted JSON string:`, jsonString);
    
    const parsed = JSON.parse(jsonString);
    console.log(`🔍 PARSE: Successfully parsed JSON for ${contactName}:`, parsed);
    
    return {
      phone: parsed.phone || 'Not found',
      website: parsed.website || 'Not found',
      industry: parsed.industry || 'Not found',
      category: parsed.category || 'Other',
      categoryReason: parsed.categoryReason || 'No reason provided'
    };
  } catch (error) {
    console.error(`❌ PARSE: Failed to parse Claude response for ${contactName}:`, error);
    console.error(`❌ PARSE: Raw response was:`, claudeResponse);
    
    return {
      phone: 'Parsing failed',
      website: extractedWebsites.length > 0 ? extractedWebsites[0] : 'Parsing failed',
      industry: 'Parsing failed',
      category: 'Other',
      categoryReason: 'Failed to parse Claude response'
    };
  }
}

// STAGE 3: Extract potential websites from search results
function extractWebsitesFromSearchResults(searchResults: SearchResponse, companyName: string): string[] {
  if (!searchResults.organic || searchResults.organic.length === 0) {
    return [];
  }

  const companyNameWords = companyName.toLowerCase().split(' ').filter(word => word.length > 2);
  const websites: WebsiteCandidate[] = [];

  for (const result of searchResults.organic) {
    if (!result.link) continue;

    try {
      const url = new URL(result.link);
      const domain = url.hostname.toLowerCase();
      
      // Skip non-company domains
      const skipDomains = [
        'linkedin.com', 'facebook.com', 'twitter.com', 'instagram.com',
        'youtube.com', 'google.com', 'wikipedia.org', 'bloomberg.com',
        'crunchbase.com', 'glassdoor.com', 'indeed.com', 'companieshouse.gov.uk',
        'endole.co.uk', 'dnb.com', 'reuters.com', 'bbc.co.uk'
      ];
      
      if (skipDomains.some(skip => domain.includes(skip))) {
        continue;
      }
      
      // Calculate relevance score
      let score = 0;
      
      // Domain contains company name words
      companyNameWords.forEach(word => {
        if (domain.includes(word)) {
          score += 10;
        }
      });
      
      // Prefer common TLDs
      if (domain.endsWith('.com') || domain.endsWith('.co.uk')) {
        score += 5;
      }
      
      // Prefer shorter domains (likely main company domain)
      if (domain.split('.').length <= 3) {
        score += 3;
      }
      
      // Boost if it's a homepage
      if (url.pathname === '/' || url.pathname === '') {
        score += 5;
      }
      
      websites.push({
        url: `https://${domain}`,
        score
      });
      
    } catch (urlError) {
      // Skip invalid URLs
      continue;
    }
  }

  // Sort by score and return top URLs
  return websites
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(w => w.url);
}

// STAGE 3: Validate and improve website URL
function validateAndImproveWebsiteURL(claudeWebsite: string, extractedWebsites: string[], companyName: string): string {
  // If Claude didn't find a website, use extracted ones
  if (!claudeWebsite || claudeWebsite === 'Not found' || claudeWebsite === 'Parsing failed') {
    return extractedWebsites.length > 0 ? extractedWebsites[0] : 'Not found';
  }

  try {
    // Clean up Claude's website URL
    let cleanedUrl = claudeWebsite.trim();
    
    // Add protocol if missing
    if (!cleanedUrl.startsWith('http')) {
      cleanedUrl = 'https://' + cleanedUrl;
    }
    
    const url = new URL(cleanedUrl);
    
    // Remove paths, keep only domain
    const cleanDomain = `https://${url.hostname}`;
    
    console.log('🔍 WEBSITE: URL validation:', {
      original: claudeWebsite,
      cleaned: cleanDomain
    });
    
    return cleanDomain;
    
  } catch (error) {
    console.log('❌ WEBSITE: Invalid URL from Claude, using extracted websites');
    return extractedWebsites.length > 0 ? extractedWebsites[0] : 'Not found';
  }
}

// INDUSTRY FIX: Analyze industry from contact position and company
function analyzeIndustryFromPosition(currentIndustry: string, position: string, company: string): string {
  // If we already have a valid industry from company search, use it
  if (currentIndustry && currentIndustry !== 'Not found' && currentIndustry !== 'Search failed' && currentIndustry !== 'Parsing failed') {
    return currentIndustry;
  }

  console.log('🔍 INDUSTRY: Analyzing position for industry:', { position, company });

  const pos = position.toLowerCase();
  const comp = company.toLowerCase();

  // Financial Services
  if (pos.includes('wealth manager') || pos.includes('financial advisor') || pos.includes('investment') || 
      pos.includes('portfolio manager') || pos.includes('private banker') || pos.includes('fund manager') ||
      comp.includes('wealth') || comp.includes('investment') || comp.includes('financial') || comp.includes('asset management')) {
    console.log('✅ INDUSTRY: Mapped to Financial Services');
    return 'Financial Services';
  }

  // Technology
  if (pos.includes('developer') || pos.includes('engineer') || pos.includes('programmer') || pos.includes('tech') ||
      pos.includes('software') || pos.includes('data scientist') || pos.includes('devops') || pos.includes('architect') ||
      comp.includes('tech') || comp.includes('software') || comp.includes('digital') || comp.includes('data')) {
    console.log('✅ INDUSTRY: Mapped to Technology');
    return 'Technology';
  }

  // Marketing & Advertising
  if (pos.includes('marketing') || pos.includes('brand') || pos.includes('advertising') || pos.includes('social media') ||
      pos.includes('content') || pos.includes('digital marketing') || pos.includes('seo') || pos.includes('ppc') ||
      comp.includes('marketing') || comp.includes('advertising') || comp.includes('agency') || comp.includes('creative')) {
    console.log('✅ INDUSTRY: Mapped to Marketing & Advertising');
    return 'Marketing & Advertising';
  }

  // Healthcare
  if (pos.includes('doctor') || pos.includes('nurse') || pos.includes('physician') || pos.includes('medical') ||
      pos.includes('healthcare') || pos.includes('clinical') || pos.includes('pharma') || pos.includes('therapist') ||
      comp.includes('health') || comp.includes('medical') || comp.includes('hospital') || comp.includes('clinic')) {
    console.log('✅ INDUSTRY: Mapped to Healthcare');
    return 'Healthcare';
  }

  // Legal
  if (pos.includes('lawyer') || pos.includes('solicitor') || pos.includes('legal') || pos.includes('attorney') ||
      pos.includes('barrister') || pos.includes('counsel') || pos.includes('paralegal') ||
      comp.includes('law') || comp.includes('legal') || comp.includes('solicitors')) {
    console.log('✅ INDUSTRY: Mapped to Legal Services');
    return 'Legal Services';
  }

  // Education
  if (pos.includes('teacher') || pos.includes('professor') || pos.includes('lecturer') || pos.includes('educator') ||
      pos.includes('academic') || pos.includes('instructor') || pos.includes('tutor') ||
      comp.includes('school') || comp.includes('university') || comp.includes('education') || comp.includes('college')) {
    console.log('✅ INDUSTRY: Mapped to Education');
    return 'Education';
  }

  // Real Estate
  if (pos.includes('estate agent') || pos.includes('property') || pos.includes('real estate') || pos.includes('surveyor') ||
      pos.includes('valuer') || pos.includes('lettings') || pos.includes('property manager') ||
      comp.includes('property') || comp.includes('estate') || comp.includes('real estate') || comp.includes('lettings')) {
    console.log('✅ INDUSTRY: Mapped to Real Estate');
    return 'Real Estate';
  }

  // Consulting
  if (pos.includes('consultant') || pos.includes('advisor') || pos.includes('strategist') || pos.includes('analyst') ||
      pos.includes('business development') || pos.includes('transformation') ||
      comp.includes('consulting') || comp.includes('advisory') || comp.includes('strategy')) {
    console.log('✅ INDUSTRY: Mapped to Consulting');
    return 'Consulting';
  }

  // Manufacturing
  if (pos.includes('manufacturing') || pos.includes('production') || pos.includes('operations') || pos.includes('supply chain') ||
      pos.includes('quality') || pos.includes('plant') || pos.includes('factory') ||
      comp.includes('manufacturing') || comp.includes('industrial') || comp.includes('automotive') || comp.includes('aerospace')) {
    console.log('✅ INDUSTRY: Mapped to Manufacturing');
    return 'Manufacturing';
  }

  // Retail
  if (pos.includes('retail') || pos.includes('sales assistant') || pos.includes('store') || pos.includes('merchandising') ||
      pos.includes('buyer') || pos.includes('category') || pos.includes('visual merchandiser') ||
      comp.includes('retail') || comp.includes('store') || comp.includes('shop') || comp.includes('fashion')) {
    console.log('✅ INDUSTRY: Mapped to Retail');
    return 'Retail';
  }

  // Construction
  if (pos.includes('construction') || pos.includes('builder') || pos.includes('contractor') || pos.includes('architect') ||
      pos.includes('civil engineer') || pos.includes('quantity surveyor') || pos.includes('project manager') ||
      comp.includes('construction') || comp.includes('building') || comp.includes('contractors') || comp.includes('infrastructure')) {
    console.log('✅ INDUSTRY: Mapped to Construction');
    return 'Construction';
  }

  // Media & Entertainment
  if (pos.includes('journalist') || pos.includes('editor') || pos.includes('producer') || pos.includes('director') ||
      pos.includes('media') || pos.includes('broadcasting') || pos.includes('film') || pos.includes('television') ||
      comp.includes('media') || comp.includes('broadcasting') || comp.includes('entertainment') || comp.includes('production')) {
    console.log('✅ INDUSTRY: Mapped to Media & Entertainment');
    return 'Media & Entertainment';
  }

  // Generic business roles - try to infer from company name
  if (pos.includes('manager') || pos.includes('director') || pos.includes('executive') || pos.includes('officer')) {
    if (comp.includes('bank') || comp.includes('finance') || comp.includes('credit')) {
      console.log('✅ INDUSTRY: Manager at financial company - mapped to Financial Services');
      return 'Financial Services';
    }
    if (comp.includes('tech') || comp.includes('software') || comp.includes('digital')) {
      console.log('✅ INDUSTRY: Manager at tech company - mapped to Technology');
      return 'Technology';
    }
    if (comp.includes('marketing') || comp.includes('agency') || comp.includes('creative')) {
      console.log('✅ INDUSTRY: Manager at marketing company - mapped to Marketing & Advertising');
      return 'Marketing & Advertising';
    }
  }

  console.log('⚠️ INDUSTRY: Could not determine industry from position or company');
  return currentIndustry || 'Not found';
}