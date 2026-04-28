import { useState } from 'react';
import { login } from '../services/authService';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Giriş başarısız.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / title */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📖</div>
          <h1 className="font-display text-3xl font-semibold text-[#174330]">
            LoveBook
          </h1>
          <p className="text-[#3d7259] mt-1 text-sm">Bizim Günlüğümüz</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#f7fdf9] rounded-2xl shadow-book border border-[#cbe3d5] p-6 sm:p-8 space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-[#3d7259] mb-1 uppercase tracking-wide">
              E-posta
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-[#cbe3d5] rounded-2xl px-4 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-[#7bb395] text-[#174330]"
              placeholder="ornek@email.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#3d7259] mb-1 uppercase tracking-wide">
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-[#cbe3d5] rounded-2xl px-4 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-[#7bb395] text-[#174330]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-600 text-xs bg-red-50 rounded-lg p-2 border border-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[44px] bg-[#1f6b4b] hover:bg-[#195a40] text-white rounded-2xl py-2.5 text-sm font-medium transition disabled:opacity-60 active:scale-[0.98]"
          >
            {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
          </button>
        </form>

        <p className="text-center text-xs text-[#6e9f87] mt-6">
          Bu uygulama yalnızca özel erişime açıktır.
        </p>
      </div>
    </div>
  );
}
