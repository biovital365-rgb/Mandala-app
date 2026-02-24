import React from 'react';
import { Sparkles, Heart, Mountain, Badge, Calendar, Gift, Infinity, Calculator, Target, Shield, Zap, Compass, Star } from 'lucide-react';
import { getDetailedInterpretation, getCalculationSteps, getMapSynthesis } from '../lib/interpretations';

interface ReportTemplateProps {
    results: any;
}

export function ReportTemplate({ results }: ReportTemplateProps) {
    const getFullInfo = (pillar: string, num: number) => {
        return getDetailedInterpretation(pillar, num);
    };

    const pageStyle = "w-[210mm] h-[297mm] bg-[#050505] text-white p-16 flex flex-col relative overflow-hidden";

    return (
        <div id="pdf-report-template" style={{ display: 'none' }}>
            {/* PAGE 1: COVER */}
            <div id="pdf-page-cover" className={pageStyle}>
                {/* Background Decor */}
                <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] opacity-20 pointer-events-none">
                    <img
                        src="https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&q=80&w=2000"
                        className="w-full h-full object-cover blur-sm"
                        alt="cosmos"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black"></div>

                <div className="relative z-10 flex flex-col h-full items-center justify-center text-center">
                    <div className="w-32 h-32 mb-8 rounded-full bg-gradient-to-tr from-[#7f13ec] to-[#ffd700] p-1 shadow-[0_0_50px_rgba(127,19,236,0.5)]">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                            <Sparkles className="w-16 h-16 text-[#ffd700]" />
                        </div>
                    </div>

                    <h1 className="text-6xl font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-[#ffd700] to-white">
                        Mandala Numérico
                    </h1>
                    <div className="w-48 h-1 bg-gradient-to-r from-transparent via-[#ffd700] to-transparent mb-12"></div>

                    <h3 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#ffd700] mb-4">
                        {results.name}
                    </h3>
                    <p className="text-slate-400 text-lg">
                        Fecha de Nacimiento: {(() => {
                            const [y, m, d] = results.dob.split('-').map(Number);
                            return `${d}/${m}/${y}`;
                        })()}
                    </p>
                </div>

                <div className="space-y-4 mb-20">
                    <p className="text-slate-400 uppercase tracking-[0.5em] text-sm">Estudio Evolutivo Transpersonal</p>
                    <h2 className="text-4xl font-light text-white tracking-widest">
                        {results.name.toUpperCase()}
                    </h2>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-12 w-full border-t border-white/10 pt-12">
                    <div className="text-left">
                        <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Preparado por</p>
                        <p className="text-[#ffd700] font-bold">BioVital 365 AI</p>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Fecha de Emisión</p>
                        <p className="text-white font-medium">{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>
            </div>

            {/* PILLAR PAGES */}
            {[
                { id: 'pdf-page-esencia', icon: Heart, label: 'Esencia (Alma)', value: results.essence, key: 'esencia', color: '#ec13e0' },
                { id: 'pdf-page-mision', icon: Mountain, label: 'Misión de Vida', value: results.lifePath, key: 'mision', color: '#13ec93' },
                { id: 'pdf-page-nombre', icon: Badge, label: 'Vibración del Nombre', value: results.nameVibration, key: 'nombre', color: '#137fec' },
                { id: 'pdf-page-ano', icon: Calendar, label: 'Año Personal', value: results.personalYear, key: 'ano', color: '#ec7f13' },
                { id: 'pdf-page-regalo', icon: Gift, label: 'Regalo Divino', value: results.divineGift, key: 'regalo', color: '#ffd700' }
            ].map((pilar) => {
                const info = getFullInfo(pilar.key, pilar.value);
                const calc = getCalculationSteps(pilar.key, results);

                return (
                    <div key={pilar.id} id={pilar.id} className={pageStyle}>
                        <div className="flex justify-between items-start mb-16">
                            <div className="flex items-center gap-4">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400">
                                    <pilar.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-bold">{pilar.label}</p>
                                    <h3 className="text-xl font-bold text-white tracking-tight">Análisis de Vibración</h3>
                                </div>
                            </div>
                            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-right">
                                <p className="text-[8px] uppercase tracking-widest text-slate-500 mb-1">Frecuencia</p>
                                <p className="text-2xl font-mono font-bold text-[#ffd700] leading-none">{pilar.value}</p>
                            </div>
                        </div>

                        <div className="relative mb-12">
                            <h4 className="text-5xl font-bold text-white mb-2 leading-tight">
                                {info.subtitle}
                            </h4>
                            <div className="w-full h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent"></div>
                        </div>

                        <div className="grid grid-cols-1 gap-12 mb-12">
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-[#ffd700] text-xs font-bold uppercase tracking-widest">
                                    <Zap className="w-4 h-4" /> La Energía del {pilar.value}
                                </div>
                                <p className="text-lg text-slate-300 leading-relaxed font-light first-letter:text-4xl first-letter:font-bold first-letter:mr-2">
                                    {info.desc}
                                </p>
                            </section>

                            <section className="space-y-4 p-8 rounded-3xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10">
                                <div className="flex items-center gap-2 text-[#7f13ec] text-xs font-bold uppercase tracking-widest">
                                    <Compass className="w-4 h-4" /> Integración Personalizada
                                </div>
                                <p className="text-base text-slate-400 leading-relaxed italic">
                                    "{info.pillarNuance}"
                                </p>
                                <p className="text-sm text-slate-300 font-light mt-4">
                                    {info.essence}
                                </p>
                            </section>
                        </div>

                        {info.challenges && info.challenges.length > 0 && (
                            <section className="mb-12">
                                <div className="flex items-center gap-2 text-red-400/80 text-xs font-bold uppercase tracking-widest mb-6 border-b border-red-950/30 pb-2">
                                    <Shield className="w-4 h-4" /> Desafíos de Integración (Sombra)
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {info.challenges.map((c: string, i: number) => (
                                        <div key={i} className="flex gap-3 items-start bg-red-500/5 p-4 rounded-xl border border-red-500/10">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500/40 mt-1.5 shrink-0" />
                                            <p className="text-sm text-slate-400 font-light">{c}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        <div className="mt-auto pt-8 border-t border-white/5 flex justify-between items-end">
                            <div className="text-[10px] space-y-1">
                                <p className="text-slate-500 uppercase tracking-widest">Proceso de Cálculo Sagrado</p>
                                <p className="text-white/40 font-mono tracking-widest">{calc}</p>
                            </div>
                            <Infinity className="w-6 h-6 text-white/10" />
                        </div>
                    </div>
                );
            })}

            {/* PAGE 7: SYNTHESIS */}
            <div id="pdf-page-synthesis" className={pageStyle}>
                <div className="flex items-center gap-4 mb-20">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#7f13ec] to-[#ffd700] flex items-center justify-center">
                        <Target className="w-8 h-8 text-black" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Síntesis Armónica</h2>
                        <p className="text-slate-500 text-xs uppercase tracking-[0.3em]">Integración de tu Mapa de Destino</p>
                    </div>
                </div>

                <div className="space-y-16 flex-1">
                    <section className="relative">
                        <div className="absolute -left-12 top-0 bottom-0 w-1 bg-gradient-to-b from-[#ffd700] to-transparent"></div>
                        <h4 className="text-[#ffd700] text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-3">
                            <Star className="w-5 h-5" /> Tu Camino de Maestría
                        </h4>
                        <p className="text-2xl text-slate-200 leading-[1.6] font-light">
                            {getMapSynthesis(results)}
                        </p>
                    </section>

                    <section className="grid grid-cols-1 gap-8 opacity-60">
                        <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.01]">
                            <p className="text-xs text-slate-400 leading-relaxed italic">
                                "La numerología no es destino, sino una herramienta de navegación. Tu voluntad soberana es el capitán de este viaje. Este informe es un espejo de tus potencialidades divinas puestas en la tierra."
                            </p>
                        </div>
                    </section>
                </div>

                <div className="mt-auto flex flex-col items-center gap-6 pt-12 border-t border-white/10">
                    <Sparkles className="text-[#7f13ec] w-10 h-10 opacity-40" />
                    <p className="text-slate-500 text-[10px] uppercase tracking-[0.5em] font-light">
                        BioVital 365 • Mandala de Transformación • 2025
                    </p>
                </div>
            </div>
        </div>
    );
}
