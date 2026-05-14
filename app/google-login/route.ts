import { OAuth2Client } from 'google-auth-library';
import { NextRequest, NextResponse } from 'next/server';

const OAUTH_KEY = process.env.NEXT_PUBLIC_OAUTH_CLIENT_KEY || '';
const OAUTH_CLIENT_ID = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID || '';
const HOST_ORIGIN = process.env.NEXT_PUBLIC_HOST_ORIGIN || '';

export async function GET(req: NextRequest) {
    // Initialises an OAuth client with the provided Google credentials
    const googleAuth = new OAuth2Client(
        {
            client_id: OAUTH_CLIENT_ID,
            clientSecret: OAUTH_KEY,
            redirectUri: (new URL("/google-login-callback", HOST_ORIGIN)).toString()
        }
    )
    // Creates a URL to redirect the client to the login page
    const authUrl = googleAuth.generateAuthUrl({
        access_type: "online",
        scope: ["email", "openid"],
        include_granted_scopes: true
    })
    return NextResponse.redirect(authUrl)
}