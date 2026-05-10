import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const headers = new Headers({ "account-auth": req.cookies.get("session")?.value || "" })

    const reqBody = await req.json()

    const groupId = reqBody.groupId
    const activity = reqBody.activity
    const response = await fetch("https://fyp-project-58d2d.web.app/api/setGroupActivity", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ groupId: groupId, activity: activity })
    });
    return NextResponse.json({ status: response.status })
}