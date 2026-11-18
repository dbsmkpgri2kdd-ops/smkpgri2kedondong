import React, { useEffect, useRef } from 'react';
import { ADSENSE_CONFIG } from '../data/schoolData';

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

export type AdSlotVariant = 'display' | 'in-article';

interface AdsenseSlotProps {
  slotId: string;
  label?: string;
  variant?: AdSlotVariant;
  className?: string;
}

/**
 * Komponen unit iklan Google AdSense yang aman untuk React SPA & Core Web Vitals (anti-CLS).
 * Jika slotId masih kosong (''), komponen tidak merender kotak kosong agar tampilan tetap bersih
 * dan Auto Ads dari <head> tetap bekerja otomatis.
 */
export const AdsenseSlot: React.FC<AdsenseSlotProps> = ({
  slotId,
  label = 'Iklan',
  variant = 'display',
  className = '',
}) => {
  const insRef = useRef<HTMLModElement>(null);
  const cleanSlot = slotId.trim();

  useEffect(() => {
    if (!cleanSlot || !insRef.current) return;
    const el = insRef.current;
    if (el.dataset.adsbygoogleStatus || el.dataset.pridaPushed === '1') return;

    el.dataset.pridaPushed = '1';
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Abaikan jika skrip AdSense belum termuat atau diblokir adblocker
    }
  }, [cleanSlot]);

  if (!cleanSlot) {
    return null;
  }

  const isInArticle = variant === 'in-article';

  return (
    <aside
      aria-label="Ruang Iklan Sponsor"
      className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}
    >
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 text-center">
        <p className="mb-2 text-[10px] font-medium tracking-wider text-slate-400 uppercase">
          {label}
        </p>
        <div className={isInArticle ? 'min-h-[250px]' : 'min-h-[100px]'}>
          <ins
            ref={insRef}
            className="adsbygoogle block"
            style={{ display: 'block', textAlign: isInArticle ? 'center' : undefined }}
            data-ad-client={ADSENSE_CONFIG.clientId}
            data-ad-slot={cleanSlot}
            data-ad-layout={isInArticle ? 'in-article' : undefined}
            data-ad-format={isInArticle ? 'fluid' : 'auto'}
            data-full-width-responsive={isInArticle ? undefined : 'true'}
          />
        </div>
      </div>
    </aside>
  );
};
