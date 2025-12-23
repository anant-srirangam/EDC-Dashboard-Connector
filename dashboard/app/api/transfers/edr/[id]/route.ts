import {NextRequest, NextResponse} from 'next/server';
import {default_edc_management_url} from "@/default";

const EDC_MANAGEMENT_URL = process.env.EDC_MANAGEMENT_URL || default_edc_management_url;
const PATH = "v3/edrs"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const {id}  = await params;
        const response = await fetch(`${EDC_MANAGEMENT_URL}/${PATH}/${id}/dataaddress`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': 'password'
            }
        });

        console.log(response);

        if (!response.ok) {
            throw new Error(`EDC API error: ${response.status}`);
        }

        const edr = await response.json();

        return NextResponse.json(edr);
    } catch (error) {
        console.error('Error fetching edr:', error);
        return NextResponse.json({error: 'Failed to fetch edr'}, {status: 500});
    }
}