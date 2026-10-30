import React, { useState, useEffect, useId } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { ActivityPost, ActivityCategory } from '../types';
import {
  Flame,
  Camera,
  Image as ImageIcon,
  Video,
  Send,
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  Pin,
  MapPin,
  BadgeCheck,
  Search,
  Filter,
  Plus,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Users,
  Compass,
  Sparkles,
  Play,
} from 'lucide-react';

interface ActivitiesPageProps {
  onNavigate: (tab: string) => void;
}

const CATEGORIES: { label: ActivityCategory; color: string; bg: string }[] = [
  { label: 'গ্যাং কর্মকাণ্ড', color: 'text-[#F52E68]', bg: 'bg-[#F52E68]/10 border-[#F52E68]/30' },
  { label: 'অভিযান', color: 'text-amber-600', bg: 'bg-amber-500/10 border-amber-500/30' },
  { label: 'আড্ডা ও মিটআপ', color: 'text-blue-600', bg: 'bg-blue-500/10 border-blue-500/30' },
  { label: 'সমাজসেবা', color: 'text-emerald-600', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  { label: 'জরুরি মুভমেন্ট', color: 'text-purple-600', bg: 'bg-purple-500/10 border-purple-500/30' },
  { label: 'সাধারণ', color: 'text-gray-700', bg: 'bg-gray-100 border-gray-200' },
];

function formatTimeAgo(isoString: string): string {
  try {
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diff < 60) return 'এইমাত্র';
    if (diff < 3600) return `${Math.floor(diff / 60)} মিনিট আগে`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ঘণ্টা আগে`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} দিন আগে`;
    return new Date(isoString).toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'পূর্বে';
  }
}

// Helper to extract YouTube video ID if URL is youtube
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
}

export function ActivitiesPage({ onNavigate }: ActivitiesPageProps) {
  const { member, isAuthenticated, isAdmin } = useAuth();
  const fileInputId = useId();

  const [activities, setActivities] = useState<ActivityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('সকল');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Create post modal/form state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [category, setCategory] = useState<ActivityCategory>('গ্যাং কর্মকাণ্ড');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Comment input per post: { [postId]: string }
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  // Lightbox for full image view
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Success toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getActivities({
        category: selectedCategory,
        search: searchQuery,
      });
      setActivities(data);
    } catch (err: any) {
      setError(err.message || 'কর্মকাণ্ডসমূহ লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [selectedCategory]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Image Upload handler (supports multi-image base64)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Limit to max 4 images
    if (images.length + files.length > 6) {
      setFormError('সর্বোচ্চ ৬টি ছবি আপলোড করা যাবে।');
      return;
    }

    setFormError(null);
    Array.from(files).forEach((file) => {
      if (file.size > 8 * 1024 * 1024) {
        setFormError('প্রতিটি ছবির সাইজ ৮ মেগাবাইটের মধ্যে হতে হবে।');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    // Reset file input
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit new activity
  const handleSubmitActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setFormError('কর্মকাণ্ডের বিবরণ লেখা আবশ্যক।');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const res = await api.createActivity({
        category,
        title: title.trim() || undefined,
        content: content.trim(),
        images,
        video_url: videoUrl.trim() || undefined,
      });

      if (res.success && res.activity) {
        setActivities((prev) => [res.activity, ...prev]);
        setIsCreateOpen(false);
        setTitle('');
        setContent('');
        setImages([]);
        setVideoUrl('');
        showToast('আপনার কর্মকাণ্ডের পোস্ট সফলভাবে প্রকাশিত হয়েছে!');
      }
    } catch (err: any) {
      setFormError(err.message || 'পোস্ট প্রকাশ করতে ব্যর্থ হয়েছে।');
    } finally {
      setSubmitting(false);
    }
  };

  // Like toggle
  const handleLike = async (postId: string) => {
    if (!isAuthenticated || !member) {
      showToast('রিঅ্যাক্ট দিতে প্রথমে লগইন করুন।');
      onNavigate('login');
      return;
    }

    try {
      const res = await api.toggleLikeActivity(postId);
      setActivities((prev) =>
        prev.map((item) => {
          if (item.id === postId) {
            return {
              ...item,
              likes: res.likes,
            };
          }
          return item;
        })
      );
    } catch (err: any) {
      showToast(err.message || 'রিঅ্যাক্ট আপডেট করা যায়নি।');
    }
  };

  // Add Comment
  const handleAddComment = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const commentText = (commentInputs[postId] || '').trim();
    if (!commentText) return;

    if (!isAuthenticated || !member) {
      showToast('মন্তব্য করতে প্রথমে লগইন করুন।');
      onNavigate('login');
      return;
    }

    try {
      setSubmittingComment((prev) => ({ ...prev, [postId]: true }));
      const res = await api.commentActivity(postId, commentText);

      setActivities((prev) =>
        prev.map((item) => {
          if (item.id === postId) {
            return {
              ...item,
              comments: res.comments,
            };
          }
          return item;
        })
      );

      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      // Ensure comments section is expanded
      setExpandedComments((prev) => ({ ...prev, [postId]: true }));
    } catch (err: any) {
      showToast(err.message || 'মন্তব্য প্রকাশ করা যায়নি।');
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // Delete activity
  const handleDelete = async (postId: string) => {
    if (!window.confirm('আপনি কি নিশ্চিতভাবে এই কর্মকাণ্ডের পোস্টটি মুছে ফেলতে চান?')) {
      return;
    }

    try {
      await api.deleteActivity(postId);
      setActivities((prev) => prev.filter((p) => p.id !== postId));
      showToast('পোস্টটি মুছে ফেলা হয়েছে।');
    } catch (err: any) {
      showToast(err.message || 'পোস্টটি মুছতে ব্যর্থ হয়েছে।');
    }
  };

  // Toggle Pin
  const handleTogglePin = async (postId: string) => {
    try {
      const res = await api.togglePinActivity(postId);
      setActivities((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, is_pinned: res.is_pinned } : p))
      );
      showToast(res.message);
    } catch (err: any) {
      showToast(err.message || 'পিন আপডেট করা যায়নি।');
    }
  };

  // Share post
  const handleShare = (postId: string) => {
    const url = `${window.location.origin}/#/activities`;
    navigator.clipboard.writeText(url).then(() => {
      showToast('পোস্টের লিংক কপি করা হয়েছে!');
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F5F5] pb-20">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#111111] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#EAE6E7]/30 flex items-center gap-3 animate-fade-in">
          <Sparkles className="w-5 h-5 text-[#F52E68]" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-white via-white to-[#F7F5F5] border-b border-[#EAE6E7] pt-10 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F52E68]/10 border border-[#F52E68]/20 text-[#F52E68] text-xs font-bold uppercase tracking-wider">
            <Flame className="w-4 h-4" />
            <span>গ্যাং এক্টিভিটিস ও ফিল্ড রিপোর্ট</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#111111] tracking-tight">
            মেম্বারদের কর্মকাণ্ডসমূহ
          </h1>

          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            মুখে ল পরিবারের সদস্যদের মাঠপর্যায়ের কার্যক্রম, গ্যাং কর্মকাণ্ড, জরুরি উদ্যোগ, আড্ডা, অভিযান ও স্মৃতিচারণ। আমাদের প্রতিটি সদস্যই সক্রিয় যোদ্ধা।
          </p>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto pt-2">
            <div className="bg-white rounded-2xl p-3 border border-[#EAE6E7] text-center shadow-sm">
              <span className="block text-2xl font-black text-[#111111]">{activities.length}</span>
              <span className="text-[11px] font-medium text-gray-500 uppercase">মোট কর্মকাণ্ড</span>
            </div>
            <div className="bg-white rounded-2xl p-3 border border-[#EAE6E7] text-center shadow-sm">
              <span className="block text-2xl font-black text-[#F52E68]">
                {activities.reduce((acc, curr) => acc + (curr.likes?.length || 0), 0)}
              </span>
              <span className="text-[11px] font-medium text-gray-500 uppercase">মোট রিঅ্যাক্ট</span>
            </div>
            <div className="bg-white rounded-2xl p-3 border border-[#EAE6E7] text-center shadow-sm">
              <span className="block text-2xl font-black text-[#111111]">
                {activities.reduce((acc, curr) => acc + (curr.comments?.length || 0), 0)}
              </span>
              <span className="text-[11px] font-medium text-gray-500 uppercase">মন্তব্য</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Create Post Action Box */}
        {isAuthenticated && member ? (
          <div className="bg-white rounded-3xl p-5 border border-[#EAE6E7] shadow-sm">
            <div className="flex items-center gap-3">
              <img
                src={member.profile_image_url || '/assets/aistudio/E4C57373-4D34-4620-B487-D44F42FFFC21_a7498b63.png'}
                alt={member.nickname}
                className="w-11 h-11 rounded-2xl object-cover border border-[#EAE6E7] shrink-0"
              />
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="flex-1 text-left px-4 py-3 bg-[#F7F5F5] hover:bg-[#EAE6E7]/60 text-gray-500 rounded-2xl text-sm font-medium border border-[#EAE6E7] transition-all cursor-pointer flex items-center justify-between"
              >
                <span>{member.nickname}, আপনার গ্যাং বা এলাকার কোনো কর্মকাণ্ড শেয়ার করুন...</span>
                <Plus className="w-5 h-5 text-[#F52E68]" />
              </button>
            </div>

            {/* Quick action triggers */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#EAE6E7] text-xs font-semibold text-gray-600">
              <button
                type="button"
                onClick={() => {
                  setCategory('গ্যাং কর্মকাণ্ড');
                  setIsCreateOpen(true);
                }}
                className="flex items-center gap-1.5 hover:text-[#F52E68] transition-colors cursor-pointer py-1"
              >
                <Flame className="w-4 h-4 text-[#F52E68]" />
                <span>গ্যাং কর্মকাণ্ড</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCategory('অভিযান');
                  setIsCreateOpen(true);
                }}
                className="flex items-center gap-1.5 hover:text-amber-600 transition-colors cursor-pointer py-1"
              >
                <Compass className="w-4 h-4 text-amber-500" />
                <span>অভিযান ও ফিল্ড</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreateOpen(true);
                }}
                className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer py-1"
              >
                <ImageIcon className="w-4 h-4 text-blue-500" />
                <span>ছবি ও ভিডিও</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-[#111111] to-[#222222] text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-[#F52E68] text-xs font-bold uppercase tracking-wider">
                <Flame className="w-4 h-4" />
                <span>মুখে ল মেম্বারদের ফিল্ড প্ল্যাটফর্ম</span>
              </div>
              <h3 className="text-lg font-bold">কমিউনিটির কর্মকাণ্ডে আপনার সক্রিয় অবদান যুক্ত করুন</h3>
              <p className="text-gray-300 text-xs">
                অভিযান, গ্যাং কর্মকাণ্ড বা আড্ডার ছবি ও ভিডিও পোস্ট করতে অথবা রিঅ্যাক্ট দিতে আপনার অ্যাকাউন্টে লগইন করুন।
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => onNavigate('login')}
                className="px-4 py-2.5 bg-[#F52E68] hover:bg-[#D91F57] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-[#F52E68]/30"
              >
                লগইন করুন
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all cursor-pointer"
              >
                সদস্য নিবন্ধন
              </button>
            </div>
          </div>
        )}

        {/* Filter Pills & Search Bar */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') fetchActivities();
                }}
                placeholder="কর্মকাণ্ড, সদস্য বা এলাকা খুঁজুন..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#EAE6E7] rounded-xl text-xs focus:outline-none focus:border-[#F52E68] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setTimeout(fetchActivities, 0);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Refresh button */}
            <button
              onClick={fetchActivities}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-[#EAE6E7] rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 text-gray-500" />
              <span>রিফ্রেশ ফিড</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('সকল')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                selectedCategory === 'সকল'
                  ? 'bg-[#111111] text-white border-[#111111] shadow-sm'
                  : 'bg-white text-gray-600 border-[#EAE6E7] hover:border-gray-400'
              }`}
            >
              সকল কর্মকাণ্ড
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedCategory === cat.label
                    ? 'bg-[#F52E68] text-white border-[#F52E68] shadow-sm'
                    : 'bg-white text-gray-600 border-[#EAE6E7] hover:border-[#F52E68]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#F52E68] animate-spin mx-auto" />
            <p className="text-xs text-gray-500 font-medium">কর্মকাণ্ডের ফিড লোড হচ্ছে...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-sm font-semibold text-red-700">{error}</p>
            <button
              onClick={fetchActivities}
              className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700"
            >
              পুনরায় চেষ্টা করুন
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && activities.length === 0 && (
          <div className="bg-white rounded-3xl border border-[#EAE6E7] p-12 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#F52E68]/10 border border-[#F52E68]/20 flex items-center justify-center">
              <Flame className="w-8 h-8 text-[#F52E68]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#111111]">এখনো কোনো কর্মকাণ্ডের পোস্ট নেই</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                {selectedCategory !== 'সকল' || searchQuery
                  ? 'আপনার নির্বাচিত ফিল্টারে কোনো কর্মকাণ্ড পাওয়া যায়নি।'
                  : 'মুখে ল পরিবারের সদস্য হয়ে সর্বপ্রথম আপনার এলাকার গ্যাং কর্মকাণ্ড, অভিযান বা আড্ডার মুহূর্ত শেয়ার করুন!'}
              </p>
            </div>
            {isAuthenticated && member && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F52E68] hover:bg-[#D91F57] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>প্রথম পোস্টটি তৈরি করুন</span>
              </button>
            )}
          </div>
        )}

        {/* Activities Feed Cards */}
        {!loading && !error && activities.length > 0 && (
          <div className="space-y-6">
            {activities.map((item) => {
              const hasLiked = isAuthenticated && member && item.likes?.includes(member.id);
              const isAuthor = isAuthenticated && member && member.id === item.member_id;
              const canDelete = isAuthor || isAdmin;
              const isCommentsExpanded = expandedComments[item.id] || false;
              const youTubeEmbed = item.video_url ? getYouTubeEmbedUrl(item.video_url) : null;
              const categoryObj = CATEGORIES.find((c) => c.label === item.category);

              return (
                <article
                  key={item.id}
                  className={`bg-white rounded-3xl border transition-all shadow-sm overflow-hidden ${
                    item.is_pinned ? 'border-[#F52E68]/50 ring-1 ring-[#F52E68]/20' : 'border-[#EAE6E7]'
                  }`}
                >
                  {/* Pinned Announcement Badge */}
                  {item.is_pinned && (
                    <div className="bg-[#F52E68]/10 border-b border-[#F52E68]/20 px-6 py-2 flex items-center justify-between text-xs font-bold text-[#F52E68]">
                      <div className="flex items-center gap-2">
                        <Pin className="w-3.5 h-3.5 fill-[#F52E68]" />
                        <span>পিন করা গুরুত্বপূর্ণ কর্মকাণ্ড</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-semibold"> মুখে ল অফিশিয়াল</span>
                    </div>
                  )}

                  <div className="p-5 sm:p-6 space-y-4">
                    {/* Post Header: Author info, location, category */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.author_avatar || '/assets/aistudio/E4C57373-4D34-4620-B487-D44F42FFFC21_a7498b63.png'}
                          alt={item.author_nickname}
                          className="w-12 h-12 rounded-2xl object-cover border border-[#EAE6E7] shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-[#111111] text-sm sm:text-base leading-tight">
                              {item.author_name}
                            </span>
                            {item.author_is_verified && (
                              <span title="ভেরিফাইড মেম্বারশিপ ব্যাজ" className="inline-flex items-center">
                                <BadgeCheck className="w-4 h-4 text-[#F52E68] fill-[#F52E68]/20" />
                              </span>
                            )}
                            <span className="text-xs text-gray-500 font-medium">@{item.author_nickname}</span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-gray-500 flex-wrap">
                            {item.author_district && (
                              <span className="inline-flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md font-medium">
                                <MapPin className="w-3 h-3 text-[#F52E68]" />
                                {item.author_upazila ? `${item.author_upazila}, ` : ''}
                                {item.author_district}
                              </span>
                            )}
                            <span>·</span>
                            <span>{formatTimeAgo(item.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Header Right: Category Badge & Admin Actions */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
                            categoryObj ? `${categoryObj.bg} ${categoryObj.color}` : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {item.category}
                        </span>

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleTogglePin(item.id)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              item.is_pinned
                                ? 'bg-[#F52E68] text-white border-[#F52E68]'
                                : 'bg-gray-100 text-gray-500 border-gray-200 hover:text-gray-900'
                            }`}
                            title={item.is_pinned ? 'আনপিন করুন' : 'পিন করুন'}
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-600 border border-gray-200 transition-colors cursor-pointer"
                            title="পোস্ট মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="space-y-2">
                      {item.title && (
                        <h4 className="text-base sm:text-lg font-bold text-[#111111] tracking-tight">
                          {item.title}
                        </h4>
                      )}
                      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                        {item.content}
                      </p>
                    </div>

                    {/* Media: Images Gallery */}
                    {item.images && item.images.length > 0 && (
                      <div className="pt-2">
                        {item.images.length === 1 ? (
                          <div
                            onClick={() => setLightboxImage(item.images[0])}
                            className="relative rounded-2xl overflow-hidden bg-black/5 max-h-[460px] cursor-pointer group"
                          >
                            <img
                              src={item.images[0]}
                              alt="কর্মকাণ্ডের ছবি"
                              className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <span className="opacity-0 group-hover:opacity-100 bg-black/70 text-white text-xs px-3 py-1.5 rounded-xl font-medium transition-opacity">
                                বড় করে দেখুন
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className={`grid gap-2 rounded-2xl overflow-hidden ${item.images.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
                            {item.images.slice(0, 4).map((img, idx) => (
                              <div
                                key={idx}
                                onClick={() => setLightboxImage(img)}
                                className="relative aspect-square bg-black/5 overflow-hidden cursor-pointer group"
                              >
                                <img
                                  src={img}
                                  alt={`কর্মকাণ্ড ছবি ${idx + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  referrerPolicy="no-referrer"
                                />
                                {idx === 3 && item.images.length > 4 && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-lg">
                                    +{item.images.length - 4}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Media: Video Player or YouTube Embed */}
                    {item.video_url && (
                      <div className="pt-2">
                        {youTubeEmbed ? (
                          <div className="relative aspect-video rounded-2xl overflow-hidden border border-[#EAE6E7] bg-black">
                            <iframe
                              src={youTubeEmbed}
                              title="কর্মকাণ্ডের ভিডিও"
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <div className="p-3 bg-[#F7F5F5] rounded-2xl border border-[#EAE6E7] flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-10 h-10 rounded-xl bg-[#F52E68]/10 text-[#F52E68] flex items-center justify-center shrink-0">
                                <Play className="w-5 h-5 fill-[#F52E68]" />
                              </div>
                              <div className="truncate">
                                <span className="block text-xs font-bold text-[#111111]">ভিডিও লিংক সংযুক্ত</span>
                                <span className="block text-[11px] text-gray-500 truncate">{item.video_url}</span>
                              </div>
                            </div>
                            <a
                              href={item.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-[#111111] hover:bg-black text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shrink-0"
                            >
                              <span>ভিডিও দেখুন</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Bar: Like, Comments, Share */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#EAE6E7] text-xs font-semibold text-gray-600">
                      <div className="flex items-center gap-4">
                        {/* Like Button */}
                        <button
                          type="button"
                          onClick={() => handleLike(item.id)}
                          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
                            hasLiked
                              ? 'text-[#F52E68] bg-[#F52E68]/10'
                              : 'hover:text-[#F52E68] hover:bg-gray-100'
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 transition-transform active:scale-125 ${
                              hasLiked ? 'fill-[#F52E68] text-[#F52E68]' : ''
                            }`}
                          />
                          <span>{item.likes?.length || 0} পছন্দ</span>
                        </button>

                        {/* Comments Toggle */}
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedComments((prev) => ({
                              ...prev,
                              [item.id]: !prev[item.id],
                            }))
                          }
                          className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:text-blue-600 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{item.comments?.length || 0} মন্তব্য</span>
                        </button>
                      </div>

                      {/* Share Button */}
                      <button
                        type="button"
                        onClick={() => handleShare(item.id)}
                        className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>শেয়ার</span>
                      </button>
                    </div>

                    {/* Comments Section (Accordion) */}
                    {isCommentsExpanded && (
                      <div className="pt-3 border-t border-[#EAE6E7] space-y-3">
                        {/* Comments List */}
                        {item.comments && item.comments.length > 0 ? (
                          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                            {item.comments.map((c) => (
                              <div
                                key={c.id}
                                className="bg-[#F7F5F5] rounded-2xl p-3 border border-[#EAE6E7] flex items-start gap-2.5"
                              >
                                <img
                                  src={c.avatar_url || '/assets/aistudio/E4C57373-4D34-4620-B487-D44F42FFFC21_a7498b63.png'}
                                  alt={c.nickname}
                                  className="w-8 h-8 rounded-xl object-cover border border-[#EAE6E7] shrink-0"
                                />
                                <div className="flex-1 space-y-0.5">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs font-bold text-[#111111]">@{c.nickname}</span>
                                      {c.is_verified && (
                                        <BadgeCheck className="w-3.5 h-3.5 text-[#F52E68] fill-[#F52E68]/20" />
                                      )}
                                    </div>
                                    <span className="text-[10px] text-gray-400">{formatTimeAgo(c.created_at)}</span>
                                  </div>
                                  <p className="text-xs text-gray-800 whitespace-pre-line">{c.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic py-1">এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্যটি করুন!</p>
                        )}

                        {/* Comment Input */}
                        {isAuthenticated && member ? (
                          <form
                            onSubmit={(e) => handleAddComment(item.id, e)}
                            className="flex items-center gap-2 pt-1"
                          >
                            <input
                              type="text"
                              value={commentInputs[item.id] || ''}
                              onChange={(e) =>
                                setCommentInputs((prev) => ({
                                  ...prev,
                                  [item.id]: e.target.value,
                                }))
                              }
                              placeholder="আপনার মন্তব্য লিখুন..."
                              className="flex-1 px-4 py-2 bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl text-xs focus:outline-none focus:border-[#F52E68] transition-colors"
                            />
                            <button
                              type="submit"
                              disabled={submittingComment[item.id] || !(commentInputs[item.id] || '').trim()}
                              className="p-2.5 bg-[#111111] hover:bg-[#F52E68] text-white rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
                            >
                              {submittingComment[item.id] ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                            </button>
                          </form>
                        ) : (
                          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-2.5 text-center text-xs text-gray-500">
                            মন্তব্য করতে{' '}
                            <button
                              onClick={() => onNavigate('login')}
                              className="text-[#F52E68] font-bold underline cursor-pointer"
                            >
                              লগইন
                            </button>{' '}
                            করুন।
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Activity Post Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl border border-[#EAE6E7] shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE6E7]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#F52E68]/10 text-[#F52E68] flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#111111]">নতুন কর্মকাণ্ড প্রকাশ করুন</h3>
                  <span className="text-[11px] text-gray-500">সকল মেম্বারদের নিউজফিডে প্রকাশিত হবে</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitActivity} className="space-y-4">
              {/* Category Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase">
                  কর্মকাণ্ডের ধরন / ক্যাটাগরি
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => setCategory(c.label)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                        category === c.label
                          ? 'bg-[#111111] text-white border-[#111111] shadow-sm'
                          : 'bg-[#F7F5F5] text-gray-700 border-[#EAE6E7] hover:border-gray-400'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase">
                  শিরোনাম (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="যেমন: ধানমন্ডি লেকে মেগা গ্যাং মিটআপ ও আলোচনা..."
                  className="w-full px-4 py-2.5 bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl text-xs focus:outline-none focus:border-[#F52E68] transition-colors"
                />
              </div>

              {/* Content Textarea */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase">
                  কর্মকাণ্ডের বিবরণ <span className="text-[#F52E68]">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="আপনার কর্মকাণ্ড, গৃহীত পদক্ষেপ বা গ্যাং অভিযানের বিস্তারিত বিবরণ এখানে লিখুন..."
                  className="w-full px-4 py-3 bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl text-xs focus:outline-none focus:border-[#F52E68] transition-colors resize-none"
                />
              </div>

              {/* Image Upload Area */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase flex items-center justify-between">
                  <span>কর্মকাণ্ডের ছবি ({images.length}/৬)</span>
                  <span className="text-[11px] text-gray-400 font-normal">সর্বোচ্চ ৬টি ছবি</span>
                </label>

                {/* Upload Button */}
                <div className="flex items-center gap-3">
                  <label
                    htmlFor={fileInputId}
                    className="flex-1 py-3 px-4 border-2 border-dashed border-[#EAE6E7] hover:border-[#F52E68] rounded-2xl bg-[#F7F5F5] text-center cursor-pointer transition-colors flex items-center justify-center gap-2 text-xs font-semibold text-gray-600 hover:text-[#F52E68]"
                  >
                    <Camera className="w-4 h-4 text-[#F52E68]" />
                    <span>ছবি নির্বাচন করুন বা ক্যামেরা তুলুন</span>
                  </label>
                  <input
                    id={fileInputId}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Thumbnails */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-[#EAE6E7] group">
                        <img src={img} alt="প্রিভিউ" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white p-1 rounded-full transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Video URL Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase">
                  ভিডিও লিংক (ইউটিউব বা সরাসরি লিংক - ঐচ্ছিক)
                </label>
                <div className="relative">
                  <Video className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F7F5F5] border border-[#EAE6E7] rounded-xl text-xs focus:outline-none focus:border-[#F52E68] transition-colors"
                  />
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EAE6E7]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting || !content.trim()}
                  className="px-6 py-2.5 bg-[#F52E68] hover:bg-[#D91F57] text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-[#F52E68]/30 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>প্রকাশিত হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>পোস্ট প্রকাশ করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full-screen Lightbox for image inspect */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage}
            alt="ফুল ভিউ"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
