import { OAuth2Client } from 'google-auth-library';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const OAUTH_KEY = process.env.NEXT_PUBLIC_OAUTH_CLIENT_KEY || '';
const OAUTH_CLIENT_ID = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID || '';
export async function GET(req: NextRequest) {
    let params = await req?.nextUrl.searchParams;
    let OAUTH_PERMISSION_CODE = params?.get("code") || null;
    const googleAuth = new OAuth2Client(
        {
            client_id: OAUTH_CLIENT_ID,
            clientSecret: OAUTH_KEY,
            redirectUri: "http://localhost:3000/google-login"
        }
    )
    if (!OAUTH_PERMISSION_CODE) {
        const authUrl = googleAuth.generateAuthUrl({
            access_type: "online",
            scope: ["https://www.googleapis.com/auth/calendar.readonly", "email", "openid"],
            include_granted_scopes: true
        })
        return Response.redirect(authUrl)

    } else {
        let accountValidation = new Request(
            "https://fyp-project-58d2d.web.app/api/validateToken",
            {
                method: "POST",
                body: `{"accountToken": "${OAUTH_PERMISSION_CODE}"}`,
            })

        let response = await fetch(accountValidation, { method: "POST", credentials: "include" })
        switch (response.status) {
            case 200:
            case 201: {
                let newHeaders: [string, string][] = []
                for (let header of response.headers) {
                    newHeaders.push([header[0], header[1]])
                }
                const routeResponse = NextResponse.redirect(new URL("/", req.url), { headers: newHeaders })

                return routeResponse
            }
            case 400: {
                return Response.redirect(new URL("/", req.url))
            }
            default: {
                return Response
            }
        }
    }
}