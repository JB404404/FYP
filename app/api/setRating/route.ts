import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const headers = new Headers({ "account-auth": req.cookies.get("session")?.value || "" })
    const { searchParams } = new URL(req.url);

    const groupId = searchParams.get("group")
    const rating = searchParams.get("rating")
    const activity = searchParams.get("activity")
    const user = searchParams.get("user")
    let response = await fetch("https://fyp-project-58d2d.web.app/api/setRating", {
        method: "POST",
        headers: headers,
        body: `{"groupId":"${groupId}","rating":${rating},"activity":"${activity}","user":"${user}"}`
    });
    return NextResponse.json(await response.json())
}