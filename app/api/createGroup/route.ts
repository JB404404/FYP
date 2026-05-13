import { NextRequest, NextResponse } from 'next/server';

const NEXT_PUBLIC_API_ROUTE = process.env.NEXT_PUBLIC_API_ROUTE || "";

export async function POST(req: NextRequest) {
    const headers = new Headers({ "account-auth": req.cookies.get("session")?.value || "" })
    // requires {"name": "GroupNameHere"}
    const response = await fetch(`${NEXT_PUBLIC_API_ROUTE}/createGroup`, { method: "POST", headers: headers, body: JSON.stringify(await req.json()) });
    return NextResponse.json({ status: response.status })
}