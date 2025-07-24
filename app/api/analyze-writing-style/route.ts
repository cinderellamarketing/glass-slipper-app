import { NextResponse } from 'next/server';

// Main API endpoint for writing style analysis
export async function POST(request: Request) {
  try {
    console.log('🔍 WRITING STYLE API: Starting analysis...');
    
    const { aboutYou, aboutYourBusiness, name, businessType } = await request.json();
    
    if (!aboutYou || !aboutYourBusiness || !name || !businessType) {
      console.log('❌ WRITING STYLE API: Missing required fields');
      return NextResponse.json({ 
        success: false,
        error: 'Missing required fields for writing style analysis' 
      }, { status: 400 });
    }

    // Calculate word counts
    const aboutYouWords = aboutYou.split(' ').filter((word: string) => word.length > 0).length;
    const aboutBusinessWords = aboutYourBusiness.split(' ').filter((word: string) => word.length > 0).length;
    const totalWords = aboutYouWords + aboutBusinessWords;

    if (totalWords < 2000) {
      console.log(`❌ WRITING STYLE API: Insufficient word count: ${totalWords}/2000`);
      return NextResponse.json({ 
        success: false,
        error: `Insufficient content for analysis. Need at least 2000 words, got ${totalWords}` 
      }, { status: 400 });
    }

    console.log(`🔍 WRITING STYLE API: Analyzing ${totalWords} words for ${name} (${businessType})`);

    // Create analysis prompt
    const analysisPrompt = createWritingStylePrompt(aboutYou, aboutYourBusiness, name, businessType);
    
    console.log('🔍 WRITING STYLE API: Starting Claude analysis...');
    const claudeStartTime = Date.now();
    const analyzedStyle = await performClaudeAnalysis(analysisPrompt);
    const claudeDuration = Date.now() - claudeStartTime;
    
    console.log('🔍 WRITING STYLE API: Claude analysis completed:', {
      duration: `${claudeDuration}ms`,
      responseLength: analyzedStyle.length,
      preview: analyzedStyle.substring(0, 200) + '...'
    });

    console.log(`✅ WRITING STYLE API: Analysis complete for ${name}`);
    
    return NextResponse.json({ 
      success: true,
      analyzedStyle: analyzedStyle,
      wordCount: totalWords
    });

  } catch (error) {
    console.error('❌ WRITING STYLE API: Analysis failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({
      success: false,
      error: 'Writing style analysis failed',
      details: errorMessage
    }, { status: 500 });
  }
}

// Create comprehensive writing style analysis prompt
function createWritingStylePrompt(aboutYou: string, aboutYourBusiness: string, name: string, businessType: string): string {
  return `
Analyze the writing style from these two texts and create a comprehensive style guide for ${name}, a ${businessType} professional:

ABOUT ${name.toUpperCase()}:
${aboutYou}

ABOUT ${name.toUpperCase()}'S BUSINESS:
${aboutYourBusiness}

Please analyze and provide a detailed style guide covering:

1. **TONE & VOICE:**
   - Overall tone (formal/conversational/authoritative/friendly)
   - Personality that comes through the writing
   - Level of formality vs casualness
   - Emotional warmth and approachability

2. **LANGUAGE PATTERNS:**
   - Sentence structure preferences (short/long/varied)
   - Vocabulary sophistication level
   - Use of industry terminology and jargon
   - Preferred connecting words and phrases
   - Grammar and punctuation style

3. **CONTENT APPROACH:**
   - Use of personal stories and examples
   - How they explain complex concepts
   - Relationship with the reader (expert/peer/mentor/guide)
   - Use of questions, lists, or other formatting preferences
   - How they structure information and arguments

4. **PERSONALITY INDICATORS:**
   - Confidence level in their writing
   - Balance of warmth vs professional distance
   - Use of humor or personality quirks
   - Values and beliefs that come through
   - What motivates and drives them

5. **BUSINESS COMMUNICATION STYLE:**
   - How they position their expertise and authority
   - How they build trust and credibility with readers
   - Their approach to client relationships and communication
   - Key messages and themes they consistently communicate
   - How they differentiate themselves from competitors

6. **SPECIFIC WRITING CHARACTERISTICS:**
   - Favorite phrases or expressions
   - How they open and close communications
   - Use of metaphors, analogies, or storytelling
   - Technical vs accessible language balance
   - Energy level and enthusiasm in writing

Based on this analysis, provide specific guidance for generating content that authentically sounds like ${name}. Include examples of:
- How they would introduce a concept
- Their typical sentence starters
- How they would build credibility 
- Their natural way of explaining benefits
- How they would address common objections

Make this style guide detailed enough that AI-generated content will genuinely reflect ${name}'s unique voice and communication style.
`;
}

// Perform Claude analysis for writing style
async function performClaudeAnalysis(prompt: string): Promise<string> {
  try {
    console.log('🔍 CLAUDE WRITING STYLE: Making Claude API call...');
    
    if (!process.env.CLAUDE_API_KEY) {
      console.log('❌ CLAUDE WRITING STYLE: API key not found in environment');
      throw new Error('CLAUDE_API_KEY not configured');
    }

    console.log('🔍 CLAUDE WRITING STYLE: Using API key:', process.env.CLAUDE_API_KEY.substring(0, 8) + '...');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // Using Haiku instead of Sonnet 4
        max_tokens: 2500, // Increased for detailed analysis
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    console.log('🔍 CLAUDE WRITING STYLE: Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ CLAUDE WRITING STYLE: Error response:', errorText);
      throw new Error(`Claude API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ CLAUDE WRITING STYLE: Analysis successful');
    return data.content[0].text;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown Claude error';
    console.error('❌ CLAUDE WRITING STYLE: API failed:', errorMessage);
    throw error;
  }
}