import { NextRequest, NextResponse } from 'next/server';
import { default_edc_management_url } from "@/default";

const EDC_MANAGEMENT_URL = process.env.EDC_MANAGEMENT_URL || default_edc_management_url;

export async function GET() {
  try {
    const response = await fetch(`${EDC_MANAGEMENT_URL}/v3/policydefinitions/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': 'password'
      },
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
    console.error('Error fetching policies:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const policyDefinition = {
      "@context": ["https://w3id.org/edc/connector/management/v0.0.1"],
      "@type": "PolicyDefinition",
      "@id": body.policyID,
      "policy": {
        "@type": "Set",
        "permission": body.policyPermissions ? JSON.parse(body.policyPermissions) : [],
        "prohibition": body.policyProhibitions ? JSON.parse(body.policyProhibitions) : [],
        "obligation": body.policyObligations ? JSON.parse(body.policyObligations) : []
      }
    };

    const response = await fetch(`${EDC_MANAGEMENT_URL}/v3/policydefinitions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': 'password'
      },
      body: JSON.stringify(policyDefinition)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating policy:', error);
    return NextResponse.json({ error: 'Failed to create policy' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Policy ID is required' }, { status: 400 });
    }

    const response = await fetch(`${EDC_MANAGEMENT_URL}/v3/policydefinitions/${id}`, {
      method: 'DELETE',
      headers: {
        'X-Api-Key': 'password'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting policy:', error);
    return NextResponse.json({ error: 'Failed to delete policy' }, { status: 500 });
  }
}