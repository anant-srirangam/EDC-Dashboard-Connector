import { NextRequest, NextResponse } from 'next/server';
import { default_edc_management_url } from "@/default";

const EDC_MANAGEMENT_URL = process.env.EDC_MANAGEMENT_URL || default_edc_management_url;

export async function GET() {
    try {
        const response = await fetch(`${EDC_MANAGEMENT_URL}/v3/dataplanes`, {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error(`EDC API error: ${response.status}`);
        }

        const dataplanes = await response.json();
        return NextResponse.json(dataplanes);
    } catch (error) {
        console.error('Error fetching dataplanes:', error);
        return NextResponse.json({ error: 'Failed to fetch dataplanes' }, { status: 500 });
    }
}
