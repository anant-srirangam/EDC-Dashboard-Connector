import { NextRequest, NextResponse } from 'next/server';
import { default_edc_management_url } from "@/default";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { verifiableCredentials } = body;
    
    if (!verifiableCredentials ) {
      return NextResponse.json(
        { error: 'verifiableCredentials and privateSigningKey are required' },
        { status: 400 }
      );
    }

    const edcUrl = process.env.EDC_MANAGEMENT_URL || default_edc_management_url;
    const response = await fetch(`${edcUrl}/registration/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ verifiableCredentials }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to register user:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}