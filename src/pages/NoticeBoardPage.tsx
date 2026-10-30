import React, { useState, useEffect } from 'react';
import { Notice } from '../types';
import { api } from '../api';
import { Bell, AlertTriangle, ArrowRight, X, Calendar, Filter, Sparkles } from 'lucide-react';

interface NoticeBoardPageProps {
  initialSelectedNotice?: Notice | null;
  onNavigate: (tab: string) => void;
}

export function NoticeBoardPage({ initialSelectedNotice, onNavigate }: NoticeBoardPageProps) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(initialSelectedNotice || null);
  const [selectedCategory, setSelectedCategory] = useState<string>('সকল');

  const categories = ['সকল', 'সাধারণ', 'জরুরি', 'ইভেন্ট', 'নিয়মাবলী'];

  useEffect(() => {
    async function loadNotices() {
      setLoading(true);
      try {
        const data = await api.getNotices();
        setNotices(data);
        if (initialSelectedNotice) {
          setSelectedNotice(initialSelectedNotice);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadNotices();
  }, [initialSelectedNotice]);

  const filteredNotices = selectedCategory === 'সকল'
    ? notices
    : notices.filter((n) => n.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7F5F5] border border-[#EAE6E7] text-xs font-bold text-[#F52E68] uppercase tracking-wider">
          <Bell className="w-3.5 h-3.5" />
          <span>অফিশিয়াল বুলেটিন</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
          নোটিশ বোর্ড
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          মুখে ল প্ল্যাটফর্মের সকল প্রাতিষ্ঠানিক ঘোষণা, দিকনির্দেশনা ও সিদ্ধান্তসমূহ
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#111111] text-white shadow-sm'
                : 'bg-white text-gray-600 border border-[#EAE6E7] hover:border-gray-400'
            }`}
          >
            {cat} {cat === 'সকল' && `(${notices.length})`}
          </button>
        ))}
      </div>

      {/* Notices Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-[#F7F5F5] rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#EAE6E7] p-8 max-w-md mx-auto">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#111111]">এই ক্যাটাগরিতে কোনো নোটিশ নেই</h3>
          <p className="text-xs text-gray-400 mt-1">অন্য ক্যাটাগরি নির্বাচন করুন।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotices.map((n) => (
            <div
              key={n.id}
              onClick={() => setSelectedNotice(n)}
              className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-lg ${
                n.is_important
                  ? 'bg-red-50/20 border-red-200 hover:border-red-400'
                  : 'bg-white border-[#EAE6E7] hover:border-[#111111]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3 text-xs text-gray-500">
                  <span className="font-bold text-[#111111]">{n.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {new Date(n.created_at).toLocaleDateString('bn-BD', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  {n.is_important && (
                    <span className="ml-auto text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> জরুরি
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-[#111111] group-hover:text-[#F52E68] transition-colors leading-snug">
                  {n.title}
                </h3>

                <p className="text-xs text-gray-600 mt-3 line-clamp-3 leading-relaxed">
                  {n.description}
                </p>
              </div>

              <div className="pt-4 mt-5 border-t border-[#EAE6E7] flex items-center justify-between text-xs font-bold text-[#F52E68]">
                <span>সম্পূর্ণ নোটিশ পড়ুন</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setSelectedNotice(null)} />
          <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#EAE6E7] z-10">
            <button
              onClick={() => setSelectedNotice(null)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
              <span className="font-bold text-[#F52E68]">{selectedNotice.category}</span>
              <span>·</span>
              <span>
                {new Date(selectedNotice.created_at).toLocaleDateString('bn-BD', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              {selectedNotice.is_important && (
                <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded ml-2">
                  জরুরি ঘোষণা
                </span>
              )}
            </div>

            <h2 className="text-2xl font-bold text-[#111111] mb-4 leading-snug">
              {selectedNotice.title}
            </h2>

            {selectedNotice.image_url && (
              <div className="rounded-2xl overflow-hidden mb-6 max-h-72 border border-[#EAE6E7]">
                <img
                  src={selectedNotice.image_url}
                  alt={selectedNotice.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-[#F7F5F5] p-5 rounded-2xl border border-[#EAE6E7]">
              {selectedNotice.description}
            </div>

            <div className="mt-6 pt-4 border-t border-[#EAE6E7] flex justify-between items-center text-xs text-gray-400">
              <span>মুখে ল সেন্ট্রাল অ্যাডমিন কাউন্সিল</span>
              <button
                onClick={() => setSelectedNotice(null)}
                className="px-4 py-2 bg-[#111111] text-white font-bold rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
