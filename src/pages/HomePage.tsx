import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { CommunityStats, Notice, CommunityEvent, Idol, WebsiteSettings } from '../types';
import {
  Users,
  Calendar,
  Bell,
  Sparkles,
  ArrowRight,
  Flame,
  MapPin,
  Clock,
  HeartHandshake,
  Shield,
  Layers,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (tab: string, itemData?: any) => void;
  onOpenPayment: () => void;
}

export function HomePage({ onNavigate, onOpenPayment }: HomePageProps) {
  const { isAuthenticated, systemStatus } = useAuth();
  const [stats, setStats] = useState<CommunityStats>({
    total_members: 0,
    active_members: 0,
    total_events: 0,
    published_notices: 0,
  });
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [idols, setIdols] = useState<Idol[]>([]);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, noticesData, eventsData, idolsData, settingsData] = await Promise.all([
          api.getStats().catch(() => ({ total_members: 0, active_members: 0, total_events: 0, published_notices: 0 })),
          api.getNotices().catch(() => []),
          api.getEvents().catch(() => []),
          api.getIdols().catch(() => []),
          api.getSettings().catch(() => null),
        ]);

        setStats(statsData);
        setNotices(noticesData.slice(0, 3));
        setEvents(eventsData.slice(0, 2));
        setIdols(idolsData);
        if (settingsData) setSettings(settingsData);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-24">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden border-b border-[#EAE6E7] bg-gradient-to-b from-white via-[#F7F5F5] to-white">
        {/* Subtle background graphic */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#F52E68]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left space-y-6 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#EAE6E7] shadow-sm text-xs font-semibold text-[#111111]">
                <Flame className="w-4 h-4 text-[#F52E68]" />
                <span>মুক্তচিন্তা ও স্বকীয় আত্মপ্রকাশের বাঙালি প্ল্যাটফর্ম</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#111111] leading-[1.15]">
                {settings?.hero_title || 'স্বাগতম মুখে ল-এ'}
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 font-medium leading-relaxed">
                {settings?.hero_subtitle || 'আমরা শুধু একটি গ্রুপ নই, আমরা একটি পরিবার।'}
              </p>

              <p className="text-sm text-gray-500 leading-relaxed">
                সদস্যদের পারস্পরিক সৌহার্দ্য, যৌথ উদ্যোগ ও সামাজিক মেলবন্ধনের এক অনন্য মিলনমেলা। নিরাপদ ভেরিফিকেশনের মাধ্যমে যুক্ত হয়ে গড়ে তুলুন আপনার নিজস্ব পরিচিতি।
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-3">
                {!isAuthenticated ? (
                  <button
                    onClick={() => onNavigate('register')}
                    className="px-6 py-3.5 bg-[#F52E68] hover:bg-[#D91F57] text-white font-bold text-sm rounded-xl shadow-hard-pink active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>সদস্য হও</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="px-6 py-3.5 bg-[#111111] hover:bg-neutral-800 text-white font-bold text-sm rounded-xl shadow-hard active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>আমার ড্যাশবোর্ডে প্রবেশ</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => onNavigate('members')}
                  className="px-6 py-3.5 bg-white hover:bg-[#F7F5F5] text-[#111111] font-bold text-sm rounded-xl border border-[#EAE6E7] shadow-hard-sm active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Users className="w-4 h-4 text-[#F52E68]" />
                  <span>সদস্যবৃন্দ দেখুন</span>
                </button>

                <button
                  onClick={() => onNavigate('activities')}
                  className="px-6 py-3.5 bg-[#111111] hover:bg-neutral-800 text-white font-bold text-sm rounded-xl shadow-hard-sm active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Flame className="w-4 h-4 text-[#F52E68]" />
                  <span>মেম্বারদের কর্মকাণ্ড</span>
                </button>
              </div>

              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>সেলফি ভেরিফাইড প্রোফাইল</span>
                </span>
                <span>·</span>
                <span>৬-সংখ্যার গোপন পিন</span>
                <span>·</span>
                <span>প্রাইভেট কমিউনিটি</span>
              </div>
            </div>

            {/* Right Branded Visual (Hero Showcase of the Logo) */}
            <div className="flex-1 flex justify-center w-full max-w-md lg:max-w-none">
              <div className="relative group">
                {/* Decorative border box behind */}
                <div className="absolute inset-0 bg-[#080808] rounded-3xl translate-x-3 translate-y-3 transition-transform group-hover:translate-x-4 group-hover:translate-y-4" />
                <div className="relative bg-white border-2 border-[#111111] rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center shadow-xl">
                  <div className="w-64 h-64 sm:w-80 sm:h-80 relative flex items-center justify-center">
                    <img
                      src="/assets/aistudio/E4C57373-4D34-4620-B487-D44F42FFFC21_a7498b63.png"
                      alt="মুখে ল লোগো"
                      className="w-full h-full object-contain filter drop-shadow-md"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#EAE6E7] w-full text-center">
                    <span className="text-xs font-bold tracking-widest text-[#F52E68] uppercase">
                      OFFICIAL EMBLEM · মুখে ল
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      অনন্য শৈলী ও তারুণ্যের বিদ্রোহী প্রকাশ
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITY STATISTICS (REAL DATABASE VALUES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 bg-white rounded-2xl border border-[#EAE6E7] shadow-sm hover:border-[#111111] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500">মোট সদস্য</span>
              <Users className="w-5 h-5 text-[#F52E68]" />
            </div>
            <div className="text-3xl font-extrabold text-[#111111] tabular-nums">
              {stats.total_members}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">কমিউনিটিতে নিবন্ধিত</p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-[#EAE6E7] shadow-sm hover:border-[#111111] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500">সক্রিয় সদস্য</span>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="text-3xl font-extrabold text-[#111111] tabular-nums">
              {stats.active_members}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">ভেরিফাইড ও সক্রিয় অ্যাকাউন্ট</p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-[#EAE6E7] shadow-sm hover:border-[#111111] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500">মোট ইভেন্ট</span>
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-extrabold text-[#111111] tabular-nums">
              {stats.total_events}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">আয়োজিত ও চলমান মিটআপ</p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-[#EAE6E7] shadow-sm hover:border-[#111111] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500">প্রকাশিত নোটিশ</span>
              <Bell className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-[#111111] tabular-nums">
              {stats.published_notices}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">অফিশিয়াল দিকনির্দেশনা</p>
          </div>
        </div>
      </section>

      {/* OUR IDOLS SECTION (EXACTLY 3 PROFILES MANAGED BY ADMIN) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F52E68] uppercase tracking-widest mb-2">
            <Flame className="w-4 h-4" />
            <span>প্রেরণা ও পথপ্রদর্শক</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
            OUR IDOLS
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            আমাদের চিন্তা, দ্রোহ ও বাংলা ভাষার আত্মমর্যাদার তিন অবিচল অনুপ্রেরণা।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {idols.map((idol, index) => (
            <div
              key={idol.id || index}
              className="bg-white rounded-3xl border border-[#EAE6E7] hover:border-[#111111] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Idol Portrait Image */}
              <div className="aspect-square relative overflow-hidden bg-neutral-900">
                <img
                  src={idol.image_url}
                  alt={idol.name}
                  className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-500"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback container
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[#F52E68] bg-black/60 px-2 py-0.5 rounded">
                    আইডল #{idol.display_order || index + 1}
                  </span>
                  <h3 className="text-xl font-bold mt-1 text-white">{idol.name}</h3>
                </div>
              </div>

              {/* Description */}
              <div className="p-6 flex-1 flex flex-col justify-between bg-white">
                <p className="text-xs text-gray-600 leading-relaxed">
                  {idol.description}
                </p>
                <div className="pt-4 mt-4 border-t border-[#EAE6E7] flex items-center justify-between text-[11px] text-gray-400">
                  <span>মুখে ল অনুপ্রেরণা বোর্ড</span>
                  <span className="font-semibold text-gray-700">অনন্য পথিকৃৎ</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LATEST NOTICES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold text-[#F52E68] uppercase tracking-wider mb-1">
              জরুরি তথ্য
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111]">
              সাম্প্রতিক নোটিশ
            </h2>
          </div>
          <button
            onClick={() => onNavigate('notices')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#111111] hover:text-[#F52E68] transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>সব নোটিশ দেখুন</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {notices.map((notice) => (
            <div
              key={notice.id}
              onClick={() => onNavigate('notices', notice)}
              className="p-6 rounded-2xl bg-white border border-[#EAE6E7] hover:border-[#F52E68] transition-all cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3 text-xs text-gray-500">
                  <span className="font-semibold text-[#111111]">{notice.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {new Date(notice.created_at).toLocaleDateString('bn-BD', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  {notice.is_important && (
                    <span className="ml-auto text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                      জরুরি
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-[#111111] group-hover:text-[#F52E68] transition-colors line-clamp-2">
                  {notice.title}
                </h3>

                <p className="text-xs text-gray-600 mt-2 line-clamp-3 leading-relaxed">
                  {notice.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#EAE6E7] flex items-center justify-between text-xs font-semibold text-[#F52E68]">
                <span>বিস্তারিত পড়ুন</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold text-[#F52E68] uppercase tracking-wider mb-1">
              কমিউনিটি সম্মেলন
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111]">
              আসন্ন ইভেন্ট
            </h2>
          </div>
          <button
            onClick={() => onNavigate('events')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#111111] hover:text-[#F52E68] transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>সব ইভেন্ট দেখুন</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {events.map((evt) => (
            <div
              key={evt.id}
              onClick={() => onNavigate('events', evt)}
              className="bg-white rounded-3xl border border-[#EAE6E7] hover:border-[#111111] overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col sm:flex-row group"
            >
              <div className="sm:w-2/5 relative h-48 sm:h-auto overflow-hidden bg-neutral-900">
                <img
                  src={evt.cover_image_url}
                  alt={evt.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                  {evt.status}
                </div>
              </div>
              <div className="sm:w-3/5 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#111111] group-hover:text-[#F52E68] transition-colors">
                    {evt.title}
                  </h3>
                  <div className="space-y-1.5 mt-3 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#F52E68]" />
                      <span>{evt.event_date}</span>
                    </div>
                    {evt.event_time && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#F52E68]" />
                        <span>{evt.event_time}</span>
                      </div>
                    )}
                    {evt.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#F52E68]" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-3 line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-[#EAE6E7] flex items-center justify-between text-xs font-bold text-[#111111]">
                  <span>ইভেন্ট বিস্তারিত দেখুন</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#F52E68] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COMMUNITY FUND CALLOUT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#111111] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden border border-neutral-800 shadow-xl">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-[#F52E68]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left max-w-xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#F52E68] uppercase tracking-wider">
                <HeartHandshake className="w-4 h-4" />
                <span>মুখে ল পারস্পরিক সহায়তা তহবিল</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                কমিউনিটির বিকাশে আপনার অবদান রাখুন
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                আমাদের প্রতিটি ইভেন্ট, সৃজনশীল প্রযোজনা ও সাংস্কৃতিক উদ্যোগ সদস্যদের স্বতঃস্ফূর্ত অংশগ্রহণে পরিচালিত হয়। এনক্রিপ্টেড পেমেন্ট গেটওয়ের মাধ্যমে নিরাপদে সহায়তা পাঠাতে পারেন।
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-3">
              <button
                onClick={onOpenPayment}
                className="px-6 py-3.5 bg-[#F52E68] hover:bg-[#D91F57] text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>তহবিলে অনুদান দিন</span>
              </button>
              <button
                onClick={() => onNavigate('about')}
                className="px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold text-xs rounded-xl border border-neutral-700 transition-all cursor-pointer"
              >
                তহবিল ব্যবহারের নিয়ম
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
