import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const headers = new Headers({ "account-auth": req.cookies.get("session")?.value || "" })

    const response = await fetch("https://fyp-project-58d2d.web.app/api/suggestLocationAndActivity", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(await req.json())
    });
    return NextResponse.json({ status: response.status })
}