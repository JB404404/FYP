import { NextRequest, NextResponse } from 'next/server';

const NEXT_PUBLIC_API_ROUTE = process.env.NEXT_PUBLIC_API_ROUTE || "";

export async function POST(req: NextRequest) {
    const headers = new Headers({ "account-auth": req.cookies.get("session")?.value || "" })

    const reqBody = await req.json()

    const groupId = reqBody.groupId
    const arrivalTime = reqBody.arrivalTime
    const response = await fetch(`${NEXT_PUBLIC_API_ROUTE}/setGroupArrivalTime`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ groupId: groupId, dateTime: arrivalTime })
    });
    return NextResponse.json({ status: response.status })
}