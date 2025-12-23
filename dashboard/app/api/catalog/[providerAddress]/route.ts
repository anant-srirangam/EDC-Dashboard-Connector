import { NextRequest, NextResponse } from 'next/server';

const EDC_MANAGEMENT_PATH = 'api/v1/management';

export async function GET(request: NextRequest, { params }: { params: { providerAddress: string } }) {
  try {
    params.providerAddress = params.providerAddress.replace("host.docker.internal", "127.0.0.1");
    const response = await fetch(`${params.providerAddress}/${EDC_MANAGEMENT_PATH}/v3/catalog/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': 'password'
      },
      body: JSON.stringify({
        "@context": { "@vocab": "https://w3id.org/edc/v0.0.1/ns/" },
        "counterPartyAddress": "http://localhost:8192/protocol",
        "protocol": "dataspace-protocol-http",
        "querySpec": {
          "@type": "QuerySpec",
          "limit": 10,
          "offset": 0,
          "filterExpression": []
        }
      })
    });

    if (!response.ok) {
      throw new Error(`EDC API error: ${response.status}`);
    }

    const assets = await response.json();

    return NextResponse.json(assets);
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return NextResponse.json({ error: 'Failed to fetch catalog' }, { status: 500 });
  }
}
