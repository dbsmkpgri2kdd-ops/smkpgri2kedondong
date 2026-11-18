import React, { useEffect, useState } from 'react';
import { withBase } from '../data/schoolData';

const CONSENT_STORAGE_KEY = 'prida_cookie_consent_v1';

export const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!saved) {
        setVisible(true);
      }
    } catch {
      setVisible(false);
    }
  }, []);

  if (!visible) return null;

  const savePreference = (choice: 'all' | 'essential') => {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, choice);
    } catch {
      // Ignore storage restriction
    }
    setVisible(false);
  };

  return (
    <aside
      aria-label="Persetujuan Cookie dan Privasi"
      className="fixed right-3 bottom-3 left-3 z-40 mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm sm:px-5"
    >
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-xs leading-relaxed text-slate-600">
          Situs ini menggunakan cookie untuk preferensi portal dan layanan iklan Google AdSense.{' '}
          <a
            href={withBase('kebijakan-privasi.html')}
            className="font-semibold text-blue-700 underline underline-offset-2"
          >
            Kebijakan Privasi
          </a>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => savePreference('essential')}
            className="cursor-pointer whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Esensial Saja
          </button>
          <button
            type="button"
            onClick={() => savePreference('all')}
            className="cursor-pointer whitespace-nowrap rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
          >
            Terima Semua
          </button>
        </div>
      </div>
    </aside>
  );
};
