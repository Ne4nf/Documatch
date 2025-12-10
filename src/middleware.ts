import { getSession } from '@auth0/nextjs-auth0/edge';
import type { JwtPayload } from 'jwt-decode';
import { jwtDecode } from 'jwt-decode';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware used to:
 * - Check if the user's token is expired and log them out if it is
 * - Inject user token for calls to user-service-api and templateless-api-v2
 */
// eslint-disable-next-line consistent-return
export async function middleware(req: NextRequest) {
  // Log the user out if the token has expired
  if (
    !req.nextUrl.pathname.startsWith('/api') &&
    !req.nextUrl.pathname.startsWith('/_next') &&
    req.nextUrl.pathname !== '/' // For now, the home page does not require login
  ) {
    const res = NextResponse.next();
    const session = await getSession(req, res);

    if (session && session.idToken && _isTokenExpired(session.idToken)) {
      return NextResponse.redirect(new URL('/api/auth/logout', req.url));
    }
  }

  const rewriteUrl = (() => {
    if (req.nextUrl.pathname.startsWith('/api/user')) {
      const pathname = req.nextUrl.pathname.replace(
        '/api/user',
        process.env.USER_SERVICE_API_URL as string,
      );
      const query = req.nextUrl.searchParams.toString();

      if (query) {
        return new URL(`${pathname}?${query}`);
      }

      return new URL(`${pathname}`);
    }

    if (req.nextUrl.pathname.startsWith('/api/tless')) {
      const pathname = req.nextUrl.pathname.replace(
        '/api/tless',
        process.env.TEMPLATELESS_API_V2_URL as string,
      );
      const query = req.nextUrl.searchParams.toString();

      if (query) {
        return new URL(`${pathname}?${query}`);
      }

      return new URL(`${pathname}`);
    }

    return null;
  })();

  if (rewriteUrl) {
    console.log(`Proxy: ${req.nextUrl.pathname} -> ${rewriteUrl.href}`);

    const res = NextResponse.rewrite(rewriteUrl);
    res.headers.set('Connection', 'keep-alive');
    res.headers.set('Keep-Alive', 'timeout=300'); // 5 minutes

    const session = await getSession(req, res);

    if (session) {
      res.headers.set('Authorization', `Bearer ${session.idToken}`);
    } else {
      // If the user is not authenticated, remove the authorization header. This will
      // allow proxy for endpoints that do not require authentication to work properly
      // when the user is not logged in
      res.headers.delete('Authorization');
    }

    return res;
  }
}

/**
 * Checks if a token has expired
 * @param {string} token
 * @returns true if token has expired, false otherwise
 */
function _isTokenExpired(token: string): boolean {
  const { exp } = jwtDecode<JwtPayload>(token);
  const currentTime = new Date().getTime() / 1000;

  return !!exp && currentTime > exp;
}
