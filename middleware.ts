/**
 * Next.js Middleware for TLS Security
 * Handles HTTPS redirects and security headers
 */

import { NextRequest, NextResponse } from 'next/server';
import { tlsMiddleware } from './lib/pki/tlsMiddleware';

export function middleware(request: NextRequest) {
  // Apply TLS security middleware
  return tlsMiddleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};