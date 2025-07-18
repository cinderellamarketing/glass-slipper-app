import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log('Categorize API called');
    
    // Check environment variables
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is missing');
      return NextResponse.json({ error: 'API configuration error' }, { status: 500 });
    }
    
    const { contacts, userProfile } = await request.json();
    console.log('Received contacts:', contacts?.length, 'user profile:', !!userProfile);

    if (!contacts || !Array.isArray(contacts) || !userProfile) {
      console.error('Invalid request data');
      return NextResponse.json({ error: 'Invalid contacts data or user profile' }, { status: 400 });
    }

    const claudePrompt = `
You are an AI business relationship categoriser. Based on the user's business profile and their contacts, categorise each contact into the most appropriate category.

User's Business Profile:
- Business Type: ${userProfile.businessType}
- Target Market: ${userProfile.targetMarket}
- Company: ${userProfile.company}
- Referral Partners: ${userProfile.referralPartners}

Available Categories:
1. "Ideal Client" - Potential customers who fit their target market
2. "Referral Partners" - People who could refer business to them
3. "Competitors" - Direct competitors in their space
4. "Other" - Everyone else

Contacts to categorise:
${JSON.stringify(contacts.map(c => ({
  id: c.id,
  name: c.name,
  company: c.company,
  position: c.position
})), null, 2)}

Rules for categorisation:
- Ideal Client: Companies/roles that match their target market
- Referral Partners: Professionals who work with their target market but aren't competitors
- Competitors: Companies offering similar services to the same market
- Other: Government, personal contacts, unrelated industries

Return ONLY a JSON object with this structure:
{
  "categorisations": [
    {
      "id": contactId,
      "category": "categoryName",
      "reasoning": "brief explanation"
    }
  ]
}

Be strategic and business-focused in your categorisations.
    `;

    console.log('Calling Claude API...');
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: claudePrompt
        }
      ]
    });
    
    console.log('Claude API response received, content length:', claudeResponse.content?.length);

    // Parse Claude's response
    let categorisationData: any;
    try {
      const firstContent = claudeResponse.content[0];
      if (firstContent.type !== 'text') {
        throw new Error('Expected text response from Claude');
      }
      const responseText = firstContent.text;
      // Remove any markdown formatting if present
      const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      categorisationData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', parseError);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    // Apply categorisations to contacts
    console.log('Applying categorisations to contacts...');
    const categorisedContacts = contacts.map(contact => {
      const categorisation = categorisationData.categorisations?.find(
        (cat: any) => cat.id === contact.id
      );
      
      return {
        ...contact,
        category: categorisation?.category || 'Other'
      };
    });

    console.log('Successfully categorised contacts:', categorisedContacts.length);
    return NextResponse.json({ 
      contacts: categorisedContacts,
      message: `Successfully categorised ${categorisedContacts.length} contacts`
    });

  } catch (error) {
    console.error('Categorisation API error details:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    
    return NextResponse.json(
      { error: 'Failed to categorise contacts. Please try again.' },
      { status: 500 }
    );
  }
}