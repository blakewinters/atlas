import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login, auth callback, and API routes without cookie check
  if (pathname === '/login' || pathname.startsWith('/auth/') || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check for any Supabase auth cookie (starts with 'sb-')
  let isAuthenticated = false;
  request.cookies.getAll().forEach((cookie) => {
    if (cookie.name.startsWith('sb-')) {
      isAuthenticated = true;
    }
  });

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
