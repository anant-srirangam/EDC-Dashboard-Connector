import { NextRequest, NextResponse } from 'next/server';
import { default_edc_management_url } from "@/default";
import {Contract, Negotiation} from "@/types/contract";

const EDC_MANAGEMENT_URL = process.env.EDC_MANAGEMENT_URL || default_edc_management_url;
const PATH = "v3/transferprocesses"

export async function POST(request: NextRequest) {
    try {
        const { negotiation }: { negotiation: Negotiation} = await request.json();

        console.log(negotiation);

        const body = {
            "@context": ["https://w3id.org/edc/connector/management/v0.0.1"],
            "@type": "TransferRequest",
            counterPartyAddress: negotiation.counterPartyAddress,
            contractId: negotiation.contractAgreementId,
            protocol: "dataspace-protocol-http",
            transferType: "HttpData-PULL"
        }

        const response = await fetch(`${EDC_MANAGEMENT_URL}/${PATH}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': 'password'
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating transfer:', error);
        return NextResponse.json({ error: 'Failed to create transfer' }, { status: 500 });
    }
}