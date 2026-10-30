import React, { useState, useEffect } from 'react';
import { Member } from '../types';
import { api } from '../api';
import { Search, Instagram, Users, Shield, X, Calendar, CheckCircle2, BadgeCheck, MapPin, Filter } from 'lucide-react';
import { ALL_DISTRICT_NAMES } from '../data/bangladeshGeo';

interface MembersDirectoryPageProps {
  onNavigate: (tab: string) => void;
}

export function MembersDirectoryPage({ onNavigate }: MembersDirectoryPageProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [search, setSearch] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const fetchMembers = async (query = '', district = '') => {
    setLoading(true);
    try {
      const res = await api.getMembers(query, district);
      setMembers(res.members);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers(search, selectedDistrict);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedDistrict]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7F5F5] border border-[#EAE6E7] text-xs font-bold text-[#F52E68] uppercase tracking-wider">
          <Users className="w-3.5 h-3.5" />
          <span>কমিউনিটি মেম্বারশিপ তালিকা</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
          আমাদের সদস্যবৃন্দ
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          মোট নিবন্ধিত ও সক্রিয় সদস্য: <span className="font-bold text-[#111111]">{total} জন</span>
        </p>
      </div>

      {/* Search & Location Filter Bar */}
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="নিকনেম, নাম, ইনস্টাগ্রাম বা সদস্য আইডি দিয়ে খুঁজুন..."
            className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm bg-white border border-[#EAE6E7] rounded-2xl focus:border-[#F52E68] shadow-sm outline-none transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* District Filter Dropdown */}
        <div className="w-full sm:w-56 shrink-0 relative">
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full px-4 py-3 text-xs sm:text-sm bg-white border border-[#EAE6E7] rounded-2xl focus:border-[#F52E68] shadow-sm outline-none appearance-none cursor-pointer pr-9 font-medium text-gray-700"
          >
            <option value="">সকল জেলা (৬৪ জেলা)</option>
            {ALL_DISTRICT_NAMES.map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>
          <Filter className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Members Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-64 bg-[#F7F5F5] rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#EAE6E7] p-8 max-w-md mx-auto">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#111111]">কোনো সদস্য পাওয়া যায়নি</h3>
          <p className="text-xs text-gray-400 mt-1">ভিন্ন কীওয়ার্ড বা জেলা নির্বাচন করে অনুসন্ধান করুন।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {members.map((m) => (
            <div
              key={m.id}
              onClick={() => setSelectedMember(m)}
              className="bg-white rounded-3xl border border-[#EAE6E7] hover:border-[#111111] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col group"
            >
              {/* Profile Image Viewport */}
              <div className="aspect-square relative overflow-hidden bg-neutral-900">
                <img
                  src={m.profile_image_url || '/assets/aistudio/E4C57373-4D34-4620-B487-D44F42FFFC21_a7498b63.png'}
                  alt={m.nickname}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-75" />

                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  {/* Verified Membership Badge */}
                  {m.is_verified && (
                    <span
                      title="ভেরিফাইড মেম্বারশিপ ব্যাজ"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-emerald-600 px-2 py-0.5 rounded shadow-md"
                    >
                      <BadgeCheck className="w-3 h-3" />
                      <span>ভেরিফাইড</span>
                    </span>
                  )}
                  {m.role === 'owner_admin' ? (
                    <span className="text-[10px] font-bold text-white bg-[#F52E68] px-2 py-0.5 rounded shadow">
                      প্রধান প্রশাসক
                    </span>
                  ) : m.role === 'admin' ? (
                    <span className="text-[10px] font-bold text-black bg-white px-2 py-0.5 rounded shadow">
                      প্রশাসক
                    </span>
                  ) : null}
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-[11px] font-mono font-bold text-[#F52E68] tracking-wider uppercase">
                    {m.member_id}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-lg font-bold text-white truncate leading-tight">
                      {m.nickname}
                    </h3>
                    {m.is_verified && (
                      <span title="ভেরিফাইড মেম্বারশিপ">
                        <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Details */}
              <div className="p-4 flex-1 flex flex-col justify-between bg-white text-xs">
                <div>
                  <div className="font-semibold text-gray-800 truncate">{m.full_name}</div>
                  
                  {/* Location display: district & upazila */}
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-500">
                    <MapPin className="w-3 h-3 text-[#F52E68] shrink-0" />
                    <span className="truncate">
                      {m.district ? `${m.district}${m.upazila ? ` • ${m.upazila}` : ''}` : 'বাংলাদেশ'}
                    </span>
                  </div>

                  <a
                    href={`https://instagram.com/${m.instagram_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1.5 flex items-center gap-1.5 text-gray-500 hover:text-[#F52E68] font-mono text-[11px]"
                  >
                    <Instagram className="w-3 h-3 text-[#F52E68]" />
                    <span>@{m.instagram_username}</span>
                  </a>
                </div>

                <div className="pt-3 mt-3 border-t border-[#EAE6E7] flex items-center justify-between text-[11px] text-gray-400">
                  <span className="flex items-center gap-1">
                    {m.is_verified ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <BadgeCheck className="w-3 h-3" /> ব্যাজ প্রাপ্ত
                      </span>
                    ) : (
                      <span>সদস্য</span>
                    )}
                  </span>
                  <span className="text-[#111111] font-semibold group-hover:text-[#F52E68] transition-colors">
                    প্রোফাইল দেখুন →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setSelectedMember(null)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#EAE6E7] z-10 text-center">
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Avatar */}
            <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-[#111111] mx-auto mb-4 bg-neutral-900 shadow-lg relative">
              <img
                src={selectedMember.profile_image_url || '/assets/aistudio/E4C57373-4D34-4620-B487-D44F42FFFC21_a7498b63.png'}
                alt={selectedMember.nickname}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {selectedMember.is_verified && (
                <div className="absolute bottom-2 right-2 p-1 bg-emerald-600 text-white rounded-full shadow-lg" title="ভেরিফাইড মেম্বার">
                  <BadgeCheck className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5">
                <h3 className="text-2xl font-extrabold text-[#111111]">{selectedMember.nickname}</h3>
                {selectedMember.is_verified && (
                  <span title="ভেরিফাইড মেম্বারশিপ ব্যাজ">
                    <BadgeCheck className="w-5 h-5 text-emerald-600" />
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 font-semibold">{selectedMember.full_name}</p>
            </div>

            {/* Badges */}
            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
              {selectedMember.is_verified && (
                <span className="text-xs font-bold text-white bg-emerald-600 px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  ভেরিফাইড মেম্বারশিপ
                </span>
              )}
              {selectedMember.role === 'owner_admin' ? (
                <span className="text-xs font-bold text-white bg-[#F52E68] px-3 py-1 rounded-full">
                  প্রধান প্রশাসক
                </span>
              ) : selectedMember.role === 'admin' ? (
                <span className="text-xs font-bold text-black bg-[#EAE6E7] px-3 py-1 rounded-full">
                  প্রশাসক
                </span>
              ) : (
                <span className="text-xs font-bold text-gray-700 bg-[#F7F5F5] px-3 py-1 rounded-full border border-[#EAE6E7]">
                  সক্রিয় সদস্য
                </span>
              )}
            </div>

            {/* Details Box */}
            <div className="bg-[#F7F5F5] border border-[#EAE6E7] rounded-2xl p-4 text-left space-y-2.5 text-xs mt-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">সদস্য আইডি:</span>
                <span className="font-mono font-bold text-[#111111]">{selectedMember.member_id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">বিভাগ:</span>
                <span className="font-semibold text-gray-800">{selectedMember.division || '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">জেলা:</span>
                <span className="font-semibold text-[#111111]">{selectedMember.district || '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">উপজেলা / থানা:</span>
                <span className="font-semibold text-gray-800">{selectedMember.upazila || '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">ইনস্টাগ্রাম:</span>
                <a
                  href={`https://instagram.com/${selectedMember.instagram_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono font-semibold text-[#F52E68] hover:underline"
                >
                  @{selectedMember.instagram_username}
                </a>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">যোগদানের তারিখ:</span>
                <span className="font-semibold text-gray-700">
                  {new Date(selectedMember.created_at).toLocaleDateString('bn-BD', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">মেম্বারশিপ ব্যাজ:</span>
                <span className={`font-bold flex items-center gap-1 ${selectedMember.is_verified ? 'text-emerald-600' : 'text-gray-500'}`}>
                  {selectedMember.is_verified ? (
                    <>
                      <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                      ভেরিফাইড ব্যাজ অনুমোদিত
                    </>
                  ) : (
                    <>ডকুমেন্ট যাচাই অপেক্ষারত</>
                  )}
                </span>
              </div>
            </div>

            <div className="mt-6 text-center text-[11px] text-gray-400">
              🔒 সদস্যদের ব্যক্তিগত ফোন ও পিন গোপনীয়তার স্বার্থে সংরক্ষিত রাখা হয়।
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
