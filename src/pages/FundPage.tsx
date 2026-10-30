import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { PaymentRecord } from '../types';
import { HeartHandshake, ShieldCheck, Sparkles, TrendingUp, Calendar, Heart, RefreshCw } from 'lucide-react';

interface FundPageProps {
  onOpenPayment: () => void;
}

export function FundPage({ onOpenPayment }: FundPageProps) {
  const [donations, setDonations] = useState<PaymentRecord[]>([]);
  const [totalFund, setTotalFund] = useState<number>(0);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchFundData = async () => {
    setLoading(true);
    try {
      const data = await api.getPublicPayments();
      setTotalFund(data.total_fund);
      setCount(data.count);
      setDonations(data.donations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFundData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F52E68]/10 text-xs font-bold text-[#F52E68] uppercase tracking-wider border border-[#F52E68]/20">
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>উন্মুক্ত ও স্বচ্ছ তহবিল খতিয়ান</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111111] tracking-tight">
          মুখে ল কমিউনিটি ফান্ড ও অনুদান ইতিহাস
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed max-w-2xl mx-auto">
          আমাদের কমিউনিটির প্রতিটি আয়োজন, সাহিত্য ও ক্রিয়েটিভ ইভেন্ট, দরিদ্র সহযোদ্ধাদের পাশে দাঁড়ানো ও প্ল্যাটফর্মের কারিগরি উন্নয়ন এই তহবিলের সহায়তায় পরিচালিত হয়। এখানে প্রতিটি অনুদান উন্মুক্তভাবে সংরক্ষিত।
        </p>
      </div>

      {/* Fund Overview Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111111] text-white rounded-3xl p-6 sm:p-8 border border-neutral-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-[#F52E68]/20 rounded-full blur-2xl pointer-events-none" />
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#F52E68]">
              সর্বমোট সংগৃহীত তহবিল
            </span>
            <div className="text-4xl sm:text-5xl font-mono font-extrabold text-white mt-2 tabular-nums">
              ৳{totalFund.toLocaleString('bn-BD')}
            </div>
            <p className="text-xs text-neutral-400 mt-2">
              ভেরিফাইড ও অনুমোদিত অনুদানের সমষ্টি
            </p>
          </div>
          <div className="pt-6 mt-6 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
            <span>অফিশিয়াল হিসাব</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> শতভাগ স্বচ্ছ
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE6E7] shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
              মোট অনুদানকারী সংখ্যা
            </span>
            <div className="text-4xl sm:text-5xl font-mono font-extrabold text-[#111111] mt-2 tabular-nums">
              {count} জন
            </div>
            <p className="text-xs text-gray-500 mt-2">
              কমিউনিটি তহবিলে অংশগ্রহণকারী সদস্য ও শুভাকাঙ্ক্ষী
            </p>
          </div>
          <div className="pt-6 mt-6 border-t border-[#EAE6E7] flex items-center justify-between text-xs text-gray-500">
            <span>নম্বর: ০১৭১৬১৬৩৮৪০</span>
            <span className="text-[#F52E68] font-bold">বিকাশ / নগদ / রকেট</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#F52E68] to-[#D91F57] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold">
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>সহমর্মিতার উদ্যোগ</span>
            </div>
            <h3 className="text-2xl font-bold mt-3">আপনিও কি অবদান রাখতে চান?</h3>
            <p className="text-xs text-white/90 mt-1 leading-relaxed">
              যেকোনো পরিমাণের আর্থিক অনুদান আমাদের কমিউনিটিকে আরও শক্তিশালী করে।
            </p>
          </div>
          <button
            onClick={onOpenPayment}
            className="w-full mt-6 py-3.5 bg-white text-[#111111] hover:bg-neutral-100 font-extrabold text-xs rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <HeartHandshake className="w-4 h-4 text-[#F52E68]" />
            <span>অনুদানের বিবরণ দিন</span>
          </button>
        </div>
      </div>

      {/* Transparent Ledger Table */}
      <div className="bg-white rounded-3xl border border-[#EAE6E7] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-[#111111]">অনুমোদিত অনুদানকারীদের পূর্ণ তালিকা</h2>
            <p className="text-xs text-gray-500">
              সকল অনুমোদিত অনুদানের স্বচ্ছ ও সরাসরি প্রদর্শন
            </p>
          </div>
          <button
            onClick={fetchFundData}
            disabled={loading}
            className="self-start sm:self-auto px-4 py-2 bg-[#F7F5F5] hover:bg-[#EAE6E7] text-[#111111] text-xs font-bold rounded-xl border border-[#EAE6E7] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>তালিকা রিফ্রেশ</span>
          </button>
        </div>

        {loading ? (
          <div className="space-y-3 py-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-[#F7F5F5] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : donations.length === 0 ? (
          <div className="text-center py-16 text-gray-500 bg-[#F7F5F5] rounded-2xl border border-[#EAE6E7] p-6">
            <HeartHandshake className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <h3 className="text-base font-bold text-[#111111]">এখনও কোনো অনুমোদিত অনুদান নেই</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              কমিউনিটি তহবিলে আপনার পছন্দের মাধ্যমে (বিকাশ, নগদ বা রকেট) অনুদান পাঠিয়ে প্রথম অবদানকারী হোন।
            </p>
            <button
              onClick={onOpenPayment}
              className="mt-4 px-6 py-2.5 bg-[#F52E68] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
            >
              তহবিলে প্রথম অবদান রাখুন
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EAE6E7] text-gray-400">
                  <th className="pb-3 font-semibold">অনুদানকারী</th>
                  <th className="pb-3 font-semibold">পরিমাণ</th>
                  <th className="pb-3 font-semibold">পেমেন্ট মাধ্যম</th>
                  <th className="pb-3 font-semibold">উদ্দেশ্য</th>
                  <th className="pb-3 font-semibold">ট্রানজেকশন আইডি</th>
                  <th className="pb-3 font-semibold text-right">তারিখ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE6E7]">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-[#F7F5F5] transition-colors">
                    <td className="py-4">
                      <div className="font-bold text-[#111111] text-sm">{d.donor_name}</div>
                      {d.member_nickname && (
                        <div className="text-[10px] text-[#F52E68] font-semibold">
                          নিকনেম: {d.member_nickname}
                        </div>
                      )}
                    </td>
                    <td className="py-4 font-mono font-extrabold text-[#F52E68] text-sm">
                      ৳{d.amount.toLocaleString('bn-BD')}
                    </td>
                    <td className="py-4">
                      <span className="uppercase font-bold text-xs bg-white border border-[#EAE6E7] px-2.5 py-1 rounded-md text-gray-800">
                        {d.method}
                      </span>
                    </td>
                    <td className="py-4 font-medium text-gray-700">{d.purpose}</td>
                    <td className="py-4 font-mono text-gray-600 font-semibold">{d.transaction_id}</td>
                    <td className="py-4 text-right text-gray-400">
                      {new Date(d.created_at).toLocaleDateString('bn-BD', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
