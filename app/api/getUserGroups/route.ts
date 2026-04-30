import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const headers = new Headers({ "account-auth": req.cookies.get("session")?.value || "" })
    let response = await fetch("https://fyp-project-58d2d.web.app/api/getUserGroups", { method: "POST", headers: headers });
    const data = await response.json();
    return NextResponse.json(data)
}