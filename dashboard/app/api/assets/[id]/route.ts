import { NextRequest, NextResponse } from 'next/server';
import { default_edc_management_url } from "@/default";

const EDC_MANAGEMENT_URL = process.env.EDC_MANAGEMENT_URL || default_edc_management_url;

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const assetId = params.id;
    
    const response = await fetch(`${EDC_MANAGEMENT_URL}/v3/assets/${assetId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': 'password'
      }
    });

    if (!response.ok) {
      throw new Error(`EDC API error: ${response.status}`);
    }

    const asset = await response.json();

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Error fetching asset:', error);
    return NextResponse.json({ error: 'Failed to fetch asset' }, { status: 500 });
  }
}