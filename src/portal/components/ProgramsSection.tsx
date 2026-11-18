import React, { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, Wrench } from 'lucide-react';
import { ADSENSE_CONFIG, STUDY_PROGRAMS } from '../data/schoolData';
import { MajorCategory, StudyProgram } from '../types/portal';
import { AdsenseSlot } from './AdsenseSlot';

interface ProgramsSectionProps {
  programs?: StudyProgram[];
}

export const ProgramsSection: React.FC<ProgramsSectionProps> = ({
  programs = STUDY_PROGRAMS,
}) => {
  const [activeCategory, setActiveCategory] = useState<MajorCategory>('semua');
  const [selectedProgram, setSelectedProgram] = useState<StudyProgram | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const categoryTabs: { id: MajorCategory; label: string }[] = [
    { id: 'semua', label: `Semua Program (${programs.length})` },
    { id: 'rekayasa', label: 'Teknologi & Rekayasa' },
    { id: 'tik', label: 'TIK & Elektronika' },
    { id: 'bisnis', label: 'Bisnis Digital' },
  ];

  useEffect(() => {
    if (!selectedProgram) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedProgram(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedProgram]);

  const visiblePrograms =
    activeCategory === 'semua'
      ? programs
      : programs.filter((item) => item.category === activeCategory);

  return (
    <section
      id="program-keahlian"
      aria-labelledby="heading-jurusan"
      className="border-t border-slate-200 bg-white py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wider text-blue-700 uppercase">
              Kompetensi Keahlian Vokasi
            </p>
            <h2
              id="heading-jurusan"
              className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl"
            >
              Lima Program Keahlian Terpadu Siap Kerja dan Wirausaha
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              Kurikulum praktik bengkel dan laboratorium dirancang selaras dengan standar dunia usaha
              serta dunia industri di Lampung dan nasional.
            </p>
          </div>

          {/* Executive Category Filter Menu */}
          <div
            role="tablist"
            aria-label="Filter Program Keahlian"
            className="inline-flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1.5"
          >
            {categoryTabs.map((tab) => {
              const active = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`cursor-pointer whitespace-nowrap shrink-0 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors duration-150 ${
                    active
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-white hover:text-slate-950'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Program Cards Grid */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visiblePrograms.map((program) => {
            const imgFailed = failedImages[program.code];
            return (
              <article
                key={program.code}
                className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors duration-150 hover:border-slate-300"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  {program.image && !imgFailed ? (
                    <img
                      src={program.image}
                      alt={`Fasilitas praktik ${program.name}`}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setFailedImages((prev) => ({ ...prev, [program.code]: true }))
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-100 text-slate-500">
                      <Wrench className="h-7 w-7" />
                      <span className="font-mono text-xs font-semibold">{program.code}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono font-semibold text-blue-700">{program.code}</span>
                    <span aria-hidden="true">·</span>
                    <span>{program.categoryLabel}</span>
                  </div>

                  <h3 className="mt-2 font-display text-lg font-bold text-slate-950">
                    {program.name}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                    {program.summary}
                  </p>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setSelectedProgram(program)}
                      className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800"
                    >
                      Lihat Kurikulum &amp; Prospek Karier
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Posisi Iklan Halaman Program Keahlian */}
        <AdsenseSlot
          slotId={ADSENSE_CONFIG.slots.programBottom}
          className="mt-10 px-0 sm:px-0 lg:px-0"
        />
      </div>

      {/* Program Specification Modal */}
      {selectedProgram && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-program-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          onClick={() => setSelectedProgram(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  <span className="font-mono font-semibold text-blue-700">
                    {selectedProgram.code}
                  </span>{' '}
                  · {selectedProgram.categoryLabel}
                </p>
                <h3
                  id="modal-program-title"
                  className="mt-1 font-display text-xl font-bold text-slate-950 sm:text-2xl"
                >
                  {selectedProgram.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProgram(null)}
                className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Tutup
              </button>
            </div>

            <div className="mt-6 space-y-6">
              <p className="text-sm leading-relaxed text-slate-700">
                {selectedProgram.summary}
              </p>

              <div>
                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-950">
                  <BookOpen className="h-4 w-4 text-blue-700" />
                  Kompetensi Inti yang Dipelajari
                </h4>
                <ul className="mt-3 space-y-2">
                  {selectedProgram.competencies.map((comp) => (
                    <li
                      key={comp}
                      className="flex items-start gap-2.5 text-sm text-slate-700"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                      <span>{comp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                <div>
                  <h4 className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Prospek Karier Lulusan
                  </h4>
                  <ul className="mt-2 space-y-1.5 text-sm text-slate-800">
                    {selectedProgram.careers.map((career) => (
                      <li key={career}>· {career}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Sertifikasi Kompetensi
                  </h4>
                  <p className="mt-2 text-sm text-slate-800">
                    {selectedProgram.certification}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
