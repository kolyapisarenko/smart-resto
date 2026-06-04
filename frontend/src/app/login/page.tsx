'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Будь ласка, заповніть усі поля');
            return;
        }

        setLoading(true);

        try {
            // Робимо реальний запит на наш новий AuthModule в NestJS
            const response = await fetch('http://localhost:3001/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Якщо бекенд викинув UnauthorizedException, показуємо його повідомлення
                throw new Error(data.message || 'Невірний логін або пароль');
            }

            // Зберігаємо згенерований у Redis токен сесії та дані працівника в LocalStorage
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user_role', data.user.role);
            localStorage.setItem('user_name', data.user.username);

            // Динамічний Role-Based Routing на основі реальних даних з БД
            const userRole = data.user.role;
            if (userRole === 'ADMIN') {
                router.push('/dashboard/tables');
            } else if (userRole === 'KITCHEN') {
                router.push('/kds');
            } else if (userRole === 'WAITER') {
                router.push('/waiter');
            }

        } catch (err: any) {
            setError(err.message || 'Не вдалося з’єднатися з сервером. Перевірте роботу бекенду.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-slate-100">
            <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
                <h2 className="text-2xl font-bold text-center mb-2">🔐 Вхід для персоналу</h2>
                <p className="text-center text-slate-400 text-xs mb-6">Введіть свої службові дані для доступу до системи</p>

                {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs mb-4 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Логін / Позивний</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                            placeholder="admin або cook1"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition text-white disabled:opacity-50"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Пароль</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            placeholder="••••••••"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition text-white disabled:opacity-50"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-slate-950 font-bold py-3 rounded-xl transition mt-4 shadow-md flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-950"></span>
                                Перевірка сесії в Redis...
                            </>
                        ) : (
                            'Увійти в робочий простір'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}