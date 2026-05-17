import { NextResponse } from "next/server";
import {
  getSlackTeamId,
  isSlackAuthConfigured,
  isSlackAuthEnforced,
} from "./lib/core/slack-auth-config.js";
import { getSessionSecret, SESSION_COOKIE, verifySessionToken } from "./lib/core/session-cookie.js";

const AUTH_PREFIX = "/api/auth/";

function redirectToLoginPage(request, returnTo) {
  const home = new URL("/", request.url);
  if (returnTo && returnTo !== "/") {
    home.searchParams.set("returnTo", returnTo);
  }
  return NextResponse.redirect(home);
}

export async function middleware(request) {
  if (!isSlackAuthEnforced()) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (
    pathname === "/" ||
    pathname === "/api/auth/session" ||
    pathname.startsWith(AUTH_PREFIX) ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/logo.png" ||
    pathname === "/logo-icon.png" ||
    pathname === "/boc-e-icon.jpg"
  ) {
    return NextResponse.next();
  }

  if (!isSlackAuthConfigured()) {
    return new NextResponse("Slack sign-in is misconfigured. Set SLACK_CLIENT_ID, SLACK_CLIENT_SECRET, and SLACK_TEAM_ID.", {
      status: 503,
    });
  }

  const secret = getSessionSecret();
  if (!secret) {
    return new NextResponse("Slack session secret missing. Set SLACK_CLIENT_SECRET or SLACK_SESSION_SECRET.", {
      status: 503,
    });
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token, secret);
  const expectedTeam = getSlackTeamId();

  if (!session || session.teamId !== expectedTeam) {
    const returnTo = pathname + request.nextUrl.search;
    const res = redirectToLoginPage(request, returnTo);
    if (session && session.teamId !== expectedTeam) {
      res.cookies.delete(SESSION_COOKIE);
    }
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png|logo-icon.png|boc-e-icon.jpg).*)"],
};
