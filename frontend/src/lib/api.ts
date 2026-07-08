'use client';

import { ChecklistItem, ChecklistVersion, DailyEntry } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const TOKEN_KEY = 'daily-ten-token';

export interface AuthUser {
  id: string;
  email: string;
}

export const tokenStore = {
  get: () => (typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY)),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function authHeaders(): Record<string, string> {
  const token = tokenStore.get();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/** 페이지 이탈 직전 마지막 자동 저장 — keepalive로 언로드 후에도 전송이 살아남는다 */
export function sendEntryBeacon(date: string, payload: { checkedItemIds: string[]; note: string }) {
  void fetch(`${API_URL}/entries/${date}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
    keepalive: true,
  });
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    tokenStore.clear();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message = Array.isArray(body?.message)
      ? body.message.join(', ')
      : (body?.message ?? '요청에 실패했습니다');
    throw new ApiError(res.status, message);
  }
  return body as T;
}

interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export const api = {
  // ── auth ──
  async signup(email: string, password: string) {
    const res = await request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    tokenStore.set(res.accessToken);
    return res.user;
  },

  async login(email: string, password: string) {
    const res = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    tokenStore.set(res.accessToken);
    return res.user;
  },

  logout() {
    tokenStore.clear();
  },

  me: () => request<AuthUser>('/auth/me'),

  // ── data ──
  getVersions: () => request<ChecklistVersion[]>('/versions'),

  createVersion: (payload: { items: ChecklistItem[]; changeSummary: string; clientToday: string; title?: string }) =>
    request<ChecklistVersion>('/versions', { method: 'POST', body: JSON.stringify(payload) }),

  getEntries: () => request<DailyEntry[]>('/entries'),

  upsertEntry: (date: string, payload: { checkedItemIds: string[]; note: string }) =>
    request<DailyEntry>(`/entries/${date}`, { method: 'PUT', body: JSON.stringify(payload) }),
};
