import { NextResponse } from 'next/server';
import { default_edc_api_url } from "@/default";

const EDC_API_URL = process.env.EDC_API_URL || default_edc_api_url;

export async function GET() {
  try {
    // Try health endpoint first
    const healthResponse = await fetch(`${EDC_API_URL}/check/health`, {cache: 'no-store'});
    
    if (!healthResponse.ok) {
      throw new Error(`Health endpoint failed: ${healthResponse.status}`);
    }
    
    const healthData = await healthResponse.json();

    return NextResponse.json({
      health: healthData
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch from connector: ${error}` },
      { status: 500 }
    );
  }
}