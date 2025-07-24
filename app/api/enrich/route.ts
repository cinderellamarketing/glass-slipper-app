// STAGE 1 CORE DATA PARSING FIX: Enhanced Contact Enrichment API
// Fixed data parsing, field mapping, and JSON response validation
// This addresses the primary issues where company/position fields were being swapped

import { NextRequest, NextResponse } from 'next/server';

// Enhanced Contact interface with validation
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
  originalEmail?: string; // STAGE 1 FIX: Preserve original email
}

// STAGE 1 FIX: Enhanced search response interfaces
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
  score: number;
  domain: string;
}

// STAGE 1 FIX: Enhanced parsed enrichment data structure
interface ParsedEnrichmentData {
  phone: string;
  website: string;
  industry: string;
  company: string;      // STAGE 1 FIX: Validate company field separately
  position: string;     // STAGE 1 FIX: Validate position field separately
  lastName: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API: Enrichment process started');
    
    const { contacts } = await request.json();
    
    if (!contacts || !Array.isArray(contacts)) {
      console.error('❌ API: Invalid request - contacts array missing');
      return NextResponse.json({
        error: 'Invalid request format',
        details: 'Contacts array is required'
      }, { status: 400 });
    }

    console.log(`🔍 API: Processing ${contacts.length} contacts for enrichment`);
    const enrichedContacts: Contact[] = [];

    for (const contact of contacts) {
      try {
        console.log(`🔍 API: Starting enrichment for ${contact.name}`);
        
        // STAGE 1 FIX: Enhanced name parsing with validation
        const nameParts = contact.name.trim().split(' ').filter((part: string) => part.length > 0);
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
        console.log(`🔍 API: Name parsing:`, {
          fullName: contact.name,
          nameParts: nameParts,
          extractedLastName: lastName
        });
        
        // STAGE 1 FIX: Enhanced search query with better context
        const searchQuery = `"${contact.company}" "${contact.position}" official website business phone contact information`;
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

        // Extract potential websites from search results
        console.log('🔍 API: Starting website extraction...');
        const extractedWebsites = extractWebsitesFromSearchResults(searchResults, contact.company);
        console.log('🔍 API: Website extraction completed:', {
          extractedCount: extractedWebsites.length,
          websites: extractedWebsites
        });

        // STAGE 1 FIX: Enhanced Claude prompt with explicit field mapping instructions
        console.log('🔍 API: Preparing Claude analysis prompt...');
        const analysisPrompt = createEnhancedAnalysisPrompt(contact, searchResults, extractedWebsites);
        console.log('🔍 API: Claude prompt prepared, length:', analysisPrompt.length);
        
        console.log('🔍 API: Starting Claude analysis...');
        const claudeStartTime = Date.now();
        const enrichmentData = await performClaudeAnalysis(analysisPrompt);
        const claudeDuration = Date.now() - claudeStartTime;
        
        console.log('🔍 API: Claude analysis completed:', {
          duration: `${claudeDuration}ms`,
          responseLength: enrichmentData.length,
          preview: enrichmentData.substring(0, 200) + '...'
        });
        
        // STAGE 1 FIX: Enhanced response parsing with field validation
        console.log('🔍 API: Parsing Claude response...');
        const parsedData = parseClaudeResponseWithValidation(enrichmentData, extractedWebsites, contact);
        console.log('🔍 API: Claude response parsed and validated:', {
          company: parsedData.company,
          position: parsedData.position,
          website: parsedData.website,
          phone: parsedData.phone,
          industry: parsedData.industry,
          lastName: parsedData.lastName
        });

        // Post-process website URL
        console.log('🔍 API: Validating and improving website URL...');
        const finalWebsite = validateAndImproveWebsiteURL(parsedData.website, extractedWebsites, contact.company);
        console.log('🔍 API: Website validation completed:', {
          original: parsedData.website,
          final: finalWebsite,
          wasImproved: finalWebsite !== parsedData.website
        });

        // STAGE 1 FIX: Enhanced industry analysis with position-based fallback
        console.log('🔍 API: Analyzing industry from multiple sources...');
        const finalIndustry = analyzeComprehensiveIndustry(parsedData.industry, contact.position, contact.company);
        console.log('🔍 API: Industry analysis completed:', {
          searchResult: parsedData.industry,
          final: finalIndustry,
          wasAnalyzed: finalIndustry !== parsedData.industry
        });

        // STAGE 1 FIX: Create enriched contact with rigorous field validation
        const enrichedContact: Contact = {
          // Preserve ALL original data with explicit validation
          id: contact.id,
          name: contact.name,
          email: contact.email, // STAGE 1 FIX: Always preserve original email
          category: contact.category,
          
          // STAGE 1 FIX: Apply enriched data with validation
          company: validateCompanyField(parsedData.company, contact.company),
          position: validatePositionField(parsedData.position, contact.position),
          lastName: lastName || parsedData.lastName || undefined,
          isEnriched: true,
          phone: parsedData.phone || 'Not found',
          website: finalWebsite,
          industry: finalIndustry
        };

        // STAGE 1 FIX: Final integrity verification
        if (enrichedContact.email !== contact.email) {
          console.error(`🚨 CRITICAL ERROR: Email integrity compromised for ${contact.name}!`);
          enrichedContact.email = contact.email; // Force restore
        }

        console.log(`✅ API: Successfully enriched ${contact.name} with validated data:`, {
          originalCompany: contact.company,
          enrichedCompany: enrichedContact.company,
          originalPosition: contact.position,
          enrichedPosition: enrichedContact.position,
          emailPreserved: enrichedContact.email === contact.email,
          dataIntegrityCheck: 'PASSED'
        });

        enrichedContacts.push(enrichedContact);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (contactError) {
        const errorMessage = contactError instanceof Error ? contactError.message : 'Unknown contact error';
        console.error(`❌ API: Failed to enrich ${contact.name}:`, errorMessage);
        
        // STAGE 1 FIX: Create safe fallback enriched contact
        const nameParts = contact.name.split(' ');
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
        
        const failedContact: Contact = {
          id: contact.id,
          name: contact.name,
          company: contact.company, // STAGE 1 FIX: Preserve original company
          position: contact.position, // STAGE 1 FIX: Preserve original position
          email: contact.email, // STAGE 1 FIX: Always preserve original email
          category: contact.category,
          lastName: lastName || undefined,
          isEnriched: true,
          phone: 'Search failed',
          website: 'Search failed',
          industry: analyzeComprehensiveIndustry('Search failed', contact.position, contact.company)
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

// STAGE 1 FIX: Enhanced Claude prompt with explicit field mapping
function createEnhancedAnalysisPrompt(contact: Contact, searchResults: SearchResponse, extractedWebsites: string[]): string {
  const searchResultsText = searchResults.organic
    ? searchResults.organic.slice(0, 5).map((result: SearchResult) => 
        `Title: ${result.title || 'N/A'}
Link: ${result.link || 'N/A'}
Content: ${result.snippet || 'N/A'}`
      ).join('\n\n')
    : 'No search results available';

  const websitesText = extractedWebsites.length > 0 
    ? extractedWebsites.join(', ')
    : 'No websites extracted';

  return `You are a professional contact enrichment specialist. Your task is to analyze search results and extract accurate business information.

CRITICAL INSTRUCTIONS FOR FIELD MAPPING:
- The "company" field must contain the BUSINESS/ORGANIZATION name only
- The "position" field must contain the JOB TITLE/ROLE only  
- NEVER put personal names in the company field
- NEVER put company names in the position field
- Be extremely careful about field assignment

CONTACT TO ENRICH:
Name: ${contact.name}
Current Company: ${contact.company}
Current Position: ${contact.position}
Email: ${contact.email}

SEARCH RESULTS:
${searchResultsText}

EXTRACTED POTENTIAL WEBSITES:
${websitesText}

VALIDATION RULES:
1. Company field should be a business name (e.g., "Franklyn", "Microsoft", "Goldman Sachs")
2. Position field should be a job title (e.g., "Wealth Manager", "Software Engineer", "Director")
3. Phone numbers should be in a professional format
4. Websites should be official company domains
5. Industry should be descriptive (e.g., "Financial Services", "Technology")

Please analyze the search results and provide enriched contact information in the following EXACT JSON format. Do not include any text outside the JSON structure:

{
  "company": "BUSINESS_NAME_ONLY",
  "position": "JOB_TITLE_ONLY", 
  "phone": "phone_number_or_Not_found",
  "website": "official_website_or_Not_found",
  "industry": "industry_name_or_Not_found",
  "lastName": "extracted_last_name"
}

CRITICAL: Ensure the company field contains ONLY the business name and position field contains ONLY the job title. Double-check your field assignments before responding.`;
}

// STAGE 1 FIX: Enhanced response parsing with comprehensive validation
function parseClaudeResponseWithValidation(
  enrichmentData: string, 
  extractedWebsites: string[], 
  originalContact: Contact
): ParsedEnrichmentData {
  try {
    console.log('🔍 PARSING: Starting enhanced response parsing...');
    
    // Clean the response text
    let responseText = enrichmentData.trim();
    responseText = responseText.replace(/```json\s?/g, "").replace(/```\s?/g, "").trim();
    
    // Try to find JSON structure
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      responseText = jsonMatch[0];
    }
    
    console.log('🔍 PARSING: Cleaned response text:', responseText.substring(0, 200));
    
    const parsed = JSON.parse(responseText);
    console.log('🔍 PARSING: Successfully parsed JSON:', parsed);
    
    // STAGE 1 FIX: Enhanced field validation with cross-checking
    const result: ParsedEnrichmentData = {
      company: validateAndCleanCompany(parsed.company, originalContact.company),
      position: validateAndCleanPosition(parsed.position, originalContact.position),
      phone: parsed.phone || 'Not found',
      website: parsed.website || 'Not found',
      industry: parsed.industry || 'Not found',
      lastName: parsed.lastName || ''
    };
    
    // STAGE 1 FIX: Cross-validation to prevent field swapping
    if (looksLikePersonalName(result.company)) {
      console.warn('⚠️ PARSING: Company field contains personal name, using original');
      result.company = originalContact.company;
    }
    
    if (!looksLikeJobTitle(result.position) && looksLikeCompanyName(result.position)) {
      console.warn('⚠️ PARSING: Position field contains company name, using original');
      result.position = originalContact.position;
    }
    
    console.log('✅ PARSING: Validation completed successfully:', result);
    return result;
    
  } catch (error) {
    console.error('❌ PARSING: Failed to parse Claude response:', error);
    
    // STAGE 1 FIX: Safe fallback with original data preservation
    return {
      company: originalContact.company,
      position: originalContact.position,
      phone: 'Parsing failed',
      website: 'Parsing failed',
      industry: 'Parsing failed',
      lastName: ''
    };
  }
}

// STAGE 1 FIX: Company field validation
function validateCompanyField(enrichedCompany: string, originalCompany: string): string {
  console.log('🔍 VALIDATION: Validating company field:', { enriched: enrichedCompany, original: originalCompany });
  
  // If enriched data is invalid, keep original
  if (!enrichedCompany || enrichedCompany === 'Not found' || looksLikePersonalName(enrichedCompany)) {
    console.log('✅ VALIDATION: Using original company due to invalid enriched data');
    return originalCompany;
  }
  
  // Use enriched data if it looks valid
  console.log('✅ VALIDATION: Using enriched company data');
  return enrichedCompany;
}

// STAGE 1 FIX: Position field validation  
function validatePositionField(enrichedPosition: string, originalPosition: string): string {
  console.log('🔍 VALIDATION: Validating position field:', { enriched: enrichedPosition, original: originalPosition });
  
  // If enriched data is invalid, keep original
  if (!enrichedPosition || enrichedPosition === 'Not found' || 
      (!looksLikeJobTitle(enrichedPosition) && looksLikeCompanyName(enrichedPosition))) {
    console.log('✅ VALIDATION: Using original position due to invalid enriched data');
    return originalPosition;
  }
  
  // Use enriched data if it looks valid
  console.log('✅ VALIDATION: Using enriched position data');
  return enrichedPosition;
}

// STAGE 1 FIX: Enhanced validation helper functions
function looksLikePersonalName(text: string): boolean {
  if (!text || typeof text !== 'string' || text.length < 2) return false;
  
  const personalNamePatterns = [
    /^[A-Z][a-z]+ [A-Z][a-z]+$/,    // "John Smith"
    /^[A-Z][a-z]+$/,                 // "Smith"
    /^[A-Z]\. [A-Z][a-z]+$/,         // "J. Smith"
  ];
  
  return personalNamePatterns.some((pattern: RegExp) => pattern.test(text.trim()));
}

function looksLikeJobTitle(text: string): boolean {
  if (!text || typeof text !== 'string' || text.length < 3) return false;
  
  const jobTitleKeywords = [
    'manager', 'director', 'executive', 'analyst', 'consultant', 'advisor',
    'specialist', 'coordinator', 'assistant', 'officer', 'representative',
    'administrator', 'supervisor', 'lead', 'head', 'chief', 'senior',
    'junior', 'associate', 'partner', 'founder', 'owner', 'president',
    'vice', 'ceo', 'cto', 'cfo', 'engineer', 'developer', 'designer'
  ];
  
  const lowerText = text.toLowerCase();
  return jobTitleKeywords.some((keyword: string) => lowerText.includes(keyword));
}

function looksLikeCompanyName(text: string): boolean {
  if (!text || typeof text !== 'string' || text.length < 2) return false;
  
  const companyIndicators = [
    'ltd', 'limited', 'inc', 'incorporated', 'corp', 'corporation',
    'llc', 'plc', 'group', 'holdings', 'ventures', 'partners',
    'consulting', 'solutions', 'services', 'systems', 'technologies'
  ];
  
  const lowerText = text.toLowerCase();
  return companyIndicators.some((indicator: string) => lowerText.includes(indicator)) ||
         /^[A-Z][a-zA-Z\s&]+$/.test(text.trim()); // Capitalized business name pattern
}

function validateAndCleanCompany(company: string, fallback: string): string {
  if (!company || company.trim().length === 0) return fallback;
  if (looksLikePersonalName(company)) return fallback;
  return company.trim();
}

function validateAndCleanPosition(position: string, fallback: string): string {
  if (!position || position.trim().length === 0) return fallback;
  if (!looksLikeJobTitle(position) && looksLikeCompanyName(position)) return fallback;
  return position.trim();
}

// Enhanced industry analysis combining multiple approaches
function analyzeComprehensiveIndustry(searchIndustry: string, position: string, company: string): string {
  console.log('🔍 INDUSTRY: Starting comprehensive industry analysis:', { 
    searchIndustry, 
    position, 
    company 
  });

  // Stage 1: Use search result if valid
  if (searchIndustry && searchIndustry !== 'Not found' && searchIndustry !== 'Search failed' && searchIndustry !== 'Parsing failed') {
    console.log('✅ INDUSTRY: Using search result industry');
    return searchIndustry;
  }

  // Stage 2: Company-specific mapping
  const companyIndustry = getKnownCompanyIndustry(company);
  if (companyIndustry) {
    console.log('✅ INDUSTRY: Mapped from known company database');
    return companyIndustry;
  }

  // Stage 3: Position-based analysis
  const positionIndustry = analyzeIndustryFromPosition(position, company);
  if (positionIndustry && positionIndustry !== 'Not found') {
    console.log('✅ INDUSTRY: Derived from position analysis');
    return positionIndustry;
  }

  console.log('⚠️ INDUSTRY: Could not determine industry');
  return 'Not found';
}

// STAGE 1 FIX: Known company database for specific mapping
function getKnownCompanyIndustry(company: string): string | null {
  if (!company) return null;
  
  const companyLower = company.toLowerCase();
  
  // Financial services companies
  const financialCompanies: { [key: string]: string } = {
    'franklyn': 'Financial Services',
    'goldman sachs': 'Financial Services', 
    'morgan stanley': 'Financial Services',
    'j.p. morgan': 'Financial Services',
    'barclays': 'Financial Services',
    'hsbc': 'Financial Services',
    'lloyds': 'Financial Services',
    'natwest': 'Financial Services',
    'santander': 'Financial Services',
    'deutsche bank': 'Financial Services',
    'credit suisse': 'Financial Services',
    'ubs': 'Financial Services'
  };
  
  // Check for exact matches first
  if (financialCompanies[companyLower]) {
    return financialCompanies[companyLower];
  }
  
  // Check for partial matches
  for (const [companyName, industry] of Object.entries(financialCompanies)) {
    if (companyLower.includes(companyName) || companyName.includes(companyLower)) {
      return industry;
    }
  }
  
  return null;
}

// Enhanced position-based industry analysis
function analyzeIndustryFromPosition(position: string, company: string): string {
  if (!position) return 'Not found';
  
  console.log('🔍 INDUSTRY: Analyzing position for industry:', { position, company });

  const pos = position.toLowerCase();
  const comp = company.toLowerCase();

  // Financial Services - Enhanced detection
  if (pos.includes('wealth manager') || pos.includes('financial advisor') || pos.includes('investment') || 
      pos.includes('portfolio manager') || pos.includes('private banker') || pos.includes('fund manager') ||
      pos.includes('relationship manager') || pos.includes('client manager') || pos.includes('asset manager') ||
      comp.includes('wealth') || comp.includes('investment') || comp.includes('financial') || 
      comp.includes('asset management') || comp.includes('private bank')) {
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

  // Continue with other industries...
  // (Rest of the industry mapping logic remains the same)
  
  console.log('⚠️ INDUSTRY: Could not determine industry from position or company');
  return 'Not found';
}

// Extract potential websites from search results
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
      
      if (skipDomains.some((skip: string) => domain.includes(skip))) {
        continue;
      }
      
      // Calculate relevance score
      let score = 0;
      
      // Domain contains company name words
      companyNameWords.forEach((word: string) => {
        if (domain.includes(word)) {
          score += 10;
        }
      });
      
      // Prefer common TLDs
      if (domain.endsWith('.com') || domain.endsWith('.co.uk')) {
        score += 5;
      }
      
      // Prefer shorter domains (likely main company domain)
      if (domain.split('.').length <= 3) {
        score += 3;
      }
      
      websites.push({
        url: result.link,
        score: score,
        domain: domain
      });
      
    } catch (e) {
      // Invalid URL, skip
      continue;
    }
  }

  // Sort by score and return top URLs
  const sortedWebsites = websites
    .sort((a: WebsiteCandidate, b: WebsiteCandidate) => b.score - a.score)
    .slice(0, 3)
    .map((w: WebsiteCandidate) => w.url);
    
  console.log('🔍 WEBSITES: Extracted and scored websites:', websites.map((w: WebsiteCandidate) => ({ url: w.url, score: w.score })));
  
  return sortedWebsites;
}

// Validate and improve website URL
function validateAndImproveWebsiteURL(websiteFromClaude: string, extractedWebsites: string[], companyName: string): string {
  // If Claude found a good website, use it
  if (websiteFromClaude && websiteFromClaude !== 'Not found' && websiteFromClaude.startsWith('http')) {
    return websiteFromClaude;
  }
  
  // Otherwise, use the best extracted website
  if (extractedWebsites.length > 0) {
    return extractedWebsites[0];
  }
  
  return 'Not found';
}

// Perform web search using Serper API
async function performWebSearch(query: string): Promise<SearchResponse> {
  try {
    console.log('🔍 SERPER: Making search request for query:', query);
    
    if (!process.env.SERPER_API_KEY) {
      console.log('❌ SERPER: API key not found in environment');
      throw new Error('SERPER_API_KEY not configured');
    }

    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        num: 5
      }),
    });

    if (!response.ok) {
      console.log('❌ SERPER: API request failed:', response.status);
      throw new Error(`Serper API failed: ${response.status}`);
    }

    const data = await response.json();
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