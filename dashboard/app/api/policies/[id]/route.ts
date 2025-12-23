import { NextRequest, NextResponse } from 'next/server';
import { default_edc_management_url } from "@/default";

const EDC_MANAGEMENT_URL = process.env.EDC_MANAGEMENT_URL || default_edc_management_url;

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const assetId = params.id;

        const response = await fetch(`${EDC_MANAGEMENT_URL}/v3/policydefinitions/${assetId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': 'password'
            }
        });

        if (!response.ok) {
            throw new Error(`EDC API error: ${response.status}`);
        }

        const policy = await response.json();
        return NextResponse.json(policy);
    } catch (error) {
        console.error('Error fetching policy:', error);
        return NextResponse.json({ error: 'Failed to fetch policy' }, { status: 500 });
    }
}