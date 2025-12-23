import { NextRequest, NextResponse } from 'next/server';
import { default_edc_management_url } from "@/default";

const EDC_MANAGEMENT_URL = process.env.EDC_MANAGEMENT_URL || default_edc_management_url;

export async function GET() {
  try {
    const response = await fetch(`${EDC_MANAGEMENT_URL}/v3/assets/request`, {
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
      throw new Error(`EDC API error: ${response.status}`);
    }

    const assets = await response.json();
    return NextResponse.json(assets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { assetID, name, contentType, description, version, dataAddress } = await request.json();

    // Build data address based on type
    const buildDataAddress = (dataAddr: any) => {
      const baseAddress = {
        "@type": "DataAddress",
        "type": dataAddr.type
      };

      switch (dataAddr.type) {
        case "HttpData":
          return {
            ...baseAddress,
            "baseUrl": dataAddr.baseUrl,
            "proxyPath": "true",
            ...(dataAddr.authKey && { "authKey": dataAddr.authKey }),
            ...(dataAddr.authCode && { "authCode": dataAddr.authCode }),
            ...(dataAddr.proxyBody && { "proxyBody": dataAddr.proxyBody }),
            ...(dataAddr.proxyMethod && { "proxyMethod": dataAddr.proxyMethod }),
            ...(dataAddr.proxyQueryParams && { "proxyQueryParams": dataAddr.proxyQueryParams })
          };
        case "AmazonS3":
          return {
            ...baseAddress,
            "bucketName": dataAddr.bucketName,
            "region": dataAddr.region,
            "accessKeyId": dataAddr.accessKeyId,
            "secretAccessKey": dataAddr.secretAccessKey
          };
        case "AzureStorage":
          return {
            ...baseAddress,
            "accountName": dataAddr.accountName,
            "containerName": dataAddr.containerName,
            "sasToken": dataAddr.sasToken
          };
        case "File":
          return {
            ...baseAddress,
            "path": dataAddr.path
          };
        case "IonosS3":
          return {
            ...baseAddress,
            "bucketName": dataAddr.bucketName,
            "region": dataAddr.region,
            "accessKeyId": dataAddr.accessKeyId,
            "secretAccessKey": dataAddr.secretAccessKey
          };
        case "GoogleCloudStorage":
          return {
            ...baseAddress,
            "bucketName": dataAddr.bucketName,
            "projectId": dataAddr.projectId,
            "serviceAccountKey": dataAddr.serviceAccountKey
          };
        default:
          return baseAddress;
      }
    };

    const assetPayload = {
      "@context": { "@vocab": "https://w3id.org/edc/v0.0.1/ns/" },
      "@type": "AssetInput",
      "@id": assetID,
      "properties": {
        "name": name || assetID,
        "contenttype": contentType,
        "description": description,
        "version": version || "1.0.0",
        "type": "data",
        "createdAt": Date.now().toString()
      },
      "dataAddress": buildDataAddress(dataAddress)
    };


    const response = await fetch(`${EDC_MANAGEMENT_URL}/v3/assets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': 'password'
      },
      body: JSON.stringify(assetPayload)
    });

    if (!response.ok) {
      throw new Error(`EDC API error: ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('id');

    if (!assetId) {
      return NextResponse.json({ error: 'Asset ID required' }, { status: 400 });
    }

    const response = await fetch(`${EDC_MANAGEMENT_URL}/v3/assets/${assetId}`, {
      method: 'DELETE',
      headers: {
        'X-Api-Key': 'password'
      }
    });

    if (!response.ok) {
      throw new Error(`EDC API error: ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 });
  }
}