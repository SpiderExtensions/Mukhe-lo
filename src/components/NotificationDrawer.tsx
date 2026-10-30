import React, { useEffect, useState } from 'react';
import { NotificationItem } from '../types';
import { api } from '../api';
import { X, Bell, AlertTriangle, CheckCircle2, Calendar, RefreshCw } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-[#EAE6E7]">
          {/* Header */}
          <div className="p-5 border-b border-[#EAE6E7] flex items-center justify-between bg-[#F7F5F5]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#F52E68]/10 text-[#F52E68] flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-[#111111] text-base">কমিউনিটি নোটিফিকেশন</h3>
                <p className="text-xs text-gray-500">লাইভ আপডেট ও গুরুত্বপূর্ণ বার্তা</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={fetchNotifications}
                disabled={loading}
                className="p-2 text-gray-500 hover:text-[#111111] hover:bg-white rounded-lg transition-colors cursor-pointer"
                title="রিফ্রেশ করুন"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-[#111111] hover:bg-white rounded-lg transition-colors cursor-pointer"
                aria-label="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Bell className="w-10 h-10 mx-auto mb-2 text-gray-300 stroke-[1.5]" />
                <p className="text-sm font-medium">কোনো নতুন নোটিফিকেশন নেই</p>
                <p className="text-xs text-gray-400 mt-1">কমিউনিটির সকল আপডেট এখানে দেখা যাবে</p>
              </div>
            ) : (
              notifications.map((item) => {
                const isAlert = item.type === 'alert';
                const isSuccess = item.type === 'success';
                const isEvent = item.type === 'event';

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isAlert
                        ? 'bg-red-50/50 border-red-200'
                        : isSuccess
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : isEvent
                        ? 'bg-purple-50/50 border-purple-200'
                        : 'bg-[#F7F5F5] border-[#EAE6E7]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {isAlert && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        {isEvent && <Calendar className="w-4 h-4 text-purple-500" />}
                        {!isAlert && !isSuccess && !isEvent && <Bell className="w-4 h-4 text-[#F52E68]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="text-xs font-bold text-[#111111] truncate">{item.title}</h4>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap">
                            {new Date(item.created_at).toLocaleTimeString('bn-BD', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed break-words">{item.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="p-4 border-t border-[#EAE6E7] bg-[#F7F5F5] text-center text-xs text-gray-500">
            মুখে ল প্রাইভেট নোটিফিকেশন নেটওয়ার্ক
          </div>
        </div>
      </div>
    </div>
  );
}
