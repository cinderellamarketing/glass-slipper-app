import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log('Enrich API called');
    
    // Check environment variables
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is missing');
      return NextResponse.json({ error: 'API configuration error' }, { status: 500 });
    }
    
    if (!process.env.SERPER_API_KEY) {
      console.error('SERPER_API_KEY is missing');
      return NextResponse.json({ error: 'Search API configuration error' }, { status: 500 });
    }
    
    const { contacts } = await request.json();
    console.log('Received contacts for enrichment:', contacts?.length);

    if (!contacts || !Array.isArray(contacts)) {
      console.error('Invalid contacts data');
      return NextResponse.json({ error: 'Invalid contacts data' }, { status: 400 });
    }

    const enrichedContacts = [];

    for (const contact of contacts) {
      try {
        console.log(`Enriching contact: ${contact.name}`);
        
        // Step 1: Search for contact information using Serper API
        const searchQuery = `"${contact.name}" "${contact.company}" contact information phone email website`;
        
        console.log('Calling Serper API...');
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

        if (!serperResponse.ok) {
          console.error(`Serper API error: ${serperResponse.status}`);
        }

        const searchResults = await serperResponse.json();
        console.log('Search results received:', !!searchResults.organic);

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

        console.log('Calling Claude API for enrichment...');
        const claudeResponse = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: claudePrompt
            }
          ]
        });

        console.log('Claude enrichment response received');

        // Parse Claude's response
        let enrichmentData: any;
        try {
          const firstContent = claudeResponse.content[0];
          if (firstContent.type !== 'text') {
            throw new Error('Expected text response from Claude');
          }
          const responseText = firstContent.text;
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
    console.error('Enrichment API error details:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    
    return NextResponse.json(
      { error: 'Failed to enrich contacts. Please try again.' },
      { status: 500 }
    );
  }
}