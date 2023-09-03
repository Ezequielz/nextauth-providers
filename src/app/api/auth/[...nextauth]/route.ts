import SteamProvider, { PROVIDER_ID } from 'next-auth-steam'
import GoogleProvider from "next-auth/providers/google";
import NextAuth from 'next-auth/next'

import type { NextRequest, NextResponse } from 'next/server'
import { AuthOptions } from "next-auth";

export function getAuthOptions(req: NextRequest): AuthOptions {
    return {
        providers: req
            ? [
                SteamProvider(req, {
                    clientSecret: process.env.STEAM_SECRET!,
                    callbackUrl: 'http://localhost:3000/api/auth/callback',
                }),
                GoogleProvider({
                  clientId: process.env.GOOGLE_CLIENT_ID as string,
                  clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
                })
            ]
            : [],
        callbacks: {
            jwt({ token, account, profile }) {
                if (account?.provider === PROVIDER_ID) {
                    token.steam = profile;
                }
                return token;
            },
            session({ session, token }) {
                if ('steam' in token) {
                    // @ts-expect-error
                    session.user.steam = token.steam;
                }
                return session;
            },
        },
    };
}

async function handler(
    req: NextRequest,
    res: NextResponse,
    ctx: { params: { nextauth: string[] } }
) {
    // @ts-expect-error
    return NextAuth(req, res, getAuthOptions(req));
}

export {
    handler as GET,
    handler as POST,
}