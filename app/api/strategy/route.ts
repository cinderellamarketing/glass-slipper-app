import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { strategy, userProfile } = await request.json();

    if (!strategy || !userProfile) {
      return NextResponse.json({ error: 'Invalid strategy data or user profile' }, { status: 400 });
    }

    const claudePrompt = `
You are a LinkedIn strategy expert specialising in B2B account-based marketing. Create a comprehensive, actionable LinkedIn strategy for this business.

Business Profile:
- Name: ${userProfile.name}
- Company: ${userProfile.company}
- Business Type: ${userProfile.businessType}
- Target Market: ${userProfile.targetMarket}
- Writing Style: ${userProfile.writingStyle}

Strategy Input:
- Main Offer: ${strategy.oneOffer}
- Ideal Referral Partners: ${strategy.idealReferralPartners}
- Special Factors: ${strategy.specialFactors || 'None specified'}

Create a detailed LinkedIn ABM strategy that includes:

1. **Profile Optimisation**
   - How to position themselves as the go-to expert
   - Key messaging and value proposition

2. **Content Strategy**
   - Types of content to share
   - Posting frequency and timing
   - Content themes aligned with their offer

3. **Engagement Strategy**
   - How to identify and engage ideal clients
   - Commenting and interaction approach
   - Building relationships systematically

4. **Referral Partner Strategy**
   - How to connect with and nurture referral partners
   - Collaboration opportunities
   - Mutual value creation

5. **Outreach Strategy**
   - Connection request templates
   - Follow-up message sequences
   - Personalisation techniques

6. **Success Metrics**
   - KPIs to track
   - Monthly goals and milestones

Make it specific, actionable, and tailored to their business. Use their writing style preference: ${userProfile.writingStyle}.

Format as a comprehensive strategy document with clear sections and bullet points.
    `;

    const claudeResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: claudePrompt
        }
      ]
    });

    const firstContent = claudeResponse.content[0];
    if (firstContent.type !== 'text') {
      throw new Error('Expected text response from Claude');
    }
    const generatedStrategy = firstContent.text;

    return NextResponse.json({ 
      generatedStrategy,
      message: 'LinkedIn strategy successfully generated'
    });

  } catch (error) {
    console.error('Strategy generation API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate strategy. Please try again.' },
      { status: 500 }
    );
  }
}