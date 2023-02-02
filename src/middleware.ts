import { getToken } from "next-auth/jwt";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { origin } = req.nextUrl;
  const url = req.url;

  if (!token) {
    if (url.includes("login") || url.includes("signup")) return NextResponse.next();
    return NextResponse.redirect(`${origin}/login`);
  }
  if (token.emailVerified) {
    if (url.includes("login") || url.includes("signup")) return NextResponse.redirect(`${origin}/`);
    return NextResponse.next();
  }
  if (url.includes("verify_email")) return NextResponse.next();
  return NextResponse.redirect(`${origin}/verify_email`);
}

export const config = {
  matcher: ["/", "/login", "/signup", "/verify_email"]
}
