import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  Calculator,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Search,
} from 'lucide-react';
import { ADSENSE_CONFIG, EDITORIAL_ARTICLES } from '../data/schoolData';
import { isExternalBlockedForIframe } from '../services/schoolApi';
import { DynamicPortalItem, EditorialArticle } from '../types/portal';
import { AdsenseSlot } from './AdsenseSlot';
import { PortalIconBadge } from './PortalIconBadge';

interface LiteracyDigitalViewProps {
  portalItems: DynamicPortalItem[];
  portalLoading: boolean;
  onRefreshPortal: () => void;
  onOpenExternal: (title: string, url: string) => void;
  articles?: EditorialArticle[];
  onArticleRead?: () => void;
}

type LiteracyFilter = 'semua' | 'literasi' | 'game';
type CalculatorTab = 'ohm' | 'subnet' | 'umkm';

function ipToUint32(ip: string): number | null {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return null;
  let result = 0;
  for (const part of parts) {
    if (!/^\d+$/.test(part)) return null;
    const n = Number(part);
    if (n < 0 || n > 255) return null;
    result = ((result << 8) | n) >>> 0;
  }
  return result;
}

function uint32ToIp(val: number): string {
  return [
    (val >>> 24) & 255,
    (val >>> 16) & 255,
    (val >>> 8) & 255,
    val & 255,
  ].join('.');
}

export const LiteracyDigitalView: React.FC<LiteracyDigitalViewProps> = ({
  portalItems,
  portalLoading,
  onRefreshPortal,
  onOpenExternal,
  articles = EDITORIAL_ARTICLES,
  onArticleRead,
}) => {
  const [filter, setFilter] = useState<LiteracyFilter>('semua');
  const [selectedArticle, setSelectedArticle] = useState<EditorialArticle | null>(null);
  const [articleQuery, setArticleQuery] = useState('');
  const [articleCat, setArticleCat] = useState('Semua');
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('prida_saved_articles') || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Interactive Vocational Calculator State
  const [calcTab, setCalcTab] = useState<CalculatorTab>('ohm');
  const [ohmVolt, setOhmVolt] = useState('12');
  const [ohmRes, setOhmRes] = useState('4');
  const [cidrIp, setCidrIp] = useState('192.168.10.25');
  const [cidrPrefix, setCidrPrefix] = useState(24);
  const [umkmHpp, setUmkmHpp] = useState('18000');
  const [umkmOps, setUmkmOps] = useState('2000');
  const [umkmMargin, setUmkmMargin] = useState('30');

  useEffect(() => {
    if (!selectedArticle) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedArticle(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedArticle]);

  const toggleSaveArticle = (id: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('prida_saved_articles', JSON.stringify(next));
      } catch {
        // Ignore storage error
      }
      return next;
    });
  };

  const articleCategories = useMemo(() => {
    const cats = Array.from(new Set(articles.map((a) => a.category).filter(Boolean)));
    return ['Semua', 'Tersimpan', ...cats];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    const q = articleQuery.trim().toLowerCase();
    return articles.filter((art) => {
      if (articleCat === 'Tersimpan' && !savedIds.includes(art.id)) return false;
      if (articleCat !== 'Semua' && articleCat !== 'Tersimpan' && art.category !== articleCat) {
        return false;
      }
      if (!q) return true;
      return (
        art.title.toLowerCase().includes(q) ||
        art.excerpt.toLowerCase().includes(q) ||
        art.category.toLowerCase().includes(q)
      );
    });
  }, [articles, articleCat, articleQuery, savedIds]);

  const ohmResult = useMemo(() => {
    const v = parseFloat(ohmVolt);
    const r = parseFloat(ohmRes);
    if (!Number.isFinite(v) || !Number.isFinite(r) || r <= 0) {
      return null;
    }
    const i = v / r;
    const p = v * i;
    return {
      current: i,
      power: p,
      fuseHint: i <= 2 ? 'Sekring 3A–5A' : i <= 8 ? 'Sekring 10A' : 'Sekring 15A–20A',
    };
  }, [ohmVolt, ohmRes]);

  const subnetResult = useMemo(() => {
    const ipVal = ipToUint32(cidrIp);
    if (ipVal === null || cidrPrefix < 24 || cidrPrefix > 30) return null;
    const mask = (0xffffffff << (32 - cidrPrefix)) >>> 0;
    const network = (ipVal & mask) >>> 0;
    const broadcast = (network | (~mask >>> 0)) >>> 0;
    const hostCount = Math.max(0, broadcast - network - 1);
    return {
      netmask: uint32ToIp(mask),
      network: uint32ToIp(network),
      broadcast: uint32ToIp(broadcast),
      firstHost: uint32ToIp(network + 1),
      lastHost: uint32ToIp(broadcast - 1),
      hostCount,
    };
  }, [cidrIp, cidrPrefix]);

  const umkmResult = useMemo(() => {
    const hpp = Math.max(0, parseFloat(umkmHpp) || 0);
    const ops = Math.max(0, parseFloat(umkmOps) || 0);
    const margin = Math.max(0, Math.min(200, parseFloat(umkmMargin) || 0));
    const totalCost = hpp + ops;
    const profit = Math.round(totalCost * (margin / 100));
    const sellPrice = Math.round(totalCost + profit);
    const grossMarginPct = sellPrice > 0 ? Math.round((profit / sellPrice) * 100) : 0;
    return { totalCost, profit, sellPrice, grossMarginPct };
  }, [umkmHpp, umkmOps, umkmMargin]);

  const literacyItems = portalItems.filter((item) => {
    const sec = item.SectionID?.toLowerCase().trim();
    if (filter === 'literasi') return sec === 'literasi';
    if (filter === 'game') return sec === 'game';
    return sec === 'literasi' || sec === 'game';
  });

  const handleOpenLink = (item: DynamicPortalItem) => {
    const targetUrl = item.Url || item.URL || item.url;
    if (!targetUrl) return;
    if (isExternalBlockedForIframe(targetUrl)) {
      const a = document.createElement('a');
      a.href = targetUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.click();
    } else {
      onOpenExternal(item.Title, targetUrl);
    }
  };

  return (
    <div className="bg-white">
      {/* Page Header */}
      <section className="border-b border-slate-200 bg-slate-50 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-wider text-blue-700 uppercase">
            Perpustakaan &amp; Pembelajaran Digital
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Sumber Literasi Digital &amp; Materi Kejuruan
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
            Kumpulan tautan bacaan digital, modul belajar, kalkulator praktik kejuruan, serta
            artikel bengkel dan laboratorium SMK PGRI 2 Kedondong.
          </p>
        </div>
      </section>

      {/* Spreadsheet Dynamic Literacy & Edu-Game Directory */}
      <section className="py-12 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5">
              <BookOpen className="h-5 w-5 text-blue-700" />
              <div>
                <h2 className="font-display text-xl font-bold text-slate-950">
                  Katalog Sumber Literasi &amp; Game Edukasi
                </h2>
                <p className="text-xs text-slate-500">
                  Tersinkronisasi dari spreadsheet sekolah lengkap dengan ikon sumber belajar
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div
                role="tablist"
                aria-label="Filter Sumber Literasi"
                className="inline-flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1"
              >
                {[
                  { id: 'semua' as const, label: 'Semua' },
                  { id: 'literasi' as const, label: 'Literasi Digital' },
                  { id: 'game' as const, label: 'Game Edukasi' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={filter === tab.id}
                    onClick={() => setFilter(tab.id)}
                    className={`cursor-pointer whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      filter === tab.id
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-white hover:text-slate-950'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={onRefreshPortal}
                title="Muat ulang data spreadsheet"
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              >
                <RefreshCw className={`h-4 w-4 ${portalLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {portalLoading && literacyItems.length === 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-20 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
                />
              ))}
            </div>
          ) : literacyItems.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {literacyItems.map((item) => {
                const secLabel =
                  item.SectionID?.toLowerCase().trim() === 'game'
                    ? 'Game Edukasi'
                    : 'Literasi Digital';
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleOpenLink(item)}
                    className="group flex cursor-pointer items-center justify-between gap-3.5 rounded-xl border border-slate-200 bg-white p-4 text-left transition-colors duration-150 hover:border-blue-300 hover:bg-slate-50"
                  >
                    <div className="flex min-w-0 items-center gap-3.5">
                      <PortalIconBadge
                        icon={item.Icon}
                        logo={item.Logo}
                        sectionId={item.SectionID}
                        altTitle={item.Title}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-500">{secLabel}</p>
                        <p className="mt-0.5 truncate font-display text-sm font-bold text-slate-950 group-hover:text-blue-700">
                          {item.Title}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-blue-700" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
              Belum ada item pada kategori ini di spreadsheet. Gunakan tombol muat ulang atau pilih
              tab Semua.
            </div>
          )}
        </div>
      </section>

      {/* Posisi Iklan Halaman Literasi Digital */}
      <AdsenseSlot
        slotId={ADSENSE_CONFIG.slots.literacyFeed}
        className="border-t border-slate-200 bg-white py-6"
      />

      {/* Interactive Vocational Practice Workbench */}
      <section className="border-t border-slate-200 bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-blue-700 uppercase">
                <Calculator className="h-4 w-4" />
                Laboratorium Hitung Vokasi
              </div>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-950">
                Kalkulator &amp; Simulasi Praktik Kejuruan
              </h2>
              <p className="mt-1.5 text-sm text-slate-600">
                Alat bantu cepat untuk siswa TKR, TSM, TKJ, TAV, dan Bisnis Digital saat mengerjakan
                tugas bengkel maupun laboratorium.
              </p>
            </div>

            <div
              role="tablist"
              aria-label="Pilih Alat Praktik"
              className="inline-flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1"
            >
              {[
                { id: 'ohm' as const, label: 'Hukum Ohm & Daya' },
                { id: 'subnet' as const, label: 'Subnetting IPv4' },
                { id: 'umkm' as const, label: 'Margin Bisnis UMKM' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={calcTab === tab.id}
                  onClick={() => setCalcTab(tab.id)}
                  className={`cursor-pointer whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    calcTab === tab.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-white hover:text-slate-950'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
            {calcTab === 'ohm' && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-5">
                  <h3 className="font-display text-base font-bold text-slate-950">
                    Simulasi Rangkaian Kelistrikan DC (TKR/TSM/TAV)
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="calc-volt" className="block text-xs font-semibold text-slate-700">
                        Tegangan (Volt / V)
                      </label>
                      <input
                        id="calc-volt"
                        type="number"
                        step="0.1"
                        value={ohmVolt}
                        onChange={(e) => setOhmVolt(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm focus:border-blue-700 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="calc-res" className="block text-xs font-semibold text-slate-700">
                        Hambatan Beban (Ohm / Ω)
                      </label>
                      <input
                        id="calc-res"
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={ohmRes}
                        onChange={(e) => setOhmRes(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm focus:border-blue-700 focus:outline-none"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Rumus: I = V / R dan P = V × I. Digunakan saat mengecek konsumsi lampu/beban aki
                    12V atau catu daya amplifier.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-7">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs text-slate-500">Arus Listrik (I)</p>
                    <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-950">
                      {ohmResult ? `${ohmResult.current.toFixed(2)} A` : '—'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs text-slate-500">Daya Diserap (P)</p>
                    <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-blue-700">
                      {ohmResult ? `${ohmResult.power.toFixed(2)} W` : '—'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs text-slate-500">Rekomendasi Pengaman</p>
                    <p className="mt-1 font-display text-base font-bold text-slate-950">
                      {ohmResult ? ohmResult.fuseHint : 'Hambatan > 0'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {calcTab === 'subnet' && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-5">
                  <h3 className="font-display text-base font-bold text-slate-950">
                    Kalkulator Subnetting IPv4 Lab TKJ
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label htmlFor="calc-ip" className="block text-xs font-semibold text-slate-700">
                        Alamat IPv4
                      </label>
                      <input
                        id="calc-ip"
                        type="text"
                        value={cidrIp}
                        onChange={(e) => setCidrIp(e.target.value)}
                        placeholder="192.168.10.25"
                        className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm focus:border-blue-700 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="calc-cidr"
                        className="block text-xs font-semibold text-slate-700"
                      >
                        Prefix
                      </label>
                      <select
                        id="calc-cidr"
                        value={cidrPrefix}
                        onChange={(e) => setCidrPrefix(Number(e.target.value))}
                        className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 font-mono text-sm focus:border-blue-700 focus:outline-none"
                      >
                        {[24, 25, 26, 27, 28, 29, 30].map((p) => (
                          <option key={p} value={p}>
                            /{p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Masukkan IP LAN untuk menghitung Subnet Mask, Network ID, Broadcast, dan rentang
                    IP host yang dapat dipakai di router MikroTik.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:col-span-7">
                  {subnetResult ? (
                    <>
                      <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                        <p className="text-[11px] text-slate-500">Network ID</p>
                        <p className="mt-1 font-mono text-sm font-bold tabular-nums text-slate-950">
                          {subnetResult.network}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                        <p className="text-[11px] text-slate-500">Broadcast Address</p>
                        <p className="mt-1 font-mono text-sm font-bold tabular-nums text-slate-950">
                          {subnetResult.broadcast}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                        <p className="text-[11px] text-slate-500">Subnet Mask</p>
                        <p className="mt-1 font-mono text-sm font-bold tabular-nums text-blue-700">
                          {subnetResult.netmask}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                        <p className="text-[11px] text-slate-500">Host Pertama</p>
                        <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-900">
                          {subnetResult.firstHost}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                        <p className="text-[11px] text-slate-500">Host Terakhir</p>
                        <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-900">
                          {subnetResult.lastHost}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                        <p className="text-[11px] text-slate-500">Jumlah Host Aktif</p>
                        <p className="mt-1 font-mono text-sm font-bold tabular-nums text-emerald-700">
                          {subnetResult.hostCount} perangkat
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-full rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                      Format IPv4 tidak valid. Contoh benar: <span className="font-mono">192.168.10.25</span>.
                    </div>
                  )}
                </div>
              </div>
            )}

            {calcTab === 'umkm' && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-5">
                  <h3 className="font-display text-base font-bold text-slate-950">
                    Kalkulator Harga Jual &amp; Margin Bisnis Digital
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label htmlFor="calc-hpp" className="block text-xs font-semibold text-slate-700">
                        HPP Produk (Rp)
                      </label>
                      <input
                        id="calc-hpp"
                        type="number"
                        min="0"
                        value={umkmHpp}
                        onChange={(e) => setUmkmHpp(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm focus:border-blue-700 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="calc-ops" className="block text-xs font-semibold text-slate-700">
                        Kemasan/Admin
                      </label>
                      <input
                        id="calc-ops"
                        type="number"
                        min="0"
                        value={umkmOps}
                        onChange={(e) => setUmkmOps(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm focus:border-blue-700 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="calc-margin"
                        className="block text-xs font-semibold text-slate-700"
                      >
                        Target Laba (%)
                      </label>
                      <input
                        id="calc-margin"
                        type="number"
                        min="0"
                        max="200"
                        value={umkmMargin}
                        onChange={(e) => setUmkmMargin(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm focus:border-blue-700 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-7">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs text-slate-500">Total Modal per Unit</p>
                    <p className="mt-1 font-mono text-lg font-bold tabular-nums text-slate-950">
                      Rp {umkmResult.totalCost.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs text-slate-500">Harga Jual Disarankan</p>
                    <p className="mt-1 font-mono text-lg font-bold tabular-nums text-blue-700">
                      Rp {umkmResult.sellPrice.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs text-slate-500">Laba Bersih / Unit</p>
                    <p className="mt-1 font-mono text-lg font-bold tabular-nums text-emerald-700">
                      Rp {umkmResult.profit.toLocaleString('id-ID')} ({umkmResult.grossMarginPct}%)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Editorial Vocational Articles */}
      <section className="border-t border-slate-200 bg-slate-50 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-wider text-blue-700 uppercase">
                Artikel Edukasi Kejuruan
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-950">
                Referensi Praktik Bengkel &amp; Laboratorium SMK
              </h2>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={articleQuery}
                onChange={(e) => setArticleQuery(e.target.value)}
                placeholder="Cari artikel praktik..."
                aria-label="Cari artikel kejuruan"
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none"
              />
            </div>
          </div>

          <div
            role="tablist"
            aria-label="Filter Kategori Artikel"
            className="mt-5 flex flex-wrap gap-1.5"
          >
            {articleCategories.map((cat) => {
              const active = articleCat === cat;
              const label =
                cat === 'Tersimpan' ? `Tersimpan (${savedIds.length})` : cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setArticleCat(cat)}
                  className={`cursor-pointer whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {filteredArticles.length === 0 ? (
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              {articleCat === 'Tersimpan'
                ? 'Belum ada artikel yang disimpan. Klik tombol simpan pada kartu artikel untuk membacanya kembali nanti.'
                : 'Tidak ada artikel kejuruan yang sesuai dengan filter pencarian Anda.'}
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              {filteredArticles.map((article) => {
                const isSaved = savedIds.includes(article.id);
                return (
                  <article
                    key={article.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 transition-colors duration-150 hover:border-slate-300"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="font-semibold text-blue-700">{article.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>{article.publishedAt}</span>
                          <span aria-hidden="true">·</span>
                          <span>{article.readTime}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleSaveArticle(article.id)}
                          aria-label={isSaved ? 'Hapus dari tersimpan' : 'Simpan artikel'}
                          title={isSaved ? 'Tersimpan di perangkat ini' : 'Simpan untuk dibaca nanti'}
                          className={`cursor-pointer rounded-lg border p-1.5 transition-colors ${
                            isSaved
                              ? 'border-blue-200 bg-blue-50 text-blue-700'
                              : 'border-slate-200 bg-white text-slate-400 hover:text-slate-700'
                          }`}
                        >
                          <Bookmark className="h-3.5 w-3.5" fill={isSaved ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      <h3 className="mt-2.5 font-display text-lg font-bold leading-snug text-slate-950">
                        {article.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {article.excerpt}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-xs text-slate-500">{article.author}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedArticle(article);
                          onArticleRead?.();
                        }}
                        className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800"
                      >
                        Baca Artikel
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Article Reader Modal */}
      {selectedArticle && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="article-reader-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          onClick={() => setSelectedArticle(null)}
        >
          <article
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 sm:p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <p className="text-xs text-slate-500">
                  <span className="font-semibold text-blue-700">{selectedArticle.category}</span>
                  {' · '}
                  {selectedArticle.publishedAt}
                  {' · '}
                  {selectedArticle.readTime}
                </p>
                <h3
                  id="article-reader-title"
                  className="mt-2 font-display text-2xl font-bold leading-tight text-slate-950"
                >
                  {selectedArticle.title}
                </h3>
                <p className="mt-1.5 text-xs text-slate-500">Oleh {selectedArticle.author}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="cursor-pointer shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Tutup
              </button>
            </div>

            <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-700">
              {selectedArticle.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {/* Posisi Iklan In-Article di Modal Pembaca */}
            <AdsenseSlot
              slotId={ADSENSE_CONFIG.slots.articleInContent}
              variant="in-article"
              className="mt-6 px-0 sm:px-0 lg:px-0"
            />

            <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h4 className="font-display text-sm font-bold text-slate-950">
                Ringkasan Poin Utama
              </h4>
              <ul className="mt-3 space-y-2">
                {selectedArticle.keyTakeaways.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </div>
      )}
    </div>
  );
};
