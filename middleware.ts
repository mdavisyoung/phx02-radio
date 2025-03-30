import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Convert string to base64
const toBase64 = (str: string) => Buffer.from(str).toString('base64');

// Credentials
const USERNAME = 'admin';
const PASSWORD = 'phx02pass';
const VALID_AUTH = `Basic ${toBase64(`${USERNAME}:${PASSWORD}`)}`;

export function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname;
  console.log('Middleware checking path:', pathname);

  // Only protect admin routes
  if (!pathname.startsWith('/admin')) {
    console.log('Not an admin route, allowing access');
    return NextResponse.next();
  }

  console.log('Admin route detected, checking auth');
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    console.log('No auth header, requesting authentication');
    // Return response that asks for authentication
    return new NextResponse(null, {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="PHX02 Radio Admin"',
      },
    });
  }

  if (authHeader !== VALID_AUTH) {
    console.log('Invalid auth, requesting authentication');
    // Return response that asks for authentication
    return new NextResponse(null, {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="PHX02 Radio Admin"',
      },
    });
  }

  console.log('Auth successful, allowing access');
  return NextResponse.next();
}

// Configure middleware matchers
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    {
      source: '/admin/:path*',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}; 