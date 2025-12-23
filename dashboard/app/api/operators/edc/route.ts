import { NextResponse } from 'next/server';
import { default_edc_management_url } from "@/default";

const EDC_MANAGEMENT_URL = process.env.EDC_MANAGEMENT_URL || default_edc_management_url;

export async function GET() {
    try {
        const response = await fetch(`${EDC_MANAGEMENT_URL}/operators/edc`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`EDC API error: ${response.status}`);
        }

        const operators = await response.json();
        return NextResponse.json(operators.operators);
    } catch (error) {
        console.error('Error fetching operators:', error);
        return NextResponse.json({ error: 'Failed to fetch operators' }, { status: 500 });
    }
}