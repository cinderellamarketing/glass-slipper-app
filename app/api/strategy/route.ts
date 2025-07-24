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

interface StrategyInput {
  oneOffer: string;
  idealClientProfile: string;
  specialFactors: string;
}

// Main API endpoint for strategy generation
export async function POST(request: Request) {
  try {
    console.log('🔍 STRATEGY API: Starting generation...');
    
    const { user, strategy, contacts, writingStyle, aboutYou, aboutYourBusiness } = await request.json();
    
    if (!user || !strategy) {
      console.log('❌ STRATEGY API: Missing required fields');
      return NextResponse.json({ 
        success: false,
        error: 'Missing required fields for strategy generation' 
      }, { status: 400 });
    }

    console.log(`🔍 STRATEGY API: Generating strategy for ${user.name} (${user.businessType})`);
    console.log(`🔍 STRATEGY API: Using ${writingStyle ? 'analyzed' : 'default'} writing style`);
    console.log(`🔍 STRATEGY API: Processing ${contacts?.length || 0} contacts`);

    // Create enhanced strategy prompt
    const strategyPrompt = createStrategyPrompt(user, strategy, contacts, writingStyle, aboutYou, aboutYourBusiness);
    
    console.log('🔍 STRATEGY API: Starting Claude generation...');
    const claudeStartTime = Date.now();
    const generatedStrategy = await performClaudeGeneration(strategyPrompt);
    const claudeDuration = Date.now() - claudeStartTime;
    
    console.log('🔍 STRATEGY API: Claude generation completed:', {
      duration: `${claudeDuration}ms`,
      responseLength: generatedStrategy.length,
      preview: generatedStrategy.substring(0, 200) + '...'
    });

    console.log(`✅ STRATEGY API: Strategy generated successfully for ${user.name}`);
    
    return NextResponse.json({ 
      success: true,
      strategy: generatedStrategy
    });

  } catch (error) {
    console.error('❌ STRATEGY API: Generation failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({
      success: false,
      error: 'Strategy generation failed',
      details: errorMessage
    }, { status: 500 });
  }
}

// Create comprehensive strategy prompt with business insights
function createStrategyPrompt(
  user: User, 
  strategy: StrategyInput, 
  contacts: Contact[], 
  writingStyle: string,
  aboutYou: string,
  aboutYourBusiness: string
): string {
  
  // Analyze contact data for strategic insights
  const totalContacts = contacts?.length || 0;
  const industries = Array.from(new Set(contacts.map(c => c.industry).filter(Boolean))) as string[];
  const idealClients = contacts?.filter(c => c.category === 'Ideal Client') || [];
  const referralPartners = contacts?.filter(c => c.category === 'Referral Partners') || [];
  const champions = contacts?.filter(c => c.category === 'Champions') || [];
  const competitors = contacts?.filter(c => c.category === 'Competitors') || [];

  // Extract key companies and positions for insights
  const keyCompanies = Array.from(new Set(idealClients.slice(0, 10).map(c => c.company)));
  const keyPositions = Array.from(new Set(idealClients.slice(0, 10).map(c => c.position)));

  return `
Create a comprehensive referral strategy for ${user.name}, ${user.businessType} professional at ${user.company}.

BUSINESS PROFILE:
- Name: ${user.name}
- Company: ${user.company}
- Business Type: ${user.businessType}  
- Target Market: ${user.targetMarket}
- Key Referral Partners: ${user.referralPartners}

STRATEGY INPUTS:
- Core Offer: ${strategy.oneOffer}
- Ideal Client Profile: ${strategy.idealClientProfile}
- Special Factors: ${strategy.specialFactors}

CONTACT NETWORK ANALYSIS:
- Total Network: ${totalContacts} contacts
- Ideal Clients Identified: ${idealClients.length}
- Potential Referral Partners: ${referralPartners.length}
- Champions (potential advocates): ${champions.length}
- Competitors to monitor: ${competitors.length}
- Industries represented: ${industries.slice(0, 8).join(', ')}
- Key target companies: ${keyCompanies.slice(0, 5).join(', ')}
- Common decision-maker roles: ${keyPositions.slice(0, 5).join(', ')}

${aboutYou ? `ABOUT ${user.name.toUpperCase()}:\n${aboutYou}\n` : ''}

${aboutYourBusiness ? `DETAILED BUSINESS CONTEXT:\n${aboutYourBusiness}\n` : ''}

WRITING STYLE GUIDE:
${writingStyle && writingStyle !== 'Professional yet conversational' ? writingStyle : 'Use a professional yet conversational tone that demonstrates strategic thinking and builds confidence.'}

STRATEGY REQUIREMENTS:

Create a comprehensive referral strategy that includes:

1. **EXECUTIVE SUMMARY**
   - Clear overview of the referral opportunity
   - Key success metrics and goals
   - Timeline for implementation

2. **NETWORK SEGMENTATION STRATEGY**
   - How to prioritize the ${idealClients.length} identified ideal clients based on the profile
   - Approach for engaging ${referralPartners.length} referral partners who can reach your ideal client profile
   - Strategy for converting ${champions.length} champions into advocates within target companies
   - Plan for monitoring ${competitors.length} competitors

3. **REFERRAL PARTNER DEVELOPMENT**
   - Specific approach for engaging referral partners who can reach your ideal clients
   - Value proposition for partners
   - Mutual benefit frameworks
   - Communication cadence and methods

4. **IDEAL CLIENT ENGAGEMENT**
   - Targeted approaches based on the ideal client profile: ${strategy.idealClientProfile}
   - Positioning strategy for the specific decision-makers and challenges described
   - Content and touchpoint strategy tailored to ideal client characteristics
   - Conversion pathway design for this client profile

5. **OPERATIONAL FRAMEWORK**
   - Daily/weekly/monthly activities
   - Tracking and measurement systems
   - Communication templates and tools
   - Scalable processes for growth

6. **COMPETITIVE DIFFERENTIATION**
   - Unique positioning based on special factors
   - Competitive advantages to emphasize
   - Market positioning strategy
   - Thought leadership opportunities

7. **IMPLEMENTATION ROADMAP**
   - Phase 1 (First 30 days): Quick wins and foundation
   - Phase 2 (30-90 days): Systematic outreach and relationship building
   - Phase 3 (90+ days): Optimization and scaling
   - Success milestones and checkpoints

Write this strategy in ${user.name}'s authentic voice and style as defined above. Make it actionable, specific to their network, and tailored to their unique business context.

The strategy should be comprehensive (1500-2000 words) and demonstrate deep understanding of ${user.name}'s business, personality, and network dynamics.
`;
}

// Perform Claude generation
async function performClaudeGeneration(prompt: string): Promise<string> {
  try {
    console.log('🔍 CLAUDE STRATEGY: Making Claude API call...');
    
    if (!process.env.CLAUDE_API_KEY) {
      console.log('❌ CLAUDE STRATEGY: API key not found in environment');
      throw new Error('CLAUDE_API_KEY not configured');
    }

    console.log('🔍 CLAUDE STRATEGY: Using API key:', process.env.CLAUDE_API_KEY.substring(0, 8) + '...');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // Using Haiku instead of Sonnet 4
        max_tokens: 4000, // Increased for comprehensive strategy
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    console.log('🔍 CLAUDE STRATEGY: Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ CLAUDE STRATEGY: Error response:', errorText);
      throw new Error(`Claude API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ CLAUDE STRATEGY: Generation successful');
    return data.content[0].text;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown Claude error';
    console.error('❌ CLAUDE STRATEGY: API failed:', errorMessage);
    throw error;
  }
}