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
        
        // Parse name to extract lastName
        const nameParts = contact.name.split(' ');
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
        
        console.log(`🔍 API: Extracted lastName: ${lastName}`);
        
        // STAGE 3: Enhanced search query for better website detection
        const companyQuery = `"${contact.company}" official website contact information business phone`;
        
        console.log('🔍 API: Company search query:', companyQuery);

        console.log('🔍 SERPER: Making search request for:', companyQuery);
        const companyResults = await performWebSearch(companyQuery);

        console.log('🔍 API: Search results received:', { 
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

        // STAGE 3: Extract potential website URLs from search results
        const extractedWebsites = extractWebsitesFromSearchResults(companyResults, contact.company);
        console.log('🔍 API: Extracted websites:', extractedWebsites);

        // STAGE 3: Updated Claude prompt with enhanced website detection instructions
        const analysisPrompt = `
Analyze these search results for the company: ${contact.company}

SEARCH RESULTS:
${JSON.stringify(companyResults?.organic?.slice(0, 8) || [], null, 2)}

POTENTIAL WEBSITES FOUND:
${JSON.stringify(extractedWebsites, null, 2)}

INSTRUCTIONS:
1. Find the official company website URL (prioritize company's main domain)
2. Look for business phone numbers (UK format preferred)
3. Determine the industry/business type from company description

WEBSITE SELECTION PRIORITY:
- Official company domain (e.g., ${contact.company.toLowerCase().replace(/\s+/g, '')}.com, ${contact.company.toLowerCase().replace(/\s+/g, '')}.co.uk)
- Domains that match the company name closely
- Websites with "About Us", "Contact", or company information
- Avoid social media, directories, or third-party sites

Return ONLY this JSON format (no markdown, no code blocks):
{
  "website": "Full official website URL (https://example.com) or 'Not found'",
  "phone": "Company phone number in UK format (+44...) or 'Not found'", 
  "industry": "Specific industry/business type or 'Not found'"
}

Focus on finding the PRIMARY official company website. If multiple websites exist, choose the most official/primary one.`;

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
          
          // STAGE 3: Enhanced fallback with extracted websites
          parsedData = {
            website: extractedWebsites.length > 0 ? extractedWebsites[0] : 'Parsing failed',
            phone: 'Parsing failed',
            industry: 'Parsing failed'
          };
        }

        // STAGE 3: Post-processing website validation and improvement
        if (parsedData.website && parsedData.website !== 'Not found' && parsedData.website !== 'Parsing failed') {
          parsedData.website = validateAndImproveWebsiteURL(parsedData.website, extractedWebsites, contact.company);
        } else if (extractedWebsites.length > 0) {
          // Use best extracted website as fallback
          parsedData.website = extractedWebsites[0];
          console.log(`🔍 API: Using extracted website fallback for ${contact.name}: ${parsedData.website}`);
        }

        // STAGE 2: Format response with explicit data preservation
        const enrichedContact = {
          ...contact,  // Keep all original contact data as base
          lastName: lastName,
          isEnriched: true,
          phone: parsedData.phone || 'Not found',
          website: parsedData.website || 'Not found',
          industry: parsedData.industry || 'Not found'
          // STAGE 2: Explicitly NOT including email field to prevent overwrite in client
        };

        // STAGE 2: Remove any email field that might have been added accidentally
        if (enrichedContact.email && enrichedContact.email !== contact.email) {
          console.warn(`⚠️ API: Removing email field from enriched data for ${contact.name} to preserve original`);
          delete enrichedContact.email;
        }

        console.log(`✅ API: Successfully enriched ${contact.name} with data:`, {
          lastName: enrichedContact.lastName,
          phone: enrichedContact.phone,
          website: enrichedContact.website,
          industry: enrichedContact.industry,
          originalEmailPreserved: contact.email
        });

        enrichedContacts.push(enrichedContact);
        
        // Rate limiting to avoid hitting API limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (contactError) {
        const errorMessage = contactError instanceof Error ? contactError.message : 'Unknown contact error';
        console.error(`❌ API: Failed to enrich ${contact.name}:`, errorMessage);
        
        // Add failed contact with fallback data so the app doesn't break
        const nameParts = contact.name.split(' ');
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
        
        enrichedContacts.push({
          ...contact,
          lastName: lastName,
          isEnriched: true,
          phone: 'Search failed',
          website: 'Search failed',
          industry: 'Search failed'
          // STAGE 2: No email field included to preserve original
        });
      }
    }

    console.log(`✅ API: Enrichment complete. Returning ${enrichedContacts.length} contacts`);
    
    // STAGE 2: Final validation - ensure no email fields in response
    enrichedContacts.forEach((contact, index) => {
      if (contact.email) {
        console.warn(`⚠️ API: Removing email field from response contact ${index} to preserve original data`);
        delete contact.email;
      }
    });
    
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

// STAGE 3: NEW FUNCTION - Extract potential websites from search results
function extractWebsitesFromSearchResults(searchResults, companyName) {
  const websites = [];
  
  if (!searchResults?.organic) {
    return websites;
  }

  const companyNameWords = companyName.toLowerCase().split(' ').filter(word => word.length > 2);
  
  searchResults.organic.forEach(result => {
    if (result.link) {
      try {
        const url = new URL(result.link);
        const domain = url.hostname.toLowerCase();
        
        // Skip common non-company domains
        const skipDomains = [
          'linkedin.com', 'facebook.com', 'twitter.com', 'instagram.com',
          'youtube.com', 'google.com', 'wikipedia.org', 'bloomberg.com',
          'crunchbase.com', 'glassdoor.com', 'indeed.com', 'companieshouse.gov.uk',
          'endole.co.uk', 'dnb.com', 'reuters.com', 'bbc.co.uk'
        ];
        
        if (skipDomains.some(skip => domain.includes(skip))) {
          return;
        }
        
        // Calculate domain relevance score
        let score = 0;
        
        // Check if domain contains company name words
        companyNameWords.forEach(word => {
          if (domain.includes(word)) {
            score += 10;
          }
        });
        
        // Prefer .com and .co.uk domains
        if (domain.endsWith('.com') || domain.endsWith('.co.uk')) {
          score += 5;
        }
        
        // Prefer shorter domains (likely to be main company domain)
        if (domain.split('.').length === 2) {
          score += 3;
        }
        
        // Check if title/snippet mentions the company
        const titleAndSnippet = (result.title + ' ' + (result.snippet || '')).toLowerCase();
        companyNameWords.forEach(word => {
          if (titleAndSnippet.includes(word)) {
            score += 3;
          }
        });
        
        // Look for "official" indicators
        if (titleAndSnippet.includes('official') || titleAndSnippet.includes('home') || 
            titleAndSnippet.includes('about us') || titleAndSnippet.includes('contact us')) {
          score += 5;
        }

        // Bonus for exact company name match in domain
        const simplifiedCompany = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (domain.includes(simplifiedCompany)) {
          score += 15;
        }

        websites.push({
          url: result.link,
          domain: domain,
          score: score,
          title: result.title
        });
        
      } catch (urlError) {
        console.log('⚠️ Invalid URL in search results:', result.link);
      }
    }
  });
  
  // Sort by score (highest first) and return top URLs
  return websites
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(site => site.url);
}

// STAGE 3: NEW FUNCTION - Validate and improve website URL
function validateAndImproveWebsiteURL(websiteURL, extractedWebsites, companyName) {
  try {
    // If it's already a valid URL, return it
    const url = new URL(websiteURL);
    return websiteURL;
  } catch {
    // If it's not a valid URL, try to construct one
    console.log('🔍 API: Invalid URL format, attempting to fix:', websiteURL);
    
    // Remove common prefixes and clean up
    let cleanDomain = websiteURL.replace(/^(https?:\/\/)?(www\.)?/, '').trim();
    
    // If it looks like a domain, add https://
    if (cleanDomain && !cleanDomain.includes(' ') && cleanDomain.includes('.')) {
      const fixedURL = `https://${cleanDomain}`;
      try {
        new URL(fixedURL); // Validate the fixed URL
        console.log('🔍 API: Fixed URL:', fixedURL);
        return fixedURL;
      } catch {
        console.log('🔍 API: Could not fix URL:', cleanDomain);
      }
    }
    
    // If we can't fix it, try to find a good extracted website
    if (extractedWebsites.length > 0) {
      console.log('🔍 API: Using best extracted website as replacement');
      return extractedWebsites[0];
    }
    
    return 'Not found';
  }
}

// Helper function for web search
async function performWebSearch(query) {
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
        num: 10,
        gl: 'uk'  // STAGE 3: Set geographic location to UK for better local results
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
async function performClaudeAnalysis(prompt) {
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