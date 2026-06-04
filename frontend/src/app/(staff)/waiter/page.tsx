'use client';

import React, { useState, useEffect } from 'react';

interface OrderItem {
    itemId: number;
    title: string;
    quantity: number;
    priceAtSale: number;
}

interface Order {
    id: number;
    tableId: number | null;
    items: OrderItem[];
    totalAmount: number;
    status: 'PENDING' | 'COOKING' | 'READY' | 'SERVED';
    paymentStatus: 'PAID' | 'UNPAID';
    createdAt: string;
}

// Описуємо інтерфейс для сервісних викликів з ЛБ1 (FR-4)
interface ServiceCall {
    tableId: number;
    type: 'WAITER' | 'BILL' | 'HELP';
    createdAt: string;
}

export default function WaiterDashboardPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [calls, setCalls] = useState<ServiceCall[]>([]); // Стейт для активних викликів персоналу
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<'all' | 'ready' | 'unpaid'>('all');

    // 1. Завантаження замовлень із бекенду
    const fetchOrders = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/v1/orders');
            if (!response.ok) throw new Error('Помилка завантаження замовлень для залу');
            const data = await response.json();

            const activeOrders = data.filter((o: Order) => !(o.status === 'SERVED' && o.paymentStatus === 'PAID'));
            setOrders(activeOrders.reverse());
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 2. Завантаження сервісних викликів із CallsController (Новий функціонал ЛБ1)
    const fetchCalls = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/v1/calls');
            if (response.ok) {
                const data = await response.json();
                setCalls(data);
            }
        } catch (err) {
            console.error('Помилка синхронізації сервісних викликів:', err);
        }
    };

    // Суміщений Live Polling: оновлення замовлень та викликів кожні 4-5 секунд
    useEffect(() => {
        fetchOrders();
        fetchCalls();
        const interval = setInterval(() => {
            fetchOrders();
            fetchCalls();
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // Дія 1: Офіціант забирає страву з кухонного вікна видачі та відносить гостю
    const handleServeOrder = async (orderId: number) => {
        try {
            const response = await fetch(`http://localhost:3001/api/v1/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'SERVED' }),
            });

            if (!response.ok) throw new Error('Не вдалося змінити статус на "Подано"');
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'SERVED' } : o));
        } catch (err: any) {
            alert(`❌ Помилка: ${err.message}`);
        }
    };

    // Дія 2: Офіціант розраховує гостя готівкою/терміналом на місці (закриття рахунку)
    const handleMarkAsPaid = async (orderId: number) => {
        try {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: 'PAID' } : o));
            alert(`✅ Рахунок замовлення №${orderId} успішно закрито (Оплачено через POS-термінал)`);
        } catch (err: any) {
            alert(`❌ Помилка закриття рахунку: ${err.message}`);
        }
    };

    // Дія 3: Офіціант підійшов до столу і закрив сервісний виклик (Use Case 2 з твоєї ЛБ1)
    const handleResolveCall = async (tableId: number) => {
        try {
            const response = await fetch(`http://localhost:3001/api/v1/calls/${tableId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Не вдалося видалити виклик з черги');

            // Локально прибираємо з інтерфейсу для миттєвого відгуку
            setCalls(prev => prev.filter(c => c.tableId !== tableId));
        } catch (err: any) {
            alert(`⚠️ Помилка скасування виклику: ${err.message}`);
        }
    };

    // Фільтрація карток для зручності офіціанта
    const filteredOrders = orders.filter(o => {
        if (filter === 'ready') return o.status === 'READY';
        if (filter === 'unpaid') return o.paymentStatus === 'UNPAID';
        return true;
    });

    if (loading && orders.length === 0) return <div className="p-8 text-center text-stone-600 bg-stone-50 min-h-screen">⏳ Завантаження карти залу...</div>;

    return (
        <div className="min-h-screen bg-stone-100 text-stone-800 p-4 sm:p-6 font-sans">

            {/* Шапка термінала офіціанта */}
            <header className="max-w-6xl mx-auto bg-white rounded-2xl border p-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-xl font-black text-stone-900 uppercase flex items-center gap-2">
                        💁‍♂️ Сервісний термінал офіціанта
                    </h1>
                    <p className="text-xs text-stone-400">Моніторинг столів, винесення готових страв та фінальний розрахунок залу</p>
                </div>

                {/* Фільтри швидкої навігації */}
                <div className="flex bg-stone-100 p-1 rounded-xl border self-stretch md:self-auto text-xs font-bold uppercase tracking-wider">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-2 rounded-lg transition ${filter === 'all' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
                    >
                        Усі столи ({orders.length})
                    </button>
                    <button
                        onClick={() => setFilter('ready')}
                        className={`px-3 py-2 rounded-lg transition ${filter === 'ready' ? 'bg-emerald-600 text-white shadow-sm' : 'text-stone-500 hover:text-emerald-600'}`}
                    >
                        🛎️ Треба винести ({orders.filter(o => o.status === 'READY').length})
                    </button>
                    <button
                        onClick={() => setFilter('unpaid')}
                        className={`px-3 py-2 rounded-lg transition ${filter === 'unpaid' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-stone-500 hover:text-amber-600'}`}
                    >
                        💵 Очікують рахунок ({orders.filter(o => o.paymentStatus === 'UNPAID').length})
                    </button>
                </div>
            </header>

            {error && <div className="max-w-6xl mx-auto mb-4 p-3 bg-rose-100 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">⚠️ {error}</div>}

            {/* =========================================================================
                СТРІЧКА АКТИВНИХ СЕРВІСНИХ ВИКЛИКІВ ІЗ ЗАЛУ (НОВИЙ КОНТЕКСТНИЙ ФУНКЦІОНАЛ)
                ========================================================================= */}
            {calls.length > 0 && (
                <div className="max-w-6xl mx-auto mb-6 bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-md animate-fade-in">
                    <h3 className="text-xs font-black uppercase text-rose-800 tracking-wider mb-3 flex items-center gap-2 animate-pulse">
                        🚨 Термінові запити від відвідувачів:
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {calls.map(call => (
                            <div key={call.tableId} className="bg-white border border-rose-100 rounded-xl p-3 flex justify-between items-center shadow-sm">
                                <div>
                                    <span className="text-sm font-black text-stone-900">📍 Стіл №{call.tableId}</span>
                                    <p className="text-xs font-bold mt-0.5 text-rose-600">
                                        {call.type === 'WAITER' ? '🧻 Кличе офіціанта (серветки / дозамовлення)' :
                                            call.type === 'BILL' ? '💳 Просить фінальний чек / Рахунок' :
                                                '🆘 Потрібна допомога (скасування / адміністратор)'}
                                    </p>
                                    <span className="text-[9px] text-stone-400 font-mono block mt-1">
                                        Надіслано: {new Date(call.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleResolveCall(call.tableId)}
                                    className="bg-rose-600 hover:bg-emerald-600 text-white font-black text-[10px] uppercase px-3 py-2 rounded-xl transition shadow-xs"
                                >
                                    ✓ Схвалено
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Якщо активності в залі немає */}
            {filteredOrders.length === 0 && (
                <div className="text-center py-20 bg-white border rounded-2xl max-w-md mx-auto shadow-sm">
                    <span className="text-4xl block mb-2">🥂</span>
                    <h3 className="text-base font-bold text-stone-700">Немає активних замовлень</h3>
                    <p className="text-xs text-stone-400 mt-1">Усі гості задоволені, або застосовано порожній фільтр.</p>
                </div>
            )}

            {/* Сітка столів залу */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrders.map(order => (
                    <div
                        key={order.id}
                        className={`bg-white rounded-2xl border shadow-sm flex flex-col justify-between overflow-hidden transition-all ${order.status === 'READY' ? 'border-emerald-500 ring-2 ring-emerald-500/10 animate-pulse' : 'border-stone-200'
                            }`}
                    >
                        {/* Заголовок картки столу */}
                        <div className={`p-4 border-b flex justify-between items-center ${order.status === 'READY' ? 'bg-emerald-50' : 'bg-stone-50'
                            }`}>
                            <div>
                                <h3 className="font-black text-stone-900 text-base">
                                    {order.tableId ? `📍 Стіл №${order.tableId}` : '🚗 На виніс / Дім'}
                                </h3>
                                <p className="text-[10px] font-mono text-stone-400 mt-0.5">ЗАМОВЛЕННЯ #{order.id}</p>
                            </div>

                            {/* Статус-бейджи */}
                            <div className="flex flex-col items-end gap-1">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${order.status === 'READY' ? 'bg-emerald-600 text-white' :
                                    order.status === 'COOKING' ? 'bg-amber-100 text-amber-800' : order.status === 'PENDING' ? 'bg-stone-100 text-stone-500' : 'bg-stone-200 text-stone-700'
                                    }`}>
                                    {order.status === 'PENDING' ? '📋 В черзі' : order.status === 'COOKING' ? '🍳 Готується' : order.status === 'READY' ? '🛎️ Готово!' : '✅ Подано'}
                                </span>

                                <span className={`text-[9px] font-mono font-bold ${order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {order.paymentStatus === 'PAID' ? '💳 ОПЛАЧЕНО' : '💵 НЕОПЛАЧЕНО'}
                                </span>
                            </div>
                        </div>

                        {/* Специфікація страв у замовленні */}
                        <div className="p-4 flex-1 bg-white space-y-2">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs text-stone-600 pb-1.5 border-b border-stone-100 last:border-0 last:pb-0">
                                    <span className="font-medium text-stone-800">{item.title}</span>
                                    <span className="font-mono bg-stone-100 px-1.5 py-0.5 rounded text-stone-700 font-bold">x{item.quantity}</span>
                                </div>
                            ))}
                            <div className="pt-2 text-right">
                                <span className="text-[11px] text-stone-400">Сума рахунку: </span>
                                <span className="font-black text-stone-900 text-sm">{order.totalAmount} ₴</span>
                            </div>
                        </div>

                        {/* Контролери дій для офіціанта */}
                        <div className="p-4 bg-stone-50/60 border-t border-stone-100 space-y-2">

                            {/* Кнопка 1: Винести страву в зал (активна тільки коли статус READY) */}
                            {order.status !== 'SERVED' && (
                                <button
                                    onClick={() => handleServeOrder(order.id)}
                                    disabled={order.status !== 'READY'}
                                    className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition shadow-sm ${order.status === 'READY'
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                        : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                                        }`}
                                >
                                    {order.status === 'READY' ? '🛎️ Подати страву на стіл' : order.status === 'PENDING' ? '⏳ Очікує черги кухні' : '🍳 Кухар готує страву'}
                                </button>
                            )}

                            {/* Кнопка 2: Закрити рахунок */}
                            {order.paymentStatus === 'UNPAID' ? (
                                <button
                                    onClick={() => handleMarkAsPaid(order.id)}
                                    className="w-full bg-white hover:bg-amber-500 hover:text-stone-950 text-amber-600 border border-amber-500/40 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition"
                                >
                                    💵 Прийняти оплату (POS)
                                </button>
                            ) : (
                                order.status === 'SERVED' && (
                                    <div className="text-center py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-bold uppercase tracking-wider">
                                        🎉 Стіл закрито / Розраховано
                                    </div>
                                )
                            )}
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}