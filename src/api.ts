import {
  Member,
  Notice,
  CommunityEvent,
  Idol,
  WebsiteSettings,
  SystemStatus,
  CommunityStats,
  NotificationItem,
  PaymentRecord,
  ActivityPost,
  ActivityComment,
} from './types';

const TOKEN_KEY = 'mukhe_l_session_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'একটি অপ্রত্যাশিত সমস্যা দেখা দিয়েছে।');
  }

  return data as T;
}

export const api = {
  // Status & Stats
  getStatus: () => request<SystemStatus>('/api/status'),
  getStats: () => request<CommunityStats>('/api/stats'),

  // Website Settings
  getSettings: () => request<WebsiteSettings>('/api/settings'),
  updateSettings: (data: Partial<WebsiteSettings> & { registration_enabled?: boolean }) =>
    request<{ success: boolean; settings: WebsiteSettings; registration_enabled: boolean }>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Idols
  getIdols: () => request<Idol[]>('/api/idols'),
  updateIdol: (id: string, data: Partial<Idol>) =>
    request<{ success: boolean; idol: Idol }>(`/api/idols/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Notices
  getNotices: () => request<Notice[]>('/api/notices'),
  createNotice: (data: Partial<Notice>) =>
    request<{ success: boolean; notice: Notice }>('/api/notices', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateNotice: (id: string, data: Partial<Notice>) =>
    request<{ success: boolean; notice: Notice }>(`/api/notices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteNotice: (id: string) =>
    request<{ success: boolean }>(`/api/notices/${id}`, {
      method: 'DELETE',
    }),

  // Events
  getEvents: () => request<CommunityEvent[]>('/api/events'),
  createEvent: (data: Partial<CommunityEvent>) =>
    request<{ success: boolean; event: CommunityEvent }>('/api/events', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateEvent: (id: string, data: Partial<CommunityEvent>) =>
    request<{ success: boolean; event: CommunityEvent }>(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteEvent: (id: string) =>
    request<{ success: boolean }>(`/api/events/${id}`, {
      method: 'DELETE',
    }),

  // Auth
  register: (data: {
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
  }) =>
    request<{
      success: boolean;
      member: Member;
      token: string;
      raw_pin: string;
      is_initial_admin: boolean;
    }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { identifier?: string; nickname?: string; pin: string }) =>
    request<{ success: boolean; member: Member; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => request<{ success: boolean; member: Member }>('/api/auth/me'),

  logout: () =>
    request<{ success: boolean }>('/api/auth/logout', {
      method: 'POST',
    }),

  // Members
  getMembers: (search?: string, district?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (district) params.append('district', district);
    const q = params.toString() ? `?${params.toString()}` : '';
    return request<{ total: number; members: Member[] }>(`/api/members${q}`);
  },
  getMemberById: (id: string) => request<Member>(`/api/members/${id}`),
  updateProfile: (id: string, data: Partial<Member>) =>
    request<{ success: boolean; member: Member }>(`/api/members/${id}/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  submitDocument: (id: string, data: { document_type: string; document_url: string }) =>
    request<{ success: boolean; member: Member; message: string }>(`/api/members/${id}/document`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Admin Members
  getAdminMembers: (filter?: { division?: string; district?: string; upazila?: string }) => {
    const params = new URLSearchParams();
    if (filter?.division) params.append('division', filter.division);
    if (filter?.district) params.append('district', filter.district);
    if (filter?.upazila) params.append('upazila', filter.upazila);
    const q = params.toString() ? `?${params.toString()}` : '';
    return request<Member[]>(`/api/admin/members${q}`);
  },
  updateMemberStatus: (id: string, status: 'active' | 'suspended') =>
    request<{ success: boolean; member: Member }>(`/api/admin/members/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  toggleMemberBadge: (id: string, is_verified: boolean) =>
    request<{ success: boolean; member: Member }>(`/api/admin/members/${id}/badge`, {
      method: 'PUT',
      body: JSON.stringify({ is_verified }),
    }),
  resetMemberPin: (id: string) =>
    request<{ success: boolean; member_id: string; nickname: string; new_pin: string; message: string }>(
      `/api/admin/members/${id}/reset-pin`,
      { method: 'POST' }
    ),
  deleteMember: (id: string) =>
    request<{ success: boolean }>(`/api/admin/members/${id}`, {
      method: 'DELETE',
    }),

  // Notifications
  getNotifications: () => request<NotificationItem[]>('/api/notifications'),
  broadcastNotification: (data: { title: string; message: string; type?: string }) =>
    request<{ success: boolean; notification: NotificationItem }>('/api/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Payments / Fund
  getPublicPayments: () =>
    request<{ total_fund: number; count: number; donations: PaymentRecord[] }>('/api/payments/public'),
  getPayments: () => request<PaymentRecord[]>('/api/payments'),
  submitPayment: (data: {
    amount: number;
    method: 'bkash' | 'nagad' | 'rocket';
    purpose: string;
    sender_number: string;
    donor_name: string;
    transaction_id: string;
  }) =>
    request<{ success: boolean; transaction: PaymentRecord; message: string }>('/api/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePaymentStatus: (id: string, status: 'verified' | 'rejected' | 'pending') =>
    request<{ success: boolean; payment: PaymentRecord }>(`/api/admin/payments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Activities (মেম্বারদের কর্মকাণ্ডসমূহ)
  getActivities: (filter?: { category?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filter?.category && filter.category !== 'সকল') params.append('category', filter.category);
    if (filter?.search) params.append('search', filter.search);
    const q = params.toString() ? `?${params.toString()}` : '';
    return request<ActivityPost[]>(`/api/activities${q}`);
  },
  createActivity: (data: {
    category: string;
    title?: string;
    content: string;
    images?: string[];
    video_url?: string;
  }) =>
    request<{ success: boolean; activity: ActivityPost; message: string }>('/api/activities', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  toggleLikeActivity: (id: string) =>
    request<{ success: boolean; liked: boolean; likes_count: number; likes: string[] }>(
      `/api/activities/${id}/like`,
      { method: 'POST' }
    ),
  commentActivity: (id: string, text: string) =>
    request<{ success: boolean; comment: ActivityComment; comments: ActivityComment[] }>(
      `/api/activities/${id}/comment`,
      {
        method: 'POST',
        body: JSON.stringify({ text }),
      }
    ),
  deleteActivity: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/activities/${id}`, {
      method: 'DELETE',
    }),
  togglePinActivity: (id: string) =>
    request<{ success: boolean; is_pinned: boolean; message: string }>(`/api/activities/${id}/pin`, {
      method: 'PUT',
    }),
};
