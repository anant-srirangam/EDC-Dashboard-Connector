import {NextRequest, NextResponse} from 'next/server';
import {default_edc_management_url} from "@/default";
import {Provider, Dataset, Offer, DatasetBuilder} from "@/types/catalog";
import {PolicyBuilder} from "@/types/policy";

const EDC_MANAGEMENT_URL = process.env.EDC_MANAGEMENT_URL || default_edc_management_url;
const PATH = "v3/contractagreements"

export async function GET() {
    console.log(`${EDC_MANAGEMENT_URL}/${PATH}/request`)
    try {
        const response = await fetch(`${EDC_MANAGEMENT_URL}/${PATH}/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "@context": ["https://w3id.org/edc/connector/management/v0.0.1"],
                "@type": "QuerySpec",
                sortField: "contractSigningDate",
                sortOrder: "DESC"
            })
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

export async function POST(request: NextRequest) {
    const {provider, asset, offer}: { provider: Provider; asset: Dataset; offer: Offer } = await request.json();

    const policy = new PolicyBuilder()
        .id(offer.id)
        .raw(offer)
        .type("Offer")
        .build();

    const dataset = new DatasetBuilder()
        .raw(asset)
        .build();

    try {
        const body = {
            "@context": {
                "@vocab": "https://w3id.org/edc/v0.0.1/ns/"
            },
            "@type": "ContractRequest",
            "counterPartyAddress": provider.endpointUrl,
            "protocol": "dataspace-protocol-http",
            "policy": {
                "@context": "http://www.w3.org/ns/odrl.jsonld",
                "@id": policy.id,
                "@type": "Offer",
                "target": dataset.id,
                "assigner": provider.id,
                "permission": policy.permissions,
                "prohibition": policy.prohibitions,
                "obligation": policy.obligations
            }
        }

        const response = await fetch(`${EDC_MANAGEMENT_URL}/v3/contractnegotiations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': 'password'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('EDC API error response:', errorText);
            throw new Error(`EDC API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error creating contract:', error);
        let message = "Unknown error";
        if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === "string") {
            message = error;
        } else {
            message = JSON.stringify(error);
        }
        return NextResponse.json({error: message}, {status: 500});
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const {searchParams} = new URL(request.url);
        const contractId = searchParams.get('id');

        if (!contractId) {
            return NextResponse.json({error: 'Contract ID required'}, {status: 400});
        }

        const response = await fetch(`${EDC_MANAGEMENT_URL}/contractdefinitions/${contractId}`, {
            method: 'DELETE',
            headers: {
                'X-Api-Key': 'password'
            }
        });

        if (!response.ok) {
            throw new Error(`EDC API error: ${response.status}`);
        }

        return NextResponse.json({success: true});
    } catch (error) {
        console.error('Error deleting contract:', error);
        return NextResponse.json({error: 'Failed to delete contract'}, {status: 500});
    }
}