import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/session';

// Snelle eerste controle: zonder sessie-cookie direct naar de login.
// De handtekening van de cookie wordt gecontroleerd in de admin-layout en in
// elke server action (Node runtime, waar SESSION_SECRET altijd beschikbaar is).
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin/login')) {
    return NextResponse.next();
  }

  if (!req.cookies.get(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
