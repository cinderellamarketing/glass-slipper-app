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
  email: string;
  category?: string;
  industry?: string;
  phone?: string;
  website?: string;
}

interface PersonalizedLeadMagnetResult {
  title: string;
  description: string;
  content: string;
}

// Main API endpoint for personalized lead magnet generation
export async function POST(request: Request) {
  try {
    console.log('🔍 PERSONALIZED LEAD MAGNET API: Starting generation...');
    
    const { contact, user, strategy, writingStyle, aboutYou, aboutYourBusiness } = await request.json();
    
    if (!contact || !user) {
      console.log('❌ PERSONALIZED LEAD MAGNET API: Missing required fields');
      return NextResponse.json({ 
        success: false,
        error: 'Missing required fields for personalized lead magnet generation' 
      }, { status: 400 });
    }

    console.log(`🔍 PERSONALIZED LEAD MAGNET API: Generating personalized content for ${contact.name} at ${contact.company}`);
    console.log(`🔍 PERSONALIZED LEAD MAGNET API: Contact category: ${contact.category}, Industry: ${contact.industry || 'Unknown'}`);

    // Create hyper-personalized prompt
    const personalizedPrompt = createPersonalizedLeadMagnetPrompt(contact, user, strategy, writingStyle, aboutYou, aboutYourBusiness);
    
    console.log('🔍 PERSONALIZED LEAD MAGNET API: Starting Claude generation...');
    const claudeStartTime = Date.now();
    const leadMagnetContent = await performClaudeGeneration(personalizedPrompt);
    const claudeDuration = Date.now() - claudeStartTime;
    
    console.log('🔍 PERSONALIZED LEAD MAGNET API: Claude generation completed:', {
      duration: `${claudeDuration}ms`,
      responseLength: leadMagnetContent.length,
      preview: leadMagnetContent.substring(0, 200) + '...'
    });

    // Parse Claude's response
    const leadMagnet = parsePersonalizedLeadMagnetResponse(leadMagnetContent, contact, user);

    console.log(`✅ PERSONALIZED LEAD MAGNET API: Generated successfully for ${contact.name}`);
    
    return NextResponse.json({ 
      success: true,
      leadMagnet: leadMagnet
    });

  } catch (error) {
    console.error('❌ PERSONALIZED LEAD MAGNET API: Generation failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({
      success: false,
      error: 'Personalized lead magnet generation failed',
      details: errorMessage
    }, { status: 500 });
  }
}

// Create hyper-personalized lead magnet prompt
function createPersonalizedLeadMagnetPrompt(
  contact: Contact,
  user: User, 
  strategy: string,
  writingStyle: string,
  aboutYou: string,
  aboutYourBusiness: string
): string {
  
  return `
Create a hyper-personalized lead magnet specifically tailored for this individual contact:

TARGET CONTACT:
- Name: ${contact.name}
- Position: ${contact.position}
- Company: ${contact.company}
- Industry: ${contact.industry || 'Unknown'}
- Category: ${contact.category || 'Unknown'}
- Email: ${contact.email}
${contact.phone ? `- Phone: ${contact.phone}` : ''}
${contact.website ? `- Company Website: ${contact.website}` : ''}

YOUR BUSINESS CONTEXT:
- Your Name: ${user.name}
- Your Company: ${user.company}
- Your Business Type: ${user.businessType}
- Your Target Market: ${user.targetMarket}
- Your Referral Partners: ${user.referralPartners}

${strategy ? `YOUR CURRENT STRATEGY:\n${strategy}\n` : ''}

${aboutYou ? `ABOUT YOU:\n${aboutYou}\n` : ''}

${aboutYourBusiness ? `ABOUT YOUR BUSINESS:\n${aboutYourBusiness}\n` : ''}

WRITING STYLE GUIDE:
${writingStyle && writingStyle !== 'Professional yet conversational' ? writingStyle : 'Use a professional yet conversational tone that builds trust and demonstrates expertise.'}

PERSONALIZATION REQUIREMENTS:

Create a lead magnet that is specifically designed for ${contact.name} in their role as ${contact.position} at ${contact.company}. This should:

1. **Address Their Specific Role**: Tailor content to challenges a ${contact.position} would face
2. **Reference Their Industry**: Include ${contact.industry || 'their industry'}-specific insights and examples
3. **Company Size Considerations**: Consider what someone at ${contact.company} might need
4. **Relationship Context**: Remember this person is categorized as "${contact.category}" in your network

CONTENT STRATEGY:
- If they're an "Ideal Client": Create content that demonstrates your expertise and shows how you solve their specific problems
- If they're a "Champion": Create content that helps them influence decision makers and shows your value to their organization
- If they're a "Referral Partner": Create content that helps them understand your value proposition so they can refer confidently
- If they're a "Competitor": Create thought leadership content that demonstrates your unique approach
- If they're "Other": Create valuable content relevant to their role and industry

DELIVERABLE FORMAT:
Choose the most appropriate format for this specific contact:
- **Checklist**: If they need actionable steps for their role
- **Guide**: If they need strategic insights for their position
- **Template**: If they need practical tools for their work
- **Framework**: If they need a structured approach to their challenges

Write in ${user.name}'s authentic voice and style as defined above.

The lead magnet should feel like it was created specifically for ${contact.name}, not a generic piece repurposed for them.

Respond with this JSON format:
{
  "title": "Compelling title that speaks directly to ${contact.name}'s role and challenges",
  "description": "2-3 sentence description explaining why this is perfect for someone in ${contact.position} at ${contact.company}",
  "content": "Complete personalized content that directly addresses ${contact.name}'s likely needs and challenges in their specific role"
}`;
}

// Perform Claude generation
async function performClaudeGeneration(prompt: string): Promise<string> {
  try {
    console.log('🔍 CLAUDE PERSONALIZED: Making Claude API call...');
    
    if (!process.env.CLAUDE_API_KEY) {
      console.log('❌ CLAUDE PERSONALIZED: API key not found in environment');
      throw new Error('CLAUDE_API_KEY not configured');
    }

    console.log('🔍 CLAUDE PERSONALIZED: Using API key:', process.env.CLAUDE_API_KEY.substring(0, 8) + '...');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // Using Haiku for faster generation
        max_tokens: 3500, // Increased for detailed personalized content
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    console.log('🔍 CLAUDE PERSONALIZED: Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ CLAUDE PERSONALIZED: Error response:', errorText);
      throw new Error(`Claude API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ CLAUDE PERSONALIZED: Generation successful');
    return data.content[0].text;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown Claude error';
    console.error('❌ CLAUDE PERSONALIZED: API failed:', errorMessage);
    throw error;
  }
}

// Parse Claude's personalized lead magnet response
function parsePersonalizedLeadMagnetResponse(
  claudeResponse: string, 
  contact: Contact, 
  user: User
): PersonalizedLeadMagnetResult {
  try {
    console.log(`🔍 PARSE PERSONALIZED: Processing Claude response for ${contact.name} at ${contact.company}`);
    
    // Extract JSON from Claude's response
    const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log(`❌ PARSE PERSONALIZED: No JSON found in Claude response for ${contact.name}`);
      throw new Error('No JSON found in Claude response');
    }

    const jsonString = jsonMatch[0];
    console.log(`🔍 PARSE PERSONALIZED: Extracted JSON string:`, jsonString.substring(0, 200) + '...');
    
    const parsed = JSON.parse(jsonString);
    console.log(`🔍 PARSE PERSONALIZED: Successfully parsed JSON for ${contact.name}`);
    
    return {
      title: parsed.title || `Personalized Resource for ${contact.name}`,
      description: parsed.description || `Custom content created specifically for ${contact.position} at ${contact.company}`,
      content: parsed.content || claudeResponse
    };
  } catch (error) {
    console.error(`❌ PARSE PERSONALIZED: Failed to parse Claude response for ${contact.name}:`, error);
    console.error(`❌ PARSE PERSONALIZED: Raw response was:`, claudeResponse.substring(0, 500) + '...');
    
    // Fallback response
    return {
      title: `Custom Resource for ${contact.name}`,
      description: `Personalized content created for ${contact.position} at ${contact.company}`,
      content: claudeResponse
    };
  }
}