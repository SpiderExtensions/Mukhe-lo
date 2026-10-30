import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { PaymentRecord } from '../types';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Lock,
  Heart,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  PhoneCall,
  Clock,
  Sparkles,
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: (record: PaymentRecord) => void;
}

export function PaymentModal({ isOpen, onClose, onPaymentSuccess }: PaymentModalProps) {
  const { member } = useAuth();

  // Step 1: Donor & Amount info; Step 2: Send Money instructions & Transaction ID; Step 3: Pending Confirmation
  const [modalStep, setModalStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [method, setMethod] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [amount, setAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('কমিউনিটি ফান্ড অনুদান');
  const [donorName, setDonorName] = useState<string>(member?.nickname || member?.full_name || '');
  const [senderNumber, setSenderNumber] = useState<string>(member?.phone_number || '');
  const [transactionId, setTransactionId] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [copiedNumber, setCopiedNumber] = useState<boolean>(false);
  const [completedPayment, setCompletedPayment] = useState<PaymentRecord | null>(null);

  if (!isOpen) return null;

  const finalAmount = customAmount ? parseFloat(customAmount) : amount;
  const OFFICIAL_ACCOUNT_NUMBER = '01716163840'; // বিকাশ, নগদ, রকেট একটাই নাম্বার
  const OFFICIAL_ACCOUNT_BENGALI = '০১৭১৬১৬৩৮৪০';

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(OFFICIAL_ACCOUNT_NUMBER);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!finalAmount || isNaN(finalAmount) || finalAmount < 10) {
      setError('অনুগ্রহ করে ন্যূনতম ১০ টাকার বৈধ পরিমাণ উল্লেখ করুন।');
      return;
    }

    if (!donorName.trim()) {
      setError('অনুগ্রহ করে আপনার নাম বা নিকনেম লিখুন।');
      return;
    }

    if (!senderNumber.trim() || senderNumber.trim().length < 10) {
      setError('অনুগ্রহ করে আপনার সঠিক প্রেরক নম্বর লিখুন।');
      return;
    }

    setModalStep(2);
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!transactionId.trim() || transactionId.trim().length < 4) {
      setError('অনুগ্রহ করে টাকা পাঠানোর পর প্রাপ্ত সঠিক ট্রানজেকশন আইডি (Transaction ID) লিখুন।');
      return;
    }

    setLoading(true);

    // Simulate authentic verification check with delay
    setTimeout(async () => {
      try {
        const res = await api.submitPayment({
          amount: finalAmount,
          method,
          purpose,
          sender_number: senderNumber.trim(),
          donor_name: donorName.trim(),
          transaction_id: transactionId.trim().toUpperCase(),
        });

        if (res.success && res.transaction) {
          setCompletedPayment(res.transaction);
          setModalStep(3);
          if (onPaymentSuccess) {
            onPaymentSuccess(res.transaction);
          }
        }
      } catch (err: any) {
        setError(err.message || 'পেমেন্ট ভেরিফিকেশন সম্পন্ন করা সম্ভব হয়নি।');
      } finally {
        setLoading(false);
      }
    }, 1200);
  };

  const handleReset = () => {
    setModalStep(1);
    setTransactionId('');
    setError('');
    setCompletedPayment(null);
    onClose();
  };

  const getMethodTitle = () => {
    if (method === 'bkash') return 'বিকাশ (bKash)';
    if (method === 'nagad') return 'নগদ (Nagad)';
    return 'রকেট (Rocket)';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop Click Dismiss */}
      <div className="fixed inset-0" onClick={handleReset} />

      {/* Modal Card - Fixed Responsive Height & Proper Overflow */}
      <div className="relative bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#EAE6E7] z-10 overflow-hidden">
        {/* Sticky Header with prominent EXIT button */}
        <div className="px-6 py-4 bg-[#F7F5F5] border-b border-[#EAE6E7] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F52E68]/10 text-[#F52E68] flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 fill-[#F52E68]" />
            </div>
            <div>
              <h3 className="font-bold text-[#111111] text-base leading-tight">
                {modalStep === 1 && 'কমিউনিটি তহবিল ও অনুদান'}
                {modalStep === 2 && 'ট্রানজেকশন ভেরিফিকেশন'}
                {modalStep === 3 && 'অনুদান জমা সম্পন্ন'}
              </h3>
              <p className="text-[11px] text-gray-500">মুখে ল ঐক্য ও সংহতি তহবিল</p>
            </div>
          </div>

          {/* Prominent High-Contrast Exit Button */}
          <button
            onClick={handleReset}
            className="px-3 py-1.5 bg-neutral-200 hover:bg-[#F52E68] hover:text-white text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            aria-label="বন্ধ করুন"
            title="পপআপ বন্ধ করুন (Exit)"
          >
            <span>এক্সিটের বোতাম</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-5 sm:p-7 flex-1 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* STEP 1: Enter details */}
          {modalStep === 1 && (
            <form onSubmit={handleStep1Next} className="space-y-4 text-xs">
              {/* Method Selection: bKash, Nagad, Rocket */}
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">
                  পেমেন্ট মাধ্যম নির্বাচন করুন
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'bkash', label: 'বিকাশ', sub: 'bKash', border: 'border-pink-500 bg-pink-50/40 text-pink-700' },
                    { id: 'nagad', label: 'নগদ', sub: 'Nagad', border: 'border-orange-500 bg-orange-50/40 text-orange-700' },
                    { id: 'rocket', label: 'রকেট', sub: 'Rocket', border: 'border-purple-500 bg-purple-50/40 text-purple-700' },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setMethod(item.id as any)}
                      className={`py-2.5 px-2 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        method === item.id
                          ? item.border + ' shadow-sm scale-102'
                          : 'border-[#EAE6E7] bg-[#F7F5F5] text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <span className="font-extrabold text-sm">{item.label}</span>
                      <span className="text-[10px] text-gray-500 uppercase">{item.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Selection */}
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">
                  অনুদানের পরিমাণ (টাকা)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[100, 300, 500, 1000].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => {
                        setAmount(preset);
                        setCustomAmount('');
                      }}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        amount === preset && !customAmount
                          ? 'border-[#111111] bg-[#111111] text-white shadow-sm'
                          : 'border-[#EAE6E7] bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      ৳{preset}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder="অথবা অন্য যেকোনো পরিমাণ লিখুন (যেমন: ২০০০)"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl focus:border-[#F52E68] focus:bg-white outline-none font-mono"
                  min="10"
                />
              </div>

              {/* Donor Name & Sender Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    আপনার নাম / অনুদানকারী নাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="আপনার পূর্ণ নাম"
                    className="w-full px-3.5 py-2.5 bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl focus:border-[#F52E68] focus:bg-white outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    আপনার {getMethodTitle()} নম্বর <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl focus:border-[#F52E68] focus:bg-white outline-none font-mono"
                    required
                  />
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  অবদানের উদ্দেশ্য
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl focus:border-[#F52E68] focus:bg-white outline-none"
                >
                  <option value="কমিউনিটি ফান্ড অনুদান">কমিউনিটি ফান্ড অনুদান (Community Fund)</option>
                  <option value="মাসিক সদস্যপদ ফি">মাসিক সদস্যপদ ফি (Monthly Dues)</option>
                  <option value="ইভেন্ট ও সাংস্কৃতিক আয়োজন">ইভেন্ট ও সাংস্কৃতিক আয়োজন (Event Fund)</option>
                  <option value="সহযোদ্ধাদের পাশে দাঁড়ানো">সহযোদ্ধাদের আপদকালীন সহায়তা</option>
                </select>
              </div>

              {/* Next Step Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#F52E68] hover:bg-[#D91F57] text-white font-bold text-xs rounded-xl shadow-hard-pink active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>পরবর্তী ধাপ (ট্রানজেকশন ভেরিফিকেশন)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Instruction & Transaction Verification */}
          {modalStep === 2 && (
            <form onSubmit={handleVerifySubmit} className="space-y-4 text-xs">
              {/* Account details box */}
              <div className="p-4 rounded-2xl bg-[#111111] text-white border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#F52E68] font-bold uppercase tracking-wider">
                    আমাদের অফিশিয়াল পার্সোনাল নম্বর (একটাই নাম্বার)
                  </span>
                  <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded">
                    Personal / Send Money
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 bg-neutral-900 p-3 rounded-xl border border-neutral-800">
                  <div>
                    <div className="text-xl sm:text-2xl font-mono font-extrabold text-white tracking-widest">
                      {OFFICIAL_ACCOUNT_NUMBER}
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">
                      এই একটি নম্বরেই বিকাশ, নগদ এবং রকেট তিনটাই সচল রয়েছে
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white rounded-lg transition-colors flex items-center gap-1.5 shrink-0 border border-neutral-700 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedNumber ? 'কপি হয়েছে!' : 'কপি করুন'}</span>
                  </button>
                </div>

                <div className="text-[11px] text-neutral-300 leading-relaxed space-y-1">
                  <p>
                    📌 <strong>পেমেন্ট নির্দেশিকা:</strong> আপনার <strong>{getMethodTitle()}</strong> অ্যাপ থেকে উপরের নম্বরে নির্ধারিত <strong>৳{finalAmount}</strong> টাকা সেন্ড মানি (Send Money) সম্পন্ন করুন।
                  </p>
                  <p className="text-neutral-400 text-[10px]">
                    টাকা পাঠানোর পর প্রাপ্ত ফিরতি SMS অথবা অ্যাপে প্রদর্শিত Transaction ID (যেমন: 8X9Y7Z বা BKH2819) নিচে লিখুন।
                  </p>
                </div>
              </div>

              {/* Transaction ID Input */}
              <div>
                <label className="block font-bold text-[#111111] mb-1.5">
                  আপনার ট্রানজেকশন আইডি (Transaction ID) লিখুন <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                  placeholder="যেমন: BL839201 অথবা ট্রানজেকশন কোড"
                  className="w-full px-4 py-3 bg-[#F7F5F5] border-2 border-[#111111] rounded-xl focus:border-[#F52E68] focus:bg-white outline-none font-mono text-sm tracking-wider font-bold"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#F52E68] hover:bg-[#D91F57] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-hard-pink active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>যাচাইকরণ প্রক্রিয়া চলছে...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>ভেরিফাই ও সাবমিট করুন</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setModalStep(1)}
                  disabled={loading}
                  className="w-full py-2.5 text-xs font-semibold text-gray-600 hover:text-[#111111] flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>পূর্ববর্তী তথ্যে পরিবর্তন আনুন</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Pending Confirmation & Digital Receipt */}
          {modalStep === 3 && completedPayment && (
            <div className="text-center py-2 space-y-4">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border-2 border-amber-200">
                <Clock className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#111111]">
                  আপনার ট্রানজেকশনটি পেন্ডিং (Pending) রাখা হয়েছে!
                </h3>
                <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto leading-relaxed">
                  অ্যাডমিন প্যানেল থেকে ট্রানজেকশন যাচাই সাপেক্ষে এটি অনুমোদিত হবে এবং পাবলিক অনুদান তালিকায় যুক্ত হবে।
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-[#F7F5F5] border border-[#EAE6E7] rounded-2xl p-4 text-left space-y-2.5 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-[#EAE6E7]">
                  <span className="text-gray-500">ট্রানজেকশন আইডি:</span>
                  <span className="font-mono font-bold text-[#111111]">{completedPayment.transaction_id}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500">অনুদানের পরিমাণ:</span>
                  <span className="text-sm font-extrabold text-[#F52E68]">৳{completedPayment.amount}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500">অনুদানকারী:</span>
                  <span className="font-bold text-gray-800">{completedPayment.donor_name}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500">মাধ্যম:</span>
                  <span className="uppercase font-bold">{completedPayment.method}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500">উদ্দেশ্য:</span>
                  <span className="font-semibold">{completedPayment.purpose}</span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-[#EAE6E7]">
                  <span className="text-gray-500">বর্তমান স্ট্যাটাস:</span>
                  <span className="text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                    পেন্ডিং (অ্যাডমিন অনুমোদনের অপেক্ষায়)
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-3.5 bg-[#111111] hover:bg-neutral-800 text-white font-bold rounded-xl transition-all cursor-pointer text-xs"
                >
                  সম্পন্ন ও বন্ধ করুন (Exit)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
