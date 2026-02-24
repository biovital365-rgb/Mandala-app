import React, { useState } from 'react';
import { Mail, User, Lock, ArrowRight, Sparkles } from 'lucide-react';
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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col w-full max-w-md mx-auto p-6 "
        >
            <div className="flex items-center gap-2 mb-8 justify-center">
                <Sparkles className="text-primary w-6 h-6" />
                <h2 className="text-white text-2xl font-bold tracking-tight">Mandala Numérico</h2>
            </div>

            <div className="glass-panel rounded-3xl p-8 border border-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

                <h3 className="text-2xl font-bold text-white mb-2">
                    {isLogin ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
                </h3>
                <p className="text-slate-400 text-sm mb-8">
                    {isLogin ? 'Ingresa tu correo para continuar' : 'Únete para guardar tu mapa sagrado'}
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {!isLogin && (
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nombre Completo</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ej. Juan Pérez"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-primary/50 outline-none transition"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-primary/50 outline-none transition"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-primary/50 outline-none transition"
                                required
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-primary hover:bg-primary/90 text-black font-bold text-lg rounded-xl gold-glow flex items-center justify-center gap-2 transition disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Procesando...' : (isLogin ? 'Entrar' : 'Registrarse')}
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-slate-400 hover:text-primary transition text-sm"
                    >
                        {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                    </button>
                </div>
            </div>

            <button
                onClick={onBack}
                className="mt-8 text-slate-500 hover:text-white transition text-sm font-medium"
            >
                Volver al inicio
            </button>
        </motion.div>
    );
}
