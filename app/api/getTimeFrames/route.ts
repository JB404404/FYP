import { NextRequest, NextResponse } from 'next/server';

const NEXT_PUBLIC_API_ROUTE = process.env.NEXT_PUBLIC_API_ROUTE || "";

export async function GET(req: NextRequest) {
    const headers = new Headers({ "account-auth": req.cookies.get("session")?.value || "" })
    const { searchParams } = new URL(req.url);

    const groupId = searchParams.get("groupId")
    const response = await fetch(`${NEXT_PUBLIC_API_ROUTE}/getTimeFrames`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ groupId: groupId })
    });
    return NextResponse.json(await response.json(), { status: response.status })
}