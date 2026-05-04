import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const headers = new Headers({ "account-auth": req.cookies.get("session")?.value || "" })
    const { searchParams } = new URL(req.url);

    const groupId = searchParams.get("group")
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const activity = searchParams.get("activity")
    let response = await fetch("https://fyp-project-58d2d.web.app/api/suggestLocationAndActivity", {
        method: "POST",
        headers: headers,
        body: `{"groupId":"${groupId}", "lat":${lat}, "lng":${lng}, "activity":"${activity}"}`
    });
    return NextResponse.json({})
}