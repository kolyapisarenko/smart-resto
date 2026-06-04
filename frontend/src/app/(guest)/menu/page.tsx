'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface MenuItem {
    id: number;
    title: string;
    price: number;
    category: string;
    desc: string;
    isAvailable: boolean;
    img_url?: string;
}

interface Order {
    id: number;
    tableId: number | null;
    status: 'PENDING' | 'COOKING' | 'READY' | 'SERVED';
    paymentStatus: 'PAID' | 'UNPAID';
    totalAmount: number;
}

function MenuContent() {
    const searchParams = useSearchParams();
    const tableId = searchParams.get('table');

    // Базові стейти для меню та кошика
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [activeTab, setActiveTab] = useState('soup');
    const [cart, setCart] = useState<{ [key: number]: number }>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    // --- СТЕЙТИ ДЛЯ ЕКРАНА ОЧІКУВАННЯ ТА ВИКЛИКІВ (ЛБ1) ---
    const [activeOrder, setActiveOrder] = useState<Order | null>(null);
    const [callStatus, setCallStatus] = useState<string | null>(null);

    // 1. Завантаження динамічного меню з NestJS бекенду
    useEffect(() => {
        fetch('http://localhost:3001/api/v1/menu')
            .then(res => {
                if (!res.ok) throw new Error('Помилка завантаження меню');
                return res.json();
            })
            .then((data: MenuItem[]) => {
                setMenuItems(data);
                if (data.length > 0 && !data.some(d => d.category === 'soup')) {
                    setActiveTab(data[0].category);
                }
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    // 1.5. Автоматичне зайняття столу при вході гостя (Фікс бага)
    useEffect(() => {
        if (!tableId) return;

        fetch(`http://localhost:3001/api/v1/tables/${tableId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'OCCUPIED' }),
        })
            .then(res => {
                if (!res.ok) console.error('Не вдалося оновити статус столу на OCCUPIED');
            })
            .catch(err => console.error('Помилка мережі при оновленні столу:', err));
    }, [tableId]);

    // 2. Живий моніторинг статусу замовлення кухнею (Live Polling кожні 4 сек)
    useEffect(() => {
        if (!activeOrder) return;

        let timeoutId: NodeJS.Timeout | null = null;

        const interval = setInterval(async () => {
            try {
                const res = await fetch('http://localhost:3001/api/v1/orders');
                if (res.ok) {
                    const orders: Order[] = await res.json();
                    const current = orders.find(o => o.id === activeOrder.id);

                    if (current) {
                        setActiveOrder(current);

                        // Якщо замовлення повністю подано і оплачено — запускаємо фінальний сценарій
                        if (current.status === 'SERVED' && current.paymentStatus === 'PAID') {
                            // КРОК 1: Негайно зупиняємо інтервал опитування
                            clearInterval(interval);

                            console.log("⏳ Замовлення виконано. Запуск 20-секундного таймера до очищення столу...");

                            // КРОК 2: Запускаємо таймер і зберігаємо його ID для можливості очищення
                            timeoutId = setTimeout(async () => {
                                if (tableId) {
                                    try {
                                        await fetch(`http://localhost:3001/api/v1/tables/${tableId}/status`, {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ status: 'DIRTY' }),
                                        });
                                        console.log(`🧻 Стіл №${tableId} успішно переведено в статус DIRTY.`);
                                    } catch (err) {
                                        console.error('Не вдалося перевести стіл в DIRTY:', err);
                                    }
                                }
                                // Закриваємо екран трекера та повертаємо до меню
                                setActiveOrder(null);
                            }, 20000);
                        }
                    }
                }
            } catch (err) {
                console.error('Помилка оновлення статусу замовлення гостя:', err);
            }
        }, 4000);

        // Функція очищення (cleanup), яка спрацює якщо компонент перерендериться або закриється
        return () => {
            clearInterval(interval);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [activeOrder?.id, activeOrder?.status, activeOrder?.paymentStatus, tableId]);
    // Наведені вище залежності точково відслідковують лише потрібні зміни полів замовлення, запобігаючи зайвим перезапускам ефекту


    const addToCart = (id: number) => {
        setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    };

    const removeFromCart = (id: number) => {
        if (!cart[id]) return;
        setCart(prev => {
            const updated = { ...prev };
            if (updated[id] === 1) delete updated[id];
            else updated[id]--;
            return updated;
        });
    };

    const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

    const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
        const item = menuItems.find(m => m.id === Number(id));
        return sum + (item ? item.price * qty : 0);
    }, 0);

    // 3. Відправка реального замовлення на бекенд
    const handleCheckout = async () => {
        if (checkoutLoading) return;

        const orderItems = Object.entries(cart).map(([id, qty]) => ({
            itemId: Number(id),
            quantity: qty,
        }));

        const paymentRequired = !tableId;
        setCheckoutLoading(true);

        try {
            const response = await fetch('http://localhost:3001/api/v1/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tableId: tableId ? Number(tableId) : null,
                    items: orderItems,
                    paymentRequired: paymentRequired,
                }),
            });

            if (!response.ok) throw new Error('Не вдалося створити замовлення');

            const createdOrder: Order = await response.json();

            if (createdOrder.paymentStatus === 'PAID') {
                alert(`💳 Оплату успішно знято онлайн!\nЗамовлення №${createdOrder.id} передано в чергу.`);
            } else {
                alert(`🎉 Замовлення №${createdOrder.id} надіслано на кухню!`);
            }

            setActiveOrder(createdOrder);
            setCart({});
        } catch (err: any) {
            alert(`❌ Помилка оформлення: ${err.message}`);
        } finally {
            setCheckoutLoading(false);
        }
    };

    // --- 4. ФУНКЦІЯ ВИКЛИКУ ОФІЦІАНТА З КОНТЕКСТОМ (FR-4 / ЛБ1) ---
    const sendServiceCall = async (type: 'WAITER' | 'BILL' | 'HELP', label: string) => {
        try {
            const response = await fetch('http://localhost:3001/api/v1/calls', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tableId: tableId ? Number(tableId) : 1,
                    type: type
                }),
            });

            if (!response.ok) throw new Error('Бекенд відхилив запит');

            setCallStatus(`🛎️ Сигнал "${label}" надіслано! Офіціант уже прямує до вас.`);
            setTimeout(() => setCallStatus(null), 6000);
        } catch (err: any) {
            alert(`⚠️ Не вдалося викликати персонал: ${err.message}`);
        }
    };

    const categories = Array.from(new Set(menuItems.map(item => item.category)));

    if (loading) return <div className="p-8 text-center text-stone-500 font-medium">⏳ Завантаження свіжого меню з кухні...</div>;
    if (error) return <div className="p-8 text-center text-rose-500 font-medium">❌ Не вдалося зв'язатися з сервером: {error}</div>;

    // СЦЕНАРІЙ Б: ТРЕКЕР
    if (activeOrder) {
        return (
            <div className="min-h-screen bg-stone-900 text-stone-100 p-4 max-w-md mx-auto flex flex-col justify-between font-sans">
                <header className="border-b border-stone-800 pb-3 text-center">
                    <h1 className="text-xl font-black text-amber-500 uppercase tracking-wider">📍 СТІЛ №{tableId || 'На виніс'}</h1>
                    <p className="text-xs text-stone-400">Моніторинг приготування в реальному часі</p>
                </header>

                <main className="my-6 flex-1 flex flex-col justify-center">
                    <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 shadow-2xl space-y-5">
                        <div className="text-center">
                            <span className="text-4xl animate-bounce inline-block mb-2">👨‍🍳</span>
                            <h2 className="text-base font-bold text-amber-400 uppercase tracking-wide">Ваш чек прийнято в роботу</h2>
                            <p className="text-xs font-mono text-stone-500 mt-1">ТИКЕТ ЗАМОВЛЕННЯ #{activeOrder.id}</p>
                        </div>

                        <div className="pt-4 space-y-4 border-t border-stone-900">
                            <div className={`flex items-center gap-3.5 text-xs transition-all ${activeOrder.status === 'PENDING' ? 'text-amber-400 font-bold scale-102' : 'text-stone-600'}`}>
                                <div className={`w-3 h-3 rounded-full shadow-sm ${activeOrder.status === 'PENDING' ? 'bg-amber-400 ring-4 ring-amber-500/20' : 'bg-stone-800'}`}></div>
                                <div className="flex flex-col">
                                    <span>📋 Передано на кухню</span>
                                    {activeOrder.status === 'PENDING' && <span className="text-[10px] font-normal text-stone-400">Страви додаються в чергу друку кухаря</span>}
                                </div>
                            </div>

                            <div className={`flex items-center gap-3.5 text-xs transition-all ${activeOrder.status === 'COOKING' ? 'text-amber-400 font-bold scale-102' : 'text-stone-600'}`}>
                                <div className={`w-3 h-3 rounded-full shadow-sm ${activeOrder.status === 'COOKING' ? 'bg-amber-400 animate-pulse ring-4 ring-amber-500/20' : activeOrder.status === 'READY' || activeOrder.status === 'SERVED' ? 'bg-amber-600/40' : 'bg-stone-800'}`}></div>
                                <div className="flex flex-col">
                                    <span>🍳 Готується шефом</span>
                                    {activeOrder.status === 'COOKING' && <span className="text-[10px] font-normal text-stone-400">Процес термічної обробки та оформлення</span>}
                                </div>
                            </div>

                            <div className={`flex items-center gap-3.5 text-xs transition-all ${activeOrder.status === 'READY' ? 'text-emerald-400 font-black scale-102' : 'text-stone-600'}`}>
                                <div className={`w-3 h-3 rounded-full shadow-sm ${activeOrder.status === 'READY' ? 'bg-emerald-400 ring-4 ring-emerald-500/20 animate-ping' : activeOrder.status === 'SERVED' ? 'bg-emerald-600/40' : 'bg-stone-800'}`}></div>
                                <div className="flex flex-col">
                                    <span>🛎️ Готово на рампі видачі</span>
                                    {activeOrder.status === 'READY' && <span className="text-[10px] font-bold text-stone-300 animate-pulse">Офіціант забирає тарілки в зал!</span>}
                                </div>
                            </div>

                            <div className={`flex items-center gap-3.5 text-xs transition-all ${activeOrder.status === 'SERVED' ? 'text-stone-300 font-bold' : 'text-stone-700'}`}>
                                <div className={`w-3 h-3 rounded-full ${activeOrder.status === 'SERVED' ? 'bg-emerald-500' : 'bg-stone-800'}`}></div>
                                <div className="flex flex-col">
                                    <span>🎉 Подано на стіл</span>
                                    {activeOrder.status === 'SERVED' && <span className="text-[10px] font-normal text-emerald-500">Смачного! Дякуємо, що ви з нами!</span>}
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 text-center text-[11px] text-amber-500/90 font-medium">
                            {activeOrder.status === 'SERVED' && activeOrder.paymentStatus === 'PAID' && (
                                <span className="animate-pulse block bg-stone-900 py-1.5 px-2 rounded-lg border border-amber-500/20">
                                    🔄 Дякуємо! Меню оновиться автоматично через кілька секунд...
                                </span>
                            )}
                        </div>

                        <div className="bg-stone-900 rounded-xl p-3 text-center border border-stone-800/60">
                            <span className="text-[10px] uppercase text-stone-500 block font-bold">Разом за чеком:</span>
                            <span className="text-lg font-black text-white">{activeOrder.totalAmount} ₴</span>
                            <span className={`text-[9px] block font-mono font-bold mt-1 ${activeOrder.paymentStatus === 'PAID' ? 'text-emerald-400' : 'text-amber-500'}`}>
                                {activeOrder.paymentStatus === 'PAID' ? '✓ ОПЛАЧЕНО ОНЛАЙН' : '⏱️ ОПЛАТА ПРИ ЗАКРИТТІ СТОЛУ'}
                            </span>
                        </div>
                    </div>

                    {callStatus && (
                        <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs rounded-xl text-center font-bold animate-pulse">
                            {callStatus}
                        </div>
                    )}
                </main>

                <footer className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3">
                    <h3 className="text-[10px] font-black uppercase text-stone-500 tracking-widest text-center">🛎️ Потрібен сервіс або допомога?</h3>
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => sendServiceCall('WAITER', 'Потрібен офіціант')} className="bg-stone-900 border border-stone-800 hover:border-amber-500/40 p-3 rounded-xl text-center flex flex-col items-center justify-center gap-1.5 transition active:scale-95">
                            <span className="text-xl">💁‍♂️</span>
                            <span className="text-[9px] font-bold text-stone-300">Офіціант</span>
                        </button>
                        <button onClick={() => sendServiceCall('BILL', 'Прохання рахунку')} className="bg-stone-900 border border-stone-800 hover:border-emerald-500/40 p-3 rounded-xl text-center flex flex-col items-center justify-center gap-1.5 transition active:scale-95">
                            <span className="text-xl">💵</span>
                            <span className="text-[9px] font-bold text-stone-300">Рахунок</span>
                        </button>
                        <button onClick={() => sendServiceCall('HELP', 'Термінова допомога')} className="bg-stone-900 border border-stone-800 hover:border-rose-500/40 p-3 rounded-xl text-center flex flex-col items-center justify-center gap-1.5 transition active:scale-95">
                            <span className="text-xl">🆘</span>
                            <span className="text-[9px] font-bold text-stone-300">Допомога</span>
                        </button>
                    </div>

                    <button
                        onClick={() => setActiveOrder(null)}
                        className="w-full mt-2 text-stone-500 hover:text-stone-300 text-[10px] font-bold uppercase tracking-wider text-center py-1 block"
                    >
                        ← Повернутися до меню ресторану
                    </button>
                </footer>
            </div>
        );
    }

    // СЦЕНАРІЙ А: МЕНЮ
    return (
        <div className="min-h-screen bg-stone-50 pb-24 text-stone-800">
            <header className="bg-white sticky top-0 z-10 shadow-sm border-b px-4 py-3 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-amber-600">📖 Смачне Меню</h1>
                    {tableId && <p className="text-xs text-emerald-600 font-semibold">📍 Стіл №{tableId} • Онлайн замовлення</p>}
                </div>
                <div className="bg-amber-100 text-amber-800 text-xs px-3 py-1.5 rounded-full font-bold">
                    🛒 Кошик: {totalItems} шт.
                </div>
            </header>

            <div className="bg-white border-b sticky top-[53px] z-10 flex gap-2 p-2 overflow-x-auto scrollbar-noneSB">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={`whitespace-nowrap px-4 py-2 text-xs font-bold rounded-full transition-all uppercase tracking-wider ${activeTab === cat ? 'bg-amber-500 text-white shadow-sm' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                    >
                        {cat === 'soup' ? '🥣 Супи' : cat === 'meat' ? '🥩 М’ясо' : cat === 'salad' ? '🥗 Салати' : cat === 'drinks' ? '🍹 Напої' : cat === 'brunch' ? '🥞 Бранчі' : `✨ ${cat}`}
                    </button>
                ))}
            </div>

            <main className="max-w-5xl mx-auto p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {menuItems.filter(item => item.category === activeTab).map(dish => (
                    <div key={dish.id} className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition flex flex-col overflow-hidden">
                        <div className="h-48 w-full bg-stone-200 relative">
                            {dish.img_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={dish.img_url} alt={dish.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">📸 Фото страви з'явиться незабаром</div>
                            )}
                        </div>

                        <div className="p-4 flex flex-col justify-between flex-1">
                            <div className="mb-4">
                                <div className="flex justify-between items-start gap-2 mb-2">
                                    <h3 className="font-bold text-base text-stone-900 leading-tight">{dish.title}</h3>
                                    <span className="font-black text-amber-600 text-base whitespace-nowrap">{dish.price} ₴</span>
                                </div>
                                <p className="text-stone-500 text-xs leading-relaxed">{dish.desc}</p>
                            </div>

                            <div className="flex justify-end items-center gap-3 pt-2 border-t border-stone-100">
                                {cart[dish.id] > 0 && (
                                    <div className="flex items-center gap-2 mr-auto">
                                        <button onClick={() => removeFromCart(dish.id)} className="w-8 h-8 rounded-full bg-stone-100 font-bold flex items-center justify-center hover:bg-stone-200 text-stone-700 transition">-</button>
                                        <span className="font-bold text-sm text-stone-800 w-4 text-center">{cart[dish.id]}</span>
                                        <button onClick={() => addToCart(dish.id)} className="w-8 h-8 rounded-full bg-stone-100 font-bold flex items-center justify-center hover:bg-stone-200 text-stone-700 transition">+</button>
                                    </div>
                                )}
                                <button onClick={() => addToCart(dish.id)} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition">
                                    {cart[dish.id] > 0 ? 'Додати ще' : '🛒 В кошик'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </main>

            {totalItems > 0 && (
                <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-stone-900 text-white p-4 rounded-2xl shadow-2xl flex justify-between items-center z-20 transition-all">
                    <div>
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Разом до оплати</p>
                        <p className="text-xl font-black text-amber-400">{totalPrice} ₴</p>
                    </div>
                    <button onClick={handleCheckout} disabled={checkoutLoading} className="bg-amber-500 hover:bg-amber-600 disabled:bg-stone-700 disabled:text-stone-400 text-stone-950 px-5 py-2.5 rounded-xl font-bold text-sm transition transform active:scale-95 shadow-md flex items-center gap-2">
                        {checkoutLoading ? (
                            <>
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-stone-950"></span>
                                {tableId ? 'Бронюємо...' : 'Обробка оплати...'}
                            </>
                        ) : (
                            tableId ? '🚀 Замовити на стіл' : '💳 Оплатити замовлення'
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
export default function GuestMenuPage() {
    return (
        <Suspense fallback={<div className="p-6 text-center text-stone-500">Завантаження інтерфейсу меню...</div>}>
            <MenuContent />
        </Suspense>
    );
}