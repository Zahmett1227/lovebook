import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-10 bg-lb-page text-lb-text">
          <p className="font-hero-title text-2xl sm:text-3xl text-center">Bir şeyler ters gitti</p>
          <p className="font-hero-sub text-sm text-lb-subtext text-center mt-3 max-w-md">
            Sayfayı yenilediğinde genelde düzelir. Sorun sürerse bu ekranın görüntüsünü kaydetmek faydalı olur.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-8 rounded-2xl border border-lb-accent/50 bg-lb-accent text-lb-page px-6 py-3 text-sm font-semibold shadow-glow transition active:scale-[0.98]"
          >
            Sayfayı yenile
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
