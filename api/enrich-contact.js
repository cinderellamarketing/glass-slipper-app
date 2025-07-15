export default async function handler(req, res) {
  // Enable CORS
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
    console.log('Contact enrichment request received');
    
    const { contact } = req.body;
    
    if (!contact || !contact.firstName || !contact.lastName || !contact.company) {
      return res.status(400).json({ 
        error: 'Contact object with firstName, lastName, and company is required' 
      });
    }

    // Step 1: Perform web searches
    const personQuery = `"${contact.firstName} ${contact.lastName}" "${contact.company}"`;
    const companyQuery = `"${contact.company}" website contact phone`;
    
    console.log('Search queries:', { personQuery, companyQuery });

    const [personResults, companyResults] = await Promise.all([
      performWebSearch(personQuery),
      performWebSearch(companyQuery)
    ]);

    console.log('Search results received');

    // Step 2: Use Claude to analyze results
    const analysisPrompt = `
You are a professional researcher analyzing web search results to extract contact information.

PERSON SEARCH RESULTS:
${JSON.stringify(personResults, null, 2)}

COMPANY SEARCH RESULTS:
${JSON.stringify(companyResults, null, 2)}

CONTACT TO ENRICH:
Name: ${contact.firstName} ${contact.lastName}
Company: ${contact.company}
Title: ${contact.title || 'Not provided'}

Please extract the following information from the search results:
1. PHONE NUMBER: Look for phone numbers in the search results
2. LOCATION: Find office locations, addresses, city/country
3. INDUSTRY: Determine the company's industry from descriptions
4. WEBSITE: Find the official company website URL
5. LINKEDIN: Look for LinkedIn profile URLs
6. COMPANY INFO: Extract company size, services, description

IMPORTANT: 
- Only extract information that appears in the actual search results
- Prefer official company websites and LinkedIn over other sources
- If information isn't found in results, say "Not found"
- Extract exact phone numbers, addresses, URLs as they appear

Please respond with ONLY a JSON object in this exact format:
{
  "basicInfo": {
    "phone": "Exact phone number found or 'Not found'",
    "location": "Specific address/city/country found or 'Not found'",
    "industry": "Industry found in search results or 'Not found'",
    "companyWebsite": "Official website URL found or 'Not found'",
    "linkedinProfile": "LinkedIn profile URL found or 'Not found'"
  },
  "companyIntelligence": {
    "companyFullName": "Full company name from search results",
    "companySize": "Employee count or size info from results or 'Not found'",
    "services": "Services/products description from results or 'Not found'",
    "foundOnWebsite": "Key information found about the company"
  },
  "searchQuality": "High|Medium|Low",
  "dataSource": "Search results from company website, LinkedIn, business directories"
}`;

    const enrichmentData = await performClaudeAnalysis(analysisPrompt);
    
    console.log('Claude analysis completed');
    res.json({ 
      success: true, 
      data: JSON.parse(enrichmentData) 
    });

  } catch (error) {
    console.error('Contact enrichment failed:', error);
    res.status(500).json({
      error: 'Contact enrichment failed',
      details: error.message,
      fallbackData: {
        basicInfo: {
          phone: "Search failed",
          location: "Search failed", 
          industry: "Search failed",
          companyWebsite: "Search failed",
          linkedinProfile: "Search failed"
        },
        companyIntelligence: {
          companyFullName: contact.company || "Unknown",
          companySize: "Search failed",
          services: "Search failed", 
          foundOnWebsite: "Search API unavailable"
        },
        searchQuality: "Low",
        dataSource: `Search API error: ${error.message}`
      }
    });
  }
}

// Helper function for web search
async function performWebSearch(query) {
  try {
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

// Helper function for Claude analysis
async function performClaudeAnalysis(prompt) {
  try {
    console.log('Making Claude API call from enrich-contact...');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',  // Updated model
        max_tokens: 1000,
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
    console.log('Claude API success in enrich-contact');
    return data.content[0].text;
  } catch (error) {
    console.error('Claude API failed in enrich-contact:', error.message);
    throw error;
  }
}
    if (!response.ok) {
      throw new Error(`Claude API failed: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Claude API failed:', error.message);
    throw error;
  }
}