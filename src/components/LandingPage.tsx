import { motion } from "motion/react";
import { Sparkles, Lock, Star, Shield, Brain, User as UserIcon } from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
  onAuthClick: () => void;
  user: any;
}

export function LandingPage({ onStart, onAuthClick, user }: LandingPageProps) {
  return (
    <div className="flex flex-col min-h-screen w-full max-w-md mx-auto relative z-10">
      {/* Abstract Background Graphic */}
      <div className="absolute top-0 left-0 w-full h-[600px] pointer-events-none -z-10 opacity-60 overflow-hidden" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, rgba(10,10,15,0) 70%)' }}>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-primary/10"></div>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full border border-primary/10 rotate-45"></div>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150px] h-[150px] rounded-full border border-primary/20"></div>
      </div>

      {/* Header */}
      <header className="w-full z-50 glass-panel border-b border-white/10 bg-background/80 sticky top-0">
        <div className="flex items-center justify-between px-5 py-4 w-full">
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary w-6 h-6" />
            <h2 className="text-white text-lg font-bold tracking-tight">Mandala Numérico</h2>
          </div>
          {user ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
              <UserIcon className="w-3 h-3 text-primary" />
              <span className="text-xs text-white font-medium">{user.name || user.email.split('@')[0]}</span>
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              className="text-primary/90 text-sm font-bold tracking-wide hover:text-primary transition-colors"
            >
              INGRESAR
            </button>
          )}
        </div>
      </header>

      <main className="flex-grow flex flex-col pt-8 pb-12 px-5 w-full">
        <div className="flex flex-col items-center text-center gap-6 mt-6">
          {/* Hero Image/Mandala Placeholder */}
          <div className="relative w-full h-64 flex items-center justify-center mb-2">
            <div className="w-64 h-64 rounded-full bg-cover bg-center animate-pulse" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')", boxShadow: "0 0 50px rgba(212, 175, 55, 0.15)" }}>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
              Descubre el Código Sagrado de tu Destino
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed font-light">
              Tu mapa numerológico con precisión kabalística. Decodifica tu frecuencia vibratoria hoy.
            </p>
          </div>

          <div className="w-full mt-2">
            <button
              onClick={onStart}
              className="w-full py-4 px-6 bg-primary hover:bg-primary/90 text-black font-bold text-lg rounded-xl gold-glow flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            >
              <Sparkles className="w-5 h-5" />
              Calcular Mi Mapa Gratis
            </button>
            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-500">
              <Lock className="w-3 h-3" />
              <span>Seguimiento de sesión habilitado</span>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 mb-8 border-y border-white/5 py-6">
          <p className="text-center text-slate-500 text-xs uppercase tracking-widest mb-4">Reconocido por expertos en</p>
          <div className="flex justify-between items-center opacity-50 grayscale gap-4 px-2">
            <div className="h-6 w-auto flex items-center gap-1">
              <Star className="w-4 h-4" />
              <span className="text-xs font-bold">VOGUE</span>
            </div>
            <div className="h-6 w-auto flex items-center gap-1">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-bold">FORBES</span>
            </div>
            <div className="h-6 w-auto flex items-center gap-1">
              <Brain className="w-4 h-4" />
              <span className="text-xs font-bold">MINDVALLEY</span>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-white text-center mb-2">Cómo Funciona</h2>
          <div className="flex flex-col gap-4">
            <div className="glass-panel rounded-xl p-5 flex items-center gap-4 relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                <span className="font-bold text-xl">1</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-primary font-bold uppercase tracking-wider mb-0.5">Paso 1</span>
                <h3 className="text-white text-lg font-bold leading-tight">Ingresa</h3>
                <p className="text-slate-400 text-sm">Tu nombre completo y fecha de nacimiento.</p>
              </div>
            </div>

            <div className="glass-panel rounded-xl p-5 flex items-center gap-4 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                <span className="font-bold text-xl">2</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-primary font-bold uppercase tracking-wider mb-0.5">Paso 2</span>
                <h3 className="text-white text-lg font-bold leading-tight">Decodifica</h3>
                <p className="text-slate-400 text-sm">Nuestro motor analiza tu frecuencia vibratoria.</p>
              </div>
            </div>

            <div className="glass-panel rounded-xl p-5 flex items-center gap-4 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 text-white">
                <span className="font-bold text-xl">3</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Paso 3</span>
                <h3 className="text-white text-lg font-bold leading-tight">Recibe</h3>
                <p className="text-slate-400 text-sm">Tu guía espiritual personalizada al instante.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-16 mb-8 p-8 rounded-3xl bg-card border border-white/5 text-center relative overflow-hidden">
          <h2 className="text-2xl font-bold text-white mb-4 relative z-10">¿Listo para conocer tu verdad?</h2>
          <button
            onClick={onStart}
            className="w-full py-4 px-6 bg-primary hover:bg-primary/90 text-black font-bold text-lg rounded-xl gold-glow relative z-10 shadow-lg"
          >
            Calcular Ahora
          </button>
        </div>
      </main>

      <footer className="py-8 text-center border-t border-white/5 bg-background mt-auto">
        <div className="max-w-md mx-auto px-5 flex flex-col gap-4">
          <div className="flex justify-center gap-6">
            <a className="text-slate-500 hover:text-primary text-sm" href="#">Términos</a>
            <a className="text-slate-500 hover:text-primary text-sm" href="#">Privacidad</a>
            <a className="text-slate-500 hover:text-primary text-sm" href="#">Soporte</a>
          </div>
          <p className="text-slate-600 text-xs">© 2024 Mandala Numérico. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
