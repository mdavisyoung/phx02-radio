import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Convert string to base64
const toBase64 = (str: string) => Buffer.from(str).toString('base64');

// Credentials
const USERNAME = 'admin';
const PASSWORD = 'phx02pass';
const VALID_AUTH = `Basic ${toBase64(`${USERNAME}:${PASSWORD}`)}`;

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    // Return response that asks for authentication
    return new NextResponse(null, {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="PHX02 Radio Admin"',
      },
    });
  }

  if (authHeader !== VALID_AUTH) {
    // Return response that asks for authentication
    return new NextResponse(null, {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="PHX02 Radio Admin"',
      },
    });
  }

  // If we made it this far, authentication was successful
  return NextResponse.next();
}

// Only match /admin routes
export const config = {
  matcher: '/admin/:path*'
}; 