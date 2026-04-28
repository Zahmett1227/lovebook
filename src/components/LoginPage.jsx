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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / title */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📖</div>
          <h1 className="font-display text-3xl font-semibold text-[#3d2b1f]">
            LoveBook
          </h1>
          <p className="text-[#8a6a5a] mt-1 text-sm">Bizim Günlüğümüz</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#fdfaf5] rounded-2xl shadow-book border border-[#e8d5c0] p-8 space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-[#8a6a5a] mb-1 uppercase tracking-wide">
              E-posta
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-[#e0cdb8] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a98a] text-[#3d2b1f]"
              placeholder="ornek@email.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8a6a5a] mb-1 uppercase tracking-wide">
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-[#e0cdb8] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a98a] text-[#3d2b1f]"
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
            className="w-full bg-[#a0704a] hover:bg-[#8a5e3c] text-white rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-60"
          >
            {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
          </button>
        </form>

        <p className="text-center text-xs text-[#b09080] mt-6">
          Bu uygulama yalnızca özel erişime açıktır.
        </p>
      </div>
    </div>
  );
}
