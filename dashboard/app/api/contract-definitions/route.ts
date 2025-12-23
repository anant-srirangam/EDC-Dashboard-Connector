import { NextRequest, NextResponse } from 'next/server';
import { default_edc_management_url } from "@/default";
import {ContractDefinition, EdcCriterion} from "@/types/contract-definition";

const EDC_MANAGEMENT_URL = process.env.EDC_MANAGEMENT_URL || default_edc_management_url;

export async function GET() {
  try {
    const response = await fetch(`${EDC_MANAGEMENT_URL}/v3/contractdefinitions/request`, {
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
    console.error('Error fetching contract definitions:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ContractDefinition = await request.json();

    const assetsSelector: EdcCriterion[]  = [];
    body.assetsSelector.map((selector) => (
        assetsSelector.push({
          "@type": "https://w3id.org/edc/v0.0.1/ns/Criterion",
          "edc:operandLeft": selector.leftOperand,
          "edc:operator": selector.operator,
          "edc:operandRight": selector.rightOperand
        })
    ));

    const contractDefinition = {
      "@context": { "edc": "https://w3id.org/edc/v0.0.1/ns/" },
      "@type": "ContractDefinition",
      "@id": body["@id"],
      "edc:accessPolicyId": body.accessPolicyId,
      "edc:contractPolicyId": body.contractPolicyId,
      "edc:assetsSelector": assetsSelector
    };

    const response = await fetch(`${EDC_MANAGEMENT_URL}/v3/contractdefinitions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': 'password'
      },
      body: JSON.stringify(contractDefinition)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating contract definition:', error);
    return NextResponse.json({ error: 'Failed to create contract definition' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Contract Definition ID is required' }, { status: 400 });
    }

    const response = await fetch(`${EDC_MANAGEMENT_URL}/v3/contractdefinitions/${id}`, {
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
    console.error('Error deleting contract definition:', error);
    return NextResponse.json({ error: 'Failed to delete contract definition' }, { status: 500 });
  }
}