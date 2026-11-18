import React, { useEffect, useState } from 'react';
import { ArrowRight, Check, Share2, X } from 'lucide-react';
import { resolveAssetUrl } from '../data/schoolData';
import { PortalRoute, SchoolNewsItem } from '../types/portal';

interface NewsReaderModalProps {
  item: SchoolNewsItem;
  onClose: () => void;
  onNavigate?: (route: PortalRoute) => void;
}

export const NewsReaderModal: React.FC<NewsReaderModalProps> = ({
  item,
  onClose,
  onNavigate,
}) => {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleShare = async () => {
    const shareText = `${item.title} — Portal SMK PGRI 2 Kedondong (${window.location.href})`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Clipboard blocked in restricted frame
    }
  };

  const resolvedImg = item.image ? resolveAssetUrl(item.image) : '';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="news-reader-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <article
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {resolvedImg && !imgError && (
          <div className="aspect-[16/9] w-full overflow-hidden border-b border-slate-200 bg-slate-100">
            <img
              src={resolvedImg}
              alt={item.title}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <p className="text-xs text-slate-500">
                <span className="font-semibold text-blue-700">{item.category}</span>
                <span className="mx-1.5" aria-hidden="true">·</span>
                <span>{item.date}</span>
              </p>
              <h3
                id="news-reader-title"
                className="mt-1.5 font-display text-xl font-bold leading-snug text-slate-950 sm:text-2xl"
              >
                {item.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup berita"
              className="cursor-pointer shrink-0 rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 space-y-4 text-sm leading-relaxed text-slate-700 sm:text-base">
            <p>{item.summary}</p>
            <p className="text-sm text-slate-600">
              Informasi resmi dipublikasikan melalui Portal Digital SMK PGRI 2 Kedondong
              (smkpgri2kedondong.sch.id) untuk siswa, orang tua, calon pendaftar PPDB, dan mitra industri.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-700" />
                  Tautan Warta Disalin
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  Bagikan Warta
                </>
              )}
            </button>

            {onNavigate && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate('ppdb');
                  }}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-800"
                >
                  Info PPDB Online
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
};
