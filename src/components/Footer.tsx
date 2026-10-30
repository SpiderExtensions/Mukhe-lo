import React from 'react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-[#111111] text-white border-t border-neutral-800 pt-16 pb-24 md:pb-16 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-neutral-800">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center overflow-hidden border border-neutral-700">
                <img
                  src="/assets/aistudio/E4C57373-4D34-4620-B487-D44F42FFFC21_a7498b63.png"
                  alt="মুখে ল"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight text-white">মুখে ল</h3>
                <p className="text-xs text-neutral-400 uppercase tracking-widest">
                  MUKHE L · PRIVATE UNDERGROUND BENGALI COMMUNITY
                </p>
              </div>
            </div>
            <p className="text-neutral-400 text-sm max-w-md leading-relaxed">
              আমরা শুধু একটি গ্রুপ নই, আমরা একটি পরিবার। মুখে ল একটি স্বতন্ত্র, আধুনিক ও ঐক্যবদ্ধ বাংলা প্রাইভেট কমিউনিটি। আত্মপ্রকাশের স্বাধীনতা, পরস্পরের প্রতি শ্রদ্ধা ও সৃজনশীলতার মেলবন্ধন আমাদের শক্তি।
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F52E68] mb-4">
              দ্রুত নেভিগেশন
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-300">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  হোমপেজ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('members')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  সদস্যবৃন্দ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('activities')}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>কর্মকাণ্ডসমূহ</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F52E68]" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('notices')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  নোটিশ বোর্ড
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('events')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  ইভেন্টস ও মিটআপ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  আমাদের সম্পর্কে
                </button>
              </li>
            </ul>
          </div>

          {/* Community Info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F52E68] mb-4">
              কমিউনিটি নিরাপত্তা
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed mb-3">
              মুখে ল-এ প্রতিটি সদস্যের গোপনীয়তা সংরক্ষিত। সদস্য যাচাইয়ের জন্য ফ্রন্ট ক্যামেরা সেলফি বাধ্যতামূলক এবং লগইন সম্পূর্ণ নিরাপদ ৬-সংখ্যার এনক্রিপ্টেড পিনের মাধ্যমে নিয়ন্ত্রিত।
            </p>
            <div className="text-xs text-neutral-500 space-y-1">
              <div>প্ল্যাটফর্ম: প্রাইভেট বাংলা নেটওয়ার্ক</div>
              <div>সার্ভার অবস্থা: সক্রিয় ও নিরাপদ</div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-4">
          <p>© মুখে ল | সর্বস্বত্ব সংরক্ষিত</p>
          <div className="flex items-center gap-6">
            <span>গোপনীয়তা সুরক্ষা</span>
            <span>·</span>
            <span>কমিউনিটি নির্দেশিকা</span>
            <span>·</span>
            <span>২০২৬ এডিশন</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
