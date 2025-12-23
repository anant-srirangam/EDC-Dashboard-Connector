import {NextRequest, NextResponse} from 'next/server';
import {default_edc_management_url} from "@/default";

const EDC_MANAGEMENT_URL = process.env.EDC_MANAGEMENT_URL || default_edc_management_url;
const PATH = "v3/contractnegotiations"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const {id}  = await params;
        const response = await fetch(`${EDC_MANAGEMENT_URL}/${PATH}/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': 'password'
            },
            body: JSON.stringify({
                "@context": ["https://w3id.org/edc/connector/management/v0.0.1"],
                "@type": "QuerySpec",
                filterExpression: {operandLeft: "contractAgreement.id", operator: "=", operandRight: id}
            })
        });

        console.log(response);

        if (!response.ok) {
            throw new Error(`EDC API error: ${response.status}`);
        }

        const negotiation = await response.json();

        return NextResponse.json(negotiation);
    } catch (error) {
        console.error('Error fetching contract:', error);
        return NextResponse.json({error: 'Failed to fetch contract'}, {status: 500});
    }
}