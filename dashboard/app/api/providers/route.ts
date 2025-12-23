import { NextRequest, NextResponse } from 'next/server';
import { default_edc_management_url } from "@/default";

const EDC_MANAGEMENT_URL = process.env.EDC_MANAGEMENT_URL || default_edc_management_url;

export async function GET() {
    try {
        let response = await fetch(`${EDC_MANAGEMENT_URL}/providers`, {
            method: 'POST',
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': 'password'
            },
            body: JSON.stringify({
                "@context": { "@vocab": "https://w3id.org/edc/v0.0.1/ns/" },
                "counterPartyAddress": "http://localhost:19194/protocol",
                "protocol": "dataspace-protocol-http"
            })
        });

        if (!response.ok) {
            throw new Error(`EDC API error: ${response.status}`);
        }

        const providers = await response.json();
        return NextResponse.json(providers);
    } catch (error) {
        console.error('Error fetching assets:', error);
        return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
    }
}
