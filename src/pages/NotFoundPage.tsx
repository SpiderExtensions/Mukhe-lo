import React from 'react';
import { Home, ArrowLeft } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (tab: string) => void;
}

export function NotFoundPage({ onNavigate }: NotFoundPageProps) {
  return (
    <div className="max-w-md mx-auto text-center py-20 px-4 space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-[#F7F5F5] border-2 border-[#111111] p-3 mx-auto flex items-center justify-center shadow-hard-sm">
        <img
          src="/assets/aistudio/E4C57373-4D34-4620-B487-D44F42FFFC21_a7498b63.png"
          alt="মুখে ল"
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="space-y-2">
        <div className="text-5xl font-mono font-extrabold text-[#F52E68]">৪০৪</div>
        <h1 className="text-2xl font-bold text-[#111111]">পৃষ্ঠাটি খুঁজে পাওয়া যায়নি</h1>
        <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
          আপনি যে ঠিকানাটি খুঁজছেন তা মুছে ফেলা হয়েছে অথবা ঠিকানাটি সঠিক নয়।
        </p>
      </div>

      <div className="pt-2 flex items-center justify-center gap-3">
        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-3 bg-[#111111] hover:bg-neutral-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <Home className="w-4 h-4 text-[#F52E68]" />
          <span>হোমপেজে ফিরুন</span>
        </button>
      </div>
    </div>
  );
}
