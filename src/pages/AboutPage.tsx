import React from 'react';
import { ShieldCheck, HeartHandshake, EyeOff, Sparkles, Flame, CheckCircle2 } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (tab: string) => void;
  onOpenPayment: () => void;
}

export function AboutPage({ onNavigate, onOpenPayment }: AboutPageProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Brand Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="w-20 h-20 rounded-3xl bg-[#F7F5F5] border-2 border-[#111111] p-2 mx-auto flex items-center justify-center shadow-hard-sm">
          <img
            src="/assets/aistudio/E4C57373-4D34-4620-B487-D44F42FFFC21_a7498b63.png"
            alt="মুখে ল"
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#EAE6E7] text-xs font-bold text-[#F52E68] uppercase tracking-wider">
          <Flame className="w-3.5 h-3.5" />
          <span>আমাদের দর্শন ও ইশতেহার</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
          আমরা শুধু একটি গ্রুপ নই, আমরা একটি পরিবার
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          মুখে ল হচ্ছে আধুনিক বাঙালি তরুণ, ক্রিয়েটর ও মুক্তচিন্তার মানুষের একটি স্বাবলম্বী প্রাইভেট কমিউনিটি।
        </p>
      </div>

      {/* Manifesto Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-[#EAE6E7] shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#F52E68]/10 text-[#F52E68] flex items-center justify-center font-bold">
            ০১
          </div>
          <h3 className="text-base font-bold text-[#111111]">আত্মপ্রকাশের পূর্ণ স্বাধীনতা</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            কোনো প্রকার সামাজিক দ্বিধা বা কৃত্রিমতা ছাড়া নিজস্ব মতামত ও সৃষ্টিশীলতাকে প্রকাশ করার অধিকার প্রতিটি সদস্যের রয়েছে।
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#EAE6E7] shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#111111] text-white flex items-center justify-center font-bold">
            ০২
          </div>
          <h3 className="text-base font-bold text-[#111111]">নিরাপত্তা ও গোপনীয়তা</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            কোনো প্রকার জিপিএস ট্র্যাকিং বা অযাচিত লোকেশন ট্র্যাকিং নেই। প্রত্যেকের ফোন নম্বর ও পিন সম্পূর্ণ এনক্রিপ্টেড।
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#EAE6E7] shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 text-[#111111] border border-[#EAE6E7] flex items-center justify-center font-bold">
            ০৩
          </div>
          <h3 className="text-base font-bold text-[#111111]">যৌথ ভ্রাতৃত্ব ও সহমর্মিতা</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            কমিউনিটি ফান্ড ও যৌথ তহবিলের মাধ্যমে আমরা একে অপরের প্রয়োজনে পাশে দাঁড়াই এবং সামাজিক উদ্যোগ পরিচালনা করি।
          </p>
        </div>
      </div>

      {/* Community Rules */}
      <div className="bg-[#F7F5F5] rounded-3xl border border-[#EAE6E7] p-8 sm:p-10 space-y-6">
        <h2 className="text-2xl font-bold text-[#111111]">কমিউনিটির মৌলিক নীতিমালা</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-[#EAE6E7]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#111111] block mb-0.5">পারস্পরিক সম্মান রক্ষা:</strong>
              <span className="text-gray-600">মতাদর্শ ভিন্ন হলেও কোনো সদস্যকে ব্যক্তিগত আক্রমণ বা অপমান করা কঠোরভাবে নিষিদ্ধ।</span>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-[#EAE6E7]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#111111] block mb-0.5">সেলফি ভেরিফিকেশন:</strong>
              <span className="text-gray-600">প্রত্যেক সদস্যকে সক্রিয় একক সেলফি প্রদানের মাধ্যমে নিজের পরিচয় নিশ্চিত করতে হবে।</span>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-[#EAE6E7]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#111111] block mb-0.5">গোপন পিন সংরক্ষণ:</strong>
              <span className="text-gray-600">নিজের ৬-সংখ্যার লগইন পিন অন্য কারও সাথে শেয়ার করবেন না। এটি আপনার একান্ত ডিজিটাল পরিচিতি।</span>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-[#EAE6E7]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#111111] block mb-0.5">নিয়মিত সম্পৃক্ততা:</strong>
              <span className="text-gray-600">কমিউনিটি নোটিশ, আয়োজন ও ইভেন্টে স্বতঃস্ফূর্তভাবে অংশগ্রহণ করুন।</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center space-y-4 pt-4">
        <h3 className="text-xl font-bold text-[#111111]">আপনিও কি হতে চান মুখে ল পরিবারের একজন?</h3>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('register')}
            className="px-6 py-3.5 bg-[#F52E68] hover:bg-[#D91F57] text-white font-bold text-xs rounded-xl shadow-hard-pink cursor-pointer"
          >
            সদস্য হতে আবেদন করুন
          </button>
          <button
            onClick={onOpenPayment}
            className="px-6 py-3.5 bg-white hover:bg-[#F7F5F5] text-[#111111] font-bold text-xs rounded-xl border border-[#EAE6E7] cursor-pointer"
          >
            তহবিলে অনুদান প্রদান
          </button>
        </div>
      </div>
    </div>
  );
}
