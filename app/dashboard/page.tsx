"use client";

import React, { useEffect, useState } from 'react';
import { Plus, Users, Search, ChevronRight, MapPin, Phone, Calendar, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Candidate {
  _id: string;
  fullName: string;
  phone: string;
  address: string;
  birthDate: string;
  photoUrl?: string;
  categories: string[];
}

export default function Dashboard() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/candidates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCandidates(data);
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
      {/* Header */}
      <div className="p-6 border-b border-white/10 sticky top-0 bg-[#232323]/80 backdrop-blur-md z-20">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Кандидати</h1>
            <p className="text-white/40 text-sm">Всього: {candidates.length}</p>
          </div>
          <button 
            onClick={() => router.push('/form')}
            className="bg-white text-[#232323] p-3 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
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

      {/* List */}
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
              onClick={() => router.push(`/candidates/${candidate._id}`)}
              className="bg-white/5 border border-white/10 rounded-3xl p-4 flex items-center gap-4 active:bg-white/10 transition-colors cursor-pointer group"
            >
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 overflow-hidden flex-shrink-0">
                {candidate.photoUrl ? (
                  <img src={candidate.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white/20" />
                  </div>
                )}
              </div>

              {/* Info */}
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

              {/* Arrow */}
              <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-white/40 transition-colors" />
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-white/20">
            <p>Кандидатів не знайдено</p>
          </div>
        )}
      </div>

      {/* Floating Action Button (Mobile optimization) */}
      <div className="fixed bottom-8 left-0 right-0 px-6 pointer-events-none">
        <button 
          onClick={() => router.push('/form')}
          className="w-full bg-white text-[#232323] font-bold py-4 rounded-2xl shadow-2xl pointer-events-auto active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          ДОДАТИ НОВОГО
        </button>
      </div>
    </div>
  );
}