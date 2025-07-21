import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API: Enrichment request received');
    
    const { contacts } = await request.json(); // App sends array of contacts
    
    if (!contacts || !Array.isArray(contacts)) {
      console.log('❌ API: Invalid contacts data');
      return NextResponse.json({ 
        error: 'contacts array is required' 
      }, { status: 400 });
    }

    console.log(`🔍 API: Processing ${contacts.length} contacts`);
    const enrichedContacts = [];

    // Process each contact
    for (const contact of contacts) {
      try {
        console.log(`🔍 API: Processing contact: ${contact.name} at ${contact.company}`);
        
        // Step 1: Perform web searches using the app's field names
        const personQuery = `"${contact.name}" "${contact.company}"`;
        const companyQuery = `"${contact.company}" website contact phone`;
        
        console.log('🔍 API: Search queries:', { personQuery, companyQuery });

        const [personResults, companyResults] = await Promise.all([
          performWebSearch(personQuery),
          performWebSearch(companyQuery)
        ]);

        console.log('🔍 API: Search results received:', { 
          personResults: personResults?.organic?.length || 0,
          companyResults: companyResults?.organic?.length || 0
        });

        // Log first search result for debugging
        if (companyResults?.organic?.length > 0) {
          console.log('🔍 API: First company result:', {
            title: companyResults.organic[0].title,
            link: companyResults.organic[0].link,
            snippet: companyResults.organic[0].snippet?.substring(0, 100) + '...'
          });
        } else {
          console.log('⚠️ API: No company search results found');
        }

        // Step 2: Use Claude to analyze results
        const analysisPrompt = `
Analyze these search results and extract contact information for:
Name: ${contact.name}
Company: ${contact.company}
Position: ${contact.position}

PERSON SEARCH RESULTS:
${JSON.stringify(personResults?.organic?.slice(0, 5) || [], null, 2)}

COMPANY SEARCH RESULTS:
${JSON.stringify(companyResults?.organic?.slice(0, 5) || [], null, 2)}

Extract information and respond with ONLY this JSON format (no markdown, no code blocks):
{
  "phone": "UK format phone number or 'Not found'",
  "industry": "Company industry or 'Not found'", 
  "location": "City, Country or 'Not found'",
  "website": "Company website URL or 'Not found'"
}`;

        console.log('🔍 API: Calling Claude for analysis...');
        const enrichmentData = await performClaudeAnalysis(analysisPrompt);
        console.log('🔍 API: Claude raw response:', enrichmentData.substring(0, 200) + '...');
        
        // Parse Claude's response
        let parsedData;
        try {
          let cleanedResponse = enrichmentData.trim();
          // Remove markdown code blocks
          cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
          
          // Extract JSON object
          const firstBrace = cleanedResponse.indexOf('{');
          const lastBrace = cleanedResponse.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1) {
            cleanedResponse = cleanedResponse.substring(firstBrace, lastBrace + 1);
          }
          
          console.log('🔍 API: Cleaned Claude response for parsing:', cleanedResponse.substring(0, 150) + '...');
          
          parsedData = JSON.parse(cleanedResponse);
          console.log('✅ API: Successfully parsed Claude response:', parsedData);
	  } catch (parseError) {
  	  const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
  	  console.log('❌ API: Claude parsing failed for', contact.name, '- using fallback. Error:', errorMessage);
          parsedData = {
            phone: 'Parsing failed',
            industry: 'Parsing failed',
            location: 'Parsing failed', 
            website: 'Parsing failed'
          };
        }

        // Format response to match what the app expects
        const enrichedContact = {
          ...contact,  // Keep all original contact data
          isEnriched: true,
          phone: parsedData.phone || 'Not found',
          website: parsedData.website || 'Not found',
          enrichmentData: {
            industry: parsedData.industry || 'Not found',
            location: parsedData.location || 'Not found',
            website: parsedData.website || 'Not found',
            linkedinProfile: `https://linkedin.com/in/${contact.name.toLowerCase().replace(/[^a-z]/g, '')}`
          }
        };

        console.log(`✅ API: Successfully enriched ${contact.name} with data:`, {
          phone: enrichedContact.phone,
          industry: enrichedContact.enrichmentData.industry,
          website: enrichedContact.website
        });

        enrichedContacts.push(enrichedContact);
        
        // Rate limiting to avoid hitting API limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
	} catch (contactError) {
  	const errorMessage = contactError instanceof Error ? contactError.message : 'Unknown contact error';
  	console.error(`❌ API: Failed to enrich ${contact.name}:`, errorMessage);
        
        // Add failed contact with fallback data so the app doesn't break
        enrichedContacts.push({
          ...contact,
          isEnriched: true,
          phone: 'Search failed',
          website: 'Search failed',
          enrichmentData: {
            industry: 'Search failed',
            location: 'Search failed', 
            website: 'Search failed',
            linkedinProfile: 'Search failed'
          }
        });
      }
    }

    console.log(`✅ API: Enrichment complete. Returning ${enrichedContacts.length} contacts`);
    
    // Return format that matches what the app expects
    return NextResponse.json({ 
      contacts: enrichedContacts 
    });

  } catch (error) {
  console.error('❌ API: Enrichment process failed:', error);
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  return NextResponse.json({
    error: 'Enrichment failed',
    details: errorMessage
  }, { status: 500 });
}
}

// Helper function for web search
async function performWebSearch(query: string) {
  try {
    console.log('🔍 SERPER: Making search request for:', query);
    
    if (!process.env.SERPER_API_KEY) {
      console.log('❌ SERPER: API key not found in environment');
      throw new Error('SERPER_API_KEY not configured');
    }

    console.log('🔍 SERPER: Using API key:', process.env.SERPER_API_KEY.substring(0, 8) + '...');

    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: query,
        num: 10
      })
    });

    console.log('🔍 SERPER: Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ SERPER: Error response:', errorText);
      throw new Error(`Search failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ SERPER: Search successful, results:', data.organic?.length || 0);
    
    return data;
 } catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown search error';
  console.error('❌ SERPER: Search failed for query:', query, errorMessage);
  throw error;
}
}

// Helper function for Claude analysis
async function performClaudeAnalysis(prompt: string) {
  try {
    console.log('🔍 CLAUDE: Making Claude API call...');
    
    if (!process.env.CLAUDE_API_KEY) {
      console.log('❌ CLAUDE: API key not found in environment');
      throw new Error('CLAUDE_API_KEY not configured');
    }

    console.log('🔍 CLAUDE: Using API key:', process.env.CLAUDE_API_KEY.substring(0, 8) + '...');
    
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

    console.log('🔍 CLAUDE: Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ CLAUDE: Error response:', errorText);
      throw new Error(`Claude API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ CLAUDE: Analysis successful');
    return data.content[0].text;
    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown Claude error';
    console.error('❌ CLAUDE: API failed:', errorMessage);
    throw error;
}
}