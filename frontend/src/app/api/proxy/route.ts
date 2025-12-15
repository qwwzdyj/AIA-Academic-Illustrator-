
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { apiKey, baseUrl, body, path } = await req.json();

        if (!baseUrl) {
            return NextResponse.json(
                { error: 'Base URL is required' },
                { status: 400 }
            );
        }

        // Ensure baseUrl doesn't end with slash if we are appending path
        const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        // Normalized path (e.g. /chat/completions)
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;

        const url = `${normalizedBaseUrl}${normalizedPath}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: `API Error: ${response.statusText}`, details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Proxy Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}
