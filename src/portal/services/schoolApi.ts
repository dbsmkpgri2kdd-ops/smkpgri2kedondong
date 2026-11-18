import { SCHOOL_ENDPOINTS } from '../data/schoolData';
import { DynamicPortalItem, PtkMember, UkkLookupResponse } from '../types/portal';

const PORTAL_CACHE_KEY = 'prida_portal_data_cache_v2';

export function getCachedPortalItems(): DynamicPortalItem[] {
  try {
    const raw = localStorage.getItem(PORTAL_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return normalizePortalPayload(parsed);
  } catch {
    return [];
  }
}

function normalizeRow(item: Record<string, unknown>, fallbackId: string): DynamicPortalItem {
  const rawIcon = item.Icon || item.icon || item.Ikon || item.ikon;
  const rawLogo = item.Logo || item.logo || item.Gambar || item.gambar;
  const rawThumb = item.Thumbnail || item.thumbnail;
  return {
    id: String(item.id ?? fallbackId),
    Title: String(item.Title || item.title || `Item ${fallbackId}`),
    SectionID: String(item.SectionID || item.sectionId || ''),
    Icon: rawIcon ? String(rawIcon).trim() : undefined,
    Logo: rawLogo ? String(rawLogo).trim() : undefined,
    Url: item.Url ? String(item.Url) : undefined,
    URL: item.URL ? String(item.URL) : undefined,
    url: item.url ? String(item.url) : undefined,
    Thumbnail: rawThumb ? String(rawThumb).trim() : undefined,
  };
}

function normalizePortalPayload(payload: unknown): DynamicPortalItem[] {
  if (!payload || typeof payload !== 'object') return [];
  if (Array.isArray(payload)) {
    return payload.map((raw, idx) =>
      normalizeRow((raw ?? {}) as Record<string, unknown>, String(idx))
    );
  }
  const obj = payload as Record<string, Record<string, unknown>>;
  return Object.keys(obj).map((key) => normalizeRow(obj[key] ?? {}, key));
}

export async function fetchPortalItems(): Promise<DynamicPortalItem[]> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(SCHOOL_ENDPOINTS.PORTAL_API, {
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    try {
      localStorage.setItem(PORTAL_CACHE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage quota or privacy restrictions
    }
    return normalizePortalPayload(data);
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function fetchPtkDirectory(): Promise<PtkMember[]> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(SCHOOL_ENDPOINTS.PTK_API, {
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } finally {
    window.clearTimeout(timeout);
  }
}

export function lookupUkkResult(nama: string, kelas: string): Promise<UkkLookupResponse> {
  return new Promise((resolve, reject) => {
    const callbackName = `prida_ukk_cb_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const script = document.createElement('script');
    let settled = false;

    const cleanup = () => {
      try {
        delete (window as unknown as Record<string, unknown>)[callbackName];
      } catch {
        (window as unknown as Record<string, unknown>)[callbackName] = undefined;
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };

    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error('Permintaan pengumuman UKK melebihi batas waktu.'));
    }, 12000);

    (window as unknown as Record<string, unknown>)[callbackName] = (data: UkkLookupResponse) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      cleanup();
      reject(new Error('Gagal terhubung ke server pengumuman UKK.'));
    };

    script.src = `${SCHOOL_ENDPOINTS.KELULUSAN_API}?nama=${encodeURIComponent(
      nama.trim()
    )}&kelas=${encodeURIComponent(kelas.trim())}&callback=${callbackName}`;
    document.body.appendChild(script);
  });
}

export function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^#&?]*)/
  );
  return match && match[1] && match[1].length === 11 ? match[1] : null;
}

export function isExternalBlockedForIframe(url: string): boolean {
  const blockedHosts = [
    'facebook.com',
    'instagram.com',
    'youtube.com',
    'youtu.be',
    'google.com',
    'twitter.com',
    'x.com',
    'shopee',
    'tokopedia',
    'tiktok.com',
    'wa.me',
    'whatsapp.com',
    't.me',
  ];
  const lower = url.toLowerCase();
  return blockedHosts.some((host) => lower.includes(host));
}
