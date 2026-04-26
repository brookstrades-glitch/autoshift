import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  const isAdmin =
    req.nextUrl.pathname.startsWith('/admin') ||
    req.nextUrl.pathname.startsWith('/api/admin');
  const isLogin =
    req.nextUrl.pathname === '/admin/login' ||
    req.nextUrl.pathname === '/api/admin/login';

  if (isAdmin && !isLogin) {
    const token = req.cookies.get('admin_token')?.value;
    if (!token) return NextResponse.redirect(new URL('/admin/login', req.url));
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.NEXTAUTH_SECRET!));
    } catch {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};