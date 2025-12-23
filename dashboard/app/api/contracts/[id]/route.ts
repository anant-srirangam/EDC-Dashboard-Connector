import {NextRequest, NextResponse} from 'next/server';
import {default_edc_management_url} from "@/default";
import {Provider, Dataset, Offer, DatasetBuilder} from "@/types/catalog";
import mapEdcOfferToOfferModel from "@/functions/catalog";
import {PolicyBuilder, PolicyType} from "@/types/policy";

const EDC_MANAGEMENT_URL = process.env.EDC_MANAGEMENT_URL || default_edc_management_url;
const PATH = "v3/contractnegotiations"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const {id}  = await params;
    try {
        const response = await fetch(`${EDC_MANAGEMENT_URL}/${PATH}/${id}/state`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`EDC API error: ${response.status}`);
        }

        const negotiation = await response.json();

        return NextResponse.json(negotiation);
    } catch (error) {
        console.error('Error fetching negotiation status:', error);
        return NextResponse.json({error: 'Failed to fetch negotiation status'}, {status: 500});
    }
}
