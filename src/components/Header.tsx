import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  Menu,
  X,
  Shield,
  HeartHandshake,
  LogOut,
  User,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenNotifications: () => void;
  onOpenPayment: () => void;
  unreadCount?: number;
}

export function Header({
  currentTab,
  onNavigate,
  onOpenNotifications,
  onOpenPayment,
  unreadCount = 0,
}: HeaderProps) {
  const { member, isAuthenticated, isAdmin, logout, systemStatus } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: string) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  const isInitialAdminNeeded = systemStatus && !systemStatus.initial_admin_initialized;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE6E7]">
      {/* Main Top Bar - 3 Zone Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none"
            aria-label="মুখে ল হোমপেজ"
          >
            <div className="relative w-12 h-12 flex items-center justify-center overflow-hidden rounded-xl bg-[#F7F5F5] border border-[#EAE6E7] group-hover:border-[#F52E68] transition-colors p-1">
              <img
                src="/assets/aistudio/E4C57373-4D34-4620-B487-D44F42FFFC21_a7498b63.png"
                alt="মুখে ল লোগো"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-[#111111] group-hover:text-[#F52E68] transition-colors whitespace-nowrap">
                মুখে ল
              </span>
              <span className="text-[11px] text-gray-500 font-medium tracking-wider uppercase whitespace-nowrap">
                MUKHE L · COMMUNITY
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Single line, quiet typography) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#111111]">
          <button
            onClick={() => handleNavClick('home')}
            className={`whitespace-nowrap transition-colors hover:text-[#F52E68] py-1 cursor-pointer ${
              currentTab === 'home' ? 'text-[#F52E68] font-bold border-b-2 border-[#F52E68]' : 'text-gray-700'
            }`}
          >
            হোম
          </button>
          <button
            onClick={() => handleNavClick('members')}
            className={`whitespace-nowrap transition-colors hover:text-[#F52E68] py-1 cursor-pointer ${
              currentTab === 'members' ? 'text-[#F52E68] font-bold border-b-2 border-[#F52E68]' : 'text-gray-700'
            }`}
          >
            সদস্যবৃন্দ
          </button>
          <button
            onClick={() => handleNavClick('activities')}
            className={`whitespace-nowrap transition-colors hover:text-[#F52E68] py-1 cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'activities' ? 'text-[#F52E68] font-bold border-b-2 border-[#F52E68]' : 'text-gray-700'
            }`}
          >
            <span>কর্মকাণ্ডসমূহ</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#F52E68]"></span>
          </button>
          <button
            onClick={() => handleNavClick('fund')}
            className={`whitespace-nowrap transition-colors hover:text-[#F52E68] py-1 cursor-pointer ${
              currentTab === 'fund' ? 'text-[#F52E68] font-bold border-b-2 border-[#F52E68]' : 'text-gray-700'
            }`}
          >
            তহবিল ইতিহাস
          </button>
          <button
            onClick={() => handleNavClick('notices')}
            className={`whitespace-nowrap transition-colors hover:text-[#F52E68] py-1 cursor-pointer ${
              currentTab === 'notices' ? 'text-[#F52E68] font-bold border-b-2 border-[#F52E68]' : 'text-gray-700'
            }`}
          >
            নোটিশ
          </button>
          <button
            onClick={() => handleNavClick('events')}
            className={`whitespace-nowrap transition-colors hover:text-[#F52E68] py-1 cursor-pointer ${
              currentTab === 'events' ? 'text-[#F52E68] font-bold border-b-2 border-[#F52E68]' : 'text-gray-700'
            }`}
          >
            ইভেন্ট
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className={`whitespace-nowrap transition-colors hover:text-[#F52E68] py-1 cursor-pointer ${
              currentTab === 'about' ? 'text-[#F52E68] font-bold border-b-2 border-[#F52E68]' : 'text-gray-700'
            }`}
          >
            আমাদের সম্পর্কে
          </button>
        </nav>

        {/* Zone 3: Primary Actions & User Status */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Community Contribution Trigger */}
          <button
            onClick={onOpenPayment}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#111111] bg-[#F7F5F5] hover:bg-[#EAE6E7] border border-[#EAE6E7] rounded-xl transition-all cursor-pointer whitespace-nowrap"
            title="কমিউনিটি ফান্ড ও অনুদান"
          >
            <HeartHandshake className="w-4 h-4 text-[#F52E68]" />
            <span>তহবিল অনুদান</span>
          </button>

          {/* Real-time Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded-xl text-gray-700 hover:text-[#111111] hover:bg-[#F7F5F5] border border-[#EAE6E7] transition-all cursor-pointer"
            aria-label="নোটিফিকেশন"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#F52E68] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount > 9 ? '৯+' : unreadCount}
              </span>
            )}
          </button>

          {isAuthenticated && member ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <button
                  onClick={() => handleNavClick('admin')}
                  className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                    currentTab === 'admin'
                      ? 'bg-[#111111] text-white border-[#111111]'
                      : 'bg-[#F7F5F5] text-[#111111] border-[#EAE6E7] hover:border-[#111111]'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-[#F52E68]" />
                  <span>অ্যাডমিন প্যানেল</span>
                </button>
              )}

              <button
                onClick={() => handleNavClick('dashboard')}
                className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl border transition-all cursor-pointer ${
                  currentTab === 'dashboard'
                    ? 'border-[#F52E68] bg-[#F52E68]/5 text-[#F52E68]'
                    : 'border-[#EAE6E7] hover:border-gray-400 bg-white text-[#111111]'
                }`}
              >
                <img
                  src={member.profile_image_url || '/assets/aistudio/E4C57373-4D34-4620-B487-D44F42FFFC21_a7498b63.png'}
                  alt={member.nickname}
                  className="w-7 h-7 rounded-lg object-cover border border-[#EAE6E7]"
                  referrerPolicy="no-referrer"
                />
                <span className="text-xs font-bold whitespace-nowrap max-w-[90px] truncate">
                  {member.nickname}
                </span>
              </button>

              <button
                onClick={() => logout()}
                className="hidden md:flex p-2 text-gray-500 hover:text-[#F52E68] hover:bg-[#F7F5F5] rounded-xl transition-colors cursor-pointer"
                title="লগআউট"
                aria-label="লগআউট করুন"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNavClick('login')}
                className="px-3.5 py-2 text-xs font-semibold text-[#111111] hover:text-[#F52E68] transition-colors whitespace-nowrap cursor-pointer"
              >
                লগইন
              </button>
              <button
                onClick={() => handleNavClick('register')}
                className="px-4 py-2 text-xs font-bold text-white bg-[#F52E68] hover:bg-[#D91F57] rounded-xl shadow-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>সদস্য হও</span>
              </button>
            </div>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:bg-[#F7F5F5] rounded-xl border border-[#EAE6E7]"
            aria-label="মেনু খুলুন"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#EAE6E7] px-4 pt-3 pb-6 space-y-2 shadow-lg">
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3 py-2.5 text-left text-sm font-semibold rounded-lg ${
                currentTab === 'home' ? 'bg-[#F52E68]/10 text-[#F52E68]' : 'text-gray-800 hover:bg-gray-50'
              }`}
            >
              হোম
            </button>
            <button
              onClick={() => handleNavClick('members')}
              className={`px-3 py-2.5 text-left text-sm font-semibold rounded-lg ${
                currentTab === 'members' ? 'bg-[#F52E68]/10 text-[#F52E68]' : 'text-gray-800 hover:bg-gray-50'
              }`}
            >
              সদস্যবৃন্দ
            </button>
            <button
              onClick={() => handleNavClick('activities')}
              className={`px-3 py-2.5 text-left text-sm font-semibold rounded-lg flex items-center justify-between ${
                currentTab === 'activities' ? 'bg-[#F52E68]/10 text-[#F52E68]' : 'text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span>কর্মকাণ্ডসমূহ</span>
              <span className="text-[10px] bg-[#F52E68] text-white px-2 py-0.5 rounded-full font-bold">নতুন</span>
            </button>
            <button
              onClick={() => handleNavClick('fund')}
              className={`px-3 py-2.5 text-left text-sm font-semibold rounded-lg ${
                currentTab === 'fund' ? 'bg-[#F52E68]/10 text-[#F52E68]' : 'text-gray-800 hover:bg-gray-50'
              }`}
            >
              তহবিল ইতিহাস
            </button>
            <button
              onClick={() => handleNavClick('notices')}
              className={`px-3 py-2.5 text-left text-sm font-semibold rounded-lg ${
                currentTab === 'notices' ? 'bg-[#F52E68]/10 text-[#F52E68]' : 'text-gray-800 hover:bg-gray-50'
              }`}
            >
              নোটিশ
            </button>
            <button
              onClick={() => handleNavClick('events')}
              className={`px-3 py-2.5 text-left text-sm font-semibold rounded-lg ${
                currentTab === 'events' ? 'bg-[#F52E68]/10 text-[#F52E68]' : 'text-gray-800 hover:bg-gray-50'
              }`}
            >
              ইভেন্ট
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className={`px-3 py-2.5 text-left text-sm font-semibold rounded-lg ${
                currentTab === 'about' ? 'bg-[#F52E68]/10 text-[#F52E68]' : 'text-gray-800 hover:bg-gray-50'
              }`}
            >
              আমাদের সম্পর্কে
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPayment();
              }}
              className="px-3 py-2.5 text-left text-sm font-semibold text-[#111111] hover:bg-gray-50 rounded-lg flex items-center justify-between"
            >
              <span>তহবিল ও অনুদান</span>
              <HeartHandshake className="w-4 h-4 text-[#F52E68]" />
            </button>
          </div>

          <div className="pt-3 border-t border-[#EAE6E7] flex flex-col gap-2">
            {isAuthenticated && member ? (
              <>
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className="w-full py-2.5 px-3 bg-[#F7F5F5] text-left text-sm font-bold text-[#111111] rounded-xl flex items-center gap-2 border border-[#EAE6E7]"
                >
                  <User className="w-4 h-4 text-[#F52E68]" />
                  <span>আমার প্রোফাইল ({member.nickname})</span>
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleNavClick('admin')}
                    className="w-full py-2.5 px-3 bg-[#111111] text-white text-sm font-bold rounded-xl flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4 text-[#F52E68]" />
                    <span>অ্যাডমিন ড্যাশবোর্ড</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full py-2 px-3 text-red-600 hover:bg-red-50 text-sm font-semibold rounded-xl text-left flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>লগআউট করুন</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleNavClick('login')}
                  className="py-2.5 text-center text-sm font-semibold text-[#111111] bg-[#F7F5F5] rounded-xl border border-[#EAE6E7]"
                >
                  লগইন
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="py-2.5 text-center text-sm font-bold text-white bg-[#F52E68] rounded-xl shadow-sm"
                >
                  সদস্য হও
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
