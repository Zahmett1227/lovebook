import { useState } from 'react';
import { login } from '../services/authService';
import { ALLOWED_USERS, USER_PROFILES } from '../config/appConfig';

export default function LoginPage() {
  const [selectedEmail, setSelectedEmail] = useState(ALLOWED_USERS[0] ?? '');
  const [email, setEmail] = useState(ALLOWED_USERS[0] ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function selectUserPreset(nextEmail) {
    setSelectedEmail(nextEmail);
    setEmail(nextEmail);
  }

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
    <div className="min-h-[100dvh] flex flex-col bg-lb-page relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-100"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 120% 80% at 50% -20%, rgba(227, 176, 92, 0.12), transparent 50%), ' +
            'radial-gradient(ellipse 80% 50% at 100% 50%, rgba(199, 107, 138, 0.06), transparent 45%), ' +
            'radial-gradient(ellipse 60% 40% at 0% 80%, rgba(99, 90, 120, 0.12), transparent 40%), ' +
            'linear-gradient(180deg, var(--lb-canvas) 0%, var(--lb-page) 55%, var(--lb-page) 100%)',
        }}
      />

      <div className="relative flex-1 flex flex-col justify-center px-4 py-8 sm:py-10 min-h-[45vh] sm:min-h-[50vh]">
        <div className="relative w-full max-w-lg mx-auto grain-overlay rounded-[1.85rem] min-h-[220px] flex flex-col items-center justify-center py-8 px-4">
          <h1 className="font-hero-title text-5xl italic text-center bg-gradient-to-r from-lb-accent via-yellow-300 to-lb-accent bg-clip-text text-transparent">
            Lovebook
          </h1>
          <p className="font-hero-sub text-xs tracking-[0.22em] uppercase text-lb-subtext text-center mt-3">
            Birlikte yazılan hikâye
          </p>
          <div className="flex justify-center gap-3 mt-8">
            {['🎬', '📷', '💌'].map((emoji) => (
              <div
                key={emoji}
                className="w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center border border-lb-border bg-lb-elevated/40 rounded-xl text-lg sm:text-xl animate-pulse"
              >
                {emoji}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative flex-1 flex items-center justify-center px-4 pb-10 pt-2">
        <div className="w-full max-w-md">
          <div className="bg-lb-elevated/60 backdrop-blur-2xl border border-lb-border rounded-[1.85rem] p-7 shadow-book ring-1 ring-lb-accent/10">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                {ALLOWED_USERS.map((addr) => {
                  const profile = USER_PROFILES[addr];
                  const active = selectedEmail === addr;
                  return (
                    <button
                      key={addr}
                      type="button"
                      onClick={() => selectUserPreset(addr)}
                      className={`flex-1 rounded-2xl border px-4 py-3 min-h-[44px] text-sm font-hero-sub transition active:scale-[0.98] ${
                        active
                          ? 'border-lb-accent/50 bg-lb-accent/15 text-lb-accent font-semibold'
                          : 'border-lb-border bg-lb-canvas/50 text-lb-subtext hover:border-lb-accent/30'
                      }`}
                    >
                      {profile?.displayName ?? addr.split('@')[0]}
                    </button>
                  );
                })}
              </div>

              <div>
                <label
                  htmlFor="lovebook-login-email"
                  className="block text-[11px] font-medium text-lb-subtext mb-1 uppercase tracking-wide font-hero-sub"
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
                  className="block text-[11px] font-medium text-lb-subtext mb-1 uppercase tracking-wide font-hero-sub"
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
                  className="text-lb-danger text-xs bg-lb-danger/10 rounded-xl p-3 border border-lb-danger/30 font-hero-sub"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full lb-btn-primary min-h-[52px] text-lg italic font-display active:scale-[0.98] disabled:opacity-50"
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
