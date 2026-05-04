import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const headers = new Headers({ "account-auth": req.cookies.get("session")?.value || "" })
    const { searchParams } = new URL(req.url);

    const groupId = searchParams.get("group")
    const arrivalTime = searchParams.get("arrivalTime")
    let response = await fetch("https://fyp-project-58d2d.web.app/api/suggestGroupArrivalTime", {
        method: "POST",
        headers: headers,
        body: `{"groupId":"${groupId}", "dateTime":"${arrivalTime}"}`
    });
    console.log(response)
    return NextResponse.json({})
}