import express, { Request, Response, NextFunction } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

// Supabase Client Initialization
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
let supabase: SupabaseClient | null = null;

if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    console.log('✅ Supabase connected:', SUPABASE_URL);
  } catch (err) {
    console.warn('⚠️ Supabase connection warning:', err);
  }
} else {
  console.log('ℹ️ Running embedded JSON database (SUPABASE_URL / SUPABASE_ANON_KEY not set in env).');
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Support large payload for camera selfie capture and documents
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

export interface Member {
  id: string;
  member_id: string;
  full_name: string;
  nickname: string;
  nickname_normalized: string;
  email: string;
  email_normalized: string;
  instagram_username: string;
  instagram_username_normalized: string;
  phone_number?: string;
  profile_image_url: string;
  pin_hash: string;
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
  updated_at: string;
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
  donation_number: string;
}

export interface AdminSettings {
  initial_admin_initialized: boolean;
  registration_enabled: boolean;
  updated_at: string;
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
  category: 'গ্যাং কর্মকাণ্ড' | 'অভিযান' | 'আড্ডা ও মিটআপ' | 'সমাজসেবা' | 'জরুরি মুভমেন্ট' | 'সাধারণ';
  title?: string;
  content: string;
  images: string[];
  video_url?: string;
  likes: string[];
  comments: ActivityComment[];
  is_pinned?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface DatabaseSchema {
  admin_settings: AdminSettings;
  website_settings: WebsiteSettings;
  idols: Idol[];
  members: Member[];
  sessions: { token: string; member_id: string; expires_at: number }[];
  notices: Notice[];
  events: CommunityEvent[];
  notifications: NotificationItem[];
  payments: PaymentRecord[];
  activities: ActivityPost[];
}

// Clean initial DB with ZERO mock/fake members and zero fake payments
const DEFAULT_DB: DatabaseSchema = {
  admin_settings: {
    initial_admin_initialized: false,
    registration_enabled: true,
    updated_at: new Date().toISOString(),
  },
  website_settings: {
    logo_url: '/assets/aistudio/E4C57373-4D34-4620-B487-D44F42FFFC21_a7498b63.png',
    hero_title: 'স্বাগতম মুখে ল-এ',
    hero_subtitle: 'আমরা শুধু একটি গ্রুপ নই, আমরা একটি পরিবার।',
    org_name: 'মুখে ল',
    about_text: 'মুখে ল হচ্ছে একটি স্বাধীন, সৃষ্টিশীল, তরুণ ও আত্মবিশ্বাসী প্রাইভেট বাংলা কমিউনিটি প্ল্যাটফর্ম। আমরা আমাদের শিকড়, স্বাধীনতা ও স্বতঃস্ফূর্ত আত্মপ্রকাশের মূল্য দেই।',
    footer_copyright: '© মুখে ল | সর্বস্বত্ব সংরক্ষিত',
    donation_number: '০১৭১৬১৬৩৮৪০',
  },
  idols: [
    {
      id: 'idol-1',
      name: 'কাজী নজরুল ইসলাম',
      description: 'বিদ্রোহের চিরন্তন প্রতীক, সাম্যবাদী চেতনা ও মুক্ত আত্মপ্রকাশের প্রেরণা',
      image_url: '/src/assets/images/idol_portrait_rebel_1793365205794.jpg',
      display_order: 1,
      updated_at: new Date().toISOString(),
    },
    {
      id: 'idol-2',
      name: 'মাইকেল মধুসূদন দত্ত',
      description: 'বাংলা সাহিত্যে নিজস্ব স্বাধীন ধারা ও আত্মবিশ্বাসী আধুনিকতার পথপ্রদর্শক',
      image_url: '/src/assets/images/idol_portrait_modernist_1793365206288.jpg',
      display_order: 2,
      updated_at: new Date().toISOString(),
    },
    {
      id: 'idol-3',
      name: 'সুকান্ত ভট্টাচার্য',
      description: 'যৌবনের দ্রোহ, শোষণের বিরুদ্ধে তীব্র উচ্চারণ ও তারুণ্যের বহ্নিশিখা',
      image_url: '/src/assets/images/idol_portrait_youth_1793365206198.jpg',
      display_order: 3,
      updated_at: new Date().toISOString(),
    },
  ],
  members: [], // CLEAN: No fake members
  sessions: [],
  notices: [
    {
      id: 'notice-1',
      title: 'মুখে ল প্ল্যাটফর্মের অফিশিয়াল যাত্রা শুরু',
      description: 'মুখে ল কমিউনিটির সকল সদস্যকে আন্তরিক স্বাগতম। আমাদের এই প্রাইভেট প্ল্যাটফর্মে পরিচয় নিশ্চিত রেখে বা নিজস্ব স্বকীয়তা বজায় রেখে গঠনমূলক ভাববিনিময় করা যাবে। সকল সদস্যকে কমিউনিটির নিয়মাবলী মেনে চলার অনুরোধ করা হচ্ছে।',
      category: 'সাধারণ',
      is_important: true,
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'notice-2',
      title: 'সদস্যপদ যাচাই ও মেম্বারশিপ ব্যাজ নির্দেশিকা',
      description: 'নতুন নিবন্ধনের ক্ষেত্রে ফ্রন্ট ক্যামেরা দিয়ে স্পষ্ট একক সেলফি এবং জেলা ও উপজেলা নির্বাচন বাধ্যতামূলক। পরবর্তীতে মেম্বারশিপ ভেরিফাইড ব্যাজ পাওয়ার জন্য ডকুমেন্ট সাবমিট করতে পারবেন। পিন কাউকে শেয়ার করবেন না।',
      category: 'নিয়মাবলী',
      is_important: false,
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  events: [
    {
      id: 'event-1',
      title: 'মুখে ল মেগা আড্ডা ও ক্রিয়েটরস নাইট ২০২৬',
      description: 'কমিউনিটির সদস্যবৃন্দের বার্ষিক মিলনমেলা, লাইভ মিউজিক ও বিশেষ ওপেন মাইক সেশন। শুধু ভেরিফাইড সদস্যদের জন্য প্রবেশাধিকার উন্মুক্ত।',
      cover_image_url: '/src/assets/images/event_cover_meetup_1793365207227.jpg',
      event_date: '১৫ নভেম্বর, ২০২৬',
      event_time: 'সন্ধ্যা ৬:০০ টা',
      location: 'ধানমন্ডি লেকভিউ লাউঞ্জ, ঢাকা',
      status: 'আসন্ন',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  notifications: [
    {
      id: 'notif-1',
      title: 'কমিউনিটিতে স্বাগতম!',
      message: 'মুখে ল পরিবারের সকল কার্যক্রম এবং নোটিশ সম্পর্কে নিয়মিত আপডেট রাখুন।',
      type: 'info',
      created_at: new Date().toISOString(),
    },
  ],
  payments: [], // CLEAN: No fake payments
  activities: [], // Real members' activity posts
};

function readDB(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
      return JSON.parse(JSON.stringify(DEFAULT_DB));
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    const result = { ...DEFAULT_DB, ...parsed };
    if (!Array.isArray(result.activities)) {
      result.activities = [];
    }
    return result;
  } catch (err) {
    console.error('Error reading DB, using default:', err);
    return JSON.parse(JSON.stringify(DEFAULT_DB));
  }
}

function writeDB(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing DB:', err);
  }
}

// Reset DB if requested or initialize clean state
if (fs.existsSync(DB_PATH)) {
  const current = readDB();
  // Ensure donation_number is set
  if (!current.website_settings.donation_number) {
    current.website_settings.donation_number = '০১৭১৬১৬৩৮৪০';
    writeDB(current);
  }
}

// PIN hashing with constant salt
const PIN_SALT = 'mukhe_l_salt_2026_super_secure';
function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin + PIN_SALT).digest('hex');
}

// Generate unique 6-digit PIN
function generateUniquePin(existingHashes: Set<string>): string {
  for (let attempt = 0; attempt < 50; attempt++) {
    const num = crypto.randomInt(100000, 999999);
    const pinStr = num.toString();
    const hash = hashPin(pinStr);
    if (!existingHashes.has(hash)) {
      return pinStr;
    }
  }
  return (Math.floor(100000 + Math.random() * 900000)).toString();
}

function getNextMemberId(members: Member[]): string {
  const baseNumber = 1000 + members.length + 1;
  return `ML-${baseNumber}`;
}

// Rate limiting map for login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry) return true;
  if (now - entry.lastAttempt > 5 * 60 * 1000) {
    loginAttempts.delete(key);
    return true;
  }
  return entry.count < 5;
}

function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const entry = loginAttempts.get(key) || { count: 0, lastAttempt: now };
  entry.count += 1;
  entry.lastAttempt = now;
  loginAttempts.set(key, entry);
}

function resetAttempts(key: string): void {
  loginAttempts.delete(key);
}

// Authentication Middleware
function getAuthMember(req: Request): Member | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  if (!token) return null;

  const db = readDB();
  const session = db.sessions.find(s => s.token === token && s.expires_at > Date.now());
  if (!session) return null;

  const member = db.members.find(m => m.id === session.member_id && m.status === 'active');
  return member || null;
}

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const member = getAuthMember(req);
  if (!member) {
    res.status(401).json({ error: 'অনুগ্রহ করে প্রথমে লগইন করুন।' });
    return;
  }
  (req as any).member = member;
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const member = getAuthMember(req);
  if (!member) {
    res.status(401).json({ error: 'প্রবেশাধিকার সংরক্ষিত। অনুগ্রহ করে লগইন করুন।' });
    return;
  }
  if (member.role !== 'owner_admin' && member.role !== 'admin') {
    res.status(403).json({ error: 'প্রশাসক ব্যতীত এই কার্যক্রমে প্রবেশাধিকার নেই।' });
    return;
  }
  (req as any).member = member;
  next();
}

// Sanitize member for public response (NEVER leak phone_number or pin_hash)
function sanitizeMember(m: Member) {
  return {
    id: m.id,
    member_id: m.member_id,
    full_name: m.full_name,
    nickname: m.nickname,
    email: m.email || '',
    instagram_username: m.instagram_username,
    profile_image_url: m.profile_image_url,
    division: m.division || '',
    district: m.district || '',
    upazila: m.upazila || '',
    thana: m.thana || '',
    is_verified: Boolean(m.is_verified),
    role: m.role,
    status: m.status,
    created_at: m.created_at,
  };
}

// Member private view for themselves or admin
function memberSelfView(m: Member) {
  return {
    id: m.id,
    member_id: m.member_id,
    full_name: m.full_name,
    nickname: m.nickname,
    email: m.email || '',
    instagram_username: m.instagram_username,
    phone_number: m.phone_number || '',
    profile_image_url: m.profile_image_url,
    division: m.division || '',
    district: m.district || '',
    upazila: m.upazila || '',
    thana: m.thana || '',
    is_verified: Boolean(m.is_verified),
    document_url: m.document_url || '',
    document_type: m.document_type || '',
    document_submitted_at: m.document_submitted_at || '',
    role: m.role,
    status: m.status,
    created_at: m.created_at,
    updated_at: m.updated_at,
  };
}

// ================= API ROUTES =================

// 1. System status
app.get('/api/status', (req: Request, res: Response) => {
  const db = readDB();
  const hasAdmin = db.members.some(m => m.role === 'owner_admin' || m.role === 'admin');
  res.json({
    initial_admin_initialized: db.admin_settings.initial_admin_initialized && hasAdmin,
    registration_enabled: db.admin_settings.registration_enabled,
    total_members: db.members.filter(m => m.status === 'active').length,
    total_notices: db.notices.filter(n => n.is_published).length,
    total_events: db.events.length,
  });
});

// 2. Real-time community statistics
app.get('/api/stats', (req: Request, res: Response) => {
  const db = readDB();
  const activeMembers = db.members.filter(m => m.status === 'active').length;
  const totalMembers = db.members.length;
  const totalEvents = db.events.length;
  const publishedNotices = db.notices.filter(n => n.is_published).length;

  res.json({
    total_members: totalMembers,
    active_members: activeMembers,
    total_events: totalEvents,
    published_notices: publishedNotices,
  });
});

// 3. Website Settings
app.get('/api/settings', (req: Request, res: Response) => {
  const db = readDB();
  res.json(db.website_settings);
});

app.put('/api/settings', requireAdmin, (req: Request, res: Response) => {
  const db = readDB();
  const { hero_title, hero_subtitle, org_name, about_text, footer_copyright, logo_url, donation_number } = req.body;

  if (hero_title) db.website_settings.hero_title = hero_title;
  if (hero_subtitle) db.website_settings.hero_subtitle = hero_subtitle;
  if (org_name) db.website_settings.org_name = org_name;
  if (about_text) db.website_settings.about_text = about_text;
  if (footer_copyright) db.website_settings.footer_copyright = footer_copyright;
  if (logo_url) db.website_settings.logo_url = logo_url;
  if (donation_number) db.website_settings.donation_number = donation_number;

  if (req.body.registration_enabled !== undefined) {
    db.admin_settings.registration_enabled = Boolean(req.body.registration_enabled);
  }

  writeDB(db);
  res.json({ success: true, settings: db.website_settings, registration_enabled: db.admin_settings.registration_enabled });
});

// 4. OUR IDOLS
app.get('/api/idols', (req: Request, res: Response) => {
  const db = readDB();
  const sorted = [...db.idols].sort((a, b) => a.display_order - b.display_order);
  res.json(sorted);
});

app.put('/api/idols/:id', requireAdmin, (req: Request, res: Response) => {
  const db = readDB();
  const { id } = req.params;
  const { name, description, image_url } = req.body;

  const idolIndex = db.idols.findIndex(i => i.id === id);
  if (idolIndex === -1) {
    res.status(404).json({ error: 'আইডল প্রোফাইল খুঁজে পাওয়া যায়নি।' });
    return;
  }

  if (name) db.idols[idolIndex].name = name.trim();
  if (description !== undefined) db.idols[idolIndex].description = description.trim();
  if (image_url) db.idols[idolIndex].image_url = image_url;
  db.idols[idolIndex].updated_at = new Date().toISOString();

  writeDB(db);
  res.json({ success: true, idol: db.idols[idolIndex] });
});

// 5. Notices
app.get('/api/notices', (req: Request, res: Response) => {
  const db = readDB();
  const authMember = getAuthMember(req);
  const isAdmin = authMember?.role === 'owner_admin' || authMember?.role === 'admin';

  const list = isAdmin ? db.notices : db.notices.filter(n => n.is_published);
  list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(list);
});

app.post('/api/notices', requireAdmin, (req: Request, res: Response) => {
  const db = readDB();
  const { title, description, category, image_url, is_important, is_published } = req.body;

  if (!title || !description) {
    res.status(400).json({ error: 'শিরোনাম ও বিবরণ আবশ্যক।' });
    return;
  }

  const newNotice: Notice = {
    id: `notice-${Date.now()}`,
    title: title.trim(),
    description: description.trim(),
    category: category || 'সাধারণ',
    image_url: image_url || '',
    is_important: Boolean(is_important),
    is_published: is_published !== undefined ? Boolean(is_published) : true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.notices.unshift(newNotice);

  if (newNotice.is_published) {
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: `নতুন নোটিশ: ${newNotice.title}`,
      message: newNotice.description.slice(0, 100) + (newNotice.description.length > 100 ? '...' : ''),
      type: newNotice.is_important ? 'alert' : 'info',
      created_at: new Date().toISOString(),
    });
  }

  writeDB(db);
  res.json({ success: true, notice: newNotice });
});

app.put('/api/notices/:id', requireAdmin, (req: Request, res: Response) => {
  const db = readDB();
  const { id } = req.params;
  const idx = db.notices.findIndex(n => n.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'নোটিশ পাওয়া যায়নি।' });
    return;
  }

  const { title, description, category, image_url, is_important, is_published } = req.body;
  if (title) db.notices[idx].title = title.trim();
  if (description) db.notices[idx].description = description.trim();
  if (category) db.notices[idx].category = category;
  if (image_url !== undefined) db.notices[idx].image_url = image_url;
  if (is_important !== undefined) db.notices[idx].is_important = Boolean(is_important);
  if (is_published !== undefined) db.notices[idx].is_published = Boolean(is_published);
  db.notices[idx].updated_at = new Date().toISOString();

  writeDB(db);
  res.json({ success: true, notice: db.notices[idx] });
});

app.delete('/api/notices/:id', requireAdmin, (req: Request, res: Response) => {
  const db = readDB();
  const { id } = req.params;
  db.notices = db.notices.filter(n => n.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// 6. Events
app.get('/api/events', (req: Request, res: Response) => {
  const db = readDB();
  const list = [...db.events].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(list);
});

app.post('/api/events', requireAdmin, (req: Request, res: Response) => {
  const db = readDB();
  const { title, description, cover_image_url, event_date, event_time, location, status } = req.body;

  if (!title || !event_date) {
    res.status(400).json({ error: 'ইভেন্টের নাম ও তারিখ আবশ্যক।' });
    return;
  }

  const newEvent: CommunityEvent = {
    id: `event-${Date.now()}`,
    title: title.trim(),
    description: description ? description.trim() : '',
    cover_image_url: cover_image_url || '/src/assets/images/event_cover_meetup_1793365207227.jpg',
    event_date: event_date.trim(),
    event_time: event_time ? event_time.trim() : '',
    location: location ? location.trim() : '',
    status: status || 'আসন্ন',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.events.unshift(newEvent);

  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    title: `নতুন ইভেন্ট: ${newEvent.title}`,
    message: `${newEvent.event_date} তারিখে মুখে ল-এর বিশেষ ইভেন্ট অনুষ্ঠিত হবে।`,
    type: 'event',
    created_at: new Date().toISOString(),
  });

  writeDB(db);
  res.json({ success: true, event: newEvent });
});

app.put('/api/events/:id', requireAdmin, (req: Request, res: Response) => {
  const db = readDB();
  const { id } = req.params;
  const idx = db.events.findIndex(e => e.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'ইভেন্ট পাওয়া যায়নি।' });
    return;
  }

  const { title, description, cover_image_url, event_date, event_time, location, status } = req.body;
  if (title) db.events[idx].title = title.trim();
  if (description !== undefined) db.events[idx].description = description.trim();
  if (cover_image_url) db.events[idx].cover_image_url = cover_image_url;
  if (event_date) db.events[idx].event_date = event_date.trim();
  if (event_time !== undefined) db.events[idx].event_time = event_time.trim();
  if (location !== undefined) db.events[idx].location = location.trim();
  if (status) db.events[idx].status = status;
  db.events[idx].updated_at = new Date().toISOString();

  writeDB(db);
  res.json({ success: true, event: db.events[idx] });
});

app.delete('/api/events/:id', requireAdmin, (req: Request, res: Response) => {
  const db = readDB();
  const { id } = req.params;
  db.events = db.events.filter(e => e.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// 7. Member Registration (Includes mandatory Email, Bangladesh District & Upazila/Thana)
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const db = readDB();

  if (!db.admin_settings.registration_enabled) {
    res.status(403).json({ error: 'দুঃখিত, বর্তমানে নতুন সদস্য নিবন্ধন সাময়িকভাবে বন্ধ রয়েছে।' });
    return;
  }

  const {
    full_name,
    nickname,
    email,
    instagram_username,
    phone_number,
    selfie_data,
    division,
    district,
    upazila,
    thana,
  } = req.body;

  // Validation
  if (!full_name || !full_name.trim()) {
    res.status(400).json({ error: 'আপনার সম্পূর্ণ নাম লিখুন।' });
    return;
  }

  if (!nickname || !nickname.trim()) {
    res.status(400).json({ error: 'আপনার একটি অনন্য গ্রুপ নিকনেম লিখুন।' });
    return;
  }

  // Email validation (mandatory for Supabase Email provider)
  if (!email || !email.trim() || !email.includes('@')) {
    res.status(400).json({ error: 'অনুগ্রহ করে আপনার সঠিক ইমেইল এড্রেস লিখুন।' });
    return;
  }

  if (!instagram_username || !instagram_username.trim()) {
    res.status(400).json({ error: 'আপনার ইনস্টাগ্রাম ইউজারনেম লিখুন।' });
    return;
  }

  if (!district || !district.trim()) {
    res.status(400).json({ error: 'অনুগ্রহ করে আপনার জেলা নির্বাচন করুন।' });
    return;
  }

  if (!upazila || !upazila.trim()) {
    res.status(400).json({ error: 'অনুগ্রহ করে আপনার উপজেলা অথবা থানা নির্বাচন করুন।' });
    return;
  }

  if (!selfie_data || typeof selfie_data !== 'string' || selfie_data.length < 50) {
    res.status(400).json({ error: 'সদস্যপদ সম্পন্ন করতে লাইভ ক্যামেরা সেলফি যাচাইকরণ বাধ্যতামূলক।' });
    return;
  }

  const cleanNickname = nickname.trim();
  const normNickname = cleanNickname.toLowerCase();
  const cleanEmail = email.trim();
  const normEmail = cleanEmail.toLowerCase();
  const cleanInsta = instagram_username.trim().replace(/^@/, '');
  const normInsta = cleanInsta.toLowerCase();

  // Check unique nickname
  const existingNick = db.members.find(m => m.nickname_normalized === normNickname);
  if (existingNick) {
    res.status(400).json({ error: `এই নিকনেমটি ("${cleanNickname}") ইতিমধ্যে অন্য একজন সদস্য ব্যবহার করছেন। অনুগ্রহ করে ভিন্ন একটি নিকনেম নির্বাচন করুন।` });
    return;
  }

  // Check unique email
  const existingEmail = db.members.find(m => m.email_normalized === normEmail);
  if (existingEmail) {
    res.status(400).json({ error: `এই ইমেইলটি ("${cleanEmail}") দিয়ে ইতিমধ্যে নিবন্ধন করা হয়েছে। অনুগ্রহ করে লগইন করুন বা ভিন্ন ইমেইল দিন।` });
    return;
  }

  // Check unique Instagram
  const existingInsta = db.members.find(m => m.instagram_username_normalized === normInsta);
  if (existingInsta) {
    res.status(400).json({ error: `এই ইনস্টাগ্রাম অ্যাকাউন্টটি (@${cleanInsta}) দিয়ে ইতিমধ্যে একটি সদস্যপদ নিবন্ধিত রয়েছে।` });
    return;
  }

  // Atomic first-admin check:
  // 1st registered person becomes owner_admin with verification badge!
  const hasExistingAdmin = db.members.some(m => m.role === 'owner_admin' || m.role === 'admin');
  let assignedRole: 'owner_admin' | 'admin' | 'member' = 'member';
  let isVerified = false;

  if (!db.admin_settings.initial_admin_initialized || !hasExistingAdmin) {
    assignedRole = 'owner_admin';
    isVerified = true;
    db.admin_settings.initial_admin_initialized = true;
    db.admin_settings.updated_at = new Date().toISOString();
  }

  // Generate unique 6-digit PIN
  const existingHashes = new Set(db.members.map(m => m.pin_hash));
  const rawPin = generateUniquePin(existingHashes);
  const hashedPin = hashPin(rawPin);

  const newMemberId = getNextMemberId(db.members);
  const memberUid = crypto.randomUUID();

  // If Supabase is connected, sync user with Supabase Auth (Email Provider)
  if (supabase) {
    try {
      const { data: supaUser, error: supaErr } = await supabase.auth.admin.createUser({
        email: cleanEmail,
        password: rawPin,
        email_confirm: true,
        user_metadata: {
          nickname: cleanNickname,
          full_name: full_name.trim(),
          member_id: newMemberId,
          role: assignedRole,
        },
      });
      if (supaErr) {
        console.warn('Supabase auth sync notice:', supaErr.message);
      } else if (supaUser?.user) {
        console.log('✅ Supabase Auth user created:', supaUser.user.id, cleanEmail);
      }
    } catch (e: any) {
      console.warn('Supabase sync skipped/warning:', e.message);
    }
  }

  const newMember: Member = {
    id: memberUid,
    member_id: newMemberId,
    full_name: full_name.trim(),
    nickname: cleanNickname,
    nickname_normalized: normNickname,
    email: cleanEmail,
    email_normalized: normEmail,
    instagram_username: cleanInsta,
    instagram_username_normalized: normInsta,
    phone_number: phone_number ? phone_number.trim() : '', // Optional
    profile_image_url: selfie_data,
    pin_hash: hashedPin,
    division: division?.trim() || '',
    district: district.trim(),
    upazila: upazila.trim(),
    thana: thana?.trim() || upazila.trim(),
    is_verified: isVerified,
    role: assignedRole,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.members.push(newMember);

  // Persistent session
  const token = crypto.randomBytes(32).toString('hex');
  const sessionExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
  db.sessions.push({
    token,
    member_id: newMember.id,
    expires_at: sessionExpiry,
  });

  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    title: 'নতুন সদস্যের আগমন!',
    message: `${newMember.nickname} (${newMember.member_id}), জেলা: ${newMember.district} — মুখে ল পরিবারে যুক্ত হয়েছেন।`,
    type: 'success',
    created_at: new Date().toISOString(),
  });

  writeDB(db);

  res.json({
    success: true,
    member: memberSelfView(newMember),
    token,
    raw_pin: rawPin,
    is_initial_admin: assignedRole === 'owner_admin',
  });
});

// 8. Member Login (Supports Email OR Group Nickname + PIN)
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { identifier, nickname, pin } = req.body;
  const clientIp = req.ip || 'unknown';

  const loginInput = (identifier || nickname || '').trim();

  if (!loginInput) {
    res.status(400).json({ error: 'অনুগ্রহ করে আপনার ইমেইল অথবা গ্রুপ নিকনেম লিখুন।' });
    return;
  }

  if (!pin || !pin.trim()) {
    res.status(400).json({ error: 'অনুগ্রহ করে আপনার ৬ সংখ্যার পিন লিখুন।' });
    return;
  }

  const normInput = loginInput.toLowerCase();
  const rateLimitKey = `${clientIp}_${normInput}`;

  if (!checkRateLimit(rateLimitKey)) {
    res.status(429).json({ error: 'অতিরিক্ত ভুল পিন চেষ্টার কারণে আপনার অ্যাকাউন্ট সাময়িকভাবে লক হয়েছে। ৫ মিনিট পর পুনরায় চেষ্টা করুন।' });
    return;
  }

  const db = readDB();
  // Find member by either Nickname OR Email
  const member = db.members.find(
    m => m.nickname_normalized === normInput || (m.email_normalized && m.email_normalized === normInput)
  );

  if (!member) {
    recordFailedAttempt(rateLimitKey);
    res.status(401).json({ error: 'এই ইমেইল বা নিকনেমের কোনো সক্রিয় সদস্য পাওয়া যায়নি।' });
    return;
  }

  if (member.status === 'suspended') {
    res.status(403).json({ error: 'আপনার অ্যাকাউন্টটি স্থগিত (Suspended) রয়েছে। কর্তৃপক্ষের সাথে যোগাযোগ করুন।' });
    return;
  }

  const hashedEnteredPin = hashPin(pin.trim());
  if (member.pin_hash !== hashedEnteredPin) {
    recordFailedAttempt(rateLimitKey);
    res.status(401).json({ error: 'ভুল পিন কোড! অনুগ্রহ করে সঠিক ৬ সংখ্যার পিন প্রদান করুন।' });
    return;
  }

  resetAttempts(rateLimitKey);

  const token = crypto.randomBytes(32).toString('hex');
  const sessionExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
  db.sessions.push({
    token,
    member_id: member.id,
    expires_at: sessionExpiry,
  });

  writeDB(db);

  res.json({
    success: true,
    member: memberSelfView(member),
    token,
  });
});

// 9. Current member
app.get('/api/auth/me', requireAuth, (req: Request, res: Response) => {
  const member = (req as any).member as Member;
  res.json({
    success: true,
    member: memberSelfView(member),
  });
});

// 10. Logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const db = readDB();
    db.sessions = db.sessions.filter(s => s.token !== token);
    writeDB(db);
  }
  res.json({ success: true });
});

// 11. Public Members Directory (With Location & Verified Badge)
app.get('/api/members', (req: Request, res: Response) => {
  const db = readDB();
  const search = typeof req.query.search === 'string' ? req.query.search.toLowerCase().trim() : '';
  const districtFilter = typeof req.query.district === 'string' ? req.query.district.trim() : '';

  let activeMembers = db.members.filter(m => m.status === 'active');

  if (districtFilter) {
    activeMembers = activeMembers.filter(m => m.district === districtFilter);
  }

  if (search) {
    activeMembers = activeMembers.filter(m =>
      m.nickname_normalized.includes(search) ||
      m.full_name.toLowerCase().includes(search) ||
      m.member_id.toLowerCase().includes(search) ||
      m.instagram_username_normalized.includes(search) ||
      (m.district && m.district.toLowerCase().includes(search)) ||
      (m.upazila && m.upazila.toLowerCase().includes(search))
    );
  }

  activeMembers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  res.json({
    total: activeMembers.length,
    members: activeMembers.map(sanitizeMember),
  });
});

// 12. Public Member Profile
app.get('/api/members/:id', (req: Request, res: Response) => {
  const db = readDB();
  const member = db.members.find(m => (m.id === req.params.id || m.member_id === req.params.id) && m.status === 'active');
  if (!member) {
    res.status(404).json({ error: 'সদস্যের তথ্য পাওয়া যায়নি।' });
    return;
  }
  res.json(sanitizeMember(member));
});

// 13. Update Own Profile (Name, Phone, Location)
app.put('/api/members/:id/profile', requireAuth, (req: Request, res: Response) => {
  const currentMember = (req as any).member as Member;
  if (currentMember.id !== req.params.id && currentMember.role !== 'owner_admin' && currentMember.role !== 'admin') {
    res.status(403).json({ error: 'আপনি কেবল নিজের প্রোফাইল সম্পাদনা করতে পারেন।' });
    return;
  }

  const db = readDB();
  const idx = db.members.findIndex(m => m.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'সদস্য প্রোফাইল পাওয়া যায়নি।' });
    return;
  }

  const { full_name, phone_number, profile_image_url, division, district, upazila, thana } = req.body;
  if (full_name && full_name.trim()) db.members[idx].full_name = full_name.trim();
  if (phone_number !== undefined) db.members[idx].phone_number = phone_number.trim();
  if (profile_image_url) db.members[idx].profile_image_url = profile_image_url;
  if (division) db.members[idx].division = division.trim();
  if (district) db.members[idx].district = district.trim();
  if (upazila) db.members[idx].upazila = upazila.trim();
  if (thana) db.members[idx].thana = thana.trim();
  db.members[idx].updated_at = new Date().toISOString();

  writeDB(db);
  res.json({ success: true, member: memberSelfView(db.members[idx]) });
});

// 14. Document Submission for Membership Verification Badge
app.post('/api/members/:id/document', requireAuth, (req: Request, res: Response) => {
  const currentMember = (req as any).member as Member;
  if (currentMember.id !== req.params.id && currentMember.role !== 'owner_admin' && currentMember.role !== 'admin') {
    res.status(403).json({ error: 'অননুমোদিত অ্যাক্সেস।' });
    return;
  }

  const { document_type, document_url } = req.body;
  if (!document_type || !document_url) {
    res.status(400).json({ error: 'ডকুমেন্টের ধরন ও ছবি আবশ্যক।' });
    return;
  }

  const db = readDB();
  const idx = db.members.findIndex(m => m.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'সদস্য পাওয়া যায়নি।' });
    return;
  }

  db.members[idx].document_type = document_type;
  db.members[idx].document_url = document_url;
  db.members[idx].document_submitted_at = new Date().toISOString();
  db.members[idx].is_verified = true; // Auto-verify on valid doc submission, admin can also toggle
  db.members[idx].updated_at = new Date().toISOString();

  writeDB(db);
  res.json({
    success: true,
    member: memberSelfView(db.members[idx]),
    message: 'আপনার ডকুমেন্ট সফলভাবে জমা নেওয়া হয়েছে এবং মেম্বারশিপ ভেরিফাইড ব্যাজ সক্রিয় করা হয়েছে!',
  });
});

// 15. Admin: Members Management with Location Filtering & Badge Control
app.get('/api/admin/members', requireAdmin, (req: Request, res: Response) => {
  const db = readDB();
  const { division, district, upazila } = req.query;

  let list = db.members.map(memberSelfView);

  if (division && typeof division === 'string') {
    list = list.filter(m => m.division === division);
  }
  if (district && typeof district === 'string') {
    list = list.filter(m => m.district === district);
  }
  if (upazila && typeof upazila === 'string') {
    list = list.filter(m => m.upazila === upazila || m.thana === upazila);
  }

  res.json(list);
});

// Admin: Toggle Membership Verified Badge
app.put('/api/admin/members/:id/badge', requireAdmin, (req: Request, res: Response) => {
  const db = readDB();
  const idx = db.members.findIndex(m => m.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'সদস্য পাওয়া যায়নি।' });
    return;
  }

  const { is_verified } = req.body;
  db.members[idx].is_verified = Boolean(is_verified);
  db.members[idx].updated_at = new Date().toISOString();

  writeDB(db);
  res.json({ success: true, member: memberSelfView(db.members[idx]) });
});

// Admin: Toggle Member Status (Active <-> Suspended)
app.put('/api/admin/members/:id/status', requireAdmin, (req: Request, res: Response) => {
  const currentAdmin = (req as any).member as Member;
  const db = readDB();
  const idx = db.members.findIndex(m => m.id === req.params.id);

  if (idx === -1) {
    res.status(404).json({ error: 'সদস্য পাওয়া যায়নি।' });
    return;
  }

  const target = db.members[idx];
  if (target.role === 'owner_admin' && currentAdmin.id !== target.id) {
    res.status(403).json({ error: 'প্রধান প্রশাসকের অ্যাকাউন্ট স্থগিত করা সম্ভব নয়।' });
    return;
  }

  const { status } = req.body;
  if (status !== 'active' && status !== 'suspended') {
    res.status(400).json({ error: 'অবৈধ স্ট্যাটাস মান।' });
    return;
  }

  db.members[idx].status = status;
  db.members[idx].updated_at = new Date().toISOString();

  if (status === 'suspended') {
    db.sessions = db.sessions.filter(s => s.member_id !== target.id);
  }

  writeDB(db);
  res.json({ success: true, member: memberSelfView(db.members[idx]) });
});

// Admin: Secure PIN Reset
app.post('/api/admin/members/:id/reset-pin', requireAdmin, (req: Request, res: Response) => {
  const db = readDB();
  const idx = db.members.findIndex(m => m.id === req.params.id);

  if (idx === -1) {
    res.status(404).json({ error: 'সদস্য পাওয়া যায়নি।' });
    return;
  }

  const existingHashes = new Set(db.members.map(m => m.pin_hash));
  const newPin = generateUniquePin(existingHashes);
  db.members[idx].pin_hash = hashPin(newPin);
  db.members[idx].updated_at = new Date().toISOString();

  db.sessions = db.sessions.filter(s => s.member_id !== db.members[idx].id);

  writeDB(db);

  res.json({
    success: true,
    member_id: db.members[idx].member_id,
    nickname: db.members[idx].nickname,
    new_pin: newPin,
    message: `সদস্য "${db.members[idx].nickname}" এর জন্য নতুন ৬ সংখ্যার পিন সফলভাবে তৈরি করা হয়েছে।`,
  });
});

// Admin: Delete member
app.delete('/api/admin/members/:id', requireAdmin, (req: Request, res: Response) => {
  const currentAdmin = (req as any).member as Member;
  const db = readDB();
  const target = db.members.find(m => m.id === req.params.id);

  if (!target) {
    res.status(404).json({ error: 'সদস্য পাওয়া যায়নি।' });
    return;
  }

  if (target.role === 'owner_admin') {
    res.status(403).json({ error: 'প্রধান প্রশাসকের অ্যাকাউন্ট ডিলিট করা নিষিদ্ধ।' });
    return;
  }

  db.members = db.members.filter(m => m.id !== req.params.id);
  db.sessions = db.sessions.filter(s => s.member_id !== req.params.id);
  writeDB(db);

  res.json({ success: true });
});

// 16. Real-Time Community Notifications
app.get('/api/notifications', (req: Request, res: Response) => {
  const db = readDB();
  res.json(db.notifications.slice(0, 20));
});

app.post('/api/notifications', requireAdmin, (req: Request, res: Response) => {
  const db = readDB();
  const { title, message, type } = req.body;
  if (!title || !message) {
    res.status(400).json({ error: 'নোটিফিকেশনের শিরোনাম ও বার্তা আবশ্যক।' });
    return;
  }

  const newNotif: NotificationItem = {
    id: `notif-${Date.now()}`,
    title: title.trim(),
    message: message.trim(),
    type: type || 'info',
    created_at: new Date().toISOString(),
  };

  db.notifications.unshift(newNotif);
  writeDB(db);
  res.json({ success: true, notification: newNotif });
});

// 17. Community Fund & Donation System
// Public endpoint for transparent history: anyone can view approved donations!
app.get('/api/payments/public', (req: Request, res: Response) => {
  const db = readDB();
  const verifiedList = db.payments
    .filter(p => p.status === 'verified')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const totalFund = verifiedList.reduce((acc, curr) => acc + curr.amount, 0);

  res.json({
    total_fund: totalFund,
    count: verifiedList.length,
    donations: verifiedList.map(p => ({
      id: p.id,
      transaction_id: p.transaction_id,
      donor_name: p.donor_name || p.member_nickname || 'কমিউনিটি শুভাকাঙ্ক্ষী',
      member_nickname: p.member_nickname,
      amount: p.amount,
      method: p.method,
      purpose: p.purpose,
      created_at: p.created_at,
    })),
  });
});

// All payments for Admin or Auth member
app.get('/api/payments', requireAuth, (req: Request, res: Response) => {
  const db = readDB();
  const member = (req as any).member as Member;
  if (member.role === 'owner_admin' || member.role === 'admin') {
    res.json(db.payments);
  } else {
    res.json(db.payments.filter(p => p.member_id === member.id || p.member_nickname === member.nickname));
  }
});

// Submit payment (bKash, Nagad, Rocket to '01716163840' with transaction ID)
app.post('/api/payments', (req: Request, res: Response) => {
  const { amount, method, purpose, sender_number, donor_name, transaction_id } = req.body;

  if (!amount || Number(amount) <= 0) {
    res.status(400).json({ error: 'অনুগ্রহ করে সঠিক টাকার পরিমাণ উল্লেখ করুন।' });
    return;
  }

  if (!sender_number || sender_number.trim().length < 10) {
    res.status(400).json({ error: 'অনুগ্রহ করে আপনার প্রেরক নম্বর (বিকাশ/নগদ/রকেট) প্রদান করুন।' });
    return;
  }

  if (!transaction_id || !transaction_id.trim()) {
    res.status(400).json({ error: 'টাকা পাঠানোর পর প্রাপ্ত ট্রানজেকশন আইডি (Transaction ID) লিখুন।' });
    return;
  }

  const authMember = getAuthMember(req);
  const db = readDB();

  const paymentRecord: PaymentRecord = {
    id: `pay-${Date.now()}`,
    transaction_id: transaction_id.trim().toUpperCase(),
    member_id: authMember?.id || 'guest',
    member_nickname: authMember?.nickname || '',
    donor_name: (donor_name || authMember?.nickname || 'কমিউনিটি সদস্য').trim(),
    amount: Number(amount),
    method: (method as any) || 'bkash',
    recipient_number: '০১৭১৬১৬৩৮৪০',
    purpose: purpose || 'কমিউনিটি ফান্ড অনুদান',
    sender_number: sender_number.trim(),
    status: 'pending', // Starts as pending, approved from admin!
    created_at: new Date().toISOString(),
  };

  db.payments.unshift(paymentRecord);

  // Notify admin
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    title: 'নতুন অনুদান যাচাইয়ের অপেক্ষায়',
    message: `${paymentRecord.donor_name} ${paymentRecord.method.toUpperCase()}-এ ৳${paymentRecord.amount} পাঠিয়েছেন (Txn: ${paymentRecord.transaction_id})। অ্যাডমিন যাচাইয়ের অপেক্ষায়।`,
    type: 'info',
    created_at: new Date().toISOString(),
  });

  writeDB(db);

  res.json({
    success: true,
    transaction: paymentRecord,
    message: 'আপনার ট্রানজেকশনটি যাচাইয়ের জন্য পেন্ডিং (Pending) রাখা হয়েছে। অ্যাডমিন প্যানেল থেকে যাচাই সাপেক্ষে এটি অনুমোদিত হবে।',
  });
});

// Admin: Approve or Reject payment
app.put('/api/admin/payments/:id/status', requireAdmin, (req: Request, res: Response) => {
  const db = readDB();
  const idx = db.payments.findIndex(p => p.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'পেমেন্ট রেকর্ড পাওয়া যায়নি।' });
    return;
  }

  const { status } = req.body;
  if (status !== 'verified' && status !== 'rejected') {
    res.status(400).json({ error: 'অবৈধ স্ট্যাটাস মান।' });
    return;
  }

  db.payments[idx].status = status;
  if (status === 'verified') {
    db.payments[idx].verified_at = new Date().toISOString();

    // Celebration notification
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'কমিউনিটি তহবিলে নতুন অবদান অনুমোদিত!',
      message: `${db.payments[idx].donor_name} এর ৳${db.payments[idx].amount} অনুদান সফলভাবে যাচাই ও তহবিলে যুক্ত হয়েছে। আন্তরিক ধন্যবাদ!`,
      type: 'success',
      created_at: new Date().toISOString(),
    });
  }

  writeDB(db);
  res.json({ success: true, payment: db.payments[idx] });
});

// ==========================================
// Activities / মেম্বারদের কর্মকাণ্ডসমূহ API Endpoints
// ==========================================

// 1. Get all activities feed
app.get('/api/activities', (req: Request, res: Response) => {
  const db = readDB();
  const { category, search } = req.query;

  let activities = (db.activities || []).slice();

  if (category && typeof category === 'string' && category !== 'সকল') {
    activities = activities.filter(a => a.category === category);
  }

  if (search && typeof search === 'string' && search.trim()) {
    const q = search.trim().toLowerCase();
    activities = activities.filter(a =>
      (a.title && a.title.toLowerCase().includes(q)) ||
      a.content.toLowerCase().includes(q) ||
      a.author_nickname.toLowerCase().includes(q) ||
      a.author_name.toLowerCase().includes(q) ||
      (a.author_district && a.author_district.toLowerCase().includes(q))
    );
  }

  // Sort pinned first, then newest first
  activities.sort((a, b) => {
    if (Boolean(a.is_pinned) !== Boolean(b.is_pinned)) {
      return a.is_pinned ? -1 : 1;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  res.json(activities);
});

// 2. Create new activity post (requireAuth)
app.post('/api/activities', requireAuth, (req: Request, res: Response) => {
  const currentMember = (req as any).member as Member;
  const { category, title, content, images, video_url } = req.body;

  if (!content || !content.trim()) {
    res.status(400).json({ error: 'কর্মকাণ্ডের বিবরণ আবশ্যক।' });
    return;
  }

  const cleanCategory = category || 'গ্যাং কর্মকাণ্ড';
  const cleanImages = Array.isArray(images)
    ? images.filter((img: any) => typeof img === 'string' && img.trim().length > 0)
    : [];

  const db = readDB();
  if (!db.activities) {
    db.activities = [];
  }

  const newActivity: ActivityPost = {
    id: `act-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    member_id: currentMember.id,
    author_name: currentMember.full_name,
    author_nickname: currentMember.nickname,
    author_avatar: currentMember.profile_image_url,
    author_is_verified: currentMember.is_verified,
    author_division: currentMember.division,
    author_district: currentMember.district,
    author_upazila: currentMember.upazila,
    category: cleanCategory,
    title: title && title.trim() ? title.trim() : undefined,
    content: content.trim(),
    images: cleanImages,
    video_url: video_url && video_url.trim() ? video_url.trim() : undefined,
    likes: [],
    comments: [],
    is_pinned: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.activities.unshift(newActivity);

  // Broadcast community notification
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    title: 'নতুন কর্মকাণ্ডের পোস্ট!',
    message: `${currentMember.nickname} (${currentMember.district || 'সদস্য'}) একটি নতুন কর্মকাণ্ড পোস্ট করেছেন: "${(newActivity.title || newActivity.content).slice(0, 45)}..."`,
    type: 'info',
    created_at: new Date().toISOString(),
  });

  writeDB(db);

  res.status(201).json({
    success: true,
    activity: newActivity,
    message: 'কর্মকাণ্ড সফলভাবে পোস্ট করা হয়েছে!',
  });
});

// 3. Like/React toggle (requireAuth)
app.post('/api/activities/:id/like', requireAuth, (req: Request, res: Response) => {
  const currentMember = (req as any).member as Member;
  const db = readDB();
  const post = (db.activities || []).find(a => a.id === req.params.id);

  if (!post) {
    res.status(404).json({ error: 'পোস্টটি পাওয়া যায়নি।' });
    return;
  }

  if (!Array.isArray(post.likes)) {
    post.likes = [];
  }

  const existingIdx = post.likes.indexOf(currentMember.id);
  let liked = false;
  if (existingIdx !== -1) {
    post.likes.splice(existingIdx, 1);
    liked = false;
  } else {
    post.likes.push(currentMember.id);
    liked = true;
  }

  writeDB(db);
  res.json({
    success: true,
    liked,
    likes_count: post.likes.length,
    likes: post.likes,
  });
});

// 4. Add comment (requireAuth)
app.post('/api/activities/:id/comment', requireAuth, (req: Request, res: Response) => {
  const currentMember = (req as any).member as Member;
  const { text } = req.body;

  if (!text || !text.trim()) {
    res.status(400).json({ error: 'মন্তব্যের লেখা লিখুন।' });
    return;
  }

  const db = readDB();
  const post = (db.activities || []).find(a => a.id === req.params.id);

  if (!post) {
    res.status(404).json({ error: 'পোস্টটি পাওয়া যায়নি।' });
    return;
  }

  if (!Array.isArray(post.comments)) {
    post.comments = [];
  }

  const newComment: ActivityComment = {
    id: `comment-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    member_id: currentMember.id,
    nickname: currentMember.nickname,
    avatar_url: currentMember.profile_image_url,
    is_verified: currentMember.is_verified,
    text: text.trim(),
    created_at: new Date().toISOString(),
  };

  post.comments.push(newComment);
  writeDB(db);

  res.json({
    success: true,
    comment: newComment,
    comments: post.comments,
  });
});

// 5. Delete activity (requireAuth - Author or Admin)
app.delete('/api/activities/:id', requireAuth, (req: Request, res: Response) => {
  const currentMember = (req as any).member as Member;
  const db = readDB();
  const idx = (db.activities || []).findIndex(a => a.id === req.params.id);

  if (idx === -1) {
    res.status(404).json({ error: 'পোস্টটি পাওয়া যায়নি।' });
    return;
  }

  const post = db.activities[idx];
  const isAuthor = post.member_id === currentMember.id;
  const isAdmin = currentMember.role === 'owner_admin' || currentMember.role === 'admin';

  if (!isAuthor && !isAdmin) {
    res.status(403).json({ error: 'এই পোস্ট মুছে ফেলার অনুমতি আপনার নেই।' });
    return;
  }

  db.activities.splice(idx, 1);
  writeDB(db);

  res.json({ success: true, message: 'পোস্টটি সফলভাবে মুছে ফেলা হয়েছে।' });
});

// 6. Toggle pin activity (requireAdmin)
app.put('/api/activities/:id/pin', requireAdmin, (req: Request, res: Response) => {
  const db = readDB();
  const post = (db.activities || []).find(a => a.id === req.params.id);

  if (!post) {
    res.status(404).json({ error: 'পোস্টটি পাওয়া যায়নি।' });
    return;
  }

  post.is_pinned = !post.is_pinned;
  post.updated_at = new Date().toISOString();
  writeDB(db);

  res.json({
    success: true,
    is_pinned: post.is_pinned,
    message: post.is_pinned ? 'পোস্টটি পিন করা হয়েছে।' : 'পোস্টটি আনপিন করা হয়েছে।',
  });
});

// Vite middleware mounting in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[মুখে ল - MUKHE L] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
