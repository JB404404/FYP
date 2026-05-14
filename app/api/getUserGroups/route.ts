import { NextRequest, NextResponse } from 'next/server';

const NEXT_PUBLIC_API_ROUTE = process.env.NEXT_PUBLIC_API_ROUTE || "";

export async function GET(req: NextRequest) {
    const headers = new Headers({ "account-auth": req.cookies.get("session")?.value || "" })
    const response = await fetch(`${NEXT_PUBLIC_API_ROUTE}/getUserGroups`, { method: "POST", headers: headers });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status })
}