import React, { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, Compass, RotateCcw, Wrench } from 'lucide-react';
import { ADSENSE_CONFIG, STUDY_PROGRAMS } from '../data/schoolData';
import { MajorCategory, StudyProgram } from '../types/portal';
import { AdsenseSlot } from './AdsenseSlot';

interface ProgramsSectionProps {
  programs?: StudyProgram[];
  onApplyProgram?: (programCode: string) => void;
}

type ProgramCode = 'TKR' | 'TSM' | 'TKJ' | 'TAV' | 'BD';

interface QuizQuestion {
  id: string;
  question: string;
  options: Array<{ label: string; scores: Partial<Record<ProgramCode, number>> }>;
}

const INTEREST_QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Aktivitas praktik mana yang paling membuat Anda bersemangat?',
    options: [
      { label: 'Membongkar dan menyetel mesin mobil atau sistem AC kendaraan', scores: { TKR: 3, TSM: 1 } },
      { label: 'Menyervis sepeda motor injeksi dan kelistrikan roda dua', scores: { TSM: 3, TKR: 1 } },
      { label: 'Merakit komputer, mengatur router Wi-Fi, atau kabel fiber optik', scores: { TKJ: 3 } },
      { label: 'Merakit rangkaian elektronika, amplifier, dan tata suara', scores: { TAV: 3 } },
      { label: 'Membuat konten promosi, foto produk, dan berjualan online', scores: { BD: 3 } },
    ],
  },
  {
    id: 'q2',
    question: 'Alat kerja utama yang ingin Anda kuasai selama sekolah di SMK:',
    options: [
      { label: 'Scanner diagnostik OBD-II mobil & car lift bengkel', scores: { TKR: 3 } },
      { label: 'Bike lift, alat ukur CVT, dan scanner injeksi motor', scores: { TSM: 3 } },
      { label: 'Server Linux, router MikroTik, dan fusion splicer', scores: { TKJ: 3 } },
      { label: 'Osiloskop digital, multimeter, solder, dan mixer audio', scores: { TAV: 3 } },
      { label: 'Aplikasi desain katalog, toko daring, dan analitik pasar', scores: { BD: 3 } },
    ],
  },
  {
    id: 'q3',
    question: 'Target karier yang paling ingin Anda wujudkan setelah lulus:',
    options: [
      { label: 'Teknisi bengkel resmi mobil atau wirausaha servis roda empat', scores: { TKR: 3 } },
      { label: 'Mekanik bengkel resmi motor atau buka bengkel mandiri', scores: { TSM: 3 } },
      { label: 'Teknisi jaringan ISP, fiber optik, atau IT Support instansi', scores: { TKJ: 3 } },
      { label: 'Teknisi elektronika, operator audio studio, atau penyiaran', scores: { TAV: 3 } },
      { label: 'Digital marketing executive atau pemilik brand toko online', scores: { BD: 3 } },
    ],
  },
  {
    id: 'q4',
    question: 'Pola pemecahan masalah yang paling Anda sukai:',
    options: [
      { label: 'Mendiagnosis gangguan mekanis & kelistrikan kendaraan', scores: { TKR: 2, TSM: 2 } },
      { label: 'Melacak gangguan koneksi jaringan & konfigurasi perangkat lunak', scores: { TKJ: 3 } },
      { label: 'Mengukur arus tegangan komponen dan kejernihan sinyal audio', scores: { TAV: 3 } },
      { label: 'Menyusun strategi pemasaran dan komunikasi pelanggan digital', scores: { BD: 3 } },
    ],
  },
];

export const ProgramsSection: React.FC<ProgramsSectionProps> = ({
  programs = STUDY_PROGRAMS,
  onApplyProgram,
}) => {
  const [activeCategory, setActiveCategory] = useState<MajorCategory>('semua');
  const [selectedProgram, setSelectedProgram] = useState<StudyProgram | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});

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

  const quizCompleted = Object.keys(quizAnswers).length === INTEREST_QUIZ.length;
  const quizRecommendation = (() => {
    if (!quizCompleted) return null;
    const totals: Record<ProgramCode, number> = { TKR: 0, TSM: 0, TKJ: 0, TAV: 0, BD: 0 };
    INTEREST_QUIZ.forEach((q) => {
      const idx = quizAnswers[q.id];
      const opt = q.options[idx];
      if (!opt) return;
      (Object.keys(opt.scores) as ProgramCode[]).forEach((code) => {
        totals[code] += opt.scores[code] || 0;
      });
    });
    const ranked = (Object.entries(totals) as Array<[ProgramCode, number]>).sort(
      (a, b) => b[1] - a[1]
    );
    const bestCode = ranked[0][0];
    const secondCode = ranked[1][0];
    const bestProgram = programs.find((p) => p.code === bestCode) || programs[0];
    const secondProgram = programs.find((p) => p.code === secondCode);
    return { bestProgram, secondProgram, score: ranked[0][1] };
  })();

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

        {/* Vocational Interest Assessment Banner & Workbench */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <Compass className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
              <div>
                <h3 className="font-display text-base font-bold text-slate-950">
                  Pemetaan Minat Jurusan SMK (Lulusan SMP/MTs)
                </h3>
                <p className="mt-0.5 text-xs text-slate-600">
                  Jawab 4 pertanyaan singkat untuk melihat rekomendasi jurusan yang paling sesuai dengan minat praktik Anda.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setQuizOpen((prev) => !prev)}
              className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-100 whitespace-nowrap"
            >
              {quizOpen ? 'Tutup Pemetaan Minat' : 'Mulai Pemetaan Minat'}
            </button>
          </div>

          {quizOpen && (
            <div className="mt-6 border-t border-slate-200 pt-6 space-y-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {INTEREST_QUIZ.map((q, qIdx) => (
                  <div key={q.id} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                    <p className="text-xs font-bold text-slate-900">
                      <span className="font-mono text-blue-700 mr-1.5">0{qIdx + 1}.</span>
                      {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const checked = quizAnswers[q.id] === optIdx;
                        return (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() =>
                              setQuizAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
                            }
                            className={`w-full cursor-pointer rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                              checked
                                ? 'border-blue-700 bg-blue-50 font-semibold text-blue-950'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {quizRecommendation && (
                <div className="flex flex-col justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-5 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                      Hasil Rekomendasi Minat Kejuruan
                    </p>
                    <h4 className="mt-1 font-display text-lg font-bold text-slate-950">
                      {quizRecommendation.bestProgram.code} — {quizRecommendation.bestProgram.name}
                    </h4>
                    <p className="mt-1 text-xs text-slate-700">
                      Alternatif pilihan kedua:{' '}
                      <span className="font-semibold">
                        {quizRecommendation.secondProgram
                          ? `${quizRecommendation.secondProgram.code} (${quizRecommendation.secondProgram.name})`
                          : 'TKJ'}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setQuizAnswers({})}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Ulangi
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedProgram(quizRecommendation.bestProgram)}
                      className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100"
                    >
                      Detail Jurusan
                    </button>
                    {onApplyProgram && (
                      <button
                        type="button"
                        onClick={() => onApplyProgram(quizRecommendation.bestProgram.code)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
                      >
                        Daftar PPDB {quizRecommendation.bestProgram.code}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
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

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setSelectedProgram(program)}
                      className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800"
                    >
                      Kurikulum &amp; Karier
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    {onApplyProgram && (
                      <button
                        type="button"
                        onClick={() => onApplyProgram(program.code)}
                        className="cursor-pointer text-xs font-semibold text-slate-600 hover:text-slate-950"
                      >
                        Pilih PPDB
                      </button>
                    )}
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

              {onApplyProgram && (
                <div className="flex justify-end border-t border-slate-200 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      const code = selectedProgram.code;
                      setSelectedProgram(null);
                      onApplyProgram(code);
                    }}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
                  >
                    Daftar PPDB Jurusan {selectedProgram.code}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
