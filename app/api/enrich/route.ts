import { NextRequest, NextResponse } from 'next/server';

// TypeScript interfaces - matching exactly what React app expects
interface Contact {
  id: number;
  name: string;
  company: string;
  position: string;
  email: string;
  category?: string;
  isEnriched?: boolean;
  phone?: string;
  website?: string;
  lastName?: string;
  industry?: string;
}

interface EnrichmentData {
  website: string;
  phone: string;
  industry: string;
}

interface SearchResult {
  title?: string;
  link?: string;
  snippet?: string;
}

interface SearchResponse {
  organic?: SearchResult[];
}

interface WebsiteCandidate {
  url: string;
  domain: string;
  score: number;
  title: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API: Enrichment request received');
    console.log('🔍 API: Request headers:', Object.fromEntries(request.headers.entries()));
    console.log('🔍 API: Request method:', request.method);
    console.log('🔍 API: Request URL:', request.url);
    
    const { contacts } = await request.json();
    
    console.log('🔍 API: Request body parsed successfully');
    console.log('🔍 API: Contacts received:', {
      isArray: Array.isArray(contacts),
      count: contacts ? contacts.length : 0,
      hasContacts: !!contacts
    });
    
    if (!contacts || !Array.isArray(contacts)) {
      console.log('❌ API: Invalid contacts data - returning 400');
      return NextResponse.json({ 
        error: 'contacts array is required' 
      }, { status: 400 });
    }

    console.log(`🔍 API: Processing ${contacts.length} contacts`);
    
    // Log first contact for structure verification
    if (contacts.length > 0) {
      console.log('🔍 API: Sample contact structure:', {
        id: contacts[0].id,
        name: contacts[0].name,
        email: contacts[0].email,
        position: contacts[0].position,
        company: contacts[0].company,
        hasLastName: !!contacts[0].lastName,
        isEnriched: contacts[0].isEnriched
      });
    }
    
    // Log environment check
    console.log('🔍 API: Environment check:', {
      hasSerperKey: !!process.env.SERPER_API_KEY,
      hasClaudeKey: !!process.env.CLAUDE_API_KEY,
      serperKeyLength: process.env.SERPER_API_KEY?.length || 0,
      claudeKeyLength: process.env.CLAUDE_API_KEY?.length || 0
    });
    
    const enrichedContacts: Contact[] = [];

    for (const contact of contacts) {
      try {
        console.log(`🔍 API: ===== Processing contact: ${contact.name} =====`);
        console.log(`🔍 API: Contact details:`, {
          id: contact.id,
          name: contact.name,
          email: contact.email,
          position: contact.position,
          company: contact.company,
          category: contact.category,
          isEnriched: contact.isEnriched
        });
        
        // Extract lastName from name
        const nameParts = contact.name.split(' ');
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
        console.log(`🔍 API: Name parsing:`, {
          fullName: contact.name,
          nameParts: nameParts,
          extractedLastName: lastName
        });
        
        // STAGE 3: Enhanced search query for better website detection
        const searchQuery = `"${contact.company}" official website contact information business phone`;
        console.log('🔍 API: Search query prepared:', searchQuery);

        // Perform web search
        console.log('🔍 API: Starting web search...');
        const searchStartTime = Date.now();
        const searchResults = await performWebSearch(searchQuery);
        const searchDuration = Date.now() - searchStartTime;
        
        const resultCount = searchResults.organic ? searchResults.organic.length : 0;
        console.log('🔍 API: Web search completed:', { 
          resultCount,
          duration: `${searchDuration}ms`,
          hasOrganic: !!searchResults.organic
        });

        // Log first result for debugging
        if (searchResults.organic && searchResults.organic.length > 0) {
          const firstResult = searchResults.organic[0];
          console.log('🔍 API: First search result analysis:', {
            title: firstResult.title || 'No title',
            link: firstResult.link || 'No link',
            domain: firstResult.link ? new URL(firstResult.link).hostname : 'No domain',
            snippetLength: (firstResult.snippet || '').length,
            hasAllFields: !!(firstResult.title && firstResult.link && firstResult.snippet)
          });
        } else {
          console.log('⚠️ API: No search results found - enrichment will use fallbacks');
        }

        // STAGE 3: Extract potential websites from search results
        console.log('🔍 API: Starting website extraction...');
        const extractedWebsites = extractWebsitesFromSearchResults(searchResults, contact.company);
        console.log('🔍 API: Website extraction completed:', {
          extractedCount: extractedWebsites.length,
          websites: extractedWebsites
        });

        // STAGE 3: Enhanced Claude prompt with website detection instructions
        console.log('🔍 API: Preparing Claude analysis prompt...');
        const analysisPrompt = createAnalysisPrompt(contact.company, searchResults, extractedWebsites);
        console.log('🔍 API: Claude prompt prepared, length:', analysisPrompt.length);
        
        console.log('🔍 API: Starting Claude analysis...');
        const claudeStartTime = Date.now();
        const enrichmentData = await performClaudeAnalysis(analysisPrompt);
        const claudeDuration = Date.now() - claudeStartTime;
        
        console.log('🔍 API: Claude analysis completed:', {
          duration: `${claudeDuration}ms`,
          responseLength: enrichmentData.length,
          preview: enrichmentData.substring(0, 100) + '...'
        });
        
        // Parse Claude's response with error handling
        console.log('🔍 API: Parsing Claude response...');
        const parsedData = parseClaudeResponse(enrichmentData, extractedWebsites, contact.name);
        console.log('🔍 API: Claude response parsed:', {
          website: parsedData.website,
          phone: parsedData.phone,
          industry: parsedData.industry
        });

        // STAGE 3: Post-process website URL
        console.log('🔍 API: Validating and improving website URL...');
        const finalWebsite = validateAndImproveWebsiteURL(parsedData.website, extractedWebsites, contact.company);
        console.log('🔍 API: Website validation completed:', {
          original: parsedData.website,
          final: finalWebsite,
          wasImproved: finalWebsite !== parsedData.website
        });

        // INDUSTRY FIX: Analyze contact position if company search didn't find industry
        console.log('🔍 API: Analyzing industry from position...');
        const finalIndustry = analyzeIndustryFromPosition(parsedData.industry, contact.position, contact.company);
        console.log('🔍 API: Industry analysis completed:', {
          original: parsedData.industry,
          final: finalIndustry,
          wasAnalyzed: finalIndustry !== parsedData.industry,
          analysisSource: finalIndustry !== parsedData.industry ? 'position-analysis' : 'company-search'
        });

        // STAGE 2: Create enriched contact with explicit data preservation
        const enrichedContact: Contact = {
          // Preserve ALL original data
          id: contact.id,
          name: contact.name,
          company: contact.company,
          position: contact.position,
          email: contact.email, // STAGE 2: Always preserve original email
          category: contact.category,
          // Add enriched data
          lastName: lastName || undefined,
          isEnriched: true,
          phone: parsedData.phone || 'Not found',
          website: finalWebsite,
          industry: finalIndustry
        };

        console.log(`✅ API: Successfully enriched ${contact.name} with data:`, {
          lastName: enrichedContact.lastName,
          phone: enrichedContact.phone,
          website: enrichedContact.website,
          industry: enrichedContact.industry,
          industrySource: finalIndustry !== parsedData.industry ? 'position-analysis' : 'company-search',
          originalEmailPreserved: enrichedContact.email === contact.email
        });

        enrichedContacts.push(enrichedContact);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (contactError) {
        const errorMessage = contactError instanceof Error ? contactError.message : 'Unknown contact error';
        console.error(`❌ API: Failed to enrich ${contact.name}:`, errorMessage);
        
        // Create fallback enriched contact
        const nameParts = contact.name.split(' ');
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
        
        const failedContact: Contact = {
          id: contact.id,
          name: contact.name,
          company: contact.company,
          position: contact.position,
          email: contact.email, // STAGE 2: Always preserve original email
          category: contact.category,
          lastName: lastName || undefined,
          isEnriched: true,
          phone: 'Search failed',
          website: 'Search failed',
          industry: analyzeIndustryFromPosition('Search failed', contact.position, contact.company)
        };

        enrichedContacts.push(failedContact);
      }
    }

    console.log(`✅ API: Enrichment complete. Returning ${enrichedContacts.length} contacts`);
    
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

// INDUSTRY FIX: Analyze industry from contact position and company
function analyzeIndustryFromPosition(currentIndustry: string, position: string, company: string): string {
  // If we already have a valid industry from company search, use it
  if (currentIndustry && currentIndustry !== 'Not found' && currentIndustry !== 'Search failed' && currentIndustry !== 'Parsing failed') {
    return currentIndustry;
  }

  console.log('🔍 INDUSTRY: Analyzing position for industry:', { position, company });

  const pos = position.toLowerCase();
  const comp = company.toLowerCase();

  // Financial Services
  if (pos.includes('wealth manager') || pos.includes('financial advisor') || pos.includes('investment') || 
      pos.includes('portfolio manager') || pos.includes('private banker') || pos.includes('fund manager') ||
      comp.includes('wealth') || comp.includes('investment') || comp.includes('financial') || comp.includes('asset management')) {
    console.log('✅ INDUSTRY: Mapped to Financial Services');
    return 'Financial Services';
  }

  // Technology
  if (pos.includes('developer') || pos.includes('engineer') || pos.includes('programmer') || pos.includes('tech') ||
      pos.includes('software') || pos.includes('data scientist') || pos.includes('devops') || pos.includes('architect') ||
      comp.includes('tech') || comp.includes('software') || comp.includes('digital') || comp.includes('data')) {
    console.log('✅ INDUSTRY: Mapped to Technology');
    return 'Technology';
  }

  // Marketing & Advertising
  if (pos.includes('marketing') || pos.includes('brand') || pos.includes('advertising') || pos.includes('social media') ||
      pos.includes('content') || pos.includes('digital marketing') || pos.includes('seo') || pos.includes('ppc') ||
      comp.includes('marketing') || comp.includes('advertising') || comp.includes('agency') || comp.includes('creative')) {
    console.log('✅ INDUSTRY: Mapped to Marketing & Advertising');
    return 'Marketing & Advertising';
  }

  // Healthcare
  if (pos.includes('doctor') || pos.includes('nurse') || pos.includes('physician') || pos.includes('medical') ||
      pos.includes('healthcare') || pos.includes('clinical') || pos.includes('pharma') || pos.includes('therapist') ||
      comp.includes('health') || comp.includes('medical') || comp.includes('hospital') || comp.includes('clinic')) {
    console.log('✅ INDUSTRY: Mapped to Healthcare');
    return 'Healthcare';
  }

  // Legal
  if (pos.includes('lawyer') || pos.includes('solicitor') || pos.includes('legal') || pos.includes('attorney') ||
      pos.includes('barrister') || pos.includes('counsel') || pos.includes('paralegal') ||
      comp.includes('law') || comp.includes('legal') || comp.includes('solicitors')) {
    console.log('✅ INDUSTRY: Mapped to Legal Services');
    return 'Legal Services';
  }

  // Education
  if (pos.includes('teacher') || pos.includes('professor') || pos.includes('lecturer') || pos.includes('educator') ||
      pos.includes('academic') || pos.includes('instructor') || pos.includes('tutor') ||
      comp.includes('school') || comp.includes('university') || comp.includes('education') || comp.includes('college')) {
    console.log('✅ INDUSTRY: Mapped to Education');
    return 'Education';
  }

  // Real Estate
  if (pos.includes('estate agent') || pos.includes('property') || pos.includes('real estate') || pos.includes('surveyor') ||
      pos.includes('valuer') || pos.includes('lettings') || pos.includes('property manager') ||
      comp.includes('property') || comp.includes('estate') || comp.includes('real estate') || comp.includes('lettings')) {
    console.log('✅ INDUSTRY: Mapped to Real Estate');
    return 'Real Estate';
  }

  // Consulting
  if (pos.includes('consultant') || pos.includes('advisor') || pos.includes('strategist') || pos.includes('analyst') ||
      pos.includes('business development') || pos.includes('transformation') ||
      comp.includes('consulting') || comp.includes('advisory') || comp.includes('strategy')) {
    console.log('✅ INDUSTRY: Mapped to Consulting');
    return 'Consulting';
  }

  // Manufacturing
  if (pos.includes('manufacturing') || pos.includes('production') || pos.includes('operations') || pos.includes('supply chain') ||
      pos.includes('quality') || pos.includes('plant') || pos.includes('factory') ||
      comp.includes('manufacturing') || comp.includes('industrial') || comp.includes('automotive') || comp.includes('aerospace')) {
    console.log('✅ INDUSTRY: Mapped to Manufacturing');
    return 'Manufacturing';
  }

  // Retail
  if (pos.includes('retail') || pos.includes('sales assistant') || pos.includes('store') || pos.includes('merchandising') ||
      pos.includes('buyer') || pos.includes('category') || pos.includes('visual merchandiser') ||
      comp.includes('retail') || comp.includes('store') || comp.includes('shop') || comp.includes('fashion')) {
    console.log('✅ INDUSTRY: Mapped to Retail');
    return 'Retail';
  }

  // Construction
  if (pos.includes('construction') || pos.includes('builder') || pos.includes('contractor') || pos.includes('architect') ||
      pos.includes('civil engineer') || pos.includes('quantity surveyor') || pos.includes('project manager') ||
      comp.includes('construction') || comp.includes('building') || comp.includes('contractors') || comp.includes('infrastructure')) {
    console.log('✅ INDUSTRY: Mapped to Construction');
    return 'Construction';
  }

  // Media & Entertainment
  if (pos.includes('journalist') || pos.includes('editor') || pos.includes('producer') || pos.includes('director') ||
      pos.includes('media') || pos.includes('broadcasting') || pos.includes('film') || pos.includes('television') ||
      comp.includes('media') || comp.includes('broadcasting') || comp.includes('entertainment') || comp.includes('production')) {
    console.log('✅ INDUSTRY: Mapped to Media & Entertainment');
    return 'Media & Entertainment';
  }

  // Generic business roles - try to infer from company name
  if (pos.includes('manager') || pos.includes('director') || pos.includes('executive') || pos.includes('officer')) {
    if (comp.includes('bank') || comp.includes('finance') || comp.includes('credit')) {
      console.log('✅ INDUSTRY: Manager at financial company - mapped to Financial Services');
      return 'Financial Services';
    }
    if (comp.includes('tech') || comp.includes('software') || comp.includes('digital')) {
      console.log('✅ INDUSTRY: Manager at tech company - mapped to Technology');
      return 'Technology';
    }
    if (comp.includes('marketing') || comp.includes('agency') || comp.includes('creative')) {
      console.log('✅ INDUSTRY: Manager at marketing company - mapped to Marketing & Advertising');
      return 'Marketing & Advertising';
    }
  }

  console.log('⚠️ INDUSTRY: Could not determine industry from position or company');
  return currentIndustry || 'Not found';
}

// STAGE 3: Extract potential websites from search results
function extractWebsitesFromSearchResults(searchResults: SearchResponse, companyName: string): string[] {
  if (!searchResults.organic || searchResults.organic.length === 0) {
    return [];
  }

  const companyNameWords = companyName.toLowerCase().split(' ').filter(word => word.length > 2);
  const websites: WebsiteCandidate[] = [];

  for (const result of searchResults.organic) {
    if (!result.link) continue;

    try {
      const url = new URL(result.link);
      const domain = url.hostname.toLowerCase();
      
      // Skip non-company domains
      const skipDomains = [
        'linkedin.com', 'facebook.com', 'twitter.com', 'instagram.com',
        'youtube.com', 'google.com', 'wikipedia.org', 'bloomberg.com',
        'crunchbase.com', 'glassdoor.com', 'indeed.com', 'companieshouse.gov.uk',
        'endole.co.uk', 'dnb.com', 'reuters.com', 'bbc.co.uk'
      ];
      
      if (skipDomains.some(skip => domain.includes(skip))) {
        continue;
      }
      
      // Calculate relevance score
      let score = 0;
      
      // Domain contains company name words
      companyNameWords.forEach(word => {
        if (domain.includes(word)) {
          score += 10;
        }
      });
      
      // Prefer common TLDs
      if (domain.endsWith('.com') || domain.endsWith('.co.uk')) {
        score += 5;
      }
      
      // Prefer shorter domains (likely main company domain)
      if (domain.split('.').length === 2) {
        score += 3;
      }
      
      // Check title and snippet for company mentions
      const title = result.title || '';
      const snippet = result.snippet || '';
      const titleAndSnippet = (title + ' ' + snippet).toLowerCase();
      
      companyNameWords.forEach(word => {
        if (titleAndSnippet.includes(word)) {
          score += 3;
        }
      });
      
      // Look for official indicators
      if (titleAndSnippet.includes('official') || 
          titleAndSnippet.includes('home') || 
          titleAndSnippet.includes('about us') || 
          titleAndSnippet.includes('contact us')) {
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
        title: title
      });
      
    } catch (urlError) {
      console.log('⚠️ Invalid URL in search results:', result.link);
    }
  }
  
  // Sort by score and return top URLs as strings
  return websites
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(site => site.url);
}

// STAGE 3: Create enhanced analysis prompt
function createAnalysisPrompt(companyName: string, searchResults: SearchResponse, extractedWebsites: string[]): string {
  const resultsJson = JSON.stringify(searchResults.organic?.slice(0, 8) || [], null, 2);
  const websitesJson = JSON.stringify(extractedWebsites, null, 2);
  
  return `
Analyze these search results for the company: ${companyName}

SEARCH RESULTS:
${resultsJson}

POTENTIAL WEBSITES FOUND:
${websitesJson}

INSTRUCTIONS:
1. Find the official company website URL (prioritize company's main domain)
2. Look for business phone numbers (UK format preferred)  
3. Determine the industry/business type from company description
   - Look for business activities, services offered, sector descriptions
   - Common industries: Financial Services, Technology, Healthcare, Legal Services, Consulting, etc.

WEBSITE SELECTION PRIORITY:
- Official company domain (e.g., ${companyName.toLowerCase().replace(/\s+/g, '')}.com, ${companyName.toLowerCase().replace(/\s+/g, '')}.co.uk)
- Domains that match the company name closely
- Websites with "About Us", "Contact", or company information
- Avoid social media, directories, or third-party sites

Return ONLY this JSON format (no markdown, no code blocks):
{
  "website": "Full official website URL (https://example.com) or 'Not found'",
  "phone": "Company phone number in UK format (+44...) or 'Not found'", 
  "industry": "Specific industry/business type or 'Not found'"
}

Focus on finding the PRIMARY official company website and the main business sector/industry the company operates in.`;
}

// Parse Claude's response with fallback handling
function parseClaudeResponse(enrichmentData: string, extractedWebsites: string[], contactName: string): EnrichmentData {
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
    
    const parsedData = JSON.parse(cleanedResponse);
    console.log('✅ API: Successfully parsed Claude response:', parsedData);
    
    return {
      website: parsedData.website || 'Not found',
      phone: parsedData.phone || 'Not found',
      industry: parsedData.industry || 'Not found'
    };
    
  } catch (parseError) {
    const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
    console.log('❌ API: Claude parsing failed for', contactName, '- using fallback. Error:', errorMessage);
    
    // STAGE 3: Enhanced fallback with extracted websites
    return {
      website: extractedWebsites.length > 0 ? extractedWebsites[0] : 'Parsing failed',
      phone: 'Parsing failed',
      industry: 'Parsing failed'
    };
  }
}

// STAGE 3: Validate and improve website URL
function validateAndImproveWebsiteURL(websiteURL: string, extractedWebsites: string[], companyName: string): string {
  if (!websiteURL || websiteURL === 'Not found' || websiteURL === 'Parsing failed') {
    return extractedWebsites.length > 0 ? extractedWebsites[0] : 'Not found';
  }

  try {
    // Test if it's already a valid URL
    new URL(websiteURL);
    return websiteURL;
  } catch {
    // Try to fix the URL
    console.log('🔍 API: Invalid URL format, attempting to fix:', websiteURL);
    
    // Clean up the URL string
    let cleanDomain = websiteURL.replace(/^(https?:\/\/)?(www\.)?/, '').trim();
    
    // If it looks like a domain, add https://
    if (cleanDomain && !cleanDomain.includes(' ') && cleanDomain.includes('.')) {
      const fixedURL = `https://${cleanDomain}`;
      try {
        new URL(fixedURL);
        console.log('🔍 API: Fixed URL:', fixedURL);
        return fixedURL;
      } catch {
        console.log('🔍 API: Could not fix URL:', cleanDomain);
      }
    }
    
    // Use extracted website as fallback
    if (extractedWebsites.length > 0) {
      console.log('🔍 API: Using best extracted website as replacement');
      return extractedWebsites[0];
    }
    
    return 'Not found';
  }
}

// Perform web search using Serper API
async function performWebSearch(query: string): Promise<SearchResponse> {
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
        gl: 'uk' // STAGE 3: UK geographic targeting
      })
    });

    console.log('🔍 SERPER: Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ SERPER: Error response:', errorText);
      throw new Error(`Search failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as SearchResponse;
    const resultCount = data.organic ? data.organic.length : 0;
    console.log('✅ SERPER: Search successful, results:', resultCount);
    
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown search error';
    console.error('❌ SERPER: Search failed for query:', query, errorMessage);
    throw error;
  }
}

// Perform Claude analysis
async function performClaudeAnalysis(prompt: string): Promise<string> {
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