// Create this as a new file: app/api/test-apollo/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('🚀 APOLLO TEST: Starting API test...');
    
    // Check if API key exists
    if (!process.env.APOLLO_API_KEY) {
      console.log('❌ APOLLO TEST: API key not found in environment');
      return NextResponse.json({ 
        success: false,
        error: 'APOLLO_API_KEY not configured' 
      }, { status: 400 });
    }

    console.log('✅ APOLLO TEST: API key found:', process.env.APOLLO_API_KEY.substring(0, 8) + '...');

    // Test with a known contact (Tim Zheng from Apollo)
    const testRequest = {
      first_name: 'Tim',
      last_name: 'Zheng', 
      organization_name: 'Apollo',
      reveal_personal_emails: false,  // Set to false for initial test
      reveal_phone_number: false      // Set to false for initial test
    };

    console.log('🚀 APOLLO TEST: Making test request:', testRequest);

    const response = await fetch('https://api.apollo.io/api/v1/people/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.APOLLO_API_KEY
      },
      body: JSON.stringify(testRequest)
    });

    console.log('🚀 APOLLO TEST: Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ APOLLO TEST: Error response:', errorText);
      return NextResponse.json({
        success: false,
        error: `Apollo API failed: ${response.status}`,
        details: errorText
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ APOLLO TEST: Success! Response received');
    console.log('🔍 APOLLO TEST: Response structure:', {
      hasPerson: !!data.person,
      hasOrganization: !!data.organization,
      personName: data.person?.name,
      organizationName: data.organization?.name
    });

    // Log the full response for debugging (you can remove this later)
    console.log('🔍 APOLLO TEST: Full response:', JSON.stringify(data, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Apollo API test successful!',
      testResult: {
        foundPerson: !!data.person,
        personName: data.person?.name,
        organizationName: data.organization?.name,
        personTitle: data.person?.title,
        hasLinkedIn: !!data.person?.linkedin_url,
        hasEmail: !!data.person?.email
      },
      // Include partial data for review
      sampleData: {
        name: data.person?.name,
        title: data.person?.title,
        company: data.organization?.name,
        industry: data.organization?.industry,
        linkedin: data.person?.linkedin_url
      }
    });

  } catch (error) {
    console.error('❌ APOLLO TEST: Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      success: false,
      error: 'Apollo test failed',
      details: errorMessage
    }, { status: 500 });
  }
}

// Also create a simple GET endpoint to test from browser
export async function GET() {
  return NextResponse.json({
    message: 'Apollo API test endpoint ready. Use POST to run the test.',
    instructions: 'Send a POST request to this endpoint to test Apollo API connection.'
  });
}