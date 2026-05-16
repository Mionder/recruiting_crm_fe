"use client";

import React, { useState, useEffect } from 'react';
import { Camera, Upload, Calendar, Loader2, CheckCircle2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CandidateForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    ipn: '',
    birthDate: '',
    phone: '+380',
    address: '',
    education: '',
    experience: '',
    categories: [] as string[],
    summary: '',
    healthIssues: '',
    hasCriminal: false,
    criminalDetails: '',
    comments: '',
  });

  const [files, setFiles] = useState<{
    photo: { file: File | null; preview: string };
    vlk: { file: File | null; preview: string };
  }>({
    photo: { file: null, preview: '' },
    vlk: { file: null, preview: '' },
  });

  // Автоматичне обчислення дати народження з ІПН
  useEffect(() => {
    if (formData.ipn.length === 10) {
      const days = parseInt(formData.ipn.slice(0, 5), 10);
      if (!isNaN(days)) {
        const baseDate = new Date(1899, 11, 31);
        baseDate.setDate(baseDate.getDate() + days);
        setFormData(prev => ({ 
          ...prev, 
          birthDate: baseDate.toISOString().split('T')[0] 
        }));
      }
    }
  }, [formData.ipn]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'vlk') => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFiles(prev => ({
        ...prev,
        [type]: { file, preview: previewUrl }
      }));
    }
  };

  const handleClearFile = (e: React.MouseEvent, type: 'photo' | 'vlk') => {
    e.preventDefault(); // Зупиняємо клік, щоб знову не відкривався інпут
    e.stopPropagation();
    
    // Звільняємо пам'ять від створеного URL
    if (files[type].preview) {
      URL.revokeObjectURL(files[type].preview);
    }

    setFiles(prev => ({
      ...prev,
      [type]: { file: null, preview: '' }
    }));
  };

  const toggleCategory = (cat: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(cat) 
        ? prev.categories.filter(c => c !== cat) 
        : [...prev.categories, cat]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();

      // Додаємо всі текстові поля
      Object.keys(formData).forEach(key => {
        if (key === 'categories') {
          data.append(key, formData.categories.join(','));
        } else {
          data.append(key, (formData as any)[key]);
        }
      });

      // Додаємо файли
      if (files.photo.file) data.append('photo', files.photo.file);
      if (files.vlk.file) data.append('vlk', files.vlk.file);

      const token = localStorage.getItem('token');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates/register`, {
        method: 'POST',
        headers: {
          // Content-Type НЕ СТАВИМО, браузер сам поставить boundary для FormData
          'Authorization': `Bearer ${token}`
        },
        body: data,
      });

      if (!response.ok) throw new Error('Помилка при збереженні');

      setIsSuccess(true);
      setTimeout(() => router.push('/dashboard'), 2000);

    } catch (error) {
      alert("Помилка: " + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#232323] flex items-center justify-center p-6 text-center">
        <div className="space-y-4 animate-in zoom-in duration-300">
          <CheckCircle2 className="w-20 h-20 text-white-500 mx-auto" />
          <h2 className="text-2xl text-white font-bold">Анкету збережено!</h2>
          <p className="text-white/50">Дані успішно передані в систему.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#232323] text-white pb-20">
      <div className="p-6 border-b border-white/10 sticky top-0 bg-[#232323]/80 backdrop-blur-md z-10">
        <h1 className="text-xl font-bold">Анкета кандидата</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8 max-w-md mx-auto">
        
        {/* Секція: Основне */}
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-white/40 font-bold">Персональні дані</h2>
          
          <div className="grid gap-4">
            <input 
              type="text" 
              placeholder="ПІБ Повністю" 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-white/30 outline-none"
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="text" 
                maxLength={10}
                placeholder="ІПН (10 цифр)" 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-white/30 outline-none"
                onChange={(e) => setFormData({...formData, ipn: e.target.value})}
              />
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                <input 
                  type="date" 
                  value={formData.birthDate}
                  readOnly
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-3 text-sm text-white/50 outline-none"
                />
              </div>
            </div>

            <input 
              type="tel" 
              value={formData.phone}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-white/30 outline-none text-white"
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
        </section>

        {/* Секція: Життєвий шлях */}
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-white/40 font-bold">Досвід та освіта</h2>
          <textarea 
            placeholder="Прописка / Місце проживання" 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 h-20 outline-none focus:border-white/30"
            onChange={(e) => setFormData({...formData, address: e.target.value})}
          />
          <input 
            type="text" 
            placeholder="Освіта" 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-white/30"
            onChange={(e) => setFormData({...formData, education: e.target.value})}
          />
          <textarea 
            placeholder="Де працював" 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 h-24 outline-none focus:border-white/30"
            onChange={(e) => setFormData({...formData, experience: e.target.value})}
          />
        </section>

        {/* Водійські категорії */}
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-white/40 font-bold">Водійські категорії</h2>
          <div className="flex flex-wrap gap-2">
            {['A', 'B', 'C', 'D', 'BE', 'CE', 'T'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold transition-all ${
                  formData.categories.includes(cat) 
                  ? 'bg-white text-[#232323] border-white' 
                  : 'bg-transparent border-white/10 text-white/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Здоров'я та Кримінал */}
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-white/40 font-bold">Стан та правопорядок</h2>
          <textarea 
            placeholder="Скарги на здоров'я" 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 h-20 outline-none border-red-900/20 focus:border-red-500/50"
            onChange={(e) => setFormData({...formData, healthIssues: e.target.value})}
          />
          
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
            <input 
              type="checkbox" 
              id="criminal"
              className="w-5 h-5 rounded bg-[#232323] border-white/10"
              onChange={(e) => setFormData({...formData, hasCriminal: e.target.checked})}
            />
            <label htmlFor="criminal" className="text-sm">Є кримінальні провадження</label>
          </div>
          
          {formData.hasCriminal && (
            <textarea 
              placeholder="Опис проваджень" 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 h-24 outline-none animate-in fade-in duration-300"
                onChange={(e) => setFormData({...formData, criminalDetails: e.target.value})}
            />
          )}
        </section>

        {/* Медіа-файли (Фото та ВЛК) */}
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-white/40 font-bold">Документи та Фото</h2>
          
<div className="grid grid-cols-2 gap-4">
  {/* Фото людини */}
  <label className="relative flex flex-col items-center justify-center p-0 overflow-hidden bg-white/5 border border-dashed border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer h-32 group">
    {files.photo.preview ? (
      <>
        <img src={files.photo.preview} alt="User" className="w-full h-full object-cover" />
        {/* Оверлей при ховері для зміни */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera className="w-6 h-6 text-white" />
        </div>
        {/* Кнопка видалення */}
        <button
          type="button"
          onClick={(e) => handleClearFile(e, 'photo')}
          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white/80 hover:text-white transition-colors z-10"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </>
    ) : (
      <>
        <Camera className="w-8 h-8 mb-2 text-white/40" />
        <span className="text-[10px] uppercase font-bold text-white/40 text-center px-2">Фото кандидата</span>
        <span className="text-[8px] text-white/20 mt-0.5">Камера або галерея</span>
      </>
    )}
    <input 
      type="file" 
      maxLength={1}
      accept="image/*" 
      /* ВИДАЛЕНО capture="user" — тепер при кліку телефон сам запитає: Камера чи Галерея */
      className="hidden" 
      onChange={(e) => handleFileChange(e, 'photo')}
    />
  </label>

  {/* ВЛК */}
  <label className="relative flex flex-col items-center justify-center p-0 overflow-hidden bg-white/5 border border-dashed border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer h-32 group">
    {files.vlk.preview ? (
      <>
        <img src={files.vlk.preview} alt="VLK" className="w-full h-full object-cover" />
        {/* Оверлей при ховері для зміни */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Upload className="w-6 h-6 text-white" />
        </div>
        {/* Кнопка видалення */}
        <button
          type="button"
          onClick={(e) => handleClearFile(e, 'vlk')}
          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white/80 hover:text-white transition-colors z-10"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </>
    ) : (
      <>
        <Upload className="w-8 h-8 mb-2 text-white/40" />
        <span className="text-[10px] uppercase font-bold text-white/40 text-center px-2">Довідка ВЛК</span>
        <span className="text-[8px] text-white/20 mt-0.5">Скан або файл</span>
      </>
    )}
    <input 
      type="file" 
      maxLength={1}
      /* Для ВЛК можна розширити accept, якщо рекрутери захочуть прикріпити PDF документ */
      accept="image/*,application/pdf" 
      /* ВИДАЛЕНО capture="environment" */
      className="hidden" 
      onChange={(e) => handleFileChange(e, 'vlk')}
    />
  </label>
</div>

          <textarea 
            placeholder="Коментарі" 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 h-24 outline-none focus:border-white/30"
            onChange={(e) => setFormData({...formData, summary: e.target.value})}
          />
        </section>

        <button 
          type="submit"
          className="w-full flex items-center justify-center bg-white text-[#232323] font-bold py-5 rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest"
          disabled={isSubmitting}
        >
            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Зберегти анкету"}
        </button>
      </form>
    </div>
  );
}