'use client';

import React, { useState, useEffect } from 'react';

interface Table {
    id: number;
    number: number;
    capacity: number;
    status: 'FREE' | 'OCCUPIED' | 'DIRTY';
}

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

export default function AdminDashboardPage() {
    const [tables, setTables] = useState<Table[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [activeTab, setActiveTab] = useState<'tables' | 'analytics'>('tables');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingTableId, setUpdatingTableId] = useState<number | null>(null); // Фікс: прапорець блокування оновлення

    // Завантаження всіх даних з NestJS бекенду
    const fetchAdminData = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            };

            // 1. Отримуємо столи
            const tablesRes = await fetch('http://localhost:3001/api/v1/tables', { headers }).catch(() => null);
            if (tablesRes && tablesRes.ok) {
                const tablesData = await tablesRes.json();

                // Фікс: якщо адмін зараз перемикає якийсь стіл, ми не затираємо його стан старими даними з пулінгу
                setTables(prev => {
                    if (updatingTableId !== null) return prev;
                    return tablesData;
                });
            } else if (tables.length === 0) {
                // Фолбек тільки для першого запуску, якщо API ще не віддає дані
                setTables([
                    { id: 1, number: 1, capacity: 2, status: 'FREE' },
                    { id: 2, number: 2, capacity: 4, status: 'OCCUPIED' },
                    { id: 3, number: 3, capacity: 4, status: 'DIRTY' },
                    { id: 4, number: 4, capacity: 6, status: 'FREE' },
                    { id: 5, number: 5, capacity: 2, status: 'OCCUPIED' },
                ]);
            }

            // 2. Отримуємо замовлення для фінансової аналітики
            const ordersRes = await fetch('http://localhost:3001/api/v1/orders', { headers }).catch(() => null);
            if (ordersRes && ordersRes.ok) {
                const ordersData = await ordersRes.json();
                setOrders(ordersData);
            } else if (ordersRes && !ordersRes.ok) {
                throw new Error('Помилка завантаження фінансових звітів з сервера');
            }

            setError('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
        // Live Polling фінансової каси та столів кожні 10 секунд
        const interval = setInterval(fetchAdminData, 10000);
        return () => clearInterval(interval);
    }, [updatingTableId]); // Перезапускаємо інтервал, якщо статус блокування змінився

    // Чітка зміна статусу столу через селектор з повним підключенням до БД
    const handleStatusChange = async (tableId: number, nextStatus: 'FREE' | 'OCCUPIED' | 'DIRTY') => {
        // Блокуємо пулінг на час запиту, щоб уникнути гонки станів
        setUpdatingTableId(tableId);

        // Оптимістично оновлюємо UI (користувач відразу бачить результат без затримок мережі)
        const previousTables = [...tables];
        setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: nextStatus } : t));

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`http://localhost:3001/api/v1/tables/${tableId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ status: nextStatus }),
            });

            if (!response.ok) {
                throw new Error('Сервер відхилив зміну статусу столу');
            }

            console.log(`✔ Статус столу №${tableId} успішно синхронізовано з PostgreSQL!`);
        } catch (err: any) {
            console.error(`❌ Помилка синхронізації: ${err.message}. Відкат змін...`);
            setError(`Не вдалося зберегти статус столу на сервері.`);
            // Якщо сервер впав або видав помилку — робимо відкат назад
            setTables(previousTables);
        } finally {
            // Знімаємо блокування пулінгу
            setUpdatingTableId(null);
        }
    };

    // --- РОЗРАХУНОК ФІНАНСОВОЇ АНАЛІТИКИ (МЕТРИКИ) ---
    const paidOrders = orders.filter(o => o.paymentStatus === 'PAID');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingRevenue = orders.filter(o => o.paymentStatus === 'UNPAID').reduce((sum, o) => sum + o.totalAmount, 0);
    const averageCheck = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

    const itemQuantities: { [key: string]: number } = {};
    paidOrders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                itemQuantities[item.title] = (itemQuantities[item.title] || 0) + item.quantity;
            });
        }
    });

    const sortedPopularItems = Object.entries(itemQuantities)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    if (loading && tables.length === 0 && orders.length === 0) {
        return <div className="p-8 text-center text-slate-500 bg-slate-50 min-h-screen flex items-center justify-center">⏳ Завантаження бізнес-метрик SmartResto...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 font-sans">
            <div className="max-w-5xl mx-auto">

                {/* Шапка адмінки */}
                <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border shadow-sm">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
                            🎛️ Панель Управління & Аналітики
                        </h1>
                        <p className="text-slate-400 text-xs mt-0.5">
                            Адміністратор: <span className="text-slate-600 font-bold">{localStorage.getItem('user_name') || 'Головний'}</span> | Сесія авторизована в Redis
                        </p>
                    </div>

                    {/* Таби перемикання модулів */}
                    <div className="flex bg-slate-100 p-1 rounded-xl border self-stretch sm:self-auto text-xs font-bold uppercase tracking-wider">
                        <button
                            onClick={() => setActiveTab('tables')}
                            className={`px-4 py-2 rounded-lg transition ${activeTab === 'tables' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            📍 Карта залу
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`px-4 py-2 rounded-lg transition ${activeTab === 'analytics' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            📊 Каса та Аналітика
                        </button>
                    </div>
                </header>

                {error && (
                    <div className="mb-4 p-3 bg-rose-100 border border-rose-200 text-rose-700 text-xs rounded-xl flex justify-between items-center">
                        <span>⚠️ {error}</span>
                        <button onClick={() => setError('')} className="font-bold hover:text-rose-900">✕</button>
                    </div>
                )}

                {/* --- ВКЛАДКА 1: КАРТА СТОЛІВ --- */}
                {activeTab === 'tables' && (
                    <div className="bg-white border rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-sm font-black uppercase text-slate-500 tracking-wider">Монітор завантаженості залу</h2>
                            <div className="hidden sm:flex gap-3 text-[11px] font-bold uppercase tracking-wide">
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Вільний</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Зайнятий</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Прибирання</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {tables.map((table) => (
                                <div
                                    key={table.id}
                                    className={`p-5 rounded-2xl border bg-white flex flex-col justify-between h-36 transition shadow-sm ${table.status === 'FREE' ? 'border-emerald-200 bg-emerald-50/5' :
                                            table.status === 'OCCUPIED' ? 'border-amber-200 bg-amber-50/5' : 'border-rose-200 bg-rose-50/5'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-lg font-black text-slate-900">Стіл №{table.number}</span>
                                            <p className="text-[11px] text-slate-400 mt-0.5">👥 Місць: {table.capacity}</p>
                                        </div>

                                        <select
                                            value={table.status}
                                            disabled={updatingTableId === table.id}
                                            onChange={(e) => handleStatusChange(table.id, e.target.value as any)}
                                            className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none transition cursor-pointer uppercase tracking-wider disabled:opacity-40 ${table.status === 'FREE' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                                                    table.status === 'OCCUPIED' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                                                        'bg-rose-100 text-rose-800 border-rose-300'
                                                }`}
                                        >
                                            <option value="FREE">Вільний (FREE)</option>
                                            <option value="OCCUPIED">Зайнятий (OCCUPIED)</option>
                                            <option value="DIRTY">Брудний (DIRTY)</option>
                                        </select>
                                    </div>

                                    <div className="text-[11px] bg-slate-50 border p-2 rounded-xl flex justify-between items-center text-slate-500">
                                        <span>Статус бази даних:</span>
                                        <span className="font-mono font-bold text-slate-700">
                                            {updatingTableId === table.id ? (
                                                <span className="text-amber-600 animate-pulse">⏳ Збереження...</span>
                                            ) : table.status === 'FREE' ? (
                                                '🟢 Вільний'
                                            ) : table.status === 'OCCUPIED' ? (
                                                '🟡 Зайнятий'
                                            ) : (
                                                '🔴 Кличте клінінг'
                                            )}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- ВКЛАДКА 2: СТОРІНКА АНАЛІТИКИ --- */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">💰 Загальна Каса (Сплачено)</span>
                                    <h3 className="text-3xl font-black text-emerald-600 mt-1">{totalRevenue} ₴</h3>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-4 border-t pt-2">Закрито чеків: <span className="font-bold text-slate-700">{paidOrders.length} шт.</span></p>
                            </div>

                            <div className="bg-white border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">⏳ В процесі (Неоплачено)</span>
                                    <h3 className="text-3xl font-black text-amber-600 mt-1">{pendingRevenue} ₴</h3>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-4 border-t pt-2">Активних столів в залі: <span className="font-bold text-slate-700">{orders.filter(o => o.paymentStatus === 'UNPAID').length}</span></p>
                            </div>

                            <div className="bg-white border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">📊 Середній чек закладу</span>
                                    <h3 className="text-3xl font-black text-slate-900 mt-1">{averageCheck} ₴</h3>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-4 border-t pt-2">На основі закритих транзакцій</p>
                            </div>
                        </div>

                        <div className="bg-white border rounded-2xl p-6 shadow-sm">
                            <h3 className="text-sm font-black uppercase text-slate-500 tracking-wider mb-4">🔥 Топ-5 найпопулярніших страв</h3>
                            {sortedPopularItems.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-6">Дані продажів відсутні. Проведіть перші оплати.</p>
                            ) : (
                                <div className="space-y-3">
                                    {sortedPopularItems.map(([title, qty], index) => (
                                        <div key={title} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">
                                                    #{index + 1}
                                                </span>
                                                <span className="text-xs font-bold text-slate-800">{title}</span>
                                            </div>
                                            <div className="text-xs font-mono">
                                                Продано: <span className="text-slate-900 font-bold bg-slate-200/60 px-2 py-0.5 rounded">x{qty} шт.</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}