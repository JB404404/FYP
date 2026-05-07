import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const headers = new Headers({ "account-auth": req.cookies.get("session")?.value || "" })

    const reqBody = await req.json()

    const groupId = reqBody.groupId
    const arrivalTime = reqBody.arrivalTime
    const response = await fetch("https://fyp-project-58d2d.web.app/api/suggestGroupArrivalTime", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ groupId: groupId, dateTime: arrivalTime })
    });

    return NextResponse.json({ status: response.status })
}