import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import {
  Member,
  Notice,
  CommunityEvent,
  Idol,
  WebsiteSettings,
  PaymentRecord,
  CommunityStats,
} from '../types';
import {
  Shield,
  Users,
  Bell,
  Calendar,
  Sparkles,
  Settings,
  Search,
  Key,
  UserX,
  UserCheck,
  Trash2,
  Edit2,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  X,
  CreditCard,
  Send,
  Lock,
  Copy,
  BadgeCheck,
  MapPin,
  Filter,
  Check,
  XCircle,
  FileText,
  ExternalLink,
} from 'lucide-react';
import {
  DIVISIONS_AND_DISTRICTS,
  DISTRICTS_DATA,
} from '../data/bangladeshGeo';

interface AdminDashboardPageProps {
  onNavigate: (tab: string) => void;
}

export function AdminDashboardPage({ onNavigate }: AdminDashboardPageProps) {
  const { member, isAdmin, isOwnerAdmin } = useAuth();

  // Tab navigation
  const [currentSection, setCurrentSection] = useState<
    'overview' | 'members' | 'notices' | 'events' | 'idols' | 'settings' | 'broadcast' | 'payments'
  >('overview');

  // Stats & Data
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [membersList, setMembersList] = useState<Member[]>([]);
  const [noticesList, setNoticesList] = useState<Notice[]>([]);
  const [eventsList, setEventsList] = useState<CommunityEvent[]>([]);
  const [idolsList, setIdolsList] = useState<Idol[]>([]);
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings | null>(null);
  const [regEnabled, setRegEnabled] = useState<boolean>(true);
  const [paymentsList, setPaymentsList] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Search & Location filters in members
  const [memberSearch, setMemberSearch] = useState<string>('');
  const [filterDivision, setFilterDivision] = useState<string>('');
  const [filterDistrict, setFilterDistrict] = useState<string>('');
  const [filterUpazila, setFilterUpazila] = useState<string>('');

  // Processing state IDs
  const [badgeUpdatingId, setBadgeUpdatingId] = useState<string | null>(null);
  const [paymentUpdatingId, setPaymentUpdatingId] = useState<string | null>(null);

  // Document preview modal
  const [selectedDocPreview, setSelectedDocPreview] = useState<{
    name: string;
    url: string;
    type?: string;
  } | null>(null);

  // Reset PIN modal state
  const [resetPinResult, setResetPinResult] = useState<{
    member_id: string;
    nickname: string;
    new_pin: string;
  } | null>(null);
  const [copiedPin, setCopiedPin] = useState(false);

  // Notice Form Modal
  const [editingNotice, setEditingNotice] = useState<Partial<Notice> | null>(null);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);

  // Event Form Modal
  const [editingEvent, setEditingEvent] = useState<Partial<CommunityEvent> | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // Idol Edit Modal
  const [editingIdol, setEditingIdol] = useState<Idol | null>(null);

  // Notification Broadcast Form
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState<'info' | 'alert' | 'success'>('info');

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        statsData,
        membersData,
        noticesData,
        eventsData,
        idolsData,
        settingsData,
        paymentsData,
        statusData,
      ] = await Promise.all([
        api.getStats().catch(() => null),
        api.getAdminMembers().catch(() => []),
        api.getNotices().catch(() => []),
        api.getEvents().catch(() => []),
        api.getIdols().catch(() => []),
        api.getSettings().catch(() => null),
        api.getPayments().catch(() => []),
        api.getStatus().catch(() => null),
      ]);

      if (statsData) setStats(statsData);
      setMembersList(membersData);
      setNoticesList(noticesData);
      setEventsList(eventsData);
      setIdolsList(idolsData);
      if (settingsData) setWebsiteSettings(settingsData);
      if (statusData) setRegEnabled(statusData.registration_enabled);
      setPaymentsList(paymentsData);
    } catch (err: any) {
      setErrorMessage('ডাটা লোড করতে সমস্যা হয়েছে: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#111111]">প্রবেশাধিকার সংরক্ষিত</h2>
        <p className="text-xs text-gray-500 mt-2">
          এই ড্যাশবোর্ডটি শুধুমাত্র অনুমোদিত প্রশাসকদের জন্য উন্মুক্ত।
        </p>
        <button
          onClick={() => onNavigate('home')}
          className="mt-6 px-6 py-2.5 bg-[#111111] text-white text-xs font-bold rounded-xl cursor-pointer"
        >
          হোমপেজে ফিরুন
        </button>
      </div>
    );
  }

  // Handle Division change
  const handleDivisionChange = (div: string) => {
    setFilterDivision(div);
    setFilterDistrict('');
    setFilterUpazila('');
  };

  // Handle District change
  const handleDistrictChange = (dist: string) => {
    setFilterDistrict(dist);
    setFilterUpazila('');
  };

  // Available districts based on division selection
  const availableDistricts = filterDivision
    ? DIVISIONS_AND_DISTRICTS[filterDivision] || []
    : Object.values(DIVISIONS_AND_DISTRICTS).flat();

  // Available upazilas based on district selection
  const availableUpazilas = filterDistrict ? DISTRICTS_DATA[filterDistrict] || [] : [];

  // Filter members list by search & location
  const filteredMembers = membersList.filter((m) => {
    const s = memberSearch.trim().toLowerCase();
    const matchSearch =
      !s ||
      m.nickname.toLowerCase().includes(s) ||
      m.full_name.toLowerCase().includes(s) ||
      m.member_id.toLowerCase().includes(s) ||
      m.instagram_username.toLowerCase().includes(s) ||
      (m.district && m.district.toLowerCase().includes(s)) ||
      (m.upazila && m.upazila.toLowerCase().includes(s));

    const matchDivision = !filterDivision || m.division === filterDivision;
    const matchDistrict = !filterDistrict || m.district === filterDistrict;
    const matchUpazila = !filterUpazila || m.upazila === filterUpazila;

    return matchSearch && matchDivision && matchDistrict && matchUpazila;
  });

  // Toggle Member Badge
  const handleToggleBadge = async (id: string, currentBadge: boolean) => {
    setBadgeUpdatingId(id);
    try {
      const res = await api.toggleMemberBadge(id, !currentBadge);
      if (res.success) {
        setMembersList((prev) =>
          prev.map((m) => (m.id === id ? { ...m, is_verified: res.member.is_verified } : m))
        );
        setActionMessage(
          `সদস্যের ভেরিফাইড মেম্বারশিপ ব্যাজ ${res.member.is_verified ? 'অনুমোদিত' : 'বাতিল'} করা হয়েছে।`
        );
        setTimeout(() => setActionMessage(''), 3000);
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setBadgeUpdatingId(null);
    }
  };

  // Member status toggle (Active/Suspended)
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await api.updateMemberStatus(id, nextStatus as any);
      if (res.success) {
        setMembersList((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status: nextStatus as any } : m))
        );
        setActionMessage(
          `সদস্যের স্ট্যাটাস পরিবর্তন করে "${nextStatus === 'active' ? 'সক্রিয়' : 'স্থগিত'}" করা হয়েছে।`
        );
        setTimeout(() => setActionMessage(''), 3000);
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Reset PIN
  const handleResetPin = async (id: string) => {
    if (!window.confirm('আপনি কি এই সদস্যের জন্য একটি নতুন ৬-সংখ্যার পিন তৈরি করতে নিশ্চিত?')) {
      return;
    }
    try {
      const res = await api.resetMemberPin(id);
      if (res.success) {
        setResetPinResult({
          member_id: res.member_id,
          nickname: res.nickname,
          new_pin: res.new_pin,
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Delete Member
  const handleDeleteMember = async (id: string, name: string) => {
    if (!window.confirm(`আপনি কি সদস্য "${name}" কে স্থায়ীভাবে মুছে ফেলতে চান?`)) {
      return;
    }
    try {
      const res = await api.deleteMember(id);
      if (res.success) {
        setMembersList((prev) => prev.filter((m) => m.id !== id));
        setActionMessage(`সদস্য "${name}" এর অ্যাকাউন্ট মুছে ফেলা হয়েছে।`);
        setTimeout(() => setActionMessage(''), 3000);
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Payment status update (Approve/Reject)
  const handleUpdatePaymentStatus = async (id: string, status: 'verified' | 'rejected' | 'pending') => {
    setPaymentUpdatingId(id);
    try {
      const res = await api.updatePaymentStatus(id, status);
      if (res.success) {
        setPaymentsList((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: res.payment.status } : p))
        );
        setActionMessage(
          status === 'verified'
            ? 'ট্রানজেকশন সফলভাবে অনুমোদিত হয়েছে ও পাবলিক তহবিলে যুক্ত হয়েছে।'
            : status === 'rejected'
            ? 'ট্রানজেকশন বাতিল করা হয়েছে।'
            : 'ট্রানজেকশন পেন্ডিং করা হয়েছে।'
        );
        setTimeout(() => setActionMessage(''), 3000);
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setPaymentUpdatingId(null);
    }
  };

  // Save Notice
  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotice?.title || !editingNotice?.description) return;

    try {
      if (editingNotice.id) {
        const res = await api.updateNotice(editingNotice.id, editingNotice);
        if (res.success) {
          setNoticesList((prev) =>
            prev.map((n) => (n.id === editingNotice.id ? res.notice : n))
          );
        }
      } else {
        const res = await api.createNotice(editingNotice);
        if (res.success) {
          setNoticesList((prev) => [res.notice, ...prev]);
        }
      }
      setIsNoticeModalOpen(false);
      setEditingNotice(null);
      setActionMessage('নোটিশ সফলভাবে সংরক্ষিত হয়েছে।');
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Delete Notice
  const handleDeleteNotice = async (id: string) => {
    if (!window.confirm('আপনি কি এই নোটিশটি মুছে ফেলতে চান?')) return;
    try {
      await api.deleteNotice(id);
      setNoticesList((prev) => prev.filter((n) => n.id !== id));
      setActionMessage('নোটিশ মুছে ফেলা হয়েছে।');
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Save Event
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent?.title || !editingEvent?.event_date) return;

    try {
      if (editingEvent.id) {
        const res = await api.updateEvent(editingEvent.id, editingEvent);
        if (res.success) {
          setEventsList((prev) =>
            prev.map((ev) => (ev.id === editingEvent.id ? res.event : ev))
          );
        }
      } else {
        const res = await api.createEvent(editingEvent);
        if (res.success) {
          setEventsList((prev) => [res.event, ...prev]);
        }
      }
      setIsEventModalOpen(false);
      setEditingEvent(null);
      setActionMessage('ইভেন্ট সফলভাবে সংরক্ষিত হয়েছে।');
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Delete Event
  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('আপনি কি এই ইভেন্টটি মুছে ফেলতে চান?')) return;
    try {
      await api.deleteEvent(id);
      setEventsList((prev) => prev.filter((e) => e.id !== id));
      setActionMessage('ইভেন্ট মুছে ফেলা হয়েছে।');
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Save Idol
  const handleSaveIdol = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIdol) return;

    try {
      const res = await api.updateIdol(editingIdol.id, {
        name: editingIdol.name,
        description: editingIdol.description,
        image_url: editingIdol.image_url,
      });
      if (res.success) {
        setIdolsList((prev) =>
          prev.map((i) => (i.id === editingIdol.id ? res.idol : i))
        );
        setEditingIdol(null);
        setActionMessage('আইডল প্রোফাইল সফলভাবে আপডেট হয়েছে।');
        setTimeout(() => setActionMessage(''), 3000);
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Save Website Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!websiteSettings) return;

    try {
      const res = await api.updateSettings({
        ...websiteSettings,
        registration_enabled: regEnabled,
      });
      if (res.success) {
        setWebsiteSettings(res.settings);
        setRegEnabled(res.registration_enabled);
        setActionMessage('ওয়েবসাইট সেটিংস সফলভাবে হালনাগাদ করা হয়েছে।');
        setTimeout(() => setActionMessage(''), 3000);
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Send Broadcast
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    try {
      await api.broadcastNotification({
        title: broadcastTitle,
        message: broadcastMessage,
        type: broadcastType,
      });
      setBroadcastTitle('');
      setBroadcastMessage('');
      setActionMessage('লাইভ নোটিফিকেশন সকল সদস্যের নিকট পাঠানো হয়েছে।');
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Banner */}
      <div className="bg-[#111111] text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-neutral-800 shadow-xl">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-14 h-14 rounded-2xl bg-[#F52E68] text-white flex items-center justify-center shrink-0">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <h1 className="text-2xl font-bold">মুখে ল অ্যাডমিন কন্ট্রোল প্যানেল</h1>
              <span className="text-[10px] font-bold bg-[#F52E68] text-white px-2 py-0.5 rounded-full">
                অফিশিয়াল
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              প্রশাসক: <span className="font-bold text-white">{member?.nickname}</span> ({member?.role === 'owner_admin' ? 'প্রধান প্রতিষ্ঠাতা ও প্রশাসক' : 'প্রশাসক'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllData}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>রিফ্রেশ ডাটা</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="ml-auto text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#EAE6E7]">
        {[
          { id: 'overview', label: 'ওভারভিউ', icon: Sparkles },
          { id: 'members', label: 'সদস্য ব্যবস্থাপনা ও ব্যাজ', icon: Users },
          { id: 'notices', label: 'নোটিশ ব্যবস্থাপনা', icon: Bell },
          { id: 'events', label: 'ইভেন্ট ব্যবস্থাপনা', icon: Calendar },
          { id: 'idols', label: 'OUR IDOLS', icon: Shield },
          { id: 'settings', label: 'ওয়েবসাইট সেটিংস', icon: Settings },
          { id: 'broadcast', label: 'লাইভ নোটিফিকেশন', icon: Send },
          { id: 'payments', label: 'তাহাবিল অনুদান অনুমোদন ও অডিট', icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = currentSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentSection(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#111111] text-white shadow-sm'
                  : 'bg-[#F7F5F5] text-gray-700 hover:bg-[#EAE6E7]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW SECTION */}
      {currentSection === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-[#EAE6E7] shadow-sm">
              <span className="text-xs text-gray-500 font-semibold">মোট নিবন্ধিত সদস্য</span>
              <div className="text-3xl font-extrabold text-[#111111] mt-1 tabular-nums">
                {stats?.total_members || membersList.length}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#EAE6E7] shadow-sm">
              <span className="text-xs text-gray-500 font-semibold">সক্রিয় সদস্য</span>
              <div className="text-3xl font-extrabold text-emerald-600 mt-1 tabular-nums">
                {stats?.active_members || membersList.filter((m) => m.status === 'active').length}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#EAE6E7] shadow-sm">
              <span className="text-xs text-gray-500 font-semibold">মোট নোটিশ</span>
              <div className="text-3xl font-extrabold text-[#F52E68] mt-1 tabular-nums">
                {noticesList.length}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#EAE6E7] shadow-sm">
              <span className="text-xs text-gray-500 font-semibold">মোট ইভেন্ট</span>
              <div className="text-3xl font-extrabold text-purple-600 mt-1 tabular-nums">
                {eventsList.length}
              </div>
            </div>
          </div>

          {/* Recent Registrations Table */}
          <div className="bg-white rounded-3xl border border-[#EAE6E7] p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#111111]">সাম্প্রতিক নিবন্ধন</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#EAE6E7] text-gray-400">
                    <th className="pb-3 font-semibold">সদস্য</th>
                    <th className="pb-3 font-semibold">আইডি</th>
                    <th className="pb-3 font-semibold">জেলা ও থানা</th>
                    <th className="pb-3 font-semibold">ব্যাজ</th>
                    <th className="pb-3 font-semibold">স্ট্যাটাস</th>
                    <th className="pb-3 font-semibold">নিবন্ধনের তারিখ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE6E7]">
                  {membersList.slice(0, 5).map((m) => (
                    <tr key={m.id} className="hover:bg-[#F7F5F5]">
                      <td className="py-3 flex items-center gap-2">
                        <img
                          src={m.profile_image_url || '/assets/aistudio/E4C57373-4D34-4620-B487-D44F42FFFC21_a7498b63.png'}
                          alt={m.nickname}
                          className="w-7 h-7 rounded-lg object-cover"
                        />
                        <span className="font-bold text-[#111111]">{m.nickname}</span>
                      </td>
                      <td className="py-3 font-mono">{m.member_id}</td>
                      <td className="py-3 text-gray-600">
                        {m.district ? `${m.district}${m.upazila ? ` • ${m.upazila}` : ''}` : '—'}
                      </td>
                      <td className="py-3">
                        {m.is_verified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            <BadgeCheck className="w-3 h-3 text-emerald-600" /> ভেরিফাইড
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400">সাধারণ</span>
                        )}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {m.status === 'active' ? 'সক্রিয়' : 'স্থগিত'}
                        </span>
                      </td>
                      <td className="py-3 text-gray-400">
                        {new Date(m.created_at).toLocaleDateString('bn-BD')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. MEMBERS MANAGEMENT & LOCATION FILTER */}
      {currentSection === 'members' && (
        <div className="bg-white rounded-3xl border border-[#EAE6E7] p-6 shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#111111]">সদস্যদের পূর্ণ তালিকা, অবস্থান ও ব্যাজ নিয়ন্ত্রণ</h2>
              <p className="text-xs text-gray-500">
                মোট সদস্য: {membersList.length} জন | ৬৪ জেলা ফিল্টারিং, মেম্বারশিপ ব্যাজ অনুমোদন, অ্যাকাউন্ট স্থগিত ও পিন রিসেট
              </p>
            </div>
            <div className="w-full lg:w-72 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="নাম, নিকনেম, আইডি, জেলা বা থানা দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl focus:bg-white outline-none"
              />
            </div>
          </div>

          {/* Bangladesh Administrative Location Filters */}
          <div className="p-4 bg-[#F7F5F5] rounded-2xl border border-[#EAE6E7] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#111111]">
              <Filter className="w-3.5 h-3.5 text-[#F52E68]" />
              <span>বাংলাদেশ প্রশাসনিক অবস্থান অনুযায়ী ফিল্টার করুন:</span>
              {(filterDivision || filterDistrict || filterUpazila) && (
                <button
                  onClick={() => {
                    setFilterDivision('');
                    setFilterDistrict('');
                    setFilterUpazila('');
                  }}
                  className="ml-auto text-[11px] font-bold text-[#F52E68] hover:underline cursor-pointer"
                >
                  ফিল্টার মুছুন
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Division Dropdown */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">বিভাগ</label>
                <select
                  value={filterDivision}
                  onChange={(e) => handleDivisionChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EAE6E7] rounded-xl outline-none cursor-pointer"
                >
                  <option value="">সকল বিভাগ (৮টি)</option>
                  {Object.keys(DIVISIONS_AND_DISTRICTS).map((div) => (
                    <option key={div} value={div}>
                      {div}
                    </option>
                  ))}
                </select>
              </div>

              {/* District Dropdown */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">জেলা (৬৪ জেলা)</label>
                <select
                  value={filterDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EAE6E7] rounded-xl outline-none cursor-pointer"
                >
                  <option value="">সকল জেলা</option>
                  {availableDistricts.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>

              {/* Upazila / Thana Dropdown */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">উপজেলা / থানা</label>
                <select
                  value={filterUpazila}
                  onChange={(e) => setFilterUpazila(e.target.value)}
                  disabled={!filterDistrict}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EAE6E7] rounded-xl outline-none cursor-pointer disabled:opacity-50 disabled:bg-gray-100"
                >
                  <option value="">
                    {filterDistrict ? 'সকল উপজেলা / থানা' : 'আগে জেলা নির্বাচন করুন'}
                  </option>
                  {availableUpazilas.map((upa) => (
                    <option key={upa} value={upa}>
                      {upa}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EAE6E7] text-gray-400">
                  <th className="pb-3 font-semibold">সেলফি ও নাম</th>
                  <th className="pb-3 font-semibold">নিকনেম ও আইডি</th>
                  <th className="pb-3 font-semibold">অবস্থান (জেলা ও থানা)</th>
                  <th className="pb-3 font-semibold">ইমেইল, ইনস্টা ও ফোন</th>
                  <th className="pb-3 font-semibold">মেম্বারশিপ ব্যাজ</th>
                  <th className="pb-3 font-semibold">ডকুমেন্ট</th>
                  <th className="pb-3 font-semibold">স্ট্যাটাস</th>
                  <th className="pb-3 font-semibold text-right">কার্যক্রম</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE6E7]">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      কোনো সদস্য পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-[#F7F5F5]">
                      {/* Name & Selfie */}
                      <td className="py-3 flex items-center gap-3">
                        <img
                          src={m.profile_image_url || '/assets/aistudio/E4C57373-4D34-4620-B487-D44F42FFFC21_a7498b63.png'}
                          alt={m.nickname}
                          className="w-9 h-9 rounded-xl object-cover border border-[#EAE6E7]"
                        />
                        <div>
                          <div className="font-bold text-[#111111]">{m.full_name}</div>
                          <div className="text-[10px] text-gray-400">
                            {new Date(m.created_at).toLocaleDateString('bn-BD')}
                          </div>
                        </div>
                      </td>

                      {/* Nickname & ID */}
                      <td className="py-3">
                        <div className="font-bold text-[#F52E68]">{m.nickname}</div>
                        <div className="font-mono text-gray-500 text-[11px]">{m.member_id}</div>
                      </td>

                      {/* Location */}
                      <td className="py-3">
                        <div className="font-semibold text-gray-800">
                          {m.district || <span className="text-gray-400">—</span>}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {m.upazila ? `${m.upazila}` : ''} {m.division ? `(${m.division})` : ''}
                        </div>
                      </td>

                      {/* Email, Instagram & Phone */}
                      <td className="py-3">
                        <div className="font-mono text-[11px] font-bold text-[#111111]">{m.email || '—'}</div>
                        <div className="font-mono text-[10px] text-gray-500">@{m.instagram_username}</div>
                        <div className="font-mono text-[10px] text-gray-400">{m.phone_number || 'ফোন নেই'}</div>
                      </td>

                      {/* Verified Badge Toggle */}
                      <td className="py-3">
                        <button
                          onClick={() => handleToggleBadge(m.id, !!m.is_verified)}
                          disabled={badgeUpdatingId === m.id}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            m.is_verified
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                              : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                          title="ক্লিক করে মেম্বারশিপ ব্যাজ অনুমোদন বা বাতিল করুন"
                        >
                          <BadgeCheck className="w-3.5 h-3.5" />
                          <span>{m.is_verified ? 'ভেরিফাইড ব্যাজ' : 'ব্যাজ প্রদান করুন'}</span>
                        </button>
                      </td>

                      {/* Document Verification */}
                      <td className="py-3">
                        {m.document_url ? (
                          <button
                            onClick={() =>
                              setSelectedDocPreview({
                                name: m.nickname,
                                url: m.document_url!,
                                type: m.document_type || 'এনআইডি / স্টুডেন্ট কার্ড',
                              })
                            }
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer bg-blue-50 px-2 py-0.5 rounded"
                          >
                            <FileText className="w-3 h-3" />
                            <span>ডকুমেন্ট দেখুন</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-400">জমা দেয়নি</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {m.status === 'active' ? 'সক্রিয়' : 'স্থগিত'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Reset PIN */}
                          <button
                            onClick={() => handleResetPin(m.id)}
                            className="p-1.5 bg-[#F7F5F5] hover:bg-neutral-200 text-[#111111] rounded-lg transition-colors cursor-pointer"
                            title="নতুন পিন তৈরি করুন"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          {/* Suspend / Reactivate */}
                          {m.role !== 'owner_admin' && (
                            <button
                              onClick={() => handleToggleStatus(m.id, m.status)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                m.status === 'active'
                                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                              }`}
                              title={m.status === 'active' ? 'অ্যাকাউন্ট স্থগিত করুন' : 'পুনরায় সক্রিয় করুন'}
                            >
                              {m.status === 'active' ? (
                                <UserX className="w-3.5 h-3.5" />
                              ) : (
                                <UserCheck className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}

                          {/* Delete account */}
                          {m.role !== 'owner_admin' && (
                            <button
                              onClick={() => handleDeleteMember(m.id, m.nickname)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                              title="অ্যাকাউন্ট ডিলিট করুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. NOTICES MANAGEMENT */}
      {currentSection === 'notices' && (
        <div className="bg-white rounded-3xl border border-[#EAE6E7] p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#111111]">নোটিশ বোর্ড পরিচালনা</h2>
              <p className="text-xs text-gray-500">নোটিশ তৈরি, সম্পাদনা ও প্রকাশ নিয়ন্ত্রণ</p>
            </div>
            <button
              onClick={() => {
                setEditingNotice({
                  title: '',
                  description: '',
                  category: 'সাধারণ',
                  is_important: false,
                  is_published: true,
                });
                setIsNoticeModalOpen(true);
              }}
              className="px-4 py-2 bg-[#F52E68] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-[#D91F57] transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন নোটিশ তৈরি</span>
            </button>
          </div>

          <div className="space-y-3">
            {noticesList.length === 0 ? (
              <p className="text-xs text-gray-400 py-4">কোনো নোটিশ নেই।</p>
            ) : (
              noticesList.map((n) => (
                <div
                  key={n.id}
                  className="p-4 rounded-2xl bg-[#F7F5F5] border border-[#EAE6E7] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#111111] text-sm">{n.title}</span>
                      <span className="text-[10px] font-bold text-gray-500 bg-white px-2 py-0.5 rounded border border-[#EAE6E7]">
                        {n.category}
                      </span>
                      {n.is_important && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">
                          জরুরি
                        </span>
                      )}
                      {!n.is_published && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                          ড্রাফট / অপ্রকাশিত
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 line-clamp-1">{n.description}</p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => {
                        setEditingNotice(n);
                        setIsNoticeModalOpen(true);
                      }}
                      className="p-2 bg-white text-gray-700 hover:text-[#111111] rounded-xl border border-[#EAE6E7] cursor-pointer"
                      title="সম্পাদনা করুন"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteNotice(n.id)}
                      className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. EVENTS MANAGEMENT */}
      {currentSection === 'events' && (
        <div className="bg-white rounded-3xl border border-[#EAE6E7] p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#111111]">ইভেন্ট পরিচালনা</h2>
              <p className="text-xs text-gray-500">নতুন ইভেন্ট যুক্ত ও সময়সূচী পরিবর্তন</p>
            </div>
            <button
              onClick={() => {
                setEditingEvent({
                  title: '',
                  description: '',
                  cover_image_url: '/src/assets/images/event_cover_meetup_1793365207227.jpg',
                  event_date: '',
                  event_time: '',
                  location: '',
                  status: 'আসন্ন',
                });
                setIsEventModalOpen(true);
              }}
              className="px-4 py-2 bg-[#F52E68] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-[#D91F57] transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন ইভেন্ট তৈরি</span>
            </button>
          </div>

          <div className="space-y-4">
            {eventsList.length === 0 ? (
              <p className="text-xs text-gray-400 py-4">কোনো ইভেন্ট নেই।</p>
            ) : (
              eventsList.map((evt) => (
                <div
                  key={evt.id}
                  className="p-4 rounded-2xl bg-[#F7F5F5] border border-[#EAE6E7] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={evt.cover_image_url}
                      alt={evt.title}
                      className="w-16 h-12 object-cover rounded-xl"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#111111]">{evt.title}</span>
                        <span className="text-[10px] font-bold bg-neutral-900 text-white px-2 py-0.5 rounded">
                          {evt.status}
                        </span>
                      </div>
                      <div className="text-gray-500 text-[11px] mt-0.5">
                        তারিখ: {evt.event_date} {evt.event_time && `· ${evt.event_time}`} {evt.location && `· ${evt.location}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => {
                        setEditingEvent(evt);
                        setIsEventModalOpen(true);
                      }}
                      className="p-2 bg-white text-gray-700 hover:text-[#111111] rounded-xl border border-[#EAE6E7] cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(evt.id)}
                      className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. OUR IDOLS MANAGEMENT */}
      {currentSection === 'idols' && (
        <div className="bg-white rounded-3xl border border-[#EAE6E7] p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-[#111111]">OUR IDOLS প্রোফাইল সম্পাদনা</h2>
            <p className="text-xs text-gray-500">
              হোমপেজে প্রদর্শিত ৩টি আইডল প্রোফাইলের ছবি, নাম ও বিবরণ এখান থেকে পরিচালনা করুন।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {idolsList.map((idol) => (
              <div
                key={idol.id}
                className="p-5 rounded-3xl bg-[#F7F5F5] border border-[#EAE6E7] flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-900 mb-3">
                    <img
                      src={idol.image_url}
                      alt={idol.name}
                      className="w-full h-full object-cover grayscale contrast-125"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-[#F52E68] uppercase">
                    আইডল #{idol.display_order}
                  </span>
                  <h4 className="text-base font-bold text-[#111111] mt-0.5">{idol.name}</h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{idol.description}</p>
                </div>

                <button
                  onClick={() => setEditingIdol(idol)}
                  className="w-full py-2 bg-white hover:bg-neutral-100 text-[#111111] font-bold text-xs rounded-xl border border-[#EAE6E7] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>তথ্য ও ছবি পরিবর্তন</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. WEBSITE SETTINGS */}
      {currentSection === 'settings' && websiteSettings && (
        <div className="bg-white rounded-3xl border border-[#EAE6E7] p-6 sm:p-8 shadow-sm space-y-6 max-w-2xl">
          <div>
            <h2 className="text-lg font-bold text-[#111111]">ওয়েবসাইট ও কমিউনিটি কনফিগারেশন</h2>
            <p className="text-xs text-gray-500">হোমপেজ টেক্সট, স্লোগান ও পাবলিক রেজিস্ট্রেশন নিয়ন্ত্রণ</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            {/* Registration toggle */}
            <div className="p-4 rounded-2xl bg-[#F7F5F5] border border-[#EAE6E7] flex items-center justify-between">
              <div>
                <strong className="text-sm font-bold text-[#111111] block">নতুন সদস্য নিবন্ধন</strong>
                <span className="text-gray-500">নিবন্ধন সাময়িকভাবে বন্ধ বা চালু রাখুন</span>
              </div>
              <input
                type="checkbox"
                checked={regEnabled}
                onChange={(e) => setRegEnabled(e.target.checked)}
                className="w-5 h-5 accent-[#F52E68] cursor-pointer"
              />
            </div>

            <div>
              <label className="block font-bold text-[#111111] mb-1">হোমপেজ প্রধান শিরোনাম (Hero Heading)</label>
              <input
                type="text"
                value={websiteSettings.hero_title}
                onChange={(e) =>
                  setWebsiteSettings({ ...websiteSettings, hero_title: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-[#111111] mb-1">হোমপেজ সাব-শিরোনাম (Subtitle)</label>
              <input
                type="text"
                value={websiteSettings.hero_subtitle}
                onChange={(e) =>
                  setWebsiteSettings({ ...websiteSettings, hero_subtitle: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-[#111111] mb-1">কমিউনিটি সম্পর্কে সংক্ষিপ্ত ইশতেহার</label>
              <textarea
                rows={3}
                value={websiteSettings.about_text}
                onChange={(e) =>
                  setWebsiteSettings({ ...websiteSettings, about_text: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-[#111111] mb-1">ফুটার কপিরাইট টেক্সট</label>
              <input
                type="text"
                value={websiteSettings.footer_copyright}
                onChange={(e) =>
                  setWebsiteSettings({ ...websiteSettings, footer_copyright: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl outline-none"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-[#F52E68] hover:bg-[#D91F57] text-white font-bold rounded-xl transition-all cursor-pointer shadow-sm"
              >
                সেটিংস সংরক্ষণ করুন
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 7. LIVE NOTIFICATION BROADCAST */}
      {currentSection === 'broadcast' && (
        <div className="bg-white rounded-3xl border border-[#EAE6E7] p-6 sm:p-8 shadow-sm space-y-6 max-w-xl">
          <div>
            <h2 className="text-lg font-bold text-[#111111]">লাইভ নোটিফিকেশন ব্রডকাস্ট</h2>
            <p className="text-xs text-gray-500">
              সকল সক্রিয় সদস্যের জন্য তাৎক্ষণিক পুশ নোটিফিকেশন প্রেরণ করুন
            </p>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">নোটিফিকেশনের ধরন</label>
              <select
                value={broadcastType}
                onChange={(e) => setBroadcastType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl outline-none"
              >
                <option value="info">তথ্যমূলক (Info)</option>
                <option value="alert">জরুরি অ্যালার্ট (Alert)</option>
                <option value="success">সাফল্য / অভিনন্দন (Success)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">নোটিফিকেশন শিরোনাম</label>
              <input
                type="text"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="যেমন: জরুরি অনলাইন সভা আহবান"
                className="w-full px-3.5 py-2.5 bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">বিস্তারিত বার্তা</label>
              <textarea
                rows={3}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="সকল সদস্যদের উদ্দেশ্যে বার্তাটি লিখুন..."
                className="w-full px-3.5 py-2.5 bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#111111] hover:bg-neutral-800 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Send className="w-4 h-4 text-[#F52E68]" />
              <span>ব্রডকাস্ট পাঠান</span>
            </button>
          </form>
        </div>
      )}

      {/* 8. PAYMENTS AUDIT & DONATION APPROVAL */}
      {currentSection === 'payments' && (
        <div className="bg-white rounded-3xl border border-[#EAE6E7] p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#111111]">তাহাবিল অনুদান অনুমোদন ও ট্রানজেকশন অডিট</h2>
              <p className="text-xs text-gray-500">
                বিকাশ, নগদ ও রকেট পেমেন্ট ভেরিফিকেশন (অফিশিয়াল নম্বর: ০১৭১৬১৬৩৮৪০)। পেন্ডিং অনুদান অনুমোদন করলে তা স্বয়ংক্রিয়ভাবে পাবলিক তহবিলে যুক্ত হবে।
              </p>
            </div>
            <div className="text-xs bg-[#F7F5F5] px-4 py-2 rounded-xl font-bold border border-[#EAE6E7]">
              মোট পেমেন্ট রেকর্ড: <span className="text-[#F52E68]">{paymentsList.length} টি</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EAE6E7] text-gray-400">
                  <th className="pb-3 font-semibold">ট্রানজেকশন আইডি</th>
                  <th className="pb-3 font-semibold">দাতা / সদস্য</th>
                  <th className="pb-3 font-semibold">পরিমাণ</th>
                  <th className="pb-3 font-semibold">মাধ্যম</th>
                  <th className="pb-3 font-semibold">উদ্দেশ্য</th>
                  <th className="pb-3 font-semibold">প্রেরক নম্বর</th>
                  <th className="pb-3 font-semibold">স্ট্যাটাস</th>
                  <th className="pb-3 font-semibold">তারিখ</th>
                  <th className="pb-3 font-semibold text-right">অনুমোদন ব্যবস্থা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE6E7]">
                {paymentsList.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-400">
                      কোনো অনুদান বা পেমেন্ট রেকর্ড নেই।
                    </td>
                  </tr>
                ) : (
                  paymentsList.map((p) => {
                    const isPending = p.status === 'pending' || !p.status;
                    const isVerified = p.status === 'verified';
                    const isRejected = p.status === 'rejected';

                    return (
                      <tr key={p.id} className="hover:bg-[#F7F5F5]">
                        <td className="py-3 font-mono font-bold text-[#111111]">{p.transaction_id}</td>
                        <td className="py-3 font-semibold">
                          <div>{p.donor_name || p.member_nickname}</div>
                          {p.member_nickname && p.donor_name && (
                            <div className="text-[10px] text-gray-400 font-mono">@{p.member_nickname}</div>
                          )}
                        </td>
                        <td className="py-3 font-bold text-[#F52E68] tabular-nums">৳{p.amount}</td>
                        <td className="py-3 uppercase font-semibold">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.method === 'bkash'
                                ? 'bg-pink-100 text-pink-700'
                                : p.method === 'nagad'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {p.method}
                          </span>
                        </td>
                        <td className="py-3">{p.purpose}</td>
                        <td className="py-3 font-mono">{p.sender_number}</td>
                        <td className="py-3">
                          {isVerified ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> অনুমোদিত
                            </span>
                          ) : isRejected ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                              <XCircle className="w-3 h-3 text-red-600" /> বাতিল
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                              <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" /> পেন্ডিং
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-gray-400">
                          {new Date(p.created_at).toLocaleDateString('bn-BD')}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending ? (
                              <>
                                <button
                                  onClick={() => handleUpdatePaymentStatus(p.id, 'verified')}
                                  disabled={paymentUpdatingId === p.id}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>অনুমোদন</span>
                                </button>
                                <button
                                  onClick={() => handleUpdatePaymentStatus(p.id, 'rejected')}
                                  disabled={paymentUpdatingId === p.id}
                                  className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[10px] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <X className="w-3 h-3" />
                                  <span>বাতিল</span>
                                </button>
                              </>
                            ) : isVerified ? (
                              <button
                                onClick={() => handleUpdatePaymentStatus(p.id, 'rejected')}
                                disabled={paymentUpdatingId === p.id}
                                className="px-2 py-1 bg-neutral-100 hover:bg-red-50 text-gray-600 hover:text-red-600 text-[10px] rounded-lg transition-colors cursor-pointer"
                                title="বাতিল করুন"
                              >
                                বাতিল করুন
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdatePaymentStatus(p.id, 'verified')}
                                disabled={paymentUpdatingId === p.id}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                                title="অনুমোদন করুন"
                              >
                                পুনরায় অনুমোদন
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {selectedDocPreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={() => setSelectedDocPreview(null)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#EAE6E7] z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#111111]">
                  মেম্বারশিপ যাচাইকরণ ডকুমেন্ট
                </h3>
                <p className="text-xs text-gray-500">
                  সদস্য: <strong>{selectedDocPreview.name}</strong> ({selectedDocPreview.type || 'ডকুমেন্ট'})
                </p>
              </div>
              <button
                onClick={() => setSelectedDocPreview(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-neutral-100 border border-[#EAE6E7] max-h-96 flex items-center justify-center p-2">
              <img
                src={selectedDocPreview.url}
                alt={selectedDocPreview.name}
                className="max-h-80 w-auto object-contain rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedDocPreview(null)}
                className="px-4 py-2 bg-[#111111] text-white text-xs font-bold rounded-xl"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIN RESET REVEAL MODAL */}
      {resetPinResult && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setResetPinResult(null)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-2 border-[#111111] z-10 text-center space-y-5">
            <div className="w-14 h-14 bg-[#F52E68]/10 text-[#F52E68] rounded-2xl flex items-center justify-center mx-auto">
              <Key className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#111111]">নতুন পিন কোড তৈরি হয়েছে</h3>
              <p className="text-xs text-gray-500 mt-1">
                সদস্য: <strong>{resetPinResult.nickname}</strong> ({resetPinResult.member_id})
              </p>
            </div>

            <div className="p-5 bg-[#111111] text-white rounded-2xl space-y-2">
              <span className="text-[11px] text-[#F52E68] font-bold block">নতুন ৬ সংখ্যার পিন</span>
              <div className="text-4xl font-mono font-extrabold tracking-widest">
                {resetPinResult.new_pin}
              </div>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(resetPinResult.new_pin);
                setCopiedPin(true);
                setTimeout(() => setCopiedPin(false), 2000);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#F7F5F5] hover:bg-[#EAE6E7] text-xs font-bold text-[#111111] rounded-xl border border-[#EAE6E7] cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              <span>{copiedPin ? 'পিন কপি হয়েছে!' : 'পিন কপি করুন'}</span>
            </button>

            <p className="text-[11px] text-amber-700 bg-amber-50 p-3 rounded-xl">
              সদস্যকে এই নতুন পিনটি প্রদান করুন। এটি আর পরবর্তীতে দেখা যাবে না।
            </p>

            <button
              onClick={() => setResetPinResult(null)}
              className="w-full py-3 bg-[#111111] text-white font-bold text-xs rounded-xl hover:bg-neutral-800 cursor-pointer"
            >
              সম্পন্ন
            </button>
          </div>
        </div>
      )}

      {/* Notice Edit/Create Modal */}
      {isNoticeModalOpen && editingNotice && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsNoticeModalOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#EAE6E7] z-10">
            <button
              onClick={() => setIsNoticeModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#111111] mb-4">
              {editingNotice.id ? 'নোটিশ সম্পাদনা' : 'নতুন নোটিশ তৈরি'}
            </h3>

            <form onSubmit={handleSaveNotice} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">নোটিশের শিরোনাম</label>
                <input
                  type="text"
                  value={editingNotice.title || ''}
                  onChange={(e) => setEditingNotice({ ...editingNotice, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">ক্যাটাগরি</label>
                <select
                  value={editingNotice.category || 'সাধারণ'}
                  onChange={(e) => setEditingNotice({ ...editingNotice, category: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl outline-none"
                >
                  <option value="সাধারণ">সাধারণ</option>
                  <option value="জরুরি">জরুরি</option>
                  <option value="ইভেন্ট">ইভেন্ট</option>
                  <option value="নিয়মাবলী">নিয়মাবলী</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">বিস্তারিত বিবরণ</label>
                <textarea
                  rows={4}
                  value={editingNotice.description || ''}
                  onChange={(e) => setEditingNotice({ ...editingNotice, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingNotice.is_important || false}
                    onChange={(e) => setEditingNotice({ ...editingNotice, is_important: e.target.checked })}
                    className="w-4 h-4 accent-red-600"
                  />
                  <span>জরুরি নোটিশ হিসেবে চিহ্নিত করুন</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingNotice.is_published ?? true}
                    onChange={(e) => setEditingNotice({ ...editingNotice, is_published: e.target.checked })}
                    className="w-4 h-4 accent-emerald-600"
                  />
                  <span>প্রকাশিত (Published)</span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#F52E68] hover:bg-[#D91F57] text-white font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Edit/Create Modal */}
      {isEventModalOpen && editingEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsEventModalOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#EAE6E7] z-10">
            <button
              onClick={() => setIsEventModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#111111] mb-4">
              {editingEvent.id ? 'ইভেন্ট সম্পাদনা' : 'নতুন ইভেন্ট যোগ করুন'}
            </h3>

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">ইভেন্টের শিরোনাম</label>
                <input
                  type="text"
                  value={editingEvent.title || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">তারিখ</label>
                  <input
                    type="text"
                    placeholder="যেমন: ১৫ নভেম্বর, ২০২৬"
                    value={editingEvent.event_date || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, event_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">সময়</label>
                  <input
                    type="text"
                    placeholder="যেমন: সন্ধ্যা ৬:০০ টা"
                    value={editingEvent.event_time || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, event_time: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">স্থান / ভেন্যু (ঐচ্ছিক)</label>
                <input
                  type="text"
                  placeholder="যেমন: ধানমন্ডি লেকভিউ লাউঞ্জ, ঢাকা"
                  value={editingEvent.location || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">স্ট্যাটাস</label>
                <select
                  value={editingEvent.status || 'আসন্ন'}
                  onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl outline-none"
                >
                  <option value="আসন্ন">আসন্ন</option>
                  <option value="চলমান">চলমান</option>
                  <option value="সম্পন্ন">সম্পন্ন</option>
                  <option value="বাতিল">বাতিল</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">ইভেন্ট বিবরণ</label>
                <textarea
                  rows={3}
                  value={editingEvent.description || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#F52E68] hover:bg-[#D91F57] text-white font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  ইভেন্ট সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Idol Edit Modal */}
      {editingIdol && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setEditingIdol(null)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#EAE6E7] z-10">
            <button
              onClick={() => setEditingIdol(null)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#111111] mb-4">
              আইডল #{editingIdol.display_order} সম্পাদনা
            </h3>

            <form onSubmit={handleSaveIdol} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">আইডলের নাম</label>
                <input
                  type="text"
                  value={editingIdol.name}
                  onChange={(e) => setEditingIdol({ ...editingIdol, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">সংক্ষিপ্ত পরিচিতি ও অনুপ্রেরণা</label>
                <textarea
                  rows={3}
                  value={editingIdol.description}
                  onChange={(e) => setEditingIdol({ ...editingIdol, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">ছবির পাথ / ইউআরএল</label>
                <input
                  type="text"
                  value={editingIdol.image_url}
                  onChange={(e) => setEditingIdol({ ...editingIdol, image_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl outline-none font-mono"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#F52E68] hover:bg-[#D91F57] text-white font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
