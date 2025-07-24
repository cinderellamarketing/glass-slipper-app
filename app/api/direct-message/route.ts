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
  categoryReason?: string;
  directMessage?: string;
}

interface User {
  name: string;
  email: string;
  company: string;
  businessType: string;
  targetMarket: string;
  writingStyle: string;
  referralPartners: string;
  aboutYou: string;
  aboutYourBusiness: string;
  analyzedWritingStyle: string;
  writingStyleAnalyzed: boolean;
}

interface LeadMagnet {
  id: number;
  title: string;
  description: string;
  type: string;
  created: string;
  downloads: number;
  content: string;
}

interface DirectMessageRequest {
  contact: Contact;
  user: User;
  strategy: string;
  existingLeadMagnets: LeadMagnet[];
}

// Main API endpoint for generating direct messages
export async function POST(request: Request) {
  try {
    console.log('🔍 DIRECT MESSAGE API: Starting direct message generation...');
    
    const { contact, user, strategy, existingLeadMagnets }: DirectMessageRequest = await request.json();
    
    // Validate inputs
    if (!contact || !user || !strategy) {
      console.log('❌ DIRECT MESSAGE API: Missing required data');
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required data for direct message generation' 
      }, { status: 400 });
    }

    console.log(`🔍 DIRECT MESSAGE API: Generating message for ${contact.name} at ${contact.company}`);

    // Step 1: Extract problem from strategy using Claude
    console.log('🔍 DIRECT MESSAGE API: Extracting problem from strategy...');
    const problemExtractionPrompt = `
Analyze this business strategy and extract the main problem/challenge that the ideal clients are facing.

STRATEGY:
${strategy}

CONTACT CONTEXT:
- Name: ${contact.name}
- Company: ${contact.company}
- Position: ${contact.position}
- Category: ${contact.category}
- Industry: ${contact.industry || 'Unknown'}

Extract the core problem that someone in ${contact.position} role at ${contact.company} would likely face, based on the strategy provided.

Respond with ONLY a single sentence describing the problem in a conversational tone, suitable for a direct message. For example:
"I noticed many [role] at [type of company] struggle with [specific problem]."

Do not include quotes or additional text - just the problem statement.
`;

    const problemResponse = await performClaudeAnalysis(problemExtractionPrompt);
    const extractedProblem = problemResponse.trim();
    console.log('✅ DIRECT MESSAGE API: Extracted problem:', extractedProblem);

    // Step 2: Check for existing personalised lead magnet for this contact
    console.log('🔍 DIRECT MESSAGE API: Checking for existing personalised lead magnet...');
    let relevantLeadMagnet = existingLeadMagnets.find(magnet => 
      magnet.type === 'personalised' && 
      magnet.title.includes(contact.name)
    );

    // Step 3: If no existing lead magnet, generate one
    if (!relevantLeadMagnet) {
      console.log('🔍 DIRECT MESSAGE API: No existing lead magnet found, generating new one...');
      
      const leadMagnetGenerationPrompt = `
Generate a personalised lead magnet for this specific contact that addresses their likely challenges.

CONTACT DETAILS:
- Name: ${contact.name}
- Company: ${contact.company}
- Position: ${contact.position}
- Category: ${contact.category}
- Industry: ${contact.industry || 'Unknown'}

USER BUSINESS:
- Business Type: ${user.businessType}
- Company: ${user.company}

IDENTIFIED PROBLEM:
${extractedProblem}

WRITING STYLE: ${user.writingStyleAnalyzed ? user.analyzedWritingStyle : 'Professional yet conversational'}

Create a lead magnet that would be valuable for someone in ${contact.position} role. Choose between:
- "guide" (comprehensive resource)
- "checklist" (actionable steps)

The content should be highly relevant to their specific role and industry.

Respond with ONLY this JSON format:
{
  "type": "guide" or "checklist",
  "title": "Specific title for the lead magnet (without quotes)",
  "description": "Brief description of why this is valuable for their role",
  "content": "Full detailed content of the lead magnet tailored to their position and challenges"
}
`;

      const leadMagnetResponse = await performClaudeAnalysis(leadMagnetGenerationPrompt);
      
      try {
        // Parse Claude's response
        let responseText = leadMagnetResponse.trim();
        responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const leadMagnetData = JSON.parse(responseText);
        
        // Create the new lead magnet
        relevantLeadMagnet = {
          id: Date.now(),
          title: leadMagnetData.title,
          description: leadMagnetData.description,
          type: leadMagnetData.type,
          created: new Date().toLocaleDateString(),
          downloads: 0,
          content: leadMagnetData.content
        };
        
        console.log('✅ DIRECT MESSAGE API: Generated new lead magnet:', relevantLeadMagnet.title);
        
      } catch (parseError) {
        console.error('❌ DIRECT MESSAGE API: Failed to parse lead magnet response:', parseError);
        // Fallback lead magnet
        relevantLeadMagnet = {
          id: Date.now(),  
          title: `Business Solutions Guide for ${contact.position}`,
          description: `A comprehensive guide tailored for ${contact.position} professionals`,
          type: 'guide',
          created: new Date().toLocaleDateString(),
          downloads: 0,
          content: `This guide addresses common challenges faced by ${contact.position} professionals in the ${contact.industry || 'business'} industry.`
        };
      }
    } else {
      console.log('✅ DIRECT MESSAGE API: Using existing lead magnet:', relevantLeadMagnet.title);
    }

    // Step 4: Format the direct message
    const directMessage = `Hi ${contact.name},

${extractedProblem}

I created a ${relevantLeadMagnet?.type || 'guide'} "${relevantLeadMagnet?.title || 'Business Solutions Guide'}" that helps solve this. Is it worth sending it over?

${user.name}`;

    console.log('✅ DIRECT MESSAGE API: Generated direct message successfully');

    return NextResponse.json({
      success: true,
      message: directMessage,
      leadMagnet: relevantLeadMagnet && existingLeadMagnets.find(magnet => magnet.id === relevantLeadMagnet!.id) ? null : relevantLeadMagnet // Only return if it's new
    });

  } catch (error) {
    console.error('❌ DIRECT MESSAGE API: Generation failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({
      success: false,
      error: 'Direct message generation failed',
      details: errorMessage
    }, { status: 500 });
  }
}

// Perform Claude analysis
async function performClaudeAnalysis(prompt: string): Promise<string> {
  try {
    console.log('🔍 CLAUDE DIRECT MESSAGE: Making Claude API call...');
    
    if (!process.env.CLAUDE_API_KEY) {
      console.log('❌ CLAUDE DIRECT MESSAGE: API key not found in environment');
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
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    console.log('🔍 CLAUDE DIRECT MESSAGE: Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ CLAUDE DIRECT MESSAGE: Error response:', errorText);
      throw new Error(`Claude API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ CLAUDE DIRECT MESSAGE: Analysis successful');
    return data.content[0].text;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown Claude error';
    console.error('❌ CLAUDE DIRECT MESSAGE: API failed:', errorMessage);
    throw error;
  }
}