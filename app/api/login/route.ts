import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import axios, { AxiosError } from 'axios';
import https from 'https';
import { connectDB } from '@/lib/db';
import { Users } from '@/lib/models/User';

// Ignore SSL certificate warnings untuk development
const agent = new https.Agent({
  rejectUnauthorized: false,
});

export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectDB();

    const body = await request.json();
    let { username, password } = body;

    // Validasi input
    if (!username || !password) {
      return NextResponse.json(
        {
          error: true,
          message: 'username and password are required',
          body: body,
        },
        { status: 400 }
      );
    }

    // 1. Cek user di local database
    let user = await Users.findOne({ username: username, password: password });

    if (user) {
      // User ditemukan di local database dengan password match
      const token = jwt.sign(
        {
          username: username,
          nik: user.data?.no_ktp,
          fullname: user.data?.nama,
        },
        process.env.SECRET_KHNZA || 'secret',
        { expiresIn: '1d' }
      );

      const response = NextResponse.json(
        {
          error: false,
          message: 'Success login',
          user: {
            username: username,
            nik: user.data?.no_ktp,
            fullname: user.data?.nama,
          },
        },
        { status: 200 }
      );

      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 86400, // 1 hari
        path: '/',
      });

      return response;
    }

    // 2. Jika user tidak ditemukan atau password tidak match,
    // cek ke external API dengan temporary Bearer token
    const Bearertoken = jwt.sign(
      { username: username },
      process.env.SECRET_KHNZA || 'secret',
      { expiresIn: '1m' }
    );

    try {
      // 3. Cek password dari external API
      const cekPasswordResponse = await axios.request({
        method: 'GET',
        maxBodyLength: Infinity,
        url: `${process.env.HOSTKHNZA}/api/users/password/${username}`,
        headers: {
          Authorization: `Bearer ${Bearertoken}`,
        },
        httpsAgent: agent,
      });

      if (cekPasswordResponse.data.data.password !== password) {
        return NextResponse.json(
          {
            error: true,
            message: 'Username or password is incorrect',
            body: body,
          },
          { status: 400 }
        );
      }

      // 4. Cek akses user
      const cekAksesResponse = await axios.request({
        method: 'GET',
        maxBodyLength: Infinity,
        url: `${process.env.HOSTKHNZA}/api/users/aksess/${username}`,
        headers: {
          Authorization: `Bearer ${Bearertoken}`,
        },
        httpsAgent: agent,
      });

      // 5. Ambil data user
      const cekUserResponse = await axios.request({
        method: 'GET',
        maxBodyLength: Infinity,
        url: `${process.env.HOSTKHNZA}/api/users/cari?search=${username}&limit=1`,
        headers: {
          Authorization: `Bearer ${Bearertoken}`,
        },
        httpsAgent: agent,
      });

      // 6. Simpan atau update user di local database
      if (!user) {
        user = new Users({
          username: username,
          password: password,
          akses: cekAksesResponse.data.data,
          data: cekUserResponse.data.data[0],
        });
        await user.save();
      } else {
        // Update existing user
        user.password = password;
        user.akses = cekAksesResponse.data.data;
        user.data = cekUserResponse.data.data[0];
        await user.save();
      }

      // 7. Generate JWT token
      const userData = cekUserResponse.data.data[0];
      const token = jwt.sign(
        {
          username: username,
          nik: userData.nik || userData.no_ktp,
          fullname: userData.nama,
        },
        process.env.SECRET_KHNZA || 'secret',
        { expiresIn: '1d' }
      );

      const response = NextResponse.json(
        {
          error: false,
          message: 'Success',
          user: {
            username: username,
            nik: userData.nik || userData.no_ktp,
            fullname: userData.nama,
          },
        },
        { status: 200 }
      );

      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 86400, // 1 hari
        path: '/',
      });

      return response;
    } catch (apiError: any) {
      console.error('External API error:', apiError);

      if (apiError.response) {
        return NextResponse.json(
          {
            error: true,
            message: apiError.response.data?.message || 'External API error',
          },
          { status: apiError.response.status || 500 }
        );
      }

      throw apiError;
    }
  } catch (error: any) {
    console.error('Login error:', error);

    if (error.response) {
      return NextResponse.json(
        {
          error: true,
          message: error.response.data?.message || 'Error',
        },
        { status: error.response.status || 500 }
      );
    }

    return NextResponse.json(
      {
        error: true,
        message: error.message || 'Server error',
      },
      { status: 500 }
    );
  }
}
