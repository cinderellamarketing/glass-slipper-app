// Create this as: app/api/test-apollo/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('🚀 APOLLO TEST: Testing with credits enabled...');
    
    if (!process.env.APOLLO_API_KEY) {
      return NextResponse.json({ 
        success: false,
        error: 'APOLLO_API_KEY not configured' 
      }, { status: 400 });
    }

    // PHASE 1: Test with Tim Zheng (known complete profile) - WITH CREDITS
    console.log('🔍 PHASE 1: Testing with Tim Zheng using credits...');
    
    const timTestApproaches = [
      {
        name: 'Tim Zheng - Email with full reveal',
        params: {
          email: 'tim@apollo.io',
          reveal_personal_emails: true,
          // Additional parameters that might help
          include_organization: true,
          include_technologies: true
        }
      },
      {
        name: 'Tim Zheng - Name + Company with full reveal',
        params: {
          first_name: 'Tim',
          last_name: 'Zheng',
          organization_name: 'Apollo',
          reveal_personal_emails: true,
          include_organization: true,
          include_technologies: true
        }
      }
    ];

    let timFound = false;
    let creditsUsed = 0;
    
    for (const approach of timTestApproaches) {
      console.log(`🚀 PHASE 1: Trying ${approach.name}...`);
      console.log(`💳 PHASE 1: This will use credits for email reveal`);
      
      try {
        const response = await fetch('https://api.apollo.io/api/v1/people/match', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.APOLLO_API_KEY
          },
          body: JSON.stringify(approach.params)
        });

        console.log(`🔍 PHASE 1: ${approach.name} - Response status:`, response.status);
        console.log(`🔍 PHASE 1: ${approach.name} - Response headers:`, Object.fromEntries(response.headers.entries()));

        if (response.ok) {
          const data = await response.json();
          console.log(`🔍 PHASE 1: ${approach.name} - Full response:`, JSON.stringify(data, null, 2));
          
          // Check for credit usage information in response
          if (data.credits_consumed) {
            creditsUsed += data.credits_consumed;
            console.log(`💳 PHASE 1: Credits consumed this request: ${data.credits_consumed}`);
          }
          
          if (data.person) {
            console.log(`✅ PHASE 1: SUCCESS! Found Tim with ${approach.name}`);
            console.log('✅ PHASE 1: Full person data:', {
              name: data.person.name,
              title: data.person.title,
              email: data.person.email,
              company: data.organization?.name,
              linkedin: data.person.linkedin_url
            });
            timFound = true;
            break;
          } else {
            console.log(`⚠️ PHASE 1: ${approach.name} - No person found in response`);
            console.log(`⚠️ PHASE 1: ${approach.name} - Available keys:`, Object.keys(data));
          }
        } else {
          const errorText = await response.text();
          console.log(`❌ PHASE 1: ${approach.name} - Error status ${response.status}:`, errorText);
          
          // Check if it's a credit-related error
          if (response.status === 402 || errorText.includes('credit')) {
            console.log(`💳 PHASE 1: This appears to be a credit-related error`);
          }
        }
      } catch (error) {
        console.log(`❌ PHASE 1: ${approach.name} failed:`, error);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Longer delay when using credits
    }

    if (!timFound) {
      return NextResponse.json({
        success: false,
        error: 'Could not find Tim Zheng - possible credit or API issue',
        phase: 'validation',
        creditsUsed: creditsUsed,
        debug: 'Check if you have sufficient credits and API permissions'
      });
    }

    console.log('✅ PHASE 1: Tim Zheng found - API with credits is working!');
    console.log(`💳 PHASE 1: Total credits used so far: ${creditsUsed}`);
    console.log('🔍 PHASE 2: Now testing Nick T with credits...');

    // PHASE 2: Test with Nick T (incomplete profile) - WITH CREDITS
    const nickTestApproaches = [
      {
        name: 'Email-only search with full reveal',
        params: {
          email: 'nick.teige@sjpp.co.uk',
          reveal_personal_emails: true,
          include_organization: true
        }
      },
      {
        name: 'Name + Current Company with full reveal',
        params: {
          first_name: 'Nick',
          last_name: 'Teige',
          organization_name: 'Franklyn',
          reveal_personal_emails: true,
          include_organization: true
        }
      },
      {
        name: 'Name + Previous Company with full reveal',
        params: {
          first_name: 'Nick',
          last_name: 'Teige',
          organization_name: 'St. James\'s Place',
          reveal_personal_emails: true,
          include_organization: true
        }
      },
      {
        name: 'Broader search - Nick + Franklyn',
        params: {
          first_name: 'Nick',
          organization_name: 'Franklyn',
          reveal_personal_emails: true,
          include_organization: true
        }
      }
    ];

    let foundMatch = null;
    let successfulApproach = null;
    let totalCreditsUsed = creditsUsed;

    // Try each approach until we find a match
    for (const approach of nickTestApproaches) {
      console.log(`🚀 APOLLO TEST: Trying ${approach.name}...`);
      console.log('🚀 APOLLO TEST: Request:', approach.params);
      console.log(`💳 APOLLO TEST: This may consume credits...`);

      try {
        const response = await fetch('https://api.apollo.io/api/v1/people/match', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.APOLLO_API_KEY
          },
          body: JSON.stringify(approach.params)
        });

        console.log(`🚀 APOLLO TEST: ${approach.name} - Response status:`, response.status);

        if (response.ok) {
          const data = await response.json();
          console.log(`🔍 APOLLO TEST: ${approach.name} - Full response:`, JSON.stringify(data, null, 2));
          
          // Track credit usage
          if (data.credits_consumed) {
            totalCreditsUsed += data.credits_consumed;
            console.log(`💳 APOLLO TEST: Credits consumed: ${data.credits_consumed}`);
          }
          
          if (data.person) {
            console.log(`✅ APOLLO TEST: SUCCESS with ${approach.name}!`);
            console.log('✅ APOLLO TEST: Found person with full data:', {
              name: data.person.name,
              title: data.person.title,
              email: data.person.email,
              company: data.organization?.name,
              location: `${data.person.city}, ${data.person.country}`,
              linkedin: data.person.linkedin_url
            });
            
            foundMatch = data;
            successfulApproach = approach.name;
            break; // Stop trying other approaches
          } else {
            console.log(`⚠️ APOLLO TEST: ${approach.name} - No person found`);
            console.log(`⚠️ APOLLO TEST: ${approach.name} - Response keys:`, Object.keys(data));
          }
        } else {
          const errorText = await response.text();
          console.log(`❌ APOLLO TEST: ${approach.name} - Error status ${response.status}:`, errorText);
          
          // Check for credit issues
          if (response.status === 402) {
            console.log(`💳 APOLLO TEST: Insufficient credits error`);
            break; // Stop trying if we're out of credits
          }
        }
      } catch (error) {
        console.log(`❌ APOLLO TEST: ${approach.name} - Exception:`, error);
      }

      // Longer wait between credit-consuming requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const finalResult = {
      success: true,
      validation_passed: true,
      nick_found: !!foundMatch,
      successfulApproach: successfulApproach,
      totalCreditsUsed: totalCreditsUsed,
      person: foundMatch?.person ? {
        name: foundMatch.person.name,
        title: foundMatch.person.title,
        company: foundMatch.organization?.name,
        email: foundMatch.person.email,
        website: foundMatch.organization?.website_url,
        industry: foundMatch.organization?.industry,
        location: `${foundMatch.person.city}, ${foundMatch.person.country}`,
        linkedin: foundMatch.person.linkedin_url
      } : null,
      rawData: foundMatch,
      message: foundMatch ? 
        `Found Nick using ${successfulApproach}. Used ${totalCreditsUsed} credits total.` :
        `Nick not found in Apollo database. Used ${totalCreditsUsed} credits testing. This is normal for incomplete profiles.`
    };

    console.log('🎯 FINAL RESULT:', finalResult.message);
    return NextResponse.json(finalResult);

  } catch (error) {
    console.error('❌ APOLLO TEST: Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Apollo test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}