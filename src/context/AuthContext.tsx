import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Member, SystemStatus } from '../types';
import { api, getStoredToken, setStoredToken, clearStoredToken } from '../api';

interface AuthContextType {
  member: Member | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOwnerAdmin: boolean;
  isLoading: boolean;
  systemStatus: SystemStatus | null;
  login: (identifier: string, pin: string) => Promise<void>;
  register: (payload: {
    full_name: string;
    nickname: string;
    email: string;
    instagram_username: string;
    phone_number?: string;
    selfie_data: string;
    division: string;
    district: string;
    upazila: string;
    thana?: string;
  }) => Promise<{ raw_pin: string; is_initial_admin: boolean; member: Member }>;
  logout: () => Promise<void>;
  refreshMember: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshStatus = async () => {
    try {
      const status = await api.getStatus();
      setSystemStatus(status);
    } catch (err) {
      console.error('Failed to fetch status:', err);
    }
  };

  const refreshMember = async () => {
    const token = getStoredToken();
    if (!token) {
      setMember(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.getMe();
      if (res.success && res.member) {
        setMember(res.member);
      } else {
        clearStoredToken();
        setMember(null);
      }
    } catch {
      clearStoredToken();
      setMember(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshStatus();
    refreshMember();
  }, []);

  const login = async (identifier: string, pin: string) => {
    const res = await api.login({ identifier, nickname: identifier, pin });
    if (res.success && res.token) {
      setStoredToken(res.token);
      setMember(res.member);
      await refreshStatus();
    }
  };

  const register = async (payload: {
    full_name: string;
    nickname: string;
    email: string;
    instagram_username: string;
    phone_number?: string;
    selfie_data: string;
    division: string;
    district: string;
    upazila: string;
    thana?: string;
  }) => {
    const res = await api.register(payload);
    if (res.success && res.token) {
      setStoredToken(res.token);
      setMember(res.member);
      await refreshStatus();
      return {
        raw_pin: res.raw_pin,
        is_initial_admin: res.is_initial_admin,
        member: res.member,
      };
    }
    throw new Error('নিবন্ধন সম্পন্ন করা সম্ভব হয়নি।');
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    } finally {
      clearStoredToken();
      setMember(null);
    }
  };

  const isAuthenticated = !!member && member.status === 'active';
  const isAdmin = isAuthenticated && (member?.role === 'owner_admin' || member?.role === 'admin');
  const isOwnerAdmin = isAuthenticated && member?.role === 'owner_admin';

  return (
    <AuthContext.Provider
      value={{
        member,
        isAuthenticated,
        isAdmin,
        isOwnerAdmin,
        isLoading,
        systemStatus,
        login,
        register,
        logout,
        refreshMember,
        refreshStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
