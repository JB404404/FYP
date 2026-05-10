import { OAuth2Client } from 'google-auth-library';
import { NextRequest, NextResponse } from 'next/server';

const OAUTH_KEY = process.env.NEXT_PUBLIC_OAUTH_CLIENT_KEY || '';
const OAUTH_CLIENT_ID = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID || '';
const HOST_ORIGIN = process.env.NEXT_PUBLIC_HOST_ORIGIN || '';
export async function GET(req: NextRequest) {
    const params = await req?.nextUrl.searchParams;
    const OAUTH_PERMISSION_CODE = params?.get("code") || null;
    if (!OAUTH_PERMISSION_CODE) {
        const googleAuth = new OAuth2Client(
            {
                client_id: OAUTH_CLIENT_ID,
                clientSecret: OAUTH_KEY,
                redirectUri: (new URL("/google-login-callback", HOST_ORIGIN)).toString()
            }
        )
        const authUrl = googleAuth.generateAuthUrl({
            access_type: "online",
            scope: ["https://www.googleapis.com/auth/calendar.readonly", "email", "openid"],
            include_granted_scopes: true
        })
        return NextResponse.redirect(authUrl)
    }
}