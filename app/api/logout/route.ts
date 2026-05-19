import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json(
    { 
      error: false,
      message: 'Logout successful' 
    },
    { status: 200 }
  );

  // Hapus cookie token
  response.cookies.delete('token');

  return response;
}
