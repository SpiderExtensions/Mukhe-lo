import React, { useState, useEffect } from 'react';
import { CommunityEvent } from '../types';
import { api } from '../api';
import { Calendar, Clock, MapPin, Sparkles, X, ArrowRight, CheckCircle2 } from 'lucide-react';

interface EventsPageProps {
  initialSelectedEvent?: CommunityEvent | null;
  onNavigate: (tab: string) => void;
  onOpenPayment: () => void;
}

export function EventsPage({ initialSelectedEvent, onNavigate, onOpenPayment }: EventsPageProps) {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(initialSelectedEvent || null);
  const [statusFilter, setStatusFilter] = useState<string>('সকল');

  const statuses = ['সকল', 'আসন্ন', 'চলমান', 'সম্পন্ন'];

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      try {
        const data = await api.getEvents();
        setEvents(data);
        if (initialSelectedEvent) {
          setSelectedEvent(initialSelectedEvent);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, [initialSelectedEvent]);

  const filteredEvents = statusFilter === 'সকল'
    ? events
    : events.filter((e) => e.status === statusFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7F5F5] border border-[#EAE6E7] text-xs font-bold text-[#F52E68] uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5" />
          <span>কমিউনিটি সম্মেলন ও মিটআপ</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
          আমাদের ইভেন্ট
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          সদস্যদের পারস্পরিক মেলবন্ধন, লাইভ আড্ডা ও সৃজনশীল আয়োজনের সময়সূচী
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
        {statuses.map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === st
                ? 'bg-[#111111] text-white shadow-sm'
                : 'bg-white text-gray-600 border border-[#EAE6E7] hover:border-gray-400'
            }`}
          >
            {st} {st === 'সকল' && `(${events.length})`}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 bg-[#F7F5F5] rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#EAE6E7] p-8 max-w-md mx-auto">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#111111]">কোনো ইভেন্ট পাওয়া যায়নি</h3>
          <p className="text-xs text-gray-400 mt-1">অন্য স্ট্যাটাস দিয়ে দেখুন বা নতুন আয়োজনের অপেক্ষা করুন।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              onClick={() => setSelectedEvent(evt)}
              className="bg-white rounded-3xl border border-[#EAE6E7] hover:border-[#111111] overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col sm:flex-row group"
            >
              <div className="sm:w-2/5 relative h-56 sm:h-auto overflow-hidden bg-neutral-900">
                <img
                  src={evt.cover_image_url}
                  alt={evt.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
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
                      <span className="font-semibold text-gray-800">{evt.event_date}</span>
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

                  <p className="text-xs text-gray-600 mt-3 line-clamp-3 leading-relaxed">
                    {evt.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#EAE6E7] flex items-center justify-between text-xs font-bold text-[#111111]">
                  <span>বিস্তারিত ও বুকিং তথ্য</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#F52E68] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setSelectedEvent(null)} />
          <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#EAE6E7] z-10">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 rounded-full cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="rounded-2xl overflow-hidden mb-6 aspect-video sm:aspect-21/9 bg-neutral-900 border border-[#EAE6E7] relative">
              <img
                src={selectedEvent.cover_image_url}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-[#111111] text-white text-xs font-bold px-3 py-1 rounded-full">
                {selectedEvent.status}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-[#111111] mb-3 leading-snug">
              {selectedEvent.title}
            </h2>

            {/* Event Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-xs">
              <div className="p-3 bg-[#F7F5F5] rounded-xl border border-[#EAE6E7]">
                <div className="text-gray-400 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#F52E68]" />
                  <span>তারিখ</span>
                </div>
                <div className="font-bold text-[#111111]">{selectedEvent.event_date}</div>
              </div>

              <div className="p-3 bg-[#F7F5F5] rounded-xl border border-[#EAE6E7]">
                <div className="text-gray-400 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#F52E68]" />
                  <span>সময়</span>
                </div>
                <div className="font-bold text-[#111111]">{selectedEvent.event_time || 'নির্ধারিত হয়নি'}</div>
              </div>

              <div className="p-3 bg-[#F7F5F5] rounded-xl border border-[#EAE6E7]">
                <div className="text-gray-400 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#F52E68]" />
                  <span>ভেন্যু / স্থান</span>
                </div>
                <div className="font-bold text-[#111111] truncate">{selectedEvent.location || 'ঘোষিত হবে'}</div>
              </div>
            </div>

            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-[#F7F5F5] p-5 rounded-2xl border border-[#EAE6E7] mb-6">
              {selectedEvent.description}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#EAE6E7]">
              <span className="text-xs text-gray-400">
                ভেরিফাইড মুখে ল সদস্যদের জন্য উন্মুক্ত
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setSelectedEvent(null);
                    onOpenPayment();
                  }}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-[#F52E68] hover:bg-[#D91F57] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  ইভেন্ট ফি / কন্ট্রিবিউশন দিন
                </button>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2.5 bg-[#111111] text-white font-bold text-xs rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
