# Panduan Implementasi Environment Variables & Cookie Token Middleware

## 📋 Daftar File yang Telah Dibuat

### 1. Environment Configuration
- `.env` - Environment variables untuk production
- `.env.local` - Environment variables untuk development

### 2. Middleware
- `middleware.ts` - Route protection middleware yang mengecek cookie token

### 3. API Routes
- `app/api/login/route.ts` - Endpoint login yang set cookie
- `app/api/logout/route.ts` - Endpoint logout yang delete cookie

### 4. Pages
- `app/login/page.tsx` - Halaman login yang di-update
- `app/dashboard/page.tsx` - Contoh protected page

### 5. Utilities
- `lib/authUtils.ts` - Utility functions untuk auth
- `lib/AuthContext.tsx` - React Context untuk auth state

---

## 🔧 Cara Menggunakan

### 1. Environment Variables

**File `.env.local` (Development):**
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
BACKEND_URL=http://localhost:3001
NODE_ENV=development
```

**File `.env` (Production):**
```env
NEXT_PUBLIC_BASE_URL=https://api.rsudaa.singkawangkota.go.id
NEXT_PUBLIC_API_URL=https://api.rsudaa.singkawangkota.go.id
BACKEND_URL=https://api.rsudaa.singkawangkota.go.id
NODE_ENV=production
```

**Catatan:**
- `NEXT_PUBLIC_*` prefix: Variable yang bisa diakses dari client-side
- Variable tanpa prefix: Hanya bisa diakses di server-side

---

### 2. Middleware untuk Route Protection

Middleware akan:
- ✅ Mengecek cookie `authToken` di setiap request
- ✅ Redirect ke login jika belum authenticated untuk protected routes
- ✅ Redirect ke dashboard jika sudah login tapi akses halaman login

**Route yang Dilindungi (Protected Routes):**
```typescript
const protectedRoutes = ['/dashboard', '/profile', '/settings'];
```

Untuk menambah protected route, edit `middleware.ts`:
```typescript
const protectedRoutes = ['/dashboard', '/profile', '/settings', '/reports'];
```

---

### 3. Login Flow

**Endpoint:** `POST /api/login`

**Request:**
```json
{
  "username": "admin",
  "password": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login berhasil",
  "user": { "username": "admin" }
}
```

**Cookie yang di-set:**
- Name: `authToken`
- HttpOnly: true (tidak bisa diakses dari JavaScript)
- Secure: true (HTTPS only di production)
- SameSite: strict (CSRF protection)
- MaxAge: 3600 (1 jam)

---

### 4. Logout Flow

**Endpoint:** `POST /api/logout`

**Fungsi:** Delete cookie `authToken`

---

## 💡 Contoh Penggunaan di Component

### Login Page
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const response = await axios.post(`${BASE_URL}/api/login`, {
      username,
      password,
    });
    if (response.status === 200) {
      router.push('/dashboard'); // Redirect ke dashboard
    }
  } catch (err) {
    // Handle error
  }
};
```

### Protected Page (Dashboard)
```typescript
"use client";
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await axios.post('/api/logout');
    router.push('/login');
  };

  return <div>Protected Content</div>;
}
```

---

## 🔐 Keamanan

### Best Practices yang Sudah Diterapkan:
1. ✅ Cookie dengan `httpOnly: true` - Tidak bisa diakses dari XSS attack
2. ✅ Cookie dengan `secure: true` - Hanya dikirim via HTTPS di production
3. ✅ Cookie dengan `sameSite: strict` - Proteksi dari CSRF attack
4. ✅ Token expiration (1 jam default)
5. ✅ Middleware di server-side untuk proteksi route

### Rekomendasi Tambahan:
- [ ] Gunakan JWT (JSON Web Token) untuk token production-ready
- [ ] Refresh token mechanism untuk extend session
- [ ] Rate limiting untuk login endpoint
- [ ] Hash password di backend sebelum compare
- [ ] HTTPS enforcing di production

---

## 🚀 Testing

### 1. Start Development Server
```bash
npm run dev
```

### 2. Test Login
```bash
# Buka http://localhost:3000/login
# Username: admin
# Password: admin
```

### 3. Verify Cookie
```javascript
// Di browser console
document.cookie
// Harusnya menampilkan: authToken=...
```

### 4. Test Protected Route
```bash
# Buka http://localhost:3000/dashboard
# Jika sudah login, tampilannya dashboard
# Jika belum login, akan redirect ke login
```

---

## 📝 Struktur File

```
a:\Project\simrs-fe
├── .env
├── .env.local
├── middleware.ts ⭐
├── app/
│   ├── api/
│   │   ├── login/
│   │   │   └── route.ts ⭐
│   │   └── logout/
│   │       └── route.ts ⭐
│   ├── login/
│   │   └── page.tsx ✏️
│   └── dashboard/
│       └── page.tsx ⭐
├── lib/
│   ├── authUtils.ts ⭐
│   └── AuthContext.tsx ⭐
└── ...
```

⭐ = File baru
✏️ = File yang di-edit

---

## 🔌 Integrasi dengan Backend API

Edit `app/api/login/route.ts`:

```typescript
// Ganti dummy validation dengan backend API call:
const backendResponse = await fetch(`${process.env.BACKEND_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password }),
});

const data = await backendResponse.json();

if (backendResponse.ok) {
  const token = data.token; // dari backend
  // Set cookie dengan token dari backend
  response.cookies.set('authToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600,
    path: '/',
  });
}
```

---

## ❓ Troubleshooting

### Cookie tidak ter-set?
- Pastikan `app/api/login/route.ts` sudah updated
- Check browser DevTools → Application → Cookies
- Pastikan domain benar

### Middleware tidak bekerja?
- Pastikan `middleware.ts` ada di root project (bukan dalam folder `app`)
- Restart server setelah membuat middleware
- Check console untuk error messages

### Redirect loop?
- Pastikan `/login` tidak ada di `protectedRoutes`
- Periksa regex di middleware matcher

---

## 📚 Referensi

- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Next.js Cookies API](https://nextjs.org/docs/app/api-reference/functions/cookies)
- [HTTP Cookies Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
