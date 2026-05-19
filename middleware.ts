import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Tentukan route yang memerlukan autentikasi
const protectedRoutes = ['/dashboard', '/profile', '/settings'];
const authRoutes = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Ambil token dari cookie
  const token = request.cookies.get('token')?.value;
  
  // Jika mengakses halaman login dan sudah terautentikasi, redirect ke dashboard
  if (authRoutes.includes(pathname) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Jika mengakses halaman yang dilindungi tanpa token, redirect ke login
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

// Konfigurasi matcher untuk menentukan path yang diproses middleware
export const config = {
  matcher: [
    /*
     * Match semua request paths kecuali:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
