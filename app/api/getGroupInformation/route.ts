import { NextRequest, NextResponse } from 'next/server';

const NEXT_PUBLIC_API_ROUTE = process.env.NEXT_PUBLIC_API_ROUTE || "";

export async function GET(req: NextRequest) {
    const headers = new Headers({ "account-auth": req.cookies.get("session")?.value || "" })

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId")
    const response = await fetch(`${NEXT_PUBLIC_API_ROUTE}/getGroupInformation`, {
        method: "POST", headers: headers,
        body: JSON.stringify({ groupId: groupId })
    });
    const data = await response.json();
    return NextResponse.json(data)
}