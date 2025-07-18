import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { contacts } = await request.json();

    if (!contacts || !Array.isArray(contacts)) {
      return NextResponse.json({ error: 'Invalid contacts data' }, { status: 400 });
    }

    const enrichedContacts = [];

    for (const contact of contacts) {
      try {
        // Step 1: Search for contact information using Serper API
        const searchQuery = `"${contact.name}" "${contact.company}" contact information phone email website`;
        
        const serperResponse = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'X-API-KEY': process.env.SERPER_API_KEY || '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: searchQuery,
            num: 5
          })
        });

        const searchResults = await serperResponse.json();

        // Step 2: Use Claude to extract contact information from search results
        const claudePrompt = `
Given this person's information and search results, extract and format their contact details:

Person: ${contact.name}
Company: ${contact.company}
Position: ${contact.position}

Search Results:
${JSON.stringify(searchResults.organic?.slice(0, 3) || [], null, 2)}

Please extract and return ONLY a JSON object with the following structure:
{
  "phone": "phone number if found, otherwise 'Not found'",
  "website": "company website if found, otherwise 'Not found'",
  "enriched": true
}

Rules:
- Only return valid phone numbers and websites
- If no reliable information is found, use "Not found"
- Return only the JSON object, no other text
        `;

        const claudeResponse = await anthropic.messages.create({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: claudePrompt
            }
          ]
        });

        // Parse Claude's response
        let enrichmentData;
        try {
          const responseText = claudeResponse.content[0].text;
          // Remove any markdown formatting if present
          const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          enrichmentData = JSON.parse(jsonText);
        } catch (parseError) {
          console.error('Failed to parse Claude response:', parseError);
          enrichmentData = {
            phone: 'Not found',
            website: 'Not found',
            enriched: false
          };
        }

        // Create enriched contact
        const enrichedContact = {
          ...contact,
          phone: enrichmentData.phone || 'Not found',
          website: enrichmentData.website || 'Not found',
          isEnriched: true
        };

        enrichedContacts.push(enrichedContact);

        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (contactError) {
        console.error(`Error enriching contact ${contact.name}:`, contactError);
        
        // Return contact with enrichment failed
        enrichedContacts.push({
          ...contact,
          phone: 'Not found',
          website: 'Not found',
          isEnriched: false
        });
      }
    }

    return NextResponse.json({ 
      contacts: enrichedContacts,
      message: `Successfully enriched ${enrichedContacts.length} contacts`
    });

  } catch (error) {
    console.error('Enrichment API error:', error);
    return NextResponse.json(
      { error: 'Failed to enrich contacts. Please try again.' },
      { status: 500 }
    );
  }
}