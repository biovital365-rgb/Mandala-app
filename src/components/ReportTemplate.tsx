import React from 'react';
import { Sparkles, Heart, Mountain, Badge, Calendar, Gift, Infinity } from 'lucide-react';
import { getDetailedInterpretation } from '../lib/interpretations';

interface ReportTemplateProps {
    results: any;
}

export function ReportTemplate({ results }: ReportTemplateProps) {
    const getDesc = (pillar: string, num: number) => {
        return getDetailedInterpretation(pillar, num).essence;
    };

    return (
        <div className="bg-black text-white p-12 w-[800px] font-sans min-h-[1100px] flex flex-col">
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

            <div className="mb-12 text-center p-8 bg-[#120e26] rounded-3xl border border-[#7f13ec]/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#7f13ec]/10 rounded-full blur-3xl"></div>
                <h2 className="text-2xl font-bold mb-2">Informe Personalizado para:</h2>
                <h3 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#7f13ec] mb-4">
                    {results.name}
                </h3>
                <p className="text-slate-400 text-lg">Fecha de Nacimiento: {new Date(results.dob).toLocaleDateString()}</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {[
                    { icon: Heart, label: 'Esencia (Alma)', value: results.essence, key: 'esencia' },
                    { icon: Mountain, label: 'Misión de Vida', value: results.lifePath, key: 'mision' },
                    { icon: Badge, label: 'Vibración del Nombre', value: results.nameVibration, key: 'nombre' },
                    { icon: Calendar, label: 'Año Personal', value: results.personalYear, key: 'ano' },
                    { icon: Gift, label: 'Regalo Divino', value: results.divineGift, key: 'regalo' }
                ].map((pilar, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                            <pilar.icon className="w-8 h-8 text-[#7f13ec]" />
                        </div>
                        <div>
                            <div className="flex items-baseline gap-4 mb-3">
                                <h4 className="text-slate-400 font-bold uppercase tracking-widest text-xs">{pilar.label}</h4>
                                <span className="text-3xl font-bold text-[#f4c025]">{pilar.value}</span>
                            </div>
                            <p className="text-slate-300 leading-relaxed italic border-l-2 border-[#7f13ec]/30 pl-4">
                                {getDesc(pilar.key, pilar.value)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-16 text-center border-t border-white/5 pt-8">
                <Infinity className="text-[#7f13ec] w-8 h-8 mx-auto mb-4 opacity-30" />
                <p className="text-slate-500 text-xs uppercase tracking-widest">
                    Este informe es una guía espiritual basada en frecuencias vibratorias sagradas.
                </p>
            </div>
        </div>
    );
}
