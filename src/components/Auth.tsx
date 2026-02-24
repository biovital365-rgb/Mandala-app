import React, { useState } from 'react';
import { Mail, User, Lock, ArrowRight, Sparkles, Zap, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

interface AuthProps {
    onAuthSuccess: (user: any) => void;
    onBack: () => void;
}

export function Auth({ onAuthSuccess, onBack }: AuthProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                const { data, error: authError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (authError) throw authError;
                onAuthSuccess(data.user);
            } else {
                const { data, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: name,
                        }
                    }
                });
                if (authError) throw authError;
                if (data.user) {
                    onAuthSuccess(data.user);
                } else {
                    setError('Revisa tu correo para confirmar tu cuenta');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Error en la autenticación');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#050505] relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-magenta/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col w-full max-w-sm relative z-10"
            >
                <div className="relative mb-10 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="p-5 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl relative group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-magenta/20 to-cyan/20 animate-pulse"></div>
                            <img src="/logo.png" alt="Mandalapp" className="w-12 h-12 relative z-10 drop-shadow-[0_0_15px_rgba(235,179,5,0.6)] object-contain" />
                        </div>
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tight leading-tight">
                        {isLogin ? 'Bienvenido a tu' : 'Inicia tu'} <br />
                        <span className="text-magenta">Frecuencia</span>
                    </h2>
                    <p className="text-slate-400 mt-3 text-base font-medium">
                        {isLogin ? 'Accede a tu portal sagrado' : 'Crea tu perfil vibracional'}
                    </p>
                </div>

                <div className="glass-panel p-8 rounded-[2rem] border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Nombre Completo</label>
                                <div className="relative group">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-magenta transition-colors" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-black/40 border border-white/5 focus:border-magenta/50 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-magenta/10 transition-all text-base"
                                        placeholder="Tu nombre sagrado"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Correo Electrónico</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 focus:border-cyan/50 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-cyan/10 transition-all text-base"
                                    placeholder="vincular@corazon.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Contraseña</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-gold transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 focus:border-gold/50 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-gold/10 transition-all text-base"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 px-4 rounded-xl flex items-center gap-3 animate-shake font-bold">
                                <Zap className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-magenta to-cyan hover:from-pink-500 hover:to-blue-400 text-white font-black py-4.5 rounded-2xl shadow-xl transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 text-lg uppercase tracking-widest mt-4"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>{isLogin ? 'Entrar' : 'Revelar mi Mapa'}</span>
                                    <ArrowRight className="w-6 h-6" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors py-2"
                        >
                            {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
                        </button>
                    </div>
                </div>

                <div className="flex justify-center mt-10">
                    <button
                        onClick={onBack}
                        className="text-slate-500 hover:text-white transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2 px-6 py-2 rounded-full border border-white/5 hover:bg-white/5"
                    >
                        <span>Volver al Inicio</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
