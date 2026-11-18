import React, { useEffect } from 'react';
import { ExternalLink, X } from 'lucide-react';

interface LegalModalProps {
  title: string;
  iframeUrl?: string | null;
  children?: React.ReactNode;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  title,
  iframeUrl,
  children,
  onClose,
}) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-0 sm:p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full flex-col overflow-hidden bg-white sm:h-[88vh] sm:max-w-4xl sm:rounded-2xl sm:border sm:border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <h3 className="truncate font-display text-base font-bold text-slate-950">
            {title}
          </h3>
          <div className="flex shrink-0 items-center gap-2">
            {iframeUrl && (
              <a
                href={iframeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Buka Tab Baru
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup jendela"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
              Tutup
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {iframeUrl ? (
            <iframe
              src={iframeUrl}
              title={title}
              className="h-full w-full border-0"
              allow="clipboard-write"
            />
          ) : (
            <div className="p-5 sm:p-8">{children}</div>
          )}
        </div>
      </div>
    </div>
  );
};
