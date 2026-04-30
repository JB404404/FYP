import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const headers = new Headers({ "account-auth": req.cookies.get("session")?.value || "" })
    let response = await fetch("https://fyp-project-58d2d.web.app/api/addAccountToGroup", { method: "POST", headers: headers, body: `{"groupId":"dummyGroup"}` });
    return NextResponse.json({})
}
