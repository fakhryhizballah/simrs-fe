/**
 * Utils untuk mengelola cookie di client-side
 * Catatan: Cookie yang di-set dengan httpOnly tidak bisa diakses dari client
 * File ini untuk reference dan menggunakan API routes untuk operasi cookie
 */

export const authUtils = {
  /**
   * Cek apakah user sudah login (dari response API)
   */
  isAuthenticated: (token?: string): boolean => {
    return !!token;
  },

  /**
   * Simpan user info di localStorage (jangan simpan token sensitif)
   */
  saveUserInfo: (user: { username: string }) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  /**
   * Ambil user info dari localStorage
   */
  getUserInfo: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  /**
   * Clear user info
   */
  clearUserInfo: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  },
};
