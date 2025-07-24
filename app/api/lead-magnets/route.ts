import { NextResponse } from 'next/server';

// TypeScript interfaces
interface User {
  name: string;
  email: string;
  company: string;
  businessType: string;
  targetMarket: string;
  referralPartners: string;
  aboutYou?: string;
  aboutYourBusiness?: string;
}

interface Contact {
  id: number;
  name: string;
  company: string;
  position: string;
  industry?: string;
  category?: string;
}

interface LeadMagnetResult {
  title: string;
  description: string;
  content: string;
}

// Main API endpoint for lead magnet generation
export async function POST(request: Request) {
  try {
    console.log('🔍 LEAD MAGNET API: Starting generation...');
    
    const { type, user, strategy, contacts, writingStyle, aboutYou, aboutYourBusiness } = await request.json();
    
    if (!type || !user) {
      console.log('❌ LEAD MAGNET API: Missing required fields');
      return NextResponse.json({ 
        success: false,
        error: 'Missing required fields for lead magnet generation' 
      }, { status: 400 });
    }

    console.log(`🔍 LEAD MAGNET API: Generating ${type} for ${user.name} (${user.businessType})`);
    console.log(`🔍 LEAD MAGNET API: Using ${writingStyle ? 'analyzed' : 'default'} writing style`);

    // Create enhanced prompt with writing style
    const leadMagnetPrompt = createLeadMagnetPrompt(type, user, strategy, contacts, writingStyle, aboutYou, aboutYourBusiness);
    
    console.log('🔍 LEAD MAGNET API: Starting Claude generation...');
    const claudeStartTime = Date.now();
    const leadMagnetContent = await performClaudeGeneration(leadMagnetPrompt);
    const claudeDuration = Date.now() - claudeStartTime;
    
    console.log('🔍 LEAD MAGNET API: Claude generation completed:', {
      duration: `${claudeDuration}ms`,
      responseLength: leadMagnetContent.length,
      preview: leadMagnetContent.substring(0, 200) + '...'
    });

    // Parse Claude's response
    const leadMagnet = parseLeadMagnetResponse(leadMagnetContent, type, user.name);

    console.log(`✅ LEAD MAGNET API: ${type} generated successfully for ${user.name}`);
    
    return NextResponse.json({ 
      success: true,
      leadMagnet: leadMagnet
    });

  } catch (error) {
    console.error('❌ LEAD MAGNET API: Generation failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({
      success: false,
      error: 'Lead magnet generation failed',
      details: errorMessage
    }, { status: 500 });
  }
}

// Create enhanced lead magnet prompt with writing style
function createLeadMagnetPrompt(
  type: string, 
  user: User, 
  strategy: string, 
  contacts: Contact[], 
  writingStyle: string,
  aboutYou: string,
  aboutYourBusiness: string
): string {
  
  // Analyze contact data for insights
  const industries = [...new Set(contacts.map(c => c.industry).filter(Boolean))];
  const idealClients = contacts.filter(c => c.category === 'Ideal Client');
  const referralPartners = contacts.filter(c => c.category === 'Referral Partners');

  const basePrompt = `
Create a professional ${type} lead magnet for ${user.name}, a ${user.businessType} professional.

BUSINESS CONTEXT:
- Company: ${user.company}
- Target Market: ${user.targetMarket}
- Business Type: ${user.businessType}
- Key Referral Partners: ${user.referralPartners}

CONTACT INSIGHTS:
- Total contacts: ${contacts.length}
- Ideal clients identified: ${idealClients.length}
- Referral partners: ${referralPartners.length}
- Industries represented: ${industries.slice(0, 5).join(', ')}

${strategy ? `CURRENT STRATEGY:\n${strategy}\n` : ''}

${aboutYou ? `ABOUT ${user.name.toUpperCase()}:\n${aboutYou}\n` : ''}

${aboutYourBusiness ? `ABOUT THE BUSINESS:\n${aboutYourBusiness}\n` : ''}

WRITING STYLE GUIDE:
${writingStyle && writingStyle !== 'Professional yet conversational' ? writingStyle : 'Use a professional yet conversational tone that builds trust and demonstrates expertise.'}

`;

  if (type === 'checklist') {
    return basePrompt + `
CHECKLIST REQUIREMENTS:
Create a comprehensive checklist that helps ${user.targetMarket} businesses achieve a specific outcome related to ${user.businessType} services.

The checklist should:
1. Address a common pain point your contacts face
2. Provide 15-20 actionable items
3. Include brief explanations for each item
4. Position you as the expert who can help with implementation
5. Be immediately useful but highlight the complexity of full implementation

Write in ${user.name}'s authentic voice and style as defined above.

Respond with this JSON format:
{
  "title": "Compelling checklist title that promises value",
  "description": "2-3 sentence description explaining what this checklist achieves",
  "content": "Complete checklist content formatted with headers, checkboxes, and explanations"
}`;
  
  } else if (type === 'guide') {
    return basePrompt + `
GUIDE REQUIREMENTS:
Create a comprehensive guide that educates ${user.targetMarket} businesses on a topic central to ${user.businessType} expertise.

The guide should:
1. Address a strategic challenge your ideal clients face
2. Provide 5-7 main sections with detailed insights
3. Include real-world examples and case studies
4. Demonstrate deep expertise while being accessible
5. Lead naturally to your services without being salesy

Write in ${user.name}'s authentic voice and style as defined above.

Respond with this JSON format:
{
  "title": "Authoritative guide title that promises transformation",
  "description": "2-3 sentence description of what readers will learn and achieve",
  "content": "Complete guide content with sections, subheaders, examples, and actionable insights"
}`;
  }

  return basePrompt + `
Create a ${type} that showcases ${user.name}'s expertise and attracts ${user.targetMarket} prospects.

Respond with this JSON format:
{
  "title": "Compelling title",
  "description": "Brief description", 
  "content": "Full content"
}`;
}

// Perform Claude generation
async function performClaudeGeneration(prompt: string): Promise<string> {
  try {
    console.log('🔍 CLAUDE LEAD MAGNET: Making Claude API call...');
    
    if (!process.env.CLAUDE_API_KEY) {
      console.log('❌ CLAUDE LEAD MAGNET: API key not found in environment');
      throw new Error('CLAUDE_API_KEY not configured');
    }

    console.log('🔍 CLAUDE LEAD MAGNET: Using API key:', process.env.CLAUDE_API_KEY.substring(0, 8) + '...');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // Using Haiku instead of Sonnet 4
        max_tokens: 3000, // Increased for longer content
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    console.log('🔍 CLAUDE LEAD MAGNET: Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ CLAUDE LEAD MAGNET: Error response:', errorText);
      throw new Error(`Claude API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ CLAUDE LEAD MAGNET: Generation successful');
    return data.content[0].text;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown Claude error';
    console.error('❌ CLAUDE LEAD MAGNET: API failed:', errorMessage);
    throw error;
  }
}

// Parse Claude's lead magnet response
function parseLeadMagnetResponse(claudeResponse: string, type: string, userName: string): LeadMagnetResult {
  try {
    console.log(`🔍 PARSE LEAD MAGNET: Processing Claude response for ${userName}'s ${type}`);
    
    // Extract JSON from Claude's response
    const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log(`❌ PARSE LEAD MAGNET: No JSON found in Claude response for ${userName}`);
      throw new Error('No JSON found in Claude response');
    }

    const jsonString = jsonMatch[0];
    console.log(`🔍 PARSE LEAD MAGNET: Extracted JSON string:`, jsonString.substring(0, 200) + '...');
    
    const parsed = JSON.parse(jsonString);
    console.log(`🔍 PARSE LEAD MAGNET: Successfully parsed JSON for ${userName}'s ${type}`);
    
    return {
      title: parsed.title || `${type.charAt(0).toUpperCase() + type.slice(1)} for ${userName}`,
      description: parsed.description || `A comprehensive ${type} created by ${userName}`,
      content: parsed.content || claudeResponse
    };
  } catch (error) {
    console.error(`❌ PARSE LEAD MAGNET: Failed to parse Claude response for ${userName}'s ${type}:`, error);
    console.error(`❌ PARSE LEAD MAGNET: Raw response was:`, claudeResponse.substring(0, 500) + '...');
    
    // Fallback response
    return {
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} for ${userName}`,
      description: `A comprehensive ${type} to help your business grow`,
      content: claudeResponse
    };
  }
}