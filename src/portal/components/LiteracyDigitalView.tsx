import React, { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, ExternalLink, RefreshCw } from 'lucide-react';
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

  useEffect(() => {
    if (!selectedArticle) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedArticle(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedArticle]);

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
            Kumpulan tautan bacaan digital, modul belajar, game edukasi interaktif dari basis data
            sekolah, serta artikel praktik kejuruan SMK PGRI 2 Kedondong.
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

      {/* Editorial Vocational Articles */}
      <section className="border-t border-slate-200 bg-slate-50 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wider text-blue-700 uppercase">
              Artikel Edukasi Kejuruan
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-950">
              Referensi Praktik Bengkel &amp; Laboratorium SMK
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {articles.map((article) => (
              <article
                key={article.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 transition-colors duration-150 hover:border-slate-300"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-blue-700">{article.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.publishedAt}</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.readTime}</span>
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
            ))}
          </div>
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
