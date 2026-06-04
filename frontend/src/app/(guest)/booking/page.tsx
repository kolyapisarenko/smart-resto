'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function BookingPage() {
    const [formData, setFormData] = useState({ name: '', phone: '', guests: 2, date: '' });
    const [isBooked, setIsBooked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [bookingInfo, setBookingInfo] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.phone || !formData.date) {
            alert('Будь ласка, заповніть усі обов’язкові поля');
            return;
        }

        setLoading(true);
        try {
            // Робимо реальний HTTP POST-запит на наш NestJS бекенд
            const response = await fetch('http://localhost:3001/api/v1/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Помилка сервера при створенні бронювання');
            }

            const data = await response.json();
            setBookingInfo(data); // Зберігаємо відповідь сервера (там буде згенерований ID)
            setIsBooked(true);
        } catch (err: any) {
            alert(`❌ Не вдалося надіслати запит: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4 text-stone-800">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 border">
                <h2 className="text-2xl font-black text-amber-600 mb-1">📅 Бронювання столу</h2>
                <p className="text-xs text-stone-400 mb-6">Оберіть дату та залиште контакти для автоматичного підтвердження</p>

                {isBooked ? (
                    <div className="text-center py-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 animate-fade-in">
                        <span className="text-4xl mb-2 block">🎉</span>
                        <h3 className="font-bold text-emerald-800 text-base mb-1">Резерв №{bookingInfo?.id} підтверджено!</h3>
                        <p className="text-xs text-emerald-600 mb-4">
                            Чекаємо на вас, <span className="font-semibold">{bookingInfo?.name}</span>, за вказаним часом.<br />
                            На ваш номер <span className="font-semibold">{bookingInfo?.phone}</span> відправлено SMS-підтвердження через шлюз.
                        </p>
                        <Link href="/" className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition">
                            На головну
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-500 mb-1">Ваше ім’я *</label>
                            <input
                                type="text"
                                required
                                disabled={loading}
                                className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 disabled:bg-stone-100"
                                placeholder="Микола"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-500 mb-1">Телефон *</label>
                            <input
                                type="tel"
                                required
                                disabled={loading}
                                className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 disabled:bg-stone-100"
                                placeholder="+380 99 123 4567"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-stone-500 mb-1">Кількість гостей</label>
                                <select
                                    disabled={loading}
                                    className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500 bg-white disabled:bg-stone-100"
                                    value={formData.guests}
                                    onChange={e => setFormData({ ...formData, guests: Number(e.target.value) })}
                                >
                                    {[2, 4, 6, 8].map(n => <option key={n} value={n}>{n} осіб</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-500 mb-1">Дата та час *</label>
                                <input
                                    type="datetime-local"
                                    required
                                    disabled={loading}
                                    className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500 bg-white disabled:bg-stone-100"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 text-white font-bold py-3 rounded-xl transition shadow-sm mt-2 text-sm flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                    Обробка та надсилання SMS...
                                </>
                            ) : (
                                '🚀 Підтвердити відновлення'
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}