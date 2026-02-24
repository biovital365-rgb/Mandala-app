import { motion } from "motion/react";
import { ChevronLeft, Share, Calculator, Sparkles, Zap, Gift, ChevronDown } from "lucide-react";

interface DetailViewProps {
  pillar: string;
  results: any;
  onBack: () => void;
}

export function DetailView({ pillar, results, onBack }: DetailViewProps) {
  // Mock data based on the pillar
  const getPillarData = () => {
    switch (pillar) {
      case 'esencia':
        return {
          title: "Esencia",
          number: results.essence,
          subtitle: "El Buscador de la Verdad",
          desc: "Tu camino hacia la sabiduría interior y el análisis profundo.",
          calc: "12 / 05 / 1990",
          calcSteps: "36 → 9 + 7",
          color: "primary",
          icon: <Sparkles className="w-5 h-5" />
        };
      case 'mision':
        return {
          title: "Misión de Vida",
          number: results.lifePath,
          subtitle: "El Constructor",
          desc: "Tu propósito en esta encarnación.",
          calc: "12 / 05 / 1990",
          calcSteps: "22",
          color: "accent",
          icon: <Sparkles className="w-5 h-5" />
        };
      // Add other cases as needed
      default:
        return {
          title: "Misión de Vida",
          number: "7",
          subtitle: "El Buscador de la Verdad",
          desc: "Tu camino hacia la sabiduría interior y el análisis profundo.",
          calc: "12 / 05 / 1990",
          calcSteps: "36 → 9 + 7",
          color: "primary",
          icon: <Sparkles className="w-5 h-5" />
        };
    }
  };

  const data = getPillarData();

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto overflow-hidden bg-[#050214] shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-b from-[#090518] via-[#110a2e] to-[#050214] pointer-events-none z-0"></div>
      
      {/* Background effects */}
      <div className="absolute top-[-10%] left-[-10%] right-[-10%] h-[600px] bg-[radial-gradient(circle_at_50%_40%,rgba(134,25,143,0.25),transparent_70%)] pointer-events-none z-0"></div>
      <div className="absolute -top-[50px] -right-[50px] w-[250px] h-[250px] bg-[#d946ef]/10 rounded-full blur-[80px] pointer-events-none z-0"></div>

      <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-[#050214]/70 backdrop-blur-xl border-b border-white/5">
        <button onClick={onBack} aria-label="Volver" className="flex w-10 h-10 items-center justify-center rounded-full hover:bg-white/5 transition-colors text-slate-200">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-[#ffd700]/80">{data.title}</h2>
        <button aria-label="Compartir" className="flex w-10 h-10 items-center justify-center rounded-full hover:bg-white/5 transition-colors text-slate-200">
          <Share className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 flex flex-col relative z-10 pb-28">
        <section className="relative flex flex-col items-center justify-center pt-10 pb-12 px-6">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[360px] h-[360px] rounded-full border border-[#d946ef]/10 animate-[spin_60s_linear_infinite] flex items-center justify-center opacity-40">
              <div className="w-[320px] h-[320px] rounded-full border border-dashed border-[#ffd700]/20"></div>
            </div>
          </div>

          <div className="relative z-10 mb-4">
            <h1 className="text-[130px] font-bold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#fffce6] via-[#ffd700] to-[#d4af37] drop-shadow-[0_0_35px_rgba(255,215,0,0.3)]">
              {data.number}
            </h1>
          </div>

          <div className="text-center relative z-10 space-y-3 px-4">
            <h2 className="text-2xl font-bold text-white tracking-tight drop-shadow-md">{data.subtitle}</h2>
            <p className="text-slate-300 text-sm font-medium leading-relaxed max-w-[280px] mx-auto opacity-90">
              {data.desc}
            </p>
          </div>
        </section>

        <section className="px-4 mb-6">
          <div className="glass-panel rounded-2xl p-5 border-l-2 border-l-[#ffd700] shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-1.5 rounded-lg bg-white/5">
                <Calculator className="w-5 h-5 text-[#ffd700]" />
              </div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Cálculo de Nacimiento</h3>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm text-slate-400">
                <span className="font-medium">Fecha</span>
                <span className="font-mono text-slate-200 tracking-wider">{data.calc}</span>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full"></div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-sm font-medium text-slate-400">Reducción</span>
                <div className="flex items-center gap-3 font-mono text-lg font-bold text-white">
                  <span className="text-slate-300">{data.calcSteps}</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#ffd700] to-[#b49b38] text-xl drop-shadow-[0_0_10px_rgba(255,215,0,0.4)]">
                    {data.number}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 space-y-4">
          <details className="group glass-panel rounded-xl overflow-hidden transition-all duration-300 open:bg-[rgba(255,255,255,0.05)] open:border-[#d946ef]/30" open>
            <summary className="flex cursor-pointer items-center justify-between p-5 list-none select-none">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#d946ef]/10 text-[#d946ef] border border-[#d946ef]/20 shadow-[0_0_15px_rgba(217,70,239,0.15)]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-100 tracking-wide text-[15px]">La Esencia</h3>
              </div>
              <ChevronDown className="w-5 h-5 text-slate-500 transition-transform duration-300 group-open:rotate-180 group-open:text-[#d946ef]" />
            </summary>
            <div className="px-5 pb-6 pt-1">
              <div className="w-full h-px bg-white/5 mb-4"></div>
              <p className="text-slate-300 text-sm leading-7 font-light">
                Eres un alma introspectiva que busca respuestas más allá de lo superficial. Tu esencia vibra con la curiosidad filosófica y la necesidad de entender los misterios del universo. No te conformas con lo evidente; siempre estás excavando hacia la raíz de las cosas.
              </p>
            </div>
          </details>

          <details className="group glass-panel rounded-xl overflow-hidden transition-all duration-300 open:bg-[rgba(255,255,255,0.05)] open:border-red-400/30">
            <summary className="flex cursor-pointer items-center justify-between p-5 list-none select-none">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-100 tracking-wide text-[15px]">Los Desafíos Kármicos</h3>
              </div>
              <ChevronDown className="w-5 h-5 text-slate-500 transition-transform duration-300 group-open:rotate-180 group-open:text-red-400" />
            </summary>
            <div className="px-5 pb-6 pt-1">
              <div className="w-full h-px bg-white/5 mb-4"></div>
              <ul className="space-y-4">
                <li className="flex gap-3 text-sm text-slate-300 leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)] flex-shrink-0"></span>
                  <span>Tendencia al aislamiento excesivo y a la soledad no constructiva.</span>
                </li>
                <li className="flex gap-3 text-sm text-slate-300 leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)] flex-shrink-0"></span>
                  <span>Perfeccionismo paralizante que impide compartir tus dones.</span>
                </li>
              </ul>
            </div>
          </details>

          <details className="group glass-panel rounded-xl overflow-hidden transition-all duration-300 open:bg-[rgba(255,255,255,0.05)] open:border-[#ffd700]/30">
            <summary className="flex cursor-pointer items-center justify-between p-5 list-none select-none">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#ffd700]/10 text-[#ffd700] border border-[#ffd700]/20 shadow-[0_0_15px_rgba(255,215,0,0.15)]">
                  <Gift className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-100 tracking-wide text-[15px]">El Regalo Divino</h3>
              </div>
              <ChevronDown className="w-5 h-5 text-slate-500 transition-transform duration-300 group-open:rotate-180 group-open:text-[#ffd700]" />
            </summary>
            <div className="px-5 pb-6 pt-1">
              <div className="w-full h-px bg-white/5 mb-4"></div>
              <div className="bg-gradient-to-r from-[#ffd700]/10 to-transparent p-4 rounded-lg border border-[#ffd700]/20 mb-4 shadow-[inset_0_0_20px_rgba(255,215,0,0.05)]">
                <p className="text-[#ffd700] text-xs font-bold uppercase tracking-widest mb-1.5 opacity-90">Dones Desbloqueados</p>
                <p className="text-white text-[15px] font-semibold tracking-wide">Intuición Profunda y Maestría</p>
              </div>
              <p className="text-slate-300 text-sm leading-7 font-light">
                Al integrar tu sombra, accedes a una capacidad única para sanar a otros a través del conocimiento. Tu mente se convierte en un puente entre lo científico y lo espiritual.
              </p>
            </div>
          </details>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#050214] via-[#050214]/95 to-transparent z-50 flex flex-col gap-3 max-w-md mx-auto">
        <button className="w-full h-14 rounded-xl bg-gradient-to-r from-[#86198f] to-[#d946ef] hover:to-[#f0abfc] active:scale-[0.98] transition-all text-white font-bold flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(217,70,239,0.4)] border border-white/10">
          <Share className="w-5 h-5" />
          Compartir Interpretación
        </button>
        <button 
          onClick={onBack}
          className="w-full py-2 text-sm text-slate-400 font-medium hover:text-white transition-colors tracking-wide"
        >
          Explorar otros pilares
        </button>
      </div>
    </div>
  );
}
