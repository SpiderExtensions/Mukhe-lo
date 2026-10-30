/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { NotificationDrawer } from './components/NotificationDrawer';
import { PaymentModal } from './components/PaymentModal';

import { HomePage } from './pages/HomePage';
import { RegistrationPage } from './pages/RegistrationPage';
import { LoginPage } from './pages/LoginPage';
import { MemberDashboardPage } from './pages/MemberDashboardPage';
import { MembersDirectoryPage } from './pages/MembersDirectoryPage';
import { NoticeBoardPage } from './pages/NoticeBoardPage';
import { EventsPage } from './pages/EventsPage';
import { AboutPage } from './pages/AboutPage';
import { FundPage } from './pages/FundPage';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { api } from './api';
import { Notice, CommunityEvent } from './types';

function MainApp() {
  const { isAuthenticated, member, isAdmin } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(null);

  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);

  // Sync hash routing if present
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash && ['home', 'members', 'activities', 'notices', 'events', 'about', 'fund', 'login', 'register', 'dashboard', 'admin'].includes(hash)) {
        setCurrentTab(hash);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Fetch initial unread notification count
  useEffect(() => {
    async function checkNotifications() {
      try {
        const notifs = await api.getNotifications();
        setUnreadNotifCount(notifs.length);
      } catch {
        // ignore
      }
    }
    checkNotifications();
    const interval = setInterval(checkNotifications, 30000); // 30 sec polling
    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (tab: string, itemData?: any) => {
    if (tab === 'notices' && itemData) {
      setSelectedNotice(itemData);
    } else if (tab === 'notices') {
      setSelectedNotice(null);
    }

    if (tab === 'events' && itemData) {
      setSelectedEvent(itemData);
    } else if (tab === 'events') {
      setSelectedEvent(null);
    }

    setCurrentTab(tab);
    window.location.hash = `#/${tab}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenNotifications = () => {
    setIsNotificationOpen(true);
    setUnreadNotifCount(0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111]">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenNotifications={handleOpenNotifications}
        onOpenPayment={() => setIsPaymentOpen(true)}
        unreadCount={unreadNotifCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 md:pb-0">
        {currentTab === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onOpenPayment={() => setIsPaymentOpen(true)}
          />
        )}

        {currentTab === 'members' && (
          <MembersDirectoryPage onNavigate={handleNavigate} />
        )}

        {currentTab === 'activities' && (
          <ActivitiesPage onNavigate={handleNavigate} />
        )}

        {currentTab === 'notices' && (
          <NoticeBoardPage
            initialSelectedNotice={selectedNotice}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'events' && (
          <EventsPage
            initialSelectedEvent={selectedEvent}
            onNavigate={handleNavigate}
            onOpenPayment={() => setIsPaymentOpen(true)}
          />
        )}

        {currentTab === 'about' && (
          <AboutPage
            onNavigate={handleNavigate}
            onOpenPayment={() => setIsPaymentOpen(true)}
          />
        )}

        {currentTab === 'fund' && (
          <FundPage onOpenPayment={() => setIsPaymentOpen(true)} />
        )}

        {currentTab === 'register' && (
          <RegistrationPage onNavigate={handleNavigate} />
        )}

        {currentTab === 'login' && (
          <LoginPage onNavigate={handleNavigate} />
        )}

        {currentTab === 'dashboard' && (
          <MemberDashboardPage
            onNavigate={handleNavigate}
            onOpenPayment={() => setIsPaymentOpen(true)}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboardPage onNavigate={handleNavigate} />
        )}

        {!['home', 'members', 'activities', 'notices', 'events', 'about', 'fund', 'register', 'login', 'dashboard', 'admin'].includes(currentTab) && (
          <NotFoundPage onNavigate={handleNavigate} />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Authenticated Member Mobile Bottom Navigation Bar */}
      {isAuthenticated && (
        <MobileBottomNav currentTab={currentTab} onNavigate={handleNavigate} />
      )}

      {/* Real-Time Notification Center Drawer */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      {/* Integrated Community Fund & Encrypted Payment Gateway Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onPaymentSuccess={() => {
          setUnreadNotifCount((prev) => prev + 1);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
