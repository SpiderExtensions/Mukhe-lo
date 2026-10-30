export interface Member {
  id: string;
  member_id: string;
  full_name: string;
  nickname: string;
  email: string;
  instagram_username: string;
  phone_number?: string;
  profile_image_url: string;
  division?: string;
  district?: string;
  upazila?: string;
  thana?: string;
  is_verified?: boolean; // Membership Badge
  document_url?: string;
  document_type?: string;
  document_submitted_at?: string;
  role: 'owner_admin' | 'admin' | 'member';
  status: 'active' | 'suspended';
  created_at: string;
  updated_at?: string;
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  category: 'সাধারণ' | 'জরুরি' | 'ইভেন্ট' | 'নিয়মাবলী';
  image_url?: string;
  is_important: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  cover_image_url: string;
  event_date: string;
  event_time: string;
  location?: string;
  status: 'আসন্ন' | 'চলমান' | 'সম্পন্ন' | 'বাতিল';
  created_at: string;
  updated_at: string;
}

export interface Idol {
  id: string;
  name: string;
  description: string;
  image_url: string;
  display_order: number;
  updated_at: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'success' | 'event';
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  transaction_id: string;
  member_id?: string;
  member_nickname?: string;
  donor_name: string;
  amount: number;
  method: 'bkash' | 'nagad' | 'rocket';
  recipient_number: string;
  purpose: string;
  sender_number: string;
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  verified_at?: string;
}

export interface WebsiteSettings {
  logo_url: string;
  hero_title: string;
  hero_subtitle: string;
  org_name: string;
  about_text: string;
  footer_copyright: string;
}

export interface SystemStatus {
  initial_admin_initialized: boolean;
  registration_enabled: boolean;
  total_members: number;
  total_notices: number;
  total_events: number;
}

export interface CommunityStats {
  total_members: number;
  active_members: number;
  total_events: number;
  published_notices: number;
}

export interface ActivityComment {
  id: string;
  member_id: string;
  nickname: string;
  avatar_url: string;
  is_verified?: boolean;
  text: string;
  created_at: string;
}

export type ActivityCategory =
  | 'গ্যাং কর্মকাণ্ড'
  | 'অভিযান'
  | 'আড্ডা ও মিটআপ'
  | 'সমাজসেবা'
  | 'জরুরি মুভমেন্ট'
  | 'সাধারণ';

export interface ActivityPost {
  id: string;
  member_id: string;
  author_name: string;
  author_nickname: string;
  author_avatar: string;
  author_is_verified?: boolean;
  author_division?: string;
  author_district?: string;
  author_upazila?: string;
  category: ActivityCategory;
  title?: string;
  content: string;
  images: string[];
  video_url?: string;
  likes: string[]; // member IDs who reacted
  comments: ActivityComment[];
  is_pinned?: boolean;
  created_at: string;
  updated_at?: string;
}
