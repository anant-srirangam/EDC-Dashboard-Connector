import { NextResponse } from 'next/server';
import { default_edc_management_url } from "@/default"

export async function GET() {
  try {
    const edcUrl = process.env.EDC_MANAGEMENT_URL || default_edc_management_url;
    
    const response = await fetch(`${edcUrl}/registration/status`, { cache: 'no-store' });
    
    if (!response.ok) {
      throw new Error(`EDC API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to check status:', error);
    return NextResponse.json(
      { error: 'Failed to check registration status' },
      { status: 500 }
    );
  }
}