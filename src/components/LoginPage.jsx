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
    <div className="min-h-[100dvh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="max-w-sm mx-auto rounded-[1.8rem] border border-[#ead4ce] bg-gradient-to-br from-[#fff9f8] via-[#fbeee8] to-[#f8e7df] p-6 sm:p-8 shadow-editorial">
          <p className="font-hero-sub text-[11px] uppercase tracking-[0.24em] text-[#a0726c] text-center">
            Hoş geldin
          </p>
          <h1 className="font-hero-title text-3xl sm:text-4xl text-[#5a3738] text-center mt-2">
            LoveBook
          </h1>
          <p className="font-hero-sub text-sm text-[#8f5f5f] text-center mt-2">
            Bizim günlüğümüze giriş yap
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label
                htmlFor="lovebook-login-email"
                className="block text-[11px] font-medium text-[#9a726c] mb-1 uppercase tracking-wide"
              >
                E-posta
              </label>
              <input
                id="lovebook-login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-[#ddbcb3] rounded-2xl px-4 py-3 text-base bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#c49a92] text-[#402b2d]"
                placeholder="ornek@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="lovebook-login-password"
                className="block text-[11px] font-medium text-[#9a726c] mb-1 uppercase tracking-wide"
              >
                Şifre
              </label>
              <input
                id="lovebook-login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-[#ddbcb3] rounded-2xl px-4 py-3 text-base bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#c49a92] text-[#402b2d]"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="text-red-700 text-xs bg-red-50/90 rounded-xl p-3 border border-red-200"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] rounded-2xl border border-[#ddbcb3] bg-[#8f5f5f] hover:bg-[#7a4f4f] text-white text-sm font-medium tracking-wide transition disabled:opacity-60 active:scale-[0.98] font-hero-sub"
            >
              {loading ? 'Giriş yapılıyor…' : 'Giriş yap'}
            </button>
          </form>

          <p className="text-center text-[11px] text-[#a0726c] mt-6 font-hero-sub">
            Bu uygulama yalnızca özel erişime açıktır.
          </p>
        </div>
      </div>
    </div>
  );
}
