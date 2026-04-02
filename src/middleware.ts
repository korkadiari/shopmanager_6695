import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── Rate Limiting Store (in-memory, resets on cold start) ───────────────────
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60;  // 60 requests per minute per IP

// Stricter limits for auth/sensitive endpoints
const AUTH_RATE_LIMIT_MAX = 10;
const AUTH_RATE_LIMIT_WINDOW_MS = 60_000;

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIP) return realIP;
  return 'unknown';
}

function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }

  if (record.count >= maxRequests) {
    return false; // blocked
  }

  record.count++;
  return true; // allowed
}

// ─── Security Headers ────────────────────────────────────────────────────────
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.resend.com https://*.supabase.co;"
  );
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIP(request);

  // ─── Rate limiting for API routes ─────────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    const isAuthEndpoint = pathname.includes('/auth') || pathname.includes('/login') || pathname.includes('/register');
    const maxReqs = isAuthEndpoint ? AUTH_RATE_LIMIT_MAX : RATE_LIMIT_MAX_REQUESTS;
    const windowMs = isAuthEndpoint ? AUTH_RATE_LIMIT_WINDOW_MS : RATE_LIMIT_WINDOW_MS;
    const key = `${ip}:${pathname}`;

    if (!checkRateLimit(key, maxReqs, windowMs)) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      );
    }
  }

  const response = NextResponse.next();

  // ─── Add security headers to all responses ────────────────────────────────
  addSecurityHeaders(response);

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
