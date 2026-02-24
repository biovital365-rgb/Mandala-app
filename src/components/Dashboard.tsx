import { motion } from "motion/react";
import { Heart, Mountain, Badge, Calendar, Gift, Sparkles, Bell, Infinity, FileText } from "lucide-react";

interface DashboardProps {
  results: any;
  onViewDetail: (pillar: string) => void;
  onGeneratePDF: () => void;
}

export function Dashboard({ results, onViewDetail, onGeneratePDF }: DashboardProps) {
  return (
    <div className="relative w-full max-w-md h-full min-h-screen bg-gradient-to-b from-[#050505] to-[#0a0a0f] flex flex-col shadow-2xl overflow-hidden mx-auto">
      <div className="flex items-center justify-between px-6 pt-12 pb-4 bg-background/80 backdrop-blur-md z-10 sticky top-0 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <Sparkles className="text-primary w-5 h-5 gold-glow" />
          </div>
          <div>
            <h1 className="text-white text-lg font-bold leading-tight">Mapa de {results.name.split(' ')[0]}</h1>
            <p className="text-slate-400 text-xs font-medium">Alineación: <span className="text-primary">85%</span></p>
          </div>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition border border-white/5">
          <Bell className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 no-scrollbar">
        <div className="mb-8 mt-6 relative overflow-hidden rounded-2xl glass-panel p-6 border border-primary/20">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-[60px] pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/20 rounded-full blur-[60px] pointer-events-none"></div>
          
          <div className="flex flex-col items-center text-center gap-4 relative z-10">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 border-2 border-dashed border-primary/30 rounded-full animate-[spin_20s_linear_infinite]"></div>
              <div className="absolute inset-2 border border-primary/10 rounded-full opacity-50"></div>
              <Infinity className="text-primary w-10 h-10 gold-glow" />
            </div>
            <div>
              <h2 className="text-white text-lg font-bold">Decodificando tu Esencia...</h2>
              <p className="text-slate-400 text-sm mt-1">Calculando vibraciones del nombre</p>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1">
              <div className="h-full bg-gradient-to-r from-primary to-yellow-200 w-full rounded-full shadow-[0_0_10px_rgba(212,175,55,0.6)]"></div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-bold">5 Pilares Sagrados</h2>
          <span className="text-primary text-xs font-semibold bg-primary/10 border border-primary/20 px-2 py-1 rounded">Completo</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Esencia */}
          <div 
            onClick={() => onViewDetail('esencia')}
            className="glass-panel rounded-xl p-4 flex flex-col gap-3 group relative overflow-hidden cursor-pointer hover:border-primary/40 transition-colors"
          >
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition">
              <Heart className="w-10 h-10 text-primary" />
            </div>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Esencia</p>
              <div className="flex items-baseline gap-1 mt-1">
                <h3 className="text-white text-3xl font-bold font-display text-gradient-gold">{results.essence}</h3>
              </div>
            </div>
          </div>

          {/* Misión */}
          <div 
            onClick={() => onViewDetail('mision')}
            className="glass-panel rounded-xl p-4 flex flex-col gap-3 group relative overflow-hidden cursor-pointer hover:border-accent/40 transition-colors"
          >
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition">
              <Mountain className="w-10 h-10 text-accent" />
            </div>
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
              <Mountain className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Misión</p>
              <div className="flex items-baseline gap-1 mt-1">
                <h3 className="text-white text-3xl font-bold font-display">{results.lifePath}</h3>
              </div>
            </div>
          </div>

          {/* Vibración del Nombre */}
          <div 
            onClick={() => onViewDetail('nombre')}
            className="glass-panel col-span-2 rounded-xl p-5 flex items-center justify-between relative overflow-hidden cursor-pointer hover:border-indigo-500/40 transition-colors"
          >
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-primary to-transparent opacity-50"></div>
            <div className="flex gap-4 items-center z-10">
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/20">
                <Badge className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Vibración del Nombre</p>
                <h3 className="text-white text-xl font-bold mt-0.5">Expresión</h3>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center bg-black/40 rounded-lg px-3 py-1 border border-primary/20 shadow-[0_0_10px_rgba(212,175,55,0.1)]">
              <span className="text-primary text-2xl font-bold">{results.nameVibration}</span>
            </div>
          </div>

          {/* Año Personal */}
          <div 
            onClick={() => onViewDetail('ano')}
            className="glass-panel rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden cursor-pointer hover:border-amber-500/40 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-600/10 flex items-center justify-center text-amber-500 border border-amber-600/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Año Personal</p>
              <h3 className="text-white text-3xl font-bold font-display mt-1">{results.personalYear}</h3>
            </div>
          </div>

          {/* Regalo Divino */}
          <div 
            onClick={() => onViewDetail('regalo')}
            className="glass-panel rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden cursor-pointer hover:border-purple-500/40 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Regalo Divino</p>
              <h3 className="text-white text-3xl font-bold font-display mt-1">{results.divineGift}</h3>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/10 p-5 flex items-start gap-4">
          <div className="bg-black/40 p-2 rounded-full border border-primary/20 shrink-0 shadow-[0_0_10px_rgba(212,175,55,0.15)]">
            <Sparkles className="text-primary w-5 h-5" />
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm">Tu energía hoy</h4>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              La vibración {results.essence} de tu esencia está en armonía con tu año personal. Es un buen momento para la introspección.
            </p>
          </div>
        </div>
        
        <div className="h-24"></div>
      </div>

      <div className="absolute bottom-[72px] left-0 w-full px-6 flex justify-center pointer-events-none z-20">
        <button 
          onClick={onGeneratePDF}
          className="pointer-events-auto gold-glow w-full max-w-[320px] bg-gradient-to-r from-primary to-amber-400 hover:to-amber-300 text-black font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition transform active:scale-95 border border-white/10"
        >
          <FileText className="w-5 h-5" />
          <span>Generar Reporte PDF</span>
        </button>
      </div>
    </div>
  );
}
