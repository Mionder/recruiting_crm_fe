"use client";

import React, { useEffect, useState } from 'react';
import { Plus, Users, Search, ChevronRight, MapPin, Phone, Calendar, Loader2, X, Briefcase, GraduationCap, ShieldAlert, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Candidate {
  _id: string;
  fullName: string;
  ipn: string;
  birthDate: string;
  phone: string;
  address: string;
  education: string;
  experience: string;
  categories: string[];
  healthIssues?: string;
  hasCriminal: boolean;
  criminalDetails?: string;
  comments?: string;
  photoUrl?: string;
  vlkUrl?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Стан для модалки
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/candidates`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCandidates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Помилка завантаження:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-[#232323] text-white pb-24">
      {/* Header & Search */}
      <div className="p-6 border-b border-white/10 sticky top-0 bg-[#232323]/80 backdrop-blur-md z-20">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Кандидати</h1>
            <p className="text-white/40 text-sm">Всього: {candidates.length}</p>
          </div>
          <button 
            onClick={() => router.push('/candidates/new')}
            className="bg-white text-[#232323] p-3 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
          <input 
            type="text"
            placeholder="Пошук за ПІБ або телефоном..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:border-white/30 outline-none transition-all text-sm"
          />
        </div>
      </div>

      {/* Список */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/20">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p>Завантаження бази...</p>
          </div>
        ) : filteredCandidates.length > 0 ? (
          filteredCandidates.map((candidate) => (
            <div 
              key={candidate._id}
              onClick={() => setSelectedCandidate(candidate)} // Відкриваємо модалку
              className="bg-white/5 border border-white/10 rounded-3xl p-4 flex items-center gap-4 active:bg-white/10 transition-colors cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 overflow-hidden flex-shrink-0">
                {candidate.photoUrl ? (
                  <img src={candidate.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white/20" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate text-lg">{candidate.fullName}</h3>
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex items-center text-xs text-white/40 gap-1">
                    <Phone className="w-3 h-3" />
                    <span>{candidate.phone}</span>
                  </div>
                  <div className="flex items-center text-xs text-white/40 gap-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{candidate.address}</span>
                  </div>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-white/40 transition-colors" />
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-white/20">
            <p>Кандидатів не знайдено</p>
          </div>
        )}
      </div>

      {/* МОДАЛКА / BOTTOM SHEET ДЕТАЛЕЙ КАНДИДАТА */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-[#1c1c1c] w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] border border-white/10 max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300">
            
            {/* Стікі Хедер модалки */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#1c1c1c] sticky top-0 z-10">
              <h2 className="text-lg font-bold tracking-tight">Картка кандидата</h2>
              <button 
                onClick={() => setSelectedCandidate(null)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Контент */}
            <div className="p-6 space-y-6 overflow-y-auto">
              
              {/* Головний блок: Фото + ПІБ */}
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                  {selectedCandidate.photoUrl ? (
                    <img src={selectedCandidate.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="w-10 h-10 text-white/20" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold leading-tight">{selectedCandidate.fullName}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedCandidate.categories?.toString().split(',').map(cat => (
                      <span key={cat} className="px-2.5 py-0.5 bg-white text-[#232323] text-xs font-black rounded-md uppercase">
                        Категорія {cat.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <hr className="border-white/5" />

              {/* Особисті дані */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-widest text-white/30 font-bold">Персональна інформація</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-white/40 text-xs block mb-0.5">ІПН</span>
                    <span className="font-mono font-medium">{selectedCandidate.ipn}</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-white/40 text-xs block mb-0.5">Дата народження</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-white/40" /> {selectedCandidate.birthDate}</span>
                  </div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-sm flex items-center gap-3">
                  <Phone className="w-4 h-4 text-white/40" />
                  <div>
                    <span className="text-white/40 text-xs block">Телефон</span>
                    <a href={`tel:${selectedCandidate.phone}`} className="text-blue-400 hover:underline font-medium">{selectedCandidate.phone}</a>
                  </div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-sm flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-white/40 mt-0.5" />
                  <div>
                    <span className="text-white/40 text-xs block">Адреса проживання</span>
                    <span>{selectedCandidate.address}</span>
                  </div>
                </div>
              </div>

              {/* Освіта та Досвід */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-widest text-white/30 font-bold">Бекграунд</h4>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3 text-sm">
                  <div className="flex gap-2">
                    <GraduationCap className="w-4 h-4 text-white/40 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-bold block text-xs text-white/50">Освіта</span>
                      <p className="text-white/80 mt-0.5">{selectedCandidate.education || 'Не вказано'}</p>
                    </div>
                  </div>
                  <hr className="border-white/5" />
                  <div className="flex gap-2">
                    <Briefcase className="w-4 h-4 text-white/40 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-bold block text-xs text-white/50">Досвід роботи</span>
                      <p className="text-white/80 mt-0.5 whitespace-pre-line">{selectedCandidate.experience || 'Не вказано'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Здоров'я та Кримінал */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-widest text-white/30 font-bold">Безпека та Стан</h4>
                <div className="grid gap-3 text-sm">
                  {selectedCandidate.healthIssues && (
                    <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-2xl text-red-200">
                      <span className="text-red-400/60 text-xs font-bold block uppercase tracking-wider mb-1">{`Скарги на здоров'я`}</span>
                      {selectedCandidate.healthIssues}
                    </div>
                  )}

                  <div className={`p-4 rounded-2xl border ${selectedCandidate.hasCriminal ? 'bg-amber-500/5 border-amber-500/10 text-amber-200' : 'bg-green-500/5 border-green-500/10 text-green-200'}`}>
                    <span className="text-xs font-bold block uppercase tracking-wider mb-1">Судимості / Провадження</span>
                    {selectedCandidate.hasCriminal ? (
                      <div className="flex gap-2 items-start">
                        <ShieldAlert className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <p>{selectedCandidate.criminalDetails || 'Деталі не вказані'}</p>
                      </div>
                    ) : (
                      'Кримінальні провадження відсутні'
                    )}
                  </div>
                </div>
              </div>

              {/* Довідка ВЛК */}
              {selectedCandidate.vlkUrl && (
                <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-widest text-white/30 font-bold">Документи</h4>
                  <a 
                    href={selectedCandidate.vlkUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl text-sm hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-2ACT">
                      <FileText className="w-5 h-5 text-white/40" />
                      <div>
                        <span className="font-bold block">Довідка ВЛК</span>
                        <span className="text-xs text-white/40">Натисніть для перегляду оригіналу</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/30" />
                  </a>
                </div>
              )}

              {/* Коментарі */}
              {selectedCandidate.comments && (
                <div className="space-y-2">
                  <h4 className="text-xs uppercase tracking-widest text-white/30 font-bold">Примітки рекрутера</h4>
                  <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl text-sm text-yellow-200/80 italic">
                    {selectedCandidate.comments}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-8 left-0 right-0 px-6 pointer-events-none">
        <button 
          onClick={() => router.push('/candidates/new')}
          className="w-full bg-white text-[#232323] font-bold py-4 rounded-2xl shadow-2xl pointer-events-auto active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          ДОДАТИ НОВОГО
        </button>
      </div>
    </div>
  );
}