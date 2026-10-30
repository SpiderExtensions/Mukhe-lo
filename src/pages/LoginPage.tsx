import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Eye, EyeOff, AlertCircle, ArrowRight, Sparkles, User } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (tab: string) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const { login } = useAuth();
  const [nickname, setNickname] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nickname.trim()) {
      setError('অনুগ্রহ করে আপনার ইমেইল অথবা গ্রুপ নিকনেম লিখুন।');
      return;
    }

    if (!pin.trim()) {
      setError('অনুগ্রহ করে আপনার ৬ সংখ্যার পিন লিখুন।');
      return;
    }

    if (pin.trim().length !== 6 || !/^\d+$/.test(pin.trim())) {
      setError('পিন কোডটি অবশ্যই ৬ সংখ্যার হতে হবে।');
      return;
    }

    setLoading(true);

    try {
      await login(nickname.trim(), pin.trim());
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'ভুল তথ্য প্রদান করা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-[#F7F5F5] border border-[#EAE6E7] p-2 mx-auto mb-4 flex items-center justify-center shadow-sm">
          <img
            src="/assets/aistudio/E4C57373-4D34-4620-B487-D44F42FFFC21_a7498b63.png"
            alt="মুখে ল"
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
          আবার ফিরে আসায় স্বাগতম!
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          আপনার ইমেইল অথবা গ্রুপ নিকনেম ও গোপন পিন দিয়ে অ্যাকাউন্টে প্রবেশ করুন।
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#EAE6E7] p-6 sm:p-8 shadow-sm">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email or Group Nickname */}
          <div>
            <label className="block text-xs font-bold text-[#111111] mb-1.5">
              ১. আপনার ইমেইল অথবা গ্রুপ নিকনেম
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="ইমেইল (name@mail.com) অথবা নিকনেম লিখুন"
                className="w-full pl-11 pr-4 py-3 text-sm bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl focus:border-[#F52E68] focus:bg-white outline-none transition-all"
                required
                autoComplete="username"
              />
            </div>
          </div>

          {/* 6-Digit PIN */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#111111]">
                ২. আপনার ৬ সংখ্যার পিন
              </label>
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="text-xs font-semibold text-gray-500 hover:text-[#F52E68] flex items-center gap-1 cursor-pointer"
              >
                {showPin ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>পিন লুকান</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>পিন দেখুন</span>
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPin ? 'text' : 'password'}
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••••"
                className="w-full pl-11 pr-4 py-3 text-sm bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl focus:border-[#F52E68] focus:bg-white outline-none transition-all font-mono tracking-widest text-lg"
                required
                autoComplete="current-password"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              নিবন্ধনের সময় প্রাপ্ত ৬-সংখ্যার গোপন পিন নম্বর প্রদান করুন।
            </p>
          </div>

          {/* Persistent Login Checkbox */}
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-gray-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#F52E68] focus:ring-[#F52E68] accent-[#F52E68]"
              />
              <span>আমাকে লগইন রাখুন (Persistent Session)</span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#F52E68] hover:bg-[#D91F57] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-hard-pink active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>যাচাইকরণ চলছে...</span>
              ) : (
                <>
                  <span>লগইন করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-[#EAE6E7] text-center text-xs text-gray-500">
          নতুন সদস্য হতে চান?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="text-[#F52E68] font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            <span>নতুন সদস্য নিবন্ধন করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
}
