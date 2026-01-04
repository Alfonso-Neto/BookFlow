'use client';

import { useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useToast } from '../components/ToastProvider';
import { Loader2, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { signIn, signUp } = useAuth();
    const router = useRouter();
    const toast = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isRegistering) {
                await signUp(email, password, name);
                toast.success('Conta criada com sucesso! Faça login.');
                setIsRegistering(false);
            } else {
                await signIn(email, password);
                toast.success('Login realizado com sucesso!');
                router.push('/dashboard');
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-background p-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface dark:bg-dark-surface p-8 rounded-2xl shadow-xl w-full max-w-md relative z-10 border border-border dark:border-dark-border"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-text-main dark:text-dark-text-main">BookFlow</h1>
                    <p className="text-text-secondary dark:text-dark-text-secondary text-sm">Gerencie sua biblioteca pessoal</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegistering && (
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-text-main dark:text-dark-text-main">Nome</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Seu nome"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required={isRegistering}
                            />
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-text-main dark:text-dark-text-main">Email</label>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-text-main dark:text-dark-text-main">Senha</label>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn bg-primary hover:bg-primary-hover text-white py-2.5 rounded-lg shadow-md shadow-emerald-200 dark:shadow-none transition-all flex items-center justify-center gap-2 mt-6"
                    >
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isRegistering ? 'Criar Conta' : 'Entrar'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="text-sm text-primary hover:text-primary-hover font-medium transition-colors"
                    >
                        {isRegistering ? 'Já tem uma conta? Faça login' : 'Não tem conta? Registre-se'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
