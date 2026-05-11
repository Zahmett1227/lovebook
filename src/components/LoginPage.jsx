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
    <div className="min-h-[100dvh] flex items-center justify-center px-4 py-10 bg-lb-page">
      <div className="w-full max-w-md">
        <div className="relative">
          <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-lb-accent/25 via-transparent to-lb-accent2/20 blur-2xl pointer-events-none" />
          <div className="relative rounded-[1.85rem] border border-lb-border bg-gradient-to-b from-lb-elevated to-lb-surface p-8 sm:p-10 shadow-book ring-1 ring-lb-accent/15">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/5 h-px bg-gradient-to-r from-transparent via-lb-accent/60 to-transparent" />
            <p className="font-hero-sub text-[11px] uppercase tracking-[0.28em] text-lb-accent text-center">
              LoveBook
            </p>
            <h1 className="font-hero-title text-3xl sm:text-4xl text-lb-text text-center mt-3">
              Giriş
            </h1>
            <p className="font-hero-sub text-sm text-lb-subtext text-center mt-2">
              Günlüğe devam et
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label
                  htmlFor="lovebook-login-email"
                  className="block text-[11px] font-medium text-lb-subtext mb-1 uppercase tracking-wide"
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
                  className="lb-input"
                  placeholder="ornek@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="lovebook-login-password"
                  className="block text-[11px] font-medium text-lb-subtext mb-1 uppercase tracking-wide"
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
                  className="lb-input"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="text-lb-danger text-xs bg-lb-danger/10 rounded-xl p-3 border border-lb-danger/30"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full lb-btn-primary min-h-[50px] text-base"
              >
                {loading ? 'Giriş yapılıyor…' : 'Giriş yap'}
              </button>
            </form>

            <p className="text-center text-[11px] text-lb-subtext mt-6 font-hero-sub">
              Bu uygulama yalnızca özel erişime açıktır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
