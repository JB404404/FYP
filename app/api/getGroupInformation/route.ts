import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const headers = new Headers({ "account-auth": req.cookies.get("session")?.value || "" })

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId")
    const response = await fetch("https://fyp-project-58d2d.web.app/api/getGroupInformation", {
        method: "POST", headers: headers,
        body: JSON.stringify({ groupId: groupId })
    });
    const data = await response.json();
    return NextResponse.json(data)
}