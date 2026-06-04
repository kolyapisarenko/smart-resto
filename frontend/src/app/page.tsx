'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function HomeScreenContent() {
  const searchParams = useSearchParams();
  const tableId = searchParams.get('table'); // Зчитуємо ?table=X з QR-коду

  return (
    <main className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-4 text-slate-800">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 text-center border border-amber-100">
        <h1 className="text-3xl font-extrabold text-amber-600 mb-2">🍽️ SmartResto</h1>
        <p className="text-slate-500 mb-6 text-sm">Цифрова система замовлень та бронювання</p>

        {tableId ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
            <p className="text-emerald-800 font-medium text-sm">
              🎉 Ви зафіксовані за **Столом №{tableId}**
            </p>
            <p className="text-xs text-emerald-600 mt-1">
              Режим Guest Checkout активовано. Можна замовляти без реєстрації.
            </p>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-blue-800 font-medium text-sm">
              🏠 Дистанційний перегляд
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Ви можете переглянути меню або забронювати стіл на вечір.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link
            href={tableId ? `/menu?table=${tableId}` : '/menu'}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-xl transition shadow-md"
          >
            📖 Відкрити Електронне Меню
          </Link>

          <Link
            href="/booking"
            className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 px-4 rounded-xl border border-slate-200 transition"
          >
            📅 Забронювати Стіл
          </Link>
        </div>

        {/* Для звичайного гостя тут кінець. Для персоналу залишаємо непомітну, естетичну плашку в самому низу */}
        <div className="mt-8 pt-4 border-t border-slate-100">
          <Link href="/login" className="text-xs text-slate-400 hover:text-slate-600 transition underline">
            Вхід для персоналу закладу
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-amber-50 flex items-center justify-center text-slate-600">Завантаження...</div>}>
      <HomeScreenContent />
    </Suspense>
  );
}