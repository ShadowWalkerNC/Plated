import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/(.*)',
  '/api/health',
]);

const APP_HOST    = process.env.NEXT_PUBLIC_APP_HOST    ?? 'app.plated.io';
const PLATED_HOST = process.env.NEXT_PUBLIC_PLATED_HOST ?? 'plated.io';

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const url      = req.nextUrl;
  const hostname = req.headers.get('host') ?? '';
  const bare     = hostname.replace(/:\d+$/, '');

  // ─ Custom domain routing ────────────────────────────────────
  // If the request comes in on a domain that is neither app.plated.io nor
  // plated.io, treat it as a custom domain and proxy to /sites/[domain].
  const isKnownHost = bare === APP_HOST ||
    bare === PLATED_HOST ||
    bare === 'localhost'  ||
    bare.endsWith('.vercel.app') ||
    bare.endsWith('.netlify.app');

  if (!isKnownHost) {
    // Rewrite to a special catch-all route that looks up the domain in the DB
    const rewritten = url.clone();
    rewritten.pathname = `/sites/${bare}${url.pathname}`;
    return NextResponse.rewrite(rewritten);
  }

  // ─ Auth protection ───────────────────────────────────────
  if (!isPublicRoute(req)) await auth.protect();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|gif|webp|ico)$).*)'],
};
