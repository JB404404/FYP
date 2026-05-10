import { NextRequest, NextResponse } from 'next/server';

const HOST_ORIGIN = process.env.NEXT_PUBLIC_HOST_ORIGIN || '';
export async function GET(req: NextRequest) {
    const params = req.nextUrl.searchParams;
    const OAUTH_PERMISSION_CODE = params?.get("code") || null;
    if (OAUTH_PERMISSION_CODE) {
        const response = await fetch("https://fyp-project-58d2d.web.app/api/validateToken",
            {
                method: "POST",
                body: JSON.stringify({ redirectOrigin: HOST_ORIGIN, accountToken: OAUTH_PERMISSION_CODE }),
                credentials: "include"
            })

        return NextResponse.redirect(new URL("/", HOST_ORIGIN), { headers: response.headers })
    }
}