import {NextRequest, NextResponse} from 'next/server';
import {default_edc_management_url} from "@/default";
import {Provider, Dataset, Offer, DatasetBuilder} from "@/types/catalog";
import mapEdcOfferToOfferModel from "@/functions/catalog";
import {PolicyBuilder, PolicyType} from "@/types/policy";

const EDC_MANAGEMENT_URL = process.env.EDC_MANAGEMENT_URL || default_edc_management_url;
const PATH = "v3/contractnegotiations"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const {id}  = await params;
    try {
        const response = await fetch(`${EDC_MANAGEMENT_URL}/${PATH}/${id}/terminate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': 'password'
            },
            body: JSON.stringify({
                reason: "Terminated by user"
            })
        });

        if (!response.ok) {
            throw new Error(`EDC API error: ${response.status} : ${response.statusText}`);
        }

        const negotiation = await response.json();

        return NextResponse.json(negotiation);
    } catch (error) {
        console.error('Error terminating contract:', error);
        return NextResponse.json({error: 'Error terminating contract request'}, {status: 500});
    }
}

