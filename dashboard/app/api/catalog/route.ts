import { NextResponse } from 'next/server';
import { default_fc_url } from "@/default";

const FC_URL = process.env.FC_URL || default_fc_url;

export async function GET() {
    try {
        const response = await fetch(FC_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': 'password'
            },
            cache: 'no-store',
            body: JSON.stringify({
                "@context": { "@vocab": "https://w3id.org/edc/v0.0.1/ns/" },
                "@type": "QuerySpec"
            })
        });

        if (!response.ok) {
            console.error(`EDC API error: ${response.status} ${response.statusText}`);
            return NextResponse.json([]);
        }

        const data = await response.json();
        return NextResponse.json(Array.isArray(data) ? data : []);
    } catch (error) {
        console.error('Error fetching federated catalog:', error);
        return NextResponse.json([]);
    }
}