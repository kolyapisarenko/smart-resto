'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

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

interface MenuItem {
    id: number;
    title: string;
    price: number;
    category: string;
    desc: string;
    isAvailable: boolean;
}

export default function KitchenDisplayPage() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false); // Захист від SSR помилок Next.js
    const [orders, setOrders] = useState<Order[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [activeMode, setActiveMode] = useState<'orders' | 'stoplist'>('orders');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Обертаємо у useCallback, щоб уникнути зайвих перерендерів в useEffect
    const fetchData = useCallback(async () => {
        try {
            const token = localStorage.getItem('auth_token');

            if (!token) {
                setError('Немає авторизації. Будь ласка, увійдіть в систему.');
                setLoading(false);
                router.push('/login');
                return;
            }

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Завантажуємо замовлення
            const ordersRes = await fetch('http://localhost:3001/api/v1/orders', { headers });

            if (ordersRes.status === 401 || ordersRes.status === 403) {
                localStorage.removeItem('auth_token');
                router.push('/login');
                return;
            }

            if (!ordersRes.ok) throw new Error(`Помилка сервера замовлень (${ordersRes.status})`);
            const ordersData = await ordersRes.json();
            const activeOrders = ordersData.filter((o: Order) => o.status !== 'SERVED');
            setOrders(activeOrders.reverse());

            // Завантажуємо меню для стоп-листа
            const menuRes = await fetch('http://localhost:3001/api/v1/menu', { headers });
            if (!menuRes.ok) throw new Error(`Помилка сервера меню (${menuRes.status})`);
            const menuData = await menuRes.json();
            setMenuItems(menuData);

            setError('');
        } catch (err: any) {
            console.error("KDS Fetch Error:", err);
            setError(err.message || 'Невідома помилка підключення');
        } finally {
            setLoading(false);
        }
    }, [router]);

    // 1. Чекаємо повної монтажу компонента в браузері
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // 2. Запускаємо polling замовлень тільки після монтажу
    useEffect(() => {
        if (!isMounted) return;

        fetchData();
        const interval = setInterval(() => {
            if (activeMode === 'orders') fetchData();
        }, 5000);

        return () => clearInterval(interval);
    }, [activeMode, isMounted, fetchData]);

    // Керування статусом замовлення
    const handleStatusChange = async (orderId: number, currentStatus: string) => {
        let nextStatus: 'COOKING' | 'READY' | 'SERVED' = 'READY';
        if (currentStatus === 'PENDING') nextStatus = 'COOKING';
        else if (currentStatus === 'COOKING') nextStatus = 'READY';
        else if (currentStatus === 'READY') nextStatus = 'SERVED';

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`http://localhost:3001/api/v1/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: nextStatus }),
            });

            if (!response.ok) throw new Error('Не вдалося оновити статус замовлення');

            setOrders(prev =>
                prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o)
                    .filter(o => o.status !== 'SERVED')
            );
        } catch (err: any) {
            alert(`❌ Помилка: ${err.message}`);
        }
    };

    // Стоп-лист
    const handleToggleAvailability = async (dishId: number) => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`http://localhost:3001/api/v1/menu/${dishId}/toggle-availability`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Не вдалося змінити статус страви');
            const updatedDish = await response.json();

            setMenuItems(prev => prev.map(item => item.id === dishId ? updatedDish : item));
        } catch (err: any) {
            alert(`❌ Помилка стоп-листа: ${err.message}`);
        }
    };

    // Якщо Next.js ще рендерить серверний каркас — показуємо порожній темний екран
    if (!isMounted) {
        return <div className="bg-stone-950 min-h-screen"></div>;
    }

    // Рендер Екрану завантаження
    if (loading && orders.length === 0 && menuItems.length === 0 && !error) {
        return <div className="p-8 text-center text-white bg-stone-950 min-h-screen flex items-center justify-center font-mono">⏳ Запуск системи KDS та стоп-листів...</div>;
    }

    // Рендер Екрану Помилки (Якщо немає токена або бекенд ліг)
    if (error && orders.length === 0 && menuItems.length === 0) {
        return (
            <div className="p-8 bg-stone-950 min-h-screen flex flex-col items-center justify-center text-center">
                <div className="bg-stone-900 border border-rose-500/30 p-6 rounded-2xl max-w-md shadow-2xl">
                    <span className="text-4xl">⚠️</span>
                    <h2 className="text-rose-500 font-bold text-lg mt-2">Помилка системи KDS</h2>
                    <p className="text-stone-400 text-sm mt-2 font-mono bg-stone-950 p-3 rounded-lg border border-stone-800 text-left overflow-x-auto">
                        {error}
                    </p>
                    <button
                        onClick={() => { setLoading(true); setError(''); fetchData(); }}
                        className="mt-4 w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs uppercase tracking-wider transition"
                    >
                        🔄 Спробувати знову
                    </button>
                    <button
                        onClick={() => { localStorage.removeItem('auth_token'); router.push('/login'); }}
                        className="mt-2 block w-full text-center text-xs text-stone-500 hover:text-stone-300 underline"
                    >
                        Повернутися на сторінку входу
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-950 p-6 text-stone-100 font-sans">
            {/* Шапка екрана кухні */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-800 pb-4 mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-wider text-amber-500 uppercase flex items-center gap-2">
                        👨‍🍳 Kitchen Display System & Menu Control
                    </h1>
                    <p className="text-xs text-stone-400">Монітор керування процесами кухні та актуальності меню в реальному часі</p>
                </div>

                {/* Перемикач режимів */}
                <div className="flex bg-stone-900 border border-stone-800 p-1 rounded-xl self-stretch sm:self-auto">
                    <button
                        onClick={() => setActiveMode('orders')}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${activeMode === 'orders' ? 'bg-amber-500 text-stone-950 shadow-md' : 'text-stone-400 hover:text-stone-200'}`}
                    >
                        📋 Замовлення ({orders.length})
                    </button>
                    <button
                        onClick={() => setActiveMode('stoplist')}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${activeMode === 'stoplist' ? 'bg-amber-500 text-stone-950 shadow-md' : 'text-stone-400 hover:text-stone-200'}`}
                    >
                        🚫 Стоп-лист меню
                    </button>
                </div>
            </header>

            {/* РЕЖИМ 1: ЕКРАН ЗАМОВЛЕНЬ */}
            {activeMode === 'orders' && (
                <>
                    {orders.length === 0 && (
                        <div className="text-center py-24 text-stone-500 border border-dashed border-stone-800 rounded-2xl max-w-md mx-auto">
                            <span className="text-5xl block mb-2">💤</span>
                            <h3 className="text-lg font-bold text-stone-400">Усі замовлення видані</h3>
                            <p className="text-xs text-stone-600 mt-1">Кухня працює в штатному режимі. Нові замовлення з'являться тут автоматично.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {orders.map(order => (
                            <div
                                key={order.id}
                                className={`rounded-2xl border flex flex-col justify-between overflow-hidden shadow-xl transition bg-stone-900 ${order.status === 'READY' ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : 'border-stone-800'}`}
                            >
                                <div className={`p-4 border-b flex justify-between items-start ${order.status === 'READY' ? 'bg-emerald-950/40 border-emerald-800/60' : 'bg-stone-900 border-stone-800'}`}>
                                    <div>
                                        <span className="text-xs font-mono text-stone-400">ТИКЕТ #{order.id}</span>
                                        <h3 className="text-lg font-black mt-0.5">
                                            {order.tableId ? `📍 Стіл №${order.tableId}` : '🚗 Доставка'}
                                        </h3>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${order.status === 'READY' ? 'bg-emerald-500 text-stone-950' : 'bg-amber-500 text-stone-950'}`}>
                                        {order.status === 'READY' ? 'Готово' : 'Готується'}
                                    </span>
                                </div>

                                <div className="p-4 flex-1 space-y-3">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex justify-between items-start text-sm border-b border-stone-800/40 pb-2 last:border-0 last:pb-0">
                                            <p className="font-bold text-stone-200 max-w-[80%]">{item.title}</p>
                                            <div className="bg-stone-800 px-2 py-0.5 rounded text-amber-400 font-mono font-bold text-xs">x{item.quantity}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-4 bg-stone-900/60 border-t border-stone-800 flex flex-col gap-3">
                                    <div className="flex justify-between text-[11px] font-mono text-stone-400">
                                        <span>Час: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        <span className={order.paymentStatus === 'PAID' ? 'text-emerald-400' : 'text-amber-500'}>
                                            {order.paymentStatus === 'PAID' ? '💳 Оплачено' : '💵 Рахунок'}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => handleStatusChange(order.id, order.status)}
                                        className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition ${order.status === 'READY' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-amber-500 hover:bg-amber-600 text-stone-950'}`}
                                    >
                                        {order.status === 'READY' ? '✅ Видано офіціанту' : '🍳 Позначити як "Готово"'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* РЕЖИМ 2: СТОП-ЛИСТ МЕНЮ */}
            {activeMode === 'stoplist' && (
                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl max-w-4xl mx-auto">
                    <h2 className="text-lg font-black text-amber-500 uppercase tracking-wide mb-2">🚫 Стоп-лист та доступність страв</h2>
                    <p className="text-xs text-stone-400 mb-6">Клікніть на кнопку страви, щоб миттєво приховати або повернути її у меню для гостей у залі.</p>

                    <div className="space-y-3">
                        {menuItems.map(dish => (
                            <div
                                key={dish.id}
                                className={`p-4 rounded-xl border flex justify-between items-center transition ${dish.isAvailable ? 'bg-stone-900/40 border-stone-800' : 'bg-rose-950/20 border-rose-900/50'}`}
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-stone-500 font-mono uppercase tracking-wider">[{dish.category}]</span>
                                        <h4 className={`text-sm font-bold ${dish.isAvailable ? 'text-stone-100' : 'text-stone-400 line-through'}`}>
                                            {dish.title}
                                        </h4>
                                    </div>
                                    <p className="text-xs text-stone-500 mt-0.5">{dish.price} ₴</p>
                                </div>

                                <button
                                    onClick={() => handleToggleAvailability(dish.id)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm ${dish.isAvailable ? 'bg-stone-800 hover:bg-rose-600 hover:text-white text-emerald-400 border border-stone-700' : 'bg-rose-600 hover:bg-emerald-600 text-white'}`}
                                >
                                    {dish.isAvailable ? '🟢 В меню (Активна)' : '🔴 В стопі (Прихована)'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}