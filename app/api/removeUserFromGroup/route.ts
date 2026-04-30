import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const headers = new Headers({ "account-auth": req.cookies.get("session")?.value || "" })
    let response = await fetch("https://fyp-project-58d2d.web.app/api/removeAccountFromGroup",
        {
            method: "POST",
            headers: headers,
            body: `{"groupId": "dummyGroup", "accountId": "112642013515507196147"}`
        }
    );
    return NextResponse.json({})
}