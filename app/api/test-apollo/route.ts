// Create this as: app/api/test-apollo/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('🚀 APOLLO TEST: Testing with Nick Teige...');
    
    if (!process.env.APOLLO_API_KEY) {
      return NextResponse.json({ 
        success: false,
        error: 'APOLLO_API_KEY not configured' 
      }, { status: 400 });
    }

    // PHASE 1: Test with Tim Zheng (known complete profile)
    console.log('🔍 PHASE 1: Testing with Tim Zheng (complete profile)...');
    
    const timTestApproaches = [
      {
        name: 'Tim Zheng - Email only',
        params: {
          email: 'tim@apollo.io',
          reveal_personal_emails: true,
          reveal_phone_number: true
        }
      },
      {
        name: 'Tim Zheng - Name + Company',
        params: {
          first_name: 'Tim',
          last_name: 'Zheng',
          organization_name: 'Apollo',
          reveal_personal_emails: true,
          reveal_phone_number: true
        }
      }
    ];

    let timFound = false;
    for (const approach of timTestApproaches) {
      console.log(`🚀 PHASE 1: Trying ${approach.name}...`);
      
      try {
        const response = await fetch('https://api.apollo.io/api/v1/people/match', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.APOLLO_API_KEY
          },
          body: JSON.stringify(approach.params)
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`🔍 PHASE 1: ${approach.name} - Response:`, JSON.stringify(data, null, 2));
          
          if (data.person) {
            console.log(`✅ PHASE 1: SUCCESS! Found Tim with ${approach.name}`);
            timFound = true;
            break;
          }
        }
      } catch (error) {
        console.log(`❌ PHASE 1: ${approach.name} failed:`, error);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (!timFound) {
      return NextResponse.json({
        success: false,
        error: 'Could not find Tim Zheng - API setup issue',
        phase: 'validation'
      });
    }

    console.log('✅ PHASE 1: Tim Zheng found - API is working correctly!');
    console.log('🔍 PHASE 2: Now testing Nick T (incomplete profile)...');

    // PHASE 2: Test with Nick T (incomplete profile)
    const nickTestApproaches = [
      {
        name: 'Email-only search (sjpp domain)',
        params: {
          email: 'nick.teige@sjpp.co.uk',
          reveal_personal_emails: true,
          reveal_phone_number: true
        }
      },
      {
        name: 'Name + Company (no email)',
        params: {
          first_name: 'Nick',
          last_name: 'T',
          organization_name: 'Franklyn',
          reveal_personal_emails: true,
          reveal_phone_number: true
        }
      },
      {
        name: 'Just first name + company',
        params: {
          first_name: 'Nick',
          organization_name: 'Franklyn',
          reveal_personal_emails: true,
          reveal_phone_number: true
        }
      },
      {
        name: 'Company name variations - exact',
        params: {
          first_name: 'Nick',
          organization_name: 'Franklyn',
          title: 'Wealth Manager',
          reveal_personal_emails: true,
          reveal_phone_number: true
        }
      },
      {
        name: 'Try previous company (St James Place)',
        params: {
          first_name: 'Nick',
          last_name: 'Teige',
          organization_name: 'St. James\'s Place',
          email: 'nick.teige@sjpp.co.uk',
          reveal_personal_emails: true,
          reveal_phone_number: true
        }
      }
    ];

    let foundMatch = null;
    let successfulApproach = null;

    // Try each approach until we find a match
    for (const approach of testApproaches) {
      console.log(`🚀 APOLLO TEST: Trying ${approach.name}...`);
      console.log('🚀 APOLLO TEST: Request:', approach.params);

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
          
          if (data.person) {
            console.log(`✅ APOLLO TEST: SUCCESS with ${approach.name}!`);
            console.log('✅ APOLLO TEST: Found person:', {
              name: data.person.name,
              title: data.person.title,
              company: data.organization?.name,
              location: `${data.person.city}, ${data.person.country}`
            });
            
            foundMatch = data;
            successfulApproach = approach.name;
            break; // Stop trying other approaches
          } else {
            console.log(`⚠️ APOLLO TEST: ${approach.name} - No person found`);
            console.log(`⚠️ APOLLO TEST: ${approach.name} - Response was:`, data);
          }
        } else {
          const errorText = await response.text();
          console.log(`❌ APOLLO TEST: ${approach.name} - Error status ${response.status}:`, errorText);
        }
      } catch (error) {
        console.log(`❌ APOLLO TEST: ${approach.name} - Exception:`, error);
      }

      // Wait a bit between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (!foundMatch) {
      return NextResponse.json({
        success: false,
        error: 'No match found with any approach',
        testedApproaches: testApproaches.map(a => a.name)
      });
    }

    const data = foundMatch;

    if (data.person) {
      console.log('✅ APOLLO TEST: Found person!', {
        name: data.person.name,
        title: data.person.title,
        company: data.organization?.name,
        location: `${data.person.city}, ${data.person.country}`,
        industry: data.organization?.industry
      });
    } else {
      console.log('⚠️ APOLLO TEST: No person found');
    }

    return NextResponse.json({
      success: true,
      found: !!data.person,
      successfulApproach: successfulApproach,
      person: data.person ? {
        name: data.person.name,
        title: data.person.title,
        company: data.organization?.name,
        email: data.person.email,
        phone: data.person.personal_phone || data.person.corporate_phone,
        website: data.organization?.website_url,
        industry: data.organization?.industry,
        location: `${data.person.city}, ${data.person.country}`,
        linkedin: data.person.linkedin_url
      } : null,
      rawData: data
    });

  } catch (error) {
    console.error('❌ APOLLO TEST: Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Apollo test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}