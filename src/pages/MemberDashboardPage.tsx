import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { PaymentRecord, Notice, CommunityEvent } from '../types';
import { BANGLADESH_DISTRICTS, ALL_DISTRICT_NAMES } from '../data/bangladeshGeo';
import {
  User,
  Users,
  Bell,
  Calendar,
  LogOut,
  Edit3,
  Shield,
  Instagram,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Save,
  X,
  CreditCard,
  MapPin,
  BadgeCheck,
  FileCheck,
  UploadCloud,
  Flame,
} from 'lucide-react';

interface MemberDashboardPageProps {
  onNavigate: (tab: string, itemData?: any) => void;
  onOpenPayment: () => void;
}

export function MemberDashboardPage({ onNavigate, onOpenPayment }: MemberDashboardPageProps) {
  const { member, logout, refreshMember, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'payments' | 'badge'>('profile');
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editFullName, setEditFullName] = useState(member?.full_name || '');
  const [editPhone, setEditPhone] = useState(member?.phone_number || '');
  const [editDistrict, setEditDistrict] = useState(member?.district || '');
  const [editUpazila, setEditUpazila] = useState(member?.upazila || '');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Document Verification State
  const [docType, setDocType] = useState('জাতীয় পরিচয়পত্র (NID)');
  const [docFileUrl, setDocFileUrl] = useState('');
  const [docSubmitting, setDocSubmitting] = useState(false);
  const [docSuccess, setDocSuccess] = useState('');
  const [docError, setDocError] = useState('');

  useEffect(() => {
    if (member) {
      setEditFullName(member.full_name);
      setEditPhone(member.phone_number || '');
      setEditDistrict(member.district || '');
      setEditUpazila(member.upazila || '');
    }

    async function loadDashboardExtras() {
      try {
        const payRes = await api.getPayments().catch(() => []);
        setPayments(payRes);
      } catch (err) {
        console.error(err);
      }
    }
    loadDashboardExtras();
  }, [member]);

  if (!member) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <p className="text-sm text-gray-500 mb-4">অনুগ্রহ করে প্রথমে লগইন করুন।</p>
        <button
          onClick={() => onNavigate('login')}
          className="px-6 py-2.5 bg-[#F52E68] text-white font-bold text-xs rounded-xl cursor-pointer"
        >
          লগইন পেজে যান
        </button>
      </div>
    );
  }

  const editAvailableUpazilas = editDistrict && BANGLADESH_DISTRICTS[editDistrict]
    ? BANGLADESH_DISTRICTS[editDistrict].upazilas
    : [];

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');

    if (!editFullName.trim()) {
      setEditError('আপনার নাম খালি রাখা যাবে না।');
      return;
    }

    setIsSaving(true);
    try {
      const divName = editDistrict && BANGLADESH_DISTRICTS[editDistrict]
        ? BANGLADESH_DISTRICTS[editDistrict].division
        : member.division;

      const res = await api.updateProfile(member.id, {
        full_name: editFullName.trim(),
        phone_number: editPhone.trim(),
        district: editDistrict,
        upazila: editUpazila,
        thana: editUpazila,
        division: divName,
      });

      if (res.success) {
        await refreshMember();
        setEditSuccess('প্রোফাইল তথ্য সফলভাবে হালনাগাদ করা হয়েছে!');
        setTimeout(() => {
          setIsEditing(false);
          setEditSuccess('');
        }, 1500);
      }
    } catch (err: any) {
      setEditError(err.message || 'হালনাগাদ করা সম্ভব হয়নি।');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDocFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setDocFileUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDocError('');
    setDocSuccess('');

    if (!docFileUrl) {
      setDocError('অনুগ্রহ করে ডকুমেন্টের ছবি বা ফাইল নির্বাচন করুন।');
      return;
    }

    setDocSubmitting(true);
    try {
      const res = await api.submitDocument(member.id, {
        document_type: docType,
        document_url: docFileUrl,
      });

      if (res.success) {
        setDocSuccess(res.message);
        await refreshMember();
      }
    } catch (err: any) {
      setDocError(err.message || 'ডকুমেন্ট জমা দেওয়া সম্ভব হয়নি।');
    } finally {
      setDocSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Personalized Welcome Banner with Membership Badge */}
      <div className="bg-[#111111] text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden border border-neutral-800 shadow-xl mb-10">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#F52E68]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-white/80 shadow-lg bg-neutral-900">
                <img
                  src={member.profile_image_url || '/assets/aistudio/E4C57373-4D34-4620-B487-D44F42FFFC21_a7498b63.png'}
                  alt={member.nickname}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Verified Membership Badge Icon */}
              {member.is_verified ? (
                <div
                  className="absolute -bottom-2 -right-2 bg-[#F52E68] text-white p-1 rounded-full border-2 border-[#111111] shadow-md flex items-center justify-center"
                  title="ভেরিফাইড মেম্বারশিপ ব্যাজ"
                >
                  <BadgeCheck className="w-5 h-5 fill-white text-[#F52E68]" />
                </div>
              ) : (
                <div
                  className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full border-2 border-[#111111]"
                  title="সক্রিয় সদস্য"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
                  <span>স্বাগতম, {member.nickname}!</span>
                  {member.is_verified && (
                    <span title="ভেরিফাইড মেম্বার">
                      <BadgeCheck className="w-6 h-6 text-[#F52E68] fill-[#F52E68]/20 shrink-0" />
                    </span>
                  )}
                </h1>

                {member.role === 'owner_admin' ? (
                  <span className="text-[10px] font-bold text-white bg-[#F52E68] px-2.5 py-0.5 rounded-full">
                    প্রধান প্রতিষ্ঠাতা ও প্রশাসক
                  </span>
                ) : member.role === 'admin' ? (
                  <span className="text-[10px] font-bold text-black bg-white px-2.5 py-0.5 rounded-full">
                    প্রশাসক
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-neutral-300 bg-neutral-800 px-2.5 py-0.5 rounded-full">
                    সদস্য
                  </span>
                )}

                {member.is_verified && (
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3 text-emerald-400" />
                    <span>ভেরিফাইড ব্যাজ</span>
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-neutral-400 font-medium">
                {member.full_name} · সদস্য আইডি: <span className="font-mono text-white">{member.member_id}</span>
              </p>

              {/* Geographic location */}
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-neutral-300 pt-1">
                <MapPin className="w-3.5 h-3.5 text-[#F52E68]" />
                <span>
                  {member.upazila ? `${member.upazila}, ` : ''}{member.district || 'জেলা নির্ধারিত হয়নি'}
                  {member.division ? ` (${member.division} বিভাগ)` : ''}
                </span>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-neutral-400">
                <span className="flex items-center gap-1 font-mono">
                  <Instagram className="w-3.5 h-3.5 text-[#F52E68]" />
                  <span>@{member.instagram_username}</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>যুক্ত হয়েছেন: {new Date(member.created_at).toLocaleDateString('bn-BD', { month: 'short', year: 'numeric' })}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-neutral-700 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>প্রোফাইল পরিবর্তন</span>
            </button>
            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className="px-4 py-2 bg-[#F52E68] hover:bg-[#D91F57] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>অ্যাডমিন ড্যাশবোর্ড</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar Menu + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Dashboard Menu */}
        <div className="lg:col-span-1 space-y-2">
          <div className="bg-white rounded-2xl border border-[#EAE6E7] p-2 space-y-1 shadow-sm">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full px-4 py-3 text-left text-xs font-bold rounded-xl flex items-center gap-3 transition-colors cursor-pointer ${
                activeTab === 'profile' ? 'bg-[#F52E68]/10 text-[#F52E68]' : 'text-gray-700 hover:bg-[#F7F5F5]'
              }`}
            >
              <User className="w-4 h-4" />
              <span>আমার প্রোফাইল</span>
            </button>

            <button
              onClick={() => setActiveTab('badge')}
              className={`w-full px-4 py-3 text-left text-xs font-bold rounded-xl flex items-center gap-3 transition-colors cursor-pointer ${
                activeTab === 'badge' ? 'bg-[#F52E68]/10 text-[#F52E68]' : 'text-gray-700 hover:bg-[#F7F5F5]'
              }`}
            >
              <BadgeCheck className="w-4 h-4 text-[#F52E68]" />
              <span>মেম্বারশিপ ব্যাজ ভেরিফিকেশন</span>
            </button>

            <button
              onClick={() => onNavigate('activities')}
              className="w-full px-4 py-3 text-left text-xs font-bold text-gray-700 hover:bg-[#F7F5F5] rounded-xl flex items-center gap-3 transition-colors cursor-pointer"
            >
              <Flame className="w-4 h-4 text-[#F52E68]" />
              <span>মেম্বারদের কর্মকাণ্ডসমূহ</span>
            </button>

            <button
              onClick={() => onNavigate('members')}
              className="w-full px-4 py-3 text-left text-xs font-bold text-gray-700 hover:bg-[#F7F5F5] rounded-xl flex items-center gap-3 transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>সদস্যবৃন্দ</span>
            </button>

            <button
              onClick={() => onNavigate('fund')}
              className="w-full px-4 py-3 text-left text-xs font-bold text-gray-700 hover:bg-[#F7F5F5] rounded-xl flex items-center gap-3 transition-colors cursor-pointer"
            >
              <HeartHandshake className="w-4 h-4 text-[#F52E68]" />
              <span>তহবিল অনুদান ইতিহাস</span>
            </button>

            <button
              onClick={() => onNavigate('notices')}
              className="w-full px-4 py-3 text-left text-xs font-bold text-gray-700 hover:bg-[#F7F5F5] rounded-xl flex items-center gap-3 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span>নোটিশ বোর্ড</span>
            </button>

            <button
              onClick={() => onNavigate('events')}
              className="w-full px-4 py-3 text-left text-xs font-bold text-gray-700 hover:bg-[#F7F5F5] rounded-xl flex items-center gap-3 transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>ইভেন্টস</span>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`w-full px-4 py-3 text-left text-xs font-bold rounded-xl flex items-center gap-3 transition-colors cursor-pointer ${
                activeTab === 'payments' ? 'bg-[#F52E68]/10 text-[#F52E68]' : 'text-gray-700 hover:bg-[#F7F5F5]'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>আমার পেমেন্ট ইতিহাস</span>
            </button>

            <div className="pt-2 border-t border-[#EAE6E7]">
              <button
                onClick={() => logout()}
                className="w-full px-4 py-3 text-left text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-3 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>লগআউট</span>
              </button>
            </div>
          </div>

          {/* Contribution box */}
          <div className="p-5 bg-gradient-to-br from-[#F52E68]/10 to-[#F52E68]/5 border border-[#F52E68]/20 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#F52E68]">
              <HeartHandshake className="w-4 h-4" />
              <span>কমিউনিটি ফান্ড</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              মুখে ল-এর সকল আয়োজন সদস্যদের অবদানে পরিচালিত হয়। নম্বর: ০১৭১৬১৬৩৮৪০
            </p>
            <button
              onClick={onOpenPayment}
              className="w-full py-2.5 bg-[#F52E68] hover:bg-[#D91F57] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
            >
              তহবিলে অনুদান দিন
            </button>
          </div>
        </div>

        {/* Right Dashboard Content */}
        <div className="lg:col-span-3 space-y-8">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl border border-[#EAE6E7] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#EAE6E7]">
                <div>
                  <h2 className="text-lg font-bold text-[#111111]">ব্যক্তিগত প্রোফাইল বিবরণ</h2>
                  <p className="text-xs text-gray-500">আপনার সংরক্ষিত ও ভেরিফাইড তথ্য</p>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3.5 py-1.5 bg-[#F7F5F5] hover:bg-[#EAE6E7] text-xs font-bold rounded-xl border border-[#EAE6E7] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>তথ্য সম্পাদনা</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="p-4 rounded-2xl bg-[#F7F5F5] border border-[#EAE6E7]">
                  <span className="text-gray-400 block mb-1">পূর্ণ নাম</span>
                  <span className="text-sm font-bold text-[#111111]">{member.full_name}</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#F7F5F5] border border-[#EAE6E7]">
                  <span className="text-gray-400 block mb-1">গ্রুপ নিকনেম (লগইন আইডি)</span>
                  <span className="text-sm font-bold text-[#F52E68] flex items-center gap-1.5">
                    <span>{member.nickname}</span>
                    {member.is_verified && <BadgeCheck className="w-4 h-4 text-[#F52E68]" />}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#F7F5F5] border border-[#EAE6E7]">
                  <span className="text-gray-400 block mb-1">ইনস্টাগ্রাম ইউজারনেম</span>
                  <a
                    href={`https://instagram.com/${member.instagram_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-mono font-bold text-[#111111] hover:text-[#F52E68] flex items-center gap-1"
                  >
                    <span>@{member.instagram_username}</span>
                  </a>
                </div>

                <div className="p-4 rounded-2xl bg-[#F7F5F5] border border-[#EAE6E7]">
                  <span className="text-gray-400 block mb-1">সদস্য আইডি</span>
                  <span className="text-sm font-mono font-bold text-[#111111]">{member.member_id}</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#F7F5F5] border border-[#EAE6E7]">
                  <span className="text-gray-400 block mb-1">অবস্থান (জেলা ও উপজেলা)</span>
                  <span className="text-sm font-bold text-gray-800 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-[#F52E68]" />
                    <span>
                      {member.upazila ? `${member.upazila}, ` : ''}{member.district || 'জেলা নির্ধারিত হয়নি'}
                      {member.division ? ` (${member.division} বিভাগ)` : ''}
                    </span>
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#F7F5F5] border border-[#EAE6E7]">
                  <span className="text-gray-400 block mb-1">মেম্বারশিপ ভেরিফিকেশন ব্যাজ</span>
                  {member.is_verified ? (
                    <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                      <BadgeCheck className="w-4 h-4 text-emerald-600" />
                      <span>ভেরিফাইড ব্যাজ সক্রিয়</span>
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-amber-600 flex items-center gap-1.5">
                      <span>ডকুমেন্ট আনভেরিফাইড</span>
                      <button
                        onClick={() => setActiveTab('badge')}
                        className="text-[11px] underline text-[#F52E68] font-bold ml-1 cursor-pointer"
                      >
                        ব্যাজ পান →
                      </button>
                    </span>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-[#F7F5F5] border border-[#EAE6E7]">
                  <span className="text-gray-400 block mb-1">ইমেইল এড্রেস</span>
                  <span className="text-sm font-mono font-bold text-[#111111] truncate block">
                    {member.email || 'উল্লেখ নেই'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#F7F5F5] border border-[#EAE6E7]">
                  <span className="text-gray-400 block mb-1">ফোন নম্বর (ঐচ্ছিক)</span>
                  <span className="text-sm font-mono font-bold text-gray-800">
                    {member.phone_number || 'উল্লেখ করা হয়নি'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#F7F5F5] border border-[#EAE6E7]">
                  <span className="text-gray-400 block mb-1">অ্যাকাউন্ট স্ট্যাটাস</span>
                  <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> সক্রিয় (Active)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Membership Badge Submission Tab */}
          {activeTab === 'badge' && (
            <div className="bg-white rounded-3xl border border-[#EAE6E7] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#EAE6E7]">
                <div>
                  <h2 className="text-lg font-bold text-[#111111]">মেম্বারশিপ ভেরিফাইড ব্যাজ সিস্টেম</h2>
                  <p className="text-xs text-gray-500">আপনার পরিচিতি নিশ্চিত করে ভেরিফাইড চেকমার্ক ব্যাজ অর্জন করুন</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#F52E68]/10 text-[#F52E68] flex items-center justify-center">
                  <BadgeCheck className="w-6 h-6" />
                </div>
              </div>

              {member.is_verified ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <BadgeCheck className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h3 className="text-base font-bold text-emerald-900">
                    অভিনন্দন! আপনার প্রোফাইলে ভেরিফাইড মেম্বারশিপ ব্যাজ সক্রিয় রয়েছে
                  </h3>
                  <p className="text-xs text-emerald-700 max-w-md mx-auto">
                    আপনার মেম্বার কার্ড ও প্রোফাইলে ভেরিফাইড ব্লু/পিঙ্ক চেকমার্ক আইকন প্রদর্শিত হচ্ছে। মুখে ল পরিবারের একজন নির্ভরযোগ্য সদস্য হিসেবে আপনার বিশেষ মর্যাদা রয়েছে।
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                    <strong className="block text-sm">কেন মেম্বারশিপ ব্যাজ প্রয়োজন?</strong>
                    <p className="leading-relaxed">
                      মেম্বারশিপ ব্যাজধারী সদস্যদের পরিচয় সম্পূর্ণ সুরক্ষিত ও বিশ্বস্ত হিসেবে গণ্য করা হয়। ব্যাজ পেতে আপনার যেকোনো একটি সরকারি বা শিক্ষাপ্রতিষ্ঠানের পরিচয়পত্রের ছবি আপলোড করুন।
                    </p>
                  </div>

                  {docError && (
                    <div className="p-3.5 rounded-xl bg-red-50 text-red-600 text-xs font-semibold">
                      {docError}
                    </div>
                  )}

                  {docSuccess && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold">
                      {docSuccess}
                    </div>
                  )}

                  <form onSubmit={handleDocSubmit} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        ডকুমেন্টের ধরন নির্বাচন করুন
                      </label>
                      <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl outline-none"
                      >
                        <option value="জাতীয় পরিচয়পত্র (NID)">জাতীয় পরিচয়পত্র (NID Card)</option>
                        <option value="শিক্ষার্থী আইডি কার্ড">শিক্ষার্থী আইডি কার্ড (Student ID)</option>
                        <option value="পাসপোর্ট / জন্ম সনদ">পাসপোর্ট অথবা জন্ম নিবন্ধন সনদ</option>
                        <option value="ড্রাইভিং লাইসেন্স">ড্রাইভিং লাইসেন্স</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        ডকুমেন্টের স্পষ্ট ছবি আপলোড করুন
                      </label>
                      <label className="border-2 border-dashed border-[#EAE6E7] hover:border-[#F52E68] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-[#F7F5F5] transition-colors">
                        <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="font-bold text-gray-700">ফাইল নির্বাচন করতে এখানে ক্লিক করুন</span>
                        <span className="text-[11px] text-gray-400 mt-0.5">JPG, PNG বা স্ক্যান কপি</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleDocFileUpload}
                          className="hidden"
                          required
                        />
                      </label>

                      {docFileUrl && (
                        <div className="mt-3 p-3 bg-white border border-[#EAE6E7] rounded-xl flex items-center gap-3">
                          <img src={docFileUrl} alt="ডকুমেন্ট প্রিভিউ" className="w-12 h-12 object-cover rounded-lg" />
                          <span className="font-semibold text-emerald-600 text-[11px]">ডকুমেন্ট ফাইল লোড হয়েছে</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={docSubmitting}
                      className="w-full py-3.5 bg-[#F52E68] hover:bg-[#D91F57] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm text-xs"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>{docSubmitting ? 'যাচাইয়ের জন্য পাঠানো হচ্ছে...' : 'ডকুমেন্ট সাবমিট করে ব্যাজ সক্রিয় করুন'}</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="bg-white rounded-3xl border border-[#EAE6E7] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#EAE6E7]">
                <div>
                  <h2 className="text-lg font-bold text-[#111111]">আমার পেমেন্ট ও অবদান রেকর্ড</h2>
                  <p className="text-xs text-gray-500">আপনার অনুদানের বিস্তারিত ইতিহাস</p>
                </div>
                <button
                  onClick={onOpenPayment}
                  className="px-3.5 py-1.5 bg-[#F52E68] text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  + নতুন অনুদান
                </button>
              </div>

              {payments.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs">
                  কোনো লেনদেনের তথ্য পাওয়া যায়নি।
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl bg-[#F7F5F5] border border-[#EAE6E7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#111111]">৳{p.amount}</span>
                          <span className="text-gray-400">·</span>
                          <span className="font-semibold text-gray-700">{p.purpose}</span>
                        </div>
                        <div className="text-gray-400 mt-1 font-mono text-[11px]">
                          আইডি: {p.transaction_id} · মাধ্যম: {p.method.toUpperCase()}
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-bold px-2.5 py-1 rounded-full text-[11px] ${
                            p.status === 'verified'
                              ? 'bg-emerald-50 text-emerald-700'
                              : p.status === 'rejected'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {p.status === 'verified' ? 'অনুমোদিত ও ভেরিফাইড' : p.status === 'rejected' ? 'বাতিল' : 'পেন্ডিং'}
                        </span>
                        <div className="text-gray-400 text-[10px] mt-1">
                          {new Date(p.created_at).toLocaleDateString('bn-BD')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal (including Location) */}
      {isEditing && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#EAE6E7] z-10">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#111111] mb-1">প্রোফাইল ও অবস্থান সম্পাদনা</h3>
            <p className="text-xs text-gray-500 mb-5">নাম, ফোন ও জেলা/উপজেলা পরিবর্তন করুন</p>

            {editError && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-600 text-xs">{editError}</div>
            )}
            {editSuccess && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-50 text-emerald-600 text-xs">{editSuccess}</div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">আপনার পূর্ণ নাম</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl focus:border-[#F52E68] focus:bg-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">ফোন নম্বর</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3.5 py-2.5 bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl focus:border-[#F52E68] focus:bg-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">জেলা</label>
                <select
                  value={editDistrict}
                  onChange={(e) => {
                    setEditDistrict(e.target.value);
                    setEditUpazila('');
                  }}
                  className="w-full px-3.5 py-2.5 bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl outline-none"
                >
                  <option value="">-- জেলা নির্বাচন করুন --</option>
                  {ALL_DISTRICT_NAMES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">উপজেলা / থানা</label>
                <select
                  value={editUpazila}
                  onChange={(e) => setEditUpazila(e.target.value)}
                  disabled={!editDistrict}
                  className="w-full px-3.5 py-2.5 bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl outline-none disabled:bg-gray-100"
                >
                  <option value="">-- উপজেলা / থানা নির্বাচন করুন --</option>
                  {editAvailableUpazilas.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3 bg-[#F52E68] hover:bg-[#D91F57] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'সংরক্ষণ করা হচ্ছে...' : 'তথ্য সংরক্ষণ করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
