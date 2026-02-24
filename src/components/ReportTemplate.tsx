import React from 'react';
import { Sparkles, Heart, Mountain, Badge, Calendar, Gift, Infinity, Calculator, Target } from 'lucide-react';
import { getDetailedInterpretation, getCalculationSteps, getMapSynthesis } from '../lib/interpretations';

interface ReportTemplateProps {
    results: any;
}

export function ReportTemplate({ results }: ReportTemplateProps) {
    const getFullInfo = (pillar: string, num: number) => {
        return getDetailedInterpretation(pillar, num);
    };

    return (
        <div className="bg-black text-white p-12 w-[800px] font-sans min-h-[1100px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-12 border-b border-white/10 pb-8">
                <div className="flex items-center gap-3">
                    <Sparkles className="text-[#7f13ec] w-10 h-10" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Mandala Numérico</h1>
                        <p className="text-slate-400 text-sm uppercase tracking-widest">BioVital 365 • Mapa de Destino</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-slate-500 text-sm">Fecha de Reporte</p>
                    <p className="text-white font-medium">{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* Profile Section */}
            <div className="mb-12 text-center p-8 bg-[#120e26] rounded-3xl border border-[#7f13ec]/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#7f13ec]/10 rounded-full blur-3xl"></div>
                <h2 className="text-2xl font-bold mb-2 text-slate-300">Informe Personalizado para:</h2>
                <h3 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#ffd700] mb-4">
                    {results.name}
                </h3>
                <p className="text-slate-400 text-lg">Fecha de Nacimiento: {new Date(results.dob).toLocaleDateString()}</p>
            </div>

            {/* Pillars Section */}
            <div className="space-y-8">
                {[
                    { icon: Heart, label: 'Esencia (Alma)', value: results.essence, key: 'esencia' },
                    { icon: Mountain, label: 'Misión de Vida', value: results.lifePath, key: 'mision' },
                    { icon: Badge, label: 'Vibración del Nombre', value: results.nameVibration, key: 'nombre' },
                    { icon: Calendar, label: 'Año Personal', value: results.personalYear, key: 'ano' },
                    { icon: Gift, label: 'Regalo Divino', value: results.divineGift, key: 'regalo' }
                ].map((pilar, idx) => {
                    const info = getFullInfo(pilar.key, pilar.value);
                    const calc = getCalculationSteps(pilar.key, results);

                    return (
                        <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 overflow-hidden relative">
                            <div className="flex gap-6 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-[#7f13ec]/10 flex items-center justify-center border border-[#7f13ec]/20 shrink-0">
                                    <pilar.icon className="w-8 h-8 text-[#7f13ec]" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{pilar.label}</h4>
                                        <span className="text-xs font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded flex items-center gap-1">
                                            <Calculator className="w-3 h-3" /> {calc}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 mb-2">
                                        <span className="text-4xl font-bold text-[#ffd700] drop-shadow-[0_0_10px_rgba(255,215,0,0.2)]">{pilar.value}</span>
                                        <h5 className="text-xl font-bold text-white leading-tight">{info.subtitle}</h5>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                <div className="space-y-3">
                                    <p className="text-[#ffd700] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                        <Target className="w-3 h-3" /> Resumen de Vibración
                                    </p>
                                    <p className="text-slate-300 text-xs leading-relaxed font-light italic">
                                        "{info.desc}"
                                    </p>
                                </div>
                                <div className="space-y-3 border-l border-white/5 pl-6">
                                    <p className="text-[#7f13ec] text-[10px] font-bold uppercase tracking-widest">Interpretación Profunda</p>
                                    <p className="text-slate-400 text-xs leading-relaxed">
                                        {info.essence}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Synthesis Section */}
            <div className="mt-12 p-8 bg-gradient-to-br from-[#1a1438] to-[#050505] rounded-3xl border border-[#ffd700]/10">
                <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="text-[#ffd700] w-6 h-6" />
                    <h4 className="text-lg font-bold text-white uppercase tracking-widest">Síntesis y Conclusiones</h4>
                </div>
                <p className="text-slate-300 leading-8 text-[15px] font-light">
                    {getMapSynthesis(results)}
                </p>
                <div className="mt-6 flex flex-col gap-2">
                    <p className="text-slate-500 text-xs italic">
                        * Nota: Tu mapa numerológico es una herramienta de autoconocimiento. La voluntad humana siempre es la fuerza final de manifestación.
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-12 text-center border-t border-white/5">
                <Infinity className="text-[#ffd700] w-8 h-8 mx-auto mb-4 opacity-30" />
                <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-medium">
                    BioVital 365 • Mandala de Transformación • 2025
                </p>
            </div>
        </div>
    );
}
