"use client";

import React, { useState } from 'react';
import { Lock, User, Shield, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { setCookie } from 'cookies-next';
import Image from 'next/image';
import Logo from '../img/logo_icon_192.png';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Помилка авторизації');
      }

      // Зберігаємо токен
      localStorage.setItem('token', data.access_token);
      setCookie('token', data.access_token, { maxAge: 60 * 60 * 48 });
      
      // Редирект на головну (список кандидатів або форму)
      router.push('/dashboard');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#232323] text-white flex flex-col justify-center px-6">
      <div className="w-full max-w-sm mx-auto space-y-8">
        <div className="text-center">
          <div className="inline-flex p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
            <Image src={Logo} alt="logo" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">RECRUITING CRM</h1>
          <p className="text-white/50 text-sm mt-2">Вхід у систему керування</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-2xl text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-white/40 ml-1">Логін</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input 
                required
                type="text" 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-white/30 outline-none transition-all"
                placeholder="Введіть логін"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-white/40 ml-1">Пароль</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input 
                required
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-white/30 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-white text-[#232323] font-bold py-4 rounded-2xl hover:bg-white/90 active:scale-[0.98] transition-all mt-4 flex items-center justify-center disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "УВІЙТИ"}
          </button>
        </form>
      </div>
    </div>
  );
}