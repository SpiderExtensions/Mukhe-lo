import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BANGLADESH_DISTRICTS, ALL_DISTRICT_NAMES } from '../data/bangladeshGeo';
import {
  Camera,
  CheckCircle2,
  Copy,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Shield,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  Lock,
  MapPin,
  Search,
} from 'lucide-react';

interface RegistrationPageProps {
  onNavigate: (tab: string) => void;
}

export function RegistrationPage({ onNavigate }: RegistrationPageProps) {
  const { register } = useAuth();

  // Multi-step: 1 = Personal Info & Location, 2 = Selfie Capture, 3 = Confirmation, 4 = PIN Success Display
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1 Form Data
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [instagram, setInstagram] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Bangladesh Dynamic Location
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedUpazila, setSelectedUpazila] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [upazilaSearch, setUpazilaSearch] = useState('');

  const [formError, setFormError] = useState('');

  // Step 2 Camera & Selfie
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);
  const [selfieConfirmed, setSelfieConfirmed] = useState(false);

  // Step 3 Submission & Progress Loading
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  // Step 4 PIN Reveal Screen
  const [generatedPin, setGeneratedPin] = useState('');
  const [isInitialAdmin, setIsInitialAdmin] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);

  const loadingMessages = [
    'আপনার সদস্যপদ তৈরি হচ্ছে...',
    'আপনার প্রোফাইল প্রস্তুত করা হচ্ছে...',
    'মুখে ল পরিবারে আপনাকে স্বাগতম!',
  ];

  // Upazilas of selected district
  const availableUpazilas = selectedDistrict && BANGLADESH_DISTRICTS[selectedDistrict]
    ? BANGLADESH_DISTRICTS[selectedDistrict].upazilas
    : [];

  const selectedDivision = selectedDistrict && BANGLADESH_DISTRICTS[selectedDistrict]
    ? BANGLADESH_DISTRICTS[selectedDistrict].division
    : '';

  // Filtered districts & upazilas for search
  const filteredDistricts = ALL_DISTRICT_NAMES.filter(d =>
    d.toLowerCase().includes(districtSearch.toLowerCase().trim())
  );

  const filteredUpazilas = availableUpazilas.filter(u =>
    u.toLowerCase().includes(upazilaSearch.toLowerCase().trim())
  );

  // Stop camera helper
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Start front-facing camera
  const startCamera = async () => {
    setCameraError('');
    try {
      stopCamera();
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      let msg = 'ক্যামেরা সংযোগ স্থাপন করা সম্ভব হয়নি।';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'ক্যামেরা ব্যবহারের অনুমতি বাতিল করা হয়েছে। ব্রাউজারের অ্যাড্রেস বার থেকে ক্যামেরার অনুমতি চালু করে পুনরায় চেষ্টা করুন।';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'আপনার ডিভাইসে কোনো উপযুক্ত ফ্রন্ট ক্যামেরা পাওয়া যায়নি।';
      }
      setCameraError(msg);
      setCameraActive(false);
    }
  };

  useEffect(() => {
    if (step === 2 && !capturedSelfie) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [step]);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const size = Math.min(video.videoWidth, video.videoHeight) || 480;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const startX = (video.videoWidth - size) / 2;
    const startY = (video.videoHeight - size) / 2;
    ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedSelfie(dataUrl);
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedSelfie(null);
    setSelfieConfirmed(false);
    startCamera();
  };

  const handleConfirmSelfie = () => {
    if (!capturedSelfie) return;
    setSelfieConfirmed(true);
    stopCamera();
    setStep(3);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setCameraError('অনুগ্রহ করে শুধুমাত্র ছবি ফাইল নির্বাচন করুন।');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCapturedSelfie(result);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName.trim()) {
      setFormError('অনুগ্রহ করে আপনার পুরো নাম লিখুন।');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setFormError('অনুগ্রহ করে আপনার সঠিক ইমেইল এড্রেস লিখুন।');
      return;
    }

    if (!instagram.trim()) {
      setFormError('অনুগ্রহ করে আপনার ইনস্টাগ্রাম ইউজারনেম লিখুন।');
      return;
    }

    if (!nickname.trim()) {
      setFormError('অনুগ্রহ করে আপনার গ্রুপ নিকনেম লিখুন (লগইনের জন্য প্রযোজ্য)।');
      return;
    }

    if (nickname.trim().length < 2) {
      setFormError('নিকনেম ন্যূনতম ২ অক্ষরের হতে হবে।');
      return;
    }

    if (!selectedDistrict) {
      setFormError('অনুগ্রহ করে আপনার জেলা নির্বাচন করুন।');
      return;
    }

    if (!selectedUpazila) {
      setFormError('অনুগ্রহ করে আপনার উপজেলা অথবা থানা নির্বাচন করুন।');
      return;
    }

    setStep(2);
  };

  const handleFinalSubmit = async () => {
    if (!capturedSelfie) {
      setFormError('সেলফি যাচাইকরণ বাধ্যতামূলক।');
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    const interval = setInterval(() => {
      setLoadingTextIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 900);

    try {
      const result = await register({
        full_name: fullName.trim(),
        nickname: nickname.trim(),
        email: email.trim(),
        instagram_username: instagram.trim().replace(/^@/, ''),
        phone_number: phoneNumber.trim() || undefined,
        selfie_data: capturedSelfie,
        division: selectedDivision,
        district: selectedDistrict,
        upazila: selectedUpazila,
        thana: selectedUpazila,
      });

      clearInterval(interval);
      setGeneratedPin(result.raw_pin);
      setIsInitialAdmin(result.is_initial_admin);
      setStep(4);
    } catch (err: any) {
      clearInterval(interval);
      setFormError(err.message || 'নিবন্ধন প্রক্রিয়া সম্পন্ন করা সম্ভব হয়নি।');
      setStep(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPin = () => {
    if (generatedPin) {
      navigator.clipboard.writeText(generatedPin);
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12">
      {/* Brand Header */}
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
          {step === 4 ? 'সদস্যপদ সফল!' : 'মুখে ল-এ যোগ দিন'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          {step === 4
            ? 'আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে'
            : 'আপনার তথ্য ও অবস্থান নির্বাচন করে সদস্যপদ তৈরি করুন।'}
        </p>

        {/* Step Indicator */}
        {step < 4 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 1 ? 'bg-[#F52E68] text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              ১
            </span>
            <div className={`w-10 h-0.5 ${step >= 2 ? 'bg-[#F52E68]' : 'bg-gray-200'}`} />
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 2 ? 'bg-[#F52E68] text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              ২
            </span>
            <div className={`w-10 h-0.5 ${step >= 3 ? 'bg-[#F52E68]' : 'bg-gray-200'}`} />
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 3 ? 'bg-[#F52E68] text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              ৩
            </span>
          </div>
        )}
      </div>

      {/* STEP 1: Personal Info & Bangladesh District/Upazila Selection */}
      {step === 1 && (
        <div className="bg-white rounded-3xl border border-[#EAE6E7] p-6 sm:p-8 shadow-sm">
          {formError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleStep1Next} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#111111] mb-1.5">
                ১. আপনার নাম <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="আপনার পূর্ণ নাম লিখুন"
                className="w-full px-4 py-3 text-sm bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl focus:border-[#F52E68] focus:bg-white outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111111] mb-1.5">
                ২. আপনার ইনস্টাগ্রাম ইউজারনেম <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">
                  @
                </span>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="username"
                  className="w-full pl-8 pr-4 py-3 text-sm bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl focus:border-[#F52E68] focus:bg-white outline-none transition-all font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111111] mb-1.5">
                ৩. আপনার গ্রুপ নিকনেম <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="যেমন: দ্রোহী, নির্ভীক, বা নিজস্ব ডাকনাম"
                className="w-full px-4 py-3 text-sm bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl focus:border-[#F52E68] focus:bg-white outline-none transition-all"
                required
              />
              <p className="text-[11px] text-gray-400 mt-1">
                অতীব গুরুত্বপূর্ণ: লগইন করতে এই নিকনেম ব্যবহার করতে পারবেন। এটি অনন্য হতে হবে।
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111111] mb-1.5">
                ৪. আপনার ইমেইল এড্রেস <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="আপনার সঠিক ইমেইল লিখুন (যেমন: name@example.com)"
                className="w-full px-4 py-3 text-sm bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl focus:border-[#F52E68] focus:bg-white outline-none transition-all font-mono"
                required
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Supabase ইমেইল অথেন্টিকেশন ও লগইনে এই ইমেইলটি ব্যবহার করতে পারবেন।
              </p>
            </div>

            {/* BANGLADESH GEOGRAPHIC LOCATION: DISTRICT & UPAZILA / THANA */}
            <div className="pt-2 border-t border-[#EAE6E7] space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#111111]">
                <MapPin className="w-4 h-4 text-[#F52E68]" />
                <span>আপনার অবস্থান নির্বাচন (বাংলাদেশ - ৬৪ জেলা ও উপজেলা)</span>
              </div>

              {/* District Dropdown */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ৪. জেলা নির্বাচন করুন <span className="text-red-500">*</span>
                </label>
                <div className="space-y-1.5">
                  <select
                    value={selectedDistrict}
                    onChange={(e) => {
                      const dist = e.target.value;
                      setSelectedDistrict(dist);
                      setSelectedUpazila(''); // reset upazila when district changes
                      setUpazilaSearch('');
                    }}
                    className="w-full px-4 py-3 text-sm bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl focus:border-[#F52E68] focus:bg-white outline-none cursor-pointer"
                    required
                  >
                    <option value="">-- জেলা নির্বাচন করুন ({ALL_DISTRICT_NAMES.length}টি জেলা) --</option>
                    {ALL_DISTRICT_NAMES.map((dName) => (
                      <option key={dName} value={dName}>
                        {dName} ({BANGLADESH_DISTRICTS[dName].division} বিভাগ)
                      </option>
                    ))}
                  </select>

                  {selectedDivision && (
                    <div className="text-[11px] text-gray-500">
                      বিভাগ: <span className="font-bold text-[#111111]">{selectedDivision} বিভাগ</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Upazila / Thana Dependent Dropdown */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ৫. উপজেলা / থানা নির্বাচন করুন <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedUpazila}
                  onChange={(e) => setSelectedUpazila(e.target.value)}
                  disabled={!selectedDistrict}
                  className="w-full px-4 py-3 text-sm bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl focus:border-[#F52E68] focus:bg-white outline-none cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">
                    {!selectedDistrict
                      ? '-- প্রথমে জেলা নির্বাচন করুন --'
                      : `-- ${selectedDistrict} জেলার উপজেলা/থানা নির্বাচন করুন (${availableUpazilas.length}টি) --`}
                  </option>
                  {availableUpazilas.map((uName) => (
                    <option key={uName} value={uName}>
                      {uName}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1">
                  জেলা অনুযায়ী স্বয়ংক্রিয়ভাবে সংশ্লিষ্ট সকল উপজেলা ও মেট্রোপলিটন থানা লোড হবে।
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                ৬. ফোন নম্বর <span className="text-gray-400 font-normal">(ঐচ্ছিক)</span>
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full px-4 py-3 text-sm bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl focus:border-[#F52E68] focus:bg-white outline-none transition-all font-mono"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                ফোন নম্বর কোনো সাধারণ সদস্য বা পাবলিক ডিরেক্টরিতে কখনোই প্রকাশ করা হবে না।
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 bg-[#F52E68] hover:bg-[#D91F57] text-white font-bold text-sm rounded-xl shadow-hard-pink active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>পরবর্তী ধাপ (সেলফি যাচাইকরণ)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-[#EAE6E7] text-center text-xs text-gray-500">
            ইতিমধ্যে সদস্য হয়েছেন?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-[#F52E68] font-bold hover:underline cursor-pointer"
            >
              লগইন করুন
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Mandatory Selfie Verification */}
      {step === 2 && (
        <div className="bg-white rounded-3xl border border-[#EAE6E7] p-6 sm:p-8 shadow-sm">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-[#111111]">আপনার একটি সেলফি তুলুন</h2>
            <p className="text-xs text-gray-500 mt-1">
              আপনার সদস্য প্রোফাইলের জন্য একটি পরিষ্কার ছবি তুলুন। ফ্রন্ট ক্যামেরা ব্যবহার বাধ্যতামূলক।
            </p>
          </div>

          {cameraError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
              <p className="font-semibold mb-2">{cameraError}</p>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <button
                  onClick={startCamera}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>পুনরায় চেষ্টা করুন</span>
                </button>

                <label className="px-3 py-1.5 bg-white border border-red-300 text-red-700 rounded-lg font-bold hover:bg-red-50 cursor-pointer">
                  <span>ফাইল থেকে ছবি আপলোড</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          <div className="relative aspect-square max-w-xs mx-auto rounded-3xl overflow-hidden bg-neutral-900 border-2 border-[#111111] shadow-inner mb-6">
            {capturedSelfie ? (
              <img
                src={capturedSelfie}
                alt="সেলফি প্রিভিউ"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover -scale-x-100"
              />
            )}

            {!capturedSelfie && !cameraActive && !cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white">
                <Camera className="w-10 h-10 mb-2 text-gray-400" />
                <p className="text-xs text-gray-300">ক্যামেরা চালু হচ্ছে...</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {!capturedSelfie ? (
              <button
                onClick={handleCapture}
                disabled={!cameraActive}
                className="w-full py-3.5 bg-[#F52E68] hover:bg-[#D91F57] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-hard-pink active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>ছবি তুলুন</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleRetake}
                  className="py-3 bg-[#F7F5F5] hover:bg-[#EAE6E7] text-[#111111] font-bold text-xs rounded-xl border border-[#EAE6E7] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>আবার তুলুন</span>
                </button>
                <button
                  onClick={handleConfirmSelfie}
                  className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ছবি নিশ্চিত করুন</span>
                </button>
              </div>
            )}

            <button
              onClick={() => {
                stopCamera();
                setStep(1);
              }}
              className="w-full py-2.5 text-xs font-semibold text-gray-600 hover:text-[#111111] transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>পূর্ববর্তী ধাপে ফিরুন</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Final Confirmation Screen */}
      {step === 3 && (
        <div className="bg-white rounded-3xl border border-[#EAE6E7] p-6 sm:p-8 shadow-sm">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-[#111111]">তথ্য চূড়ান্ত যাচাইকরণ</h2>
            <p className="text-xs text-gray-500 mt-1">
              আপনার প্রদত্ত সকল তথ্য মিলিয়ে নিয়ে নিবন্ধন সম্পন্ন করুন।
            </p>
          </div>

          <div className="p-5 bg-[#F7F5F5] border border-[#EAE6E7] rounded-2xl flex flex-col sm:flex-row items-center gap-5 mb-6">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#111111] shrink-0 bg-neutral-900">
              <img
                src={capturedSelfie!}
                alt={nickname}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 text-center sm:text-left space-y-1.5 text-xs">
              <div>
                <span className="text-gray-400">নাম:</span>{' '}
                <span className="font-bold text-[#111111] text-sm">{fullName}</span>
              </div>
              <div>
                <span className="text-gray-400">গ্রুপ নিকনেম:</span>{' '}
                <span className="font-bold text-[#F52E68] text-sm">{nickname}</span>
              </div>
              <div>
                <span className="text-gray-400">ইনস্টাগ্রাম:</span>{' '}
                <span className="font-mono font-semibold text-gray-800">@{instagram.replace(/^@/, '')}</span>
              </div>
              <div>
                <span className="text-gray-400">অবস্থান:</span>{' '}
                <span className="font-bold text-gray-800">
                  {selectedUpazila}, {selectedDistrict} ({selectedDivision} বিভাগ)
                </span>
              </div>
              {phoneNumber && (
                <div>
                  <span className="text-gray-400">ফোন নম্বর:</span>{' '}
                  <span className="font-mono text-gray-800">{phoneNumber}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="w-full py-4 bg-[#F52E68] hover:bg-[#D91F57] disabled:opacity-75 text-white font-bold text-sm rounded-xl shadow-hard-pink active:translate-x-0.5 active:translate-y-0.5 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span className="text-xs font-semibold">{loadingMessages[loadingTextIndex]}</span>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  <span>সদস্যপদ সম্পন্ন করুন</span>
                </div>
              )}
            </button>

            <button
              onClick={() => setStep(2)}
              disabled={isSubmitting}
              className="w-full py-2.5 text-xs font-semibold text-gray-600 hover:text-[#111111] transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>সেলফি পরিবর্তন করুন</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Successful PIN Reveal */}
      {step === 4 && (
        <div className="bg-white rounded-3xl border-2 border-[#111111] p-6 sm:p-8 shadow-hard text-center space-y-6">
          <div className="w-16 h-16 bg-[#F52E68]/10 text-[#F52E68] rounded-2xl flex items-center justify-center mx-auto border border-[#F52E68]/30">
            <Sparkles className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#111111]">
              মুখে ল পরিবারে আপনাকে স্বাগতম!
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {isInitialAdmin
                ? 'আপনি এই প্ল্যাটফর্মের প্রতিষ্ঠাতা ও প্রধান প্রশাসক হিসেবে নিবন্ধিত হয়েছেন।'
                : 'আপনার সদস্যপদ সফলভাবে সক্রিয় করা হয়েছে।'}
            </p>
          </div>

          <div className="p-6 bg-[#111111] text-white rounded-2xl border border-neutral-800 space-y-4">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#F52E68]">
              <Lock className="w-4 h-4" />
              <span>আপনার ব্যক্তিগত ৬-সংখ্যার লগইন পিন</span>
            </div>

            <div className="text-4xl sm:text-5xl font-mono font-extrabold tracking-widest text-white selection:bg-[#F52E68]">
              {generatedPin}
            </div>

            <button
              onClick={handleCopyPin}
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white rounded-xl transition-colors cursor-pointer border border-neutral-700"
            >
              <Copy className="w-4 h-4" />
              <span>{copiedPin ? 'পিন কপি হয়েছে!' : 'পিন কপি করুন'}</span>
            </button>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs leading-relaxed font-medium">
            ⚠️ <strong>গুরুত্বপূর্ণ সতর্কতা:</strong> আপনার লগইন পিনটি নিরাপদে সংরক্ষণ করুন। এটি কাউকে জানাবেন না।
          </div>

          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full py-3.5 bg-[#F52E68] hover:bg-[#D91F57] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>সরাসরি ড্যাশবোর্ডে প্রবেশ করুন</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
