import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validasi input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password harus diisi' },
        { status: 400 }
      );
    }

    // TODO: Hubungkan dengan backend API Anda
    // Contoh: const response = await fetch(`${process.env.BACKEND_URL}/auth/login`, {...})
    
    // Validasi sederhana (ganti dengan backend API call)
    if (username === 'admin' && password === 'admin') {
      // Generate token (gunakan JWT di production)
      const token = Buffer.from(
        JSON.stringify({ 
          username, 
          exp: Date.now() + 3600000 
        })
      ).toString('base64');
      
      const response = NextResponse.json(
        { 
          success: true, 
          message: 'Login berhasil',
          user: { username }
        },
        { status: 200 }
      );

      // Set cookie dengan opsi keamanan
      response.cookies.set('authToken', token, {
        httpOnly: true,        // Tidak bisa diakses dari JavaScript
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',    // CSRF protection
        maxAge: 3600,          // 1 jam
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Username atau password salah' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
