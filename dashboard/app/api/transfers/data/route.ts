import {NextRequest, NextResponse} from 'next/server';
import {default_edc_management_url} from "@/default";

export async function POST(request: NextRequest) {
    try {
        const {endpoint, token}  = await request.json();
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Authorization': token
            }
        });

        console.log("Response from ", endpoint);
        console.log(response);

        if (!response.ok) {
            throw new Error(`EDC API error: ${response.status}`);
        }

        return NextResponse.json(await response.json());
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json({error: 'Failed to fetch data'}, {status: 500});
    }
}