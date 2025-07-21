export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Enrichment request received');
    
    const { contacts } = req.body; // App sends array of contacts
    
    if (!contacts || !Array.isArray(contacts)) {
      return res.status(400).json({ 
        error: 'contacts array is required' 
      });
    }

    console.log(`Processing ${contacts.length} contacts`);
    const enrichedContacts = [];

    // Process each contact
    for (const contact of contacts) {
      try {
        console.log(`Processing contact: ${contact.name} at ${contact.company}`);
        
        // Step 1: Perform web searches using the app's field names
        const personQuery = `"${contact.name}" "${contact.company}"`;
        const companyQuery = `"${contact.company}" website contact phone`;
        
        console.log('Search queries:', { personQuery, companyQuery });

        const [personResults, companyResults] = await Promise.all([
          performWebSearch(personQuery),
          performWebSearch(companyQuery)
        ]);

        console.log('Search results received:', { 
          personResults: personResults?.organic?.length || 0,
          companyResults: companyResults?.organic?.length || 0
        });

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

        const enrichmentData = await performClaudeAnalysis(analysisPrompt);
        console.log('Claude analysis completed for', contact.name);
        
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
          
          parsedData = JSON.parse(cleanedResponse);
          console.log('Successfully parsed Claude response for', contact.name);
        } catch (parseError) {
          console.log('Claude parsing failed for', contact.name, '- using fallback');
          parsedData = {
            phone: 'Not found',
            industry: 'Not found',
            location: 'Not found', 
            website: 'Not found'
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

        enrichedContacts.push(enrichedContact);
        console.log(`Successfully enriched ${contact.name}`);
        
        // Rate limiting to avoid hitting API limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (contactError) {
        console.error(`Failed to enrich ${contact.name}:`, contactError.message);
        
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

    console.log(`Enrichment complete. Processed ${enrichedContacts.length} contacts`);
    
    // Return format that matches what the app expects
    res.json({ 
      contacts: enrichedContacts 
    });

  } catch (error) {
    console.error('Enrichment process failed:', error);
    res.status(500).json({
      error: 'Enrichment failed',
      details: error.message
    });
  }
}

// Helper function for web search (keep from your original file)
async function performWebSearch(query) {
  try {
    if (!process.env.SERPER_API_KEY) {
      throw new Error('SERPER_API_KEY not configured');
    }

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

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Web search failed for query:', query, error.message);
    throw error;
  }
}

// Helper function for Claude analysis (keep from your original file)
async function performClaudeAnalysis(prompt) {
  try {
    if (!process.env.CLAUDE_API_KEY) {
      throw new Error('CLAUDE_API_KEY not configured');
    }

    console.log('Making Claude API call...');
    
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

    console.log('Claude API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API Error:', errorText);
      throw new Error(`Claude API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Claude API success');
    return data.content[0].text;
  } catch (error) {
    console.error('Claude API failed:', error.message);
    throw error;
  }
}