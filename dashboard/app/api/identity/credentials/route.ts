import { NextRequest, NextResponse } from 'next/server';

const IDENTITY_HUB_URL = process.env.IDENTITY_HUB_URL || 'http://localhost:8183';

export async function GET() {
    try {
        const response = await fetch(`${IDENTITY_HUB_URL}/api/v1/identity/credentials`);
        
        if (!response.ok) {
            throw new Error(`Identity Hub API error: ${response.status}`);
        }

        const credentials = await response.json();
        return NextResponse.json(credentials);
    } catch (error) {
        console.error('Error fetching credentials:', error);
        return NextResponse.json({ error: 'Failed to fetch credentials' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const credential = await request.json();
        
        const response = await fetch(`${IDENTITY_HUB_URL}/api/v1/identity/credentials`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credential)
        });

        if (!response.ok) {
            throw new Error(`Identity Hub API error: ${response.status}`);
        }

        const result = await response.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error storing credential:', error);
        return NextResponse.json({ error: 'Failed to store credential' }, { status: 500 });
    }
}