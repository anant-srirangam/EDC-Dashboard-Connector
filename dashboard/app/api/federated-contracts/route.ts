import { NextRequest, NextResponse } from 'next/server';
import { default_edc_management_url } from "@/default";

const EDC_MANAGEMENT_URL = process.env.EDC_MANAGEMENT_URL || default_edc_management_url;

export async function POST(request: NextRequest) {
  try {
    const vpJson = await request.text();
    
    // Validate that it's valid JSON
    try {
      JSON.parse(vpJson);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      );
    }

    // Call the EDC federated contracts API
    const response = await fetch(`${EDC_MANAGEMENT_URL}/federated-contracts/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.EDC_API_KEY || 'password'
      },
      body: vpJson
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('EDC API error:', errorText);
      
      let errorMessage = 'Failed to register federated contract';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorMessage;
      } catch {
        // If not JSON, use the text as error message
        errorMessage = errorText || errorMessage;
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in federated contracts API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}