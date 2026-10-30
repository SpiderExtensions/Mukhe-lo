import React from 'react';
import { Home, Flame, Users, Bell, User } from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export function MobileBottomNav({ currentTab, onNavigate }: MobileBottomNavProps) {
  const tabs = [
    { id: 'home', label: 'হোম', icon: Home },
    { id: 'activities', label: 'কর্মকাণ্ড', icon: Flame },
    { id: 'members', label: 'সদস্য', icon: Users },
    { id: 'notices', label: 'নোটিশ', icon: Bell },
    { id: 'dashboard', label: 'প্রোফাইল', icon: User },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EAE6E7] pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.04)]"
      aria-label="মোবাইল নেভিগেশন"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 cursor-pointer transition-transform active:scale-95 ${
                isActive ? 'text-[#F52E68]' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#F52E68] rounded-full" />
                )}
              </div>
              <span className={`text-[11px] font-medium tracking-tight mt-1 ${isActive ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
