// Create this as: app/api/test-apollo/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('🚀 APOLLO TEST: Testing Apollo API connectivity...');
    
    if (!process.env.APOLLO_API_KEY) {
      return NextResponse.json({ 
        success: false,
        error: 'APOLLO_API_KEY not configured' 
      }, { status: 400 });
    }

    // Test with Tim Zheng (known complete profile) - WITH CREDITS
    console.log('🔍 APOLLO TEST: Testing with Tim Zheng using credits...');
    
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
    let successfulApproach = null;
    let foundData = null;
    
    for (const approach of timTestApproaches) {
      console.log(`🚀 APOLLO TEST: Trying ${approach.name}...`);
      console.log(`💳 APOLLO TEST: This will use credits for email reveal`);
      
      try {
        const response = await fetch('https://api.apollo.io/api/v1/people/match', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.APOLLO_API_KEY
          },
          body: JSON.stringify(approach.params)
        });

        console.log(`🔍 APOLLO TEST: ${approach.name} - Response status:`, response.status);
        console.log(`🔍 APOLLO TEST: ${approach.name} - Response headers:`, Object.fromEntries(response.headers.entries()));

        if (response.ok) {
          const data = await response.json();
          console.log(`🔍 APOLLO TEST: ${approach.name} - Full response:`, JSON.stringify(data, null, 2));
          
          // Check for credit usage information in response
          if (data.credits_consumed) {
            creditsUsed += data.credits_consumed;
            console.log(`💳 APOLLO TEST: Credits consumed this request: ${data.credits_consumed}`);
          }
          
          if (data.person) {
            console.log(`✅ APOLLO TEST: SUCCESS! Found Tim with ${approach.name}`);
            console.log('✅ APOLLO TEST: Full person data:', {
              name: data.person.name,
              title: data.person.title,
              email: data.person.email,
              company: data.organization?.name,
              linkedin: data.person.linkedin_url
            });
            timFound = true;
            successfulApproach = approach.name;
            foundData = data;
            break;
          } else {
            console.log(`⚠️ APOLLO TEST: ${approach.name} - No person found in response`);
            console.log(`⚠️ APOLLO TEST: ${approach.name} - Available keys:`, Object.keys(data));
          }
        } else {
          const errorText = await response.text();
          console.log(`❌ APOLLO TEST: ${approach.name} - Error status ${response.status}:`, errorText);
          
          // Check if it's a credit-related error
          if (response.status === 402 || errorText.includes('credit')) {
            console.log(`💳 APOLLO TEST: This appears to be a credit-related error`);
          }
        }
      } catch (error) {
        console.log(`❌ APOLLO TEST: ${approach.name} failed:`, error);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Delay between requests
    }

    if (!timFound) {
      return NextResponse.json({
        success: false,
        error: 'Could not find Tim Zheng - possible credit or API issue',
        creditsUsed: creditsUsed,
        debug: 'Check if you have sufficient credits and API permissions'
      });
    }

    console.log('✅ APOLLO TEST: Tim Zheng found - API with credits is working!');
    console.log(`💳 APOLLO TEST: Total credits used: ${creditsUsed}`);

    const finalResult = {
      success: true,
      api_working: true,
      successfulApproach: successfulApproach,
      creditsUsed: creditsUsed,
      person: foundData?.person ? {
        name: foundData.person.name,
        title: foundData.person.title,
        company: foundData.organization?.name,
        email: foundData.person.email,
        website: foundData.organization?.website_url,
        industry: foundData.organization?.industry,
        location: `${foundData.person.city}, ${foundData.person.country}`,
        linkedin: foundData.person.linkedin_url
      } : null,
      rawData: foundData,
      message: `Apollo API working correctly! Found Tim using ${successfulApproach}. Used ${creditsUsed} credits.`
    };

    console.log('🎯 APOLLO TEST COMPLETE:', finalResult.message);
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