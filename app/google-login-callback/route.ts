import { NextRequest, NextResponse } from 'next/server';

const NEXT_PUBLIC_API_ROUTE = process.env.NEXT_PUBLIC_API_ROUTE || "";
const HOST_ORIGIN = process.env.NEXT_PUBLIC_HOST_ORIGIN || '';

export async function GET(req: NextRequest) {
    const params = req.nextUrl.searchParams;
    const OAUTH_PERMISSION_CODE = params?.get("code") || null;

    //If a code is returned, forward it to the backend for validation of the login
    if (OAUTH_PERMISSION_CODE) {
        const response = await fetch(`${NEXT_PUBLIC_API_ROUTE}/validateToken`,
            {
                method: "POST",
                body: JSON.stringify({ redirectOrigin: HOST_ORIGIN, accountToken: OAUTH_PERMISSION_CODE }),
                credentials: "include"
            })

        // Return the set-cookie header to the client browser
        return NextResponse.redirect(new URL("/", HOST_ORIGIN), { headers: { "Set-Cookie": response.headers.getSetCookie()[0] } })
    }
}