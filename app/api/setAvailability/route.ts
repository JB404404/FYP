import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const headers = new Headers({ "account-auth": req.cookies.get("session")?.value || "" })
    const { searchParams } = new URL(req.url);

    const groupId = searchParams.get("group")
    const availability = searchParams.get("availability")
    const dateTime = searchParams.get("dateTime")
    let response = await fetch("https://fyp-project-58d2d.web.app/api/setAvailability", {
        method: "POST",
        headers: headers,
        body: `{"groupId":"${groupId}","availability":${availability},"dateTime":"${dateTime}"}`
    });
    return NextResponse.json(await response.json())
}