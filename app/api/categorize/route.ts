import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { contacts, userProfile } = await request.json();

    if (!contacts || !Array.isArray(contacts) || !userProfile) {
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

    const claudeResponse = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: claudePrompt
        }
      ]
    });

    // Parse Claude's response
    let categorisationData;
    try {
      const responseText = claudeResponse.content[0].text;
      // Remove any markdown formatting if present
      const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      categorisationData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', parseError);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    // Apply categorisations to contacts
    const categorisedContacts = contacts.map(contact => {
      const categorisation = categorisationData.categorisations?.find(
        (cat: any) => cat.id === contact.id
      );
      
      return {
        ...contact,
        category: categorisation?.category || 'Other'
      };
    });

    return NextResponse.json({ 
      contacts: categorisedContacts,
      message: `Successfully categorised ${categorisedContacts.length} contacts`
    });

  } catch (error) {
    console.error('Categorisation API error:', error);
    return NextResponse.json(
      { error: 'Failed to categorise contacts. Please try again.' },
      { status: 500 }
    );
  }
}