import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Отримуємо токен з кук
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 2. Визначаємо шлях до логіна
  const isLoginPage = pathname === '/login';

  // КЕЙС 1: Користувач НЕ авторизований і намагається зайти на закриту сторінку
  if (!token && !isLoginPage) {
    // Якщо це не сторінка логіна і немає токена — на вихід
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // КЕЙС 2: Користувач АВТОРИЗОВАНИЙ і намагається зайти на логін
  if (token && isLoginPage) {
    // Навіщо йому логін, якщо він уже в системі? Шлемо на дашборд
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // В усіх інших випадках дозволяємо перехід
  return NextResponse.next();
}

// 3. Налаштовуємо "матчер" (на які шляхи реагувати)
export const config = {
  matcher: [
    /*
     * Виключаємо:
     * - api (запити до бекенду)
     * - _next/static (статичні файли)
     * - _next/image (оптимізація зображень)
     * - favicon.ico (іконка)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};