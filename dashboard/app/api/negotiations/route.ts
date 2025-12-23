import {NextRequest, NextResponse} from 'next/server';
import {default_edc_management_url} from "@/default";
import {Provider, Dataset, Offer, DatasetBuilder} from "@/types/catalog";
import mapEdcOfferToOfferModel from "@/functions/catalog";
import {PolicyBuilder, PolicyType} from "@/types/policy";

const EDC_MANAGEMENT_URL = process.env.EDC_MANAGEMENT_URL || default_edc_management_url;
const PATH = "v3/contractnegotiations"

export async function GET() {
    try {
        const response = await fetch(`${EDC_MANAGEMENT_URL}/${PATH}/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`EDC API error: ${response.status}`);
        }

        const contracts = await response.json();

        return NextResponse.json(contracts);
    } catch (error) {
        console.error('Error fetching contracts:', error);
        return NextResponse.json({error: 'Failed to fetch contracts'}, {status: 500});
    }
}