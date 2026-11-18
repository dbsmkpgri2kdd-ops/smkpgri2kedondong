import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileText,
  GraduationCap,
  Lock,
  LogIn,
  LogOut,
  RefreshCw,
  Search,
  Users,
} from 'lucide-react';
import {
  ACADEMIC_CALENDAR,
  SCHOOL_DOCUMENTS,
  STUDY_PROGRAMS,
} from '../data/schoolData';
import {
  extractYouTubeId,
  fetchPtkDirectory,
  getCachedPtkDirectory,
  isExternalBlockedForIframe,
  lookupUkkResult,
} from '../services/schoolApi';
import {
  AcademicEvent,
  DynamicPortalItem,
  PtkMember,
  StudyProgram,
  UkkLookupResponse,
} from '../types/portal';
import { PortalIconBadge } from './PortalIconBadge';

interface ServicesSectionProps {
  portalItems: DynamicPortalItem[];
  portalLoading: boolean;
  onOpenExternal: (title: string, url: string) => void;
  activeTab: ServiceTab;
  onTabChange: (tab: ServiceTab) => void;
  firestorePtk?: PtkMember[];
  academicEvents?: AcademicEvent[];
  programs?: StudyProgram[];
  onTrackUkk?: () => void;
}

export type ServiceTab = 'ukk' | 'ptk' | 'tracer' | 'kalender' | 'portal';

const PORTAL_PASS_DIGEST = '8d93dbc2';

function hashPortalPass(value: string): string {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

function launchCelebrationConfetti() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#0056b3', '#0284c7', '#16a34a', '#f59e0b', '#1e293b'];
  for (let i = 0; i < 60; i += 1) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.backgroundColor = colors[i % colors.length];
    piece.style.animationDuration = `${2.2 + Math.random() * 1.8}s`;
    document.body.appendChild(piece);
    window.setTimeout(() => piece.remove(), 4200);
  }
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  portalItems,
  portalLoading,
  onOpenExternal,
  activeTab,
  onTabChange,
  firestorePtk = [],
  academicEvents = ACADEMIC_CALENDAR,
  programs = STUDY_PROGRAMS,
  onTrackUkk,
}) => {

  // UKK Lookup state
  const [namaSiswa, setNamaSiswa] = useState('');
  const [kelasSiswa, setKelasSiswa] = useState('');
  const [ukkLoading, setUkkLoading] = useState(false);
  const [ukkError, setUkkError] = useState<string | null>(null);
  const [ukkResult, setUkkResult] = useState<UkkLookupResponse | null>(null);

  // PTK Directory state (prioritaskan Google Spreadsheet sekolah)
  const [ptkList, setPtkList] = useState<PtkMember[]>(() => getCachedPtkDirectory());
  const [ptkLoading, setPtkLoading] = useState(false);
  const [ptkFetchedOnce, setPtkFetchedOnce] = useState(false);
  const [ptkError, setPtkError] = useState<string | null>(null);
  const [ptkQuery, setPtkQuery] = useState('');
  const [failedPhotos, setFailedPhotos] = useState<Record<string, boolean>>({});

  // Tracer Alumni state
  const [alumniName, setAlumniName] = useState('');
  const [alumniYear, setAlumniYear] = useState('2025');
  const [alumniMajor, setAlumniMajor] = useState(programs[0]?.code || STUDY_PROGRAMS[0].code);
  const [alumniStatus, setAlumniStatus] = useState('Bekerja di Industri');
  const [alumniCompany, setAlumniCompany] = useState('');
  const [tracerFeedback, setTracerFeedback] = useState<string | null>(null);

  // Portal Auth state (preserving original PRIDA auth behavior without window.alert)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('isLoggedIn') === 'true';
    } catch {
      return false;
    }
  });
  const [currentUserName, setCurrentUserName] = useState<string>(() => {
    try {
      return localStorage.getItem('currentUserName') || '';
    } catch {
      return '';
    }
  });
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const loadPtk = async () => {
    setPtkLoading(true);
    setPtkError(null);
    try {
      const data = await fetchPtkDirectory();
      if (data.length > 0) {
        setPtkList(data);
      }
      setPtkFetchedOnce(true);
    } catch {
      setPtkFetchedOnce(true);
      if (ptkList.length === 0 && firestorePtk.length === 0) {
        setPtkError('Direktori PTK sementara tidak dapat dimuat dari Google Spreadsheet.');
      }
    } finally {
      setPtkLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'ptk' && !ptkFetchedOnce && !ptkLoading) {
      loadPtk();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleUkkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaSiswa.trim() || !kelasSiswa.trim()) {
      setUkkError('Masukkan Nama Lengkap dan Kelas sesuai data Dapodik.');
      return;
    }
    setUkkLoading(true);
    setUkkError(null);
    setUkkResult(null);
    onTrackUkk?.();
    try {
      const res = await lookupUkkResult(namaSiswa, kelasSiswa);
      setUkkResult(res);
      if (res.found && res.status === 'LULUS') {
        launchCelebrationConfetti();
      }
    } catch (err) {
      setUkkError(err instanceof Error ? err.message : 'Gagal memuat hasil UKK.');
    } finally {
      setUkkLoading(false);
    }
  };

  const handleTracerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alumniName.trim() || !alumniCompany.trim()) {
      setTracerFeedback('Mohon lengkapi nama lengkap serta instansi/tempat usaha saat ini.');
      return;
    }
    try {
      const parsed = JSON.parse(localStorage.getItem('prida_tracer_records') || '[]');
      const existing = Array.isArray(parsed) ? parsed : [];
      existing.push({
        nama: alumniName.trim(),
        tahun: alumniYear,
        jurusan: alumniMajor,
        status: alumniStatus,
        instansi: alumniCompany.trim(),
        submittedAt: new Date().toISOString(),
      });
      localStorage.setItem('prida_tracer_records', JSON.stringify(existing));
    } catch {
      // Ignore storage restriction or malformed cache
    }
    setTracerFeedback(
      `Terima kasih, data penelusuran alumni atas nama ${alumniName.trim()} (${alumniMajor} ${alumniYear}) berhasil dicatat.`
    );
    setAlumniName('');
    setAlumniCompany('');
  };

  const handlePortalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = loginUsername.trim();
    if (!user || hashPortalPass(loginPassword) !== PORTAL_PASS_DIGEST) {
      setLoginError('Nama pengguna wajib diisi dan kata sandi portal harus sesuai.');
      return;
    }
    try {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUserName', user);
    } catch {
      // Allow in-memory session even if storage is restricted
    }
    setIsLoggedIn(true);
    setCurrentUserName(user);
    setLoginPassword('');
    setLoginError(null);
  };

  const handlePortalLogout = () => {
    try {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('currentUserName');
    } catch {
      // Ignore storage errors
    }
    setIsLoggedIn(false);
    setCurrentUserName('');
  };

  const PLACEHOLDER_PTK_NAMES = new Set([
    'kepala sekolah smk pgri 2 kedondong',
    'waka bidang kurikulum',
    'ketua program keahlian tkr',
    'ketua program keahlian tsm',
    'ketua program keahlian tkj',
    'ketua program keahlian tav',
    'ketua program bisnis digital',
    'kepala tata usaha',
  ]);

  const combinedPtk: PtkMember[] = (() => {
    if (ptkList.length === 0) {
      return firestorePtk;
    }
    const existingNames = new Set(ptkList.map((m) => m.Nama.trim().toLowerCase()));
    const customExtras = firestorePtk.filter((m) => {
      const normalized = m.Nama.trim().toLowerCase();
      return !PLACEHOLDER_PTK_NAMES.has(normalized) && !existingNames.has(normalized);
    });
    return [...ptkList, ...customExtras];
  })();

  const filteredPtk = combinedPtk.filter((m) => {
    const q = ptkQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      m.Nama?.toLowerCase().includes(q) || m.Jabatan?.toLowerCase().includes(q)
    );
  });

  const academicItems = portalItems.filter(
    (item) => item.SectionID?.toLowerCase().trim() === 'profil'
  );
  const internalServiceItems = portalItems.filter(
    (item) => item.SectionID?.toLowerCase().trim() === 'layanan'
  );

  const openPortalUrl = (item: DynamicPortalItem) => {
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
    <section
      id="layanan-akademik"
      aria-labelledby="heading-layanan"
      className="border-t border-slate-200 bg-slate-50 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-wider text-blue-700 uppercase">
            Layanan Akademik &amp; Direktori Sekolah
          </p>
          <h2
            id="heading-layanan"
            className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl"
          >
            Akses Informasi Kelulusan UKK, Pendidik, dan Tracer Alumni
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Layanan digital terintegrasi untuk peserta didik, orang tua, alumni, dan warga
            SMK PGRI 2 Kedondong.
          </p>
        </div>

        {/* Executive 5-Column Service Navigation Menu */}
        <div
          role="tablist"
          aria-label="Pilih Layanan Akademik"
          className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5"
        >
          {[
            {
              id: 'ukk' as const,
              title: 'Pengumuman UKK',
              subtitle: 'Hasil Uji Kompetensi',
              icon: GraduationCap,
            },
            {
              id: 'ptk' as const,
              title: 'Direktori PTK',
              subtitle: 'Daftar Guru & Staf',
              icon: Users,
            },
            {
              id: 'tracer' as const,
              title: 'Tracer Alumni',
              subtitle: 'Penelusuran & BKK',
              icon: Search,
            },
            {
              id: 'kalender' as const,
              title: 'Kalender & Dokumen',
              subtitle: 'Agenda PKL & Panduan',
              icon: Calendar,
            },
            {
              id: 'portal' as const,
              title: 'Portal Layanan',
              subtitle: 'Tautan Warga Sekolah',
              icon: ExternalLink,
            },
          ].map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onTabChange(tab.id)}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-left transition-colors duration-150 ${
                  active
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    active ? 'bg-white/10 text-white' : 'bg-slate-100 text-blue-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold">{tab.title}</p>
                  <p
                    className={`truncate text-xs ${
                      active ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {tab.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Panel Content */}
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          {activeTab === 'ukk' && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <h3 className="font-display text-xl font-bold text-slate-950">
                  Cek Pengumuman Hasil UKK
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Masukkan Nama Lengkap dan Kelas sesuai data Dapodik untuk memeriksa status
                  kelulusan Uji Kompetensi Keahlian (UKK) secara langsung dari server sekolah.
                </p>

                <form onSubmit={handleUkkSubmit} className="mt-6 space-y-4">
                  <div>
                    <label
                      htmlFor="ukk-nama"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Nama Lengkap Siswa
                    </label>
                    <input
                      id="ukk-nama"
                      type="text"
                      value={namaSiswa}
                      onChange={(e) => setNamaSiswa(e.target.value)}
                      placeholder="Contoh: Ahmad Pratama"
                      autoComplete="off"
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="ukk-kelas"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Kelas (Sesuai Dapodik)
                    </label>
                    <input
                      id="ukk-kelas"
                      type="text"
                      value={kelasSiswa}
                      onChange={(e) => setKelasSiswa(e.target.value)}
                      placeholder="Contoh: XII.1 atau XII TKJ"
                      autoComplete="off"
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none"
                    />
                  </div>

                  {ukkError && (
                    <div
                      role="alert"
                      className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800"
                    >
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{ukkError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={ukkLoading}
                    className="inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Search className="h-4 w-4" />
                    {ukkLoading ? 'Memeriksa Data...' : 'Cari Hasil UKK'}
                  </button>
                </form>
              </div>

              <div className="flex flex-col justify-center rounded-xl border border-slate-200 bg-slate-50 p-6 lg:col-span-7">
                {!ukkResult && !ukkLoading && (
                  <div className="text-center">
                    <GraduationCap className="mx-auto h-10 w-10 text-slate-400" />
                    <p className="mt-3 font-display text-base font-semibold text-slate-800">
                      Siap Memeriksa Status Kelulusan UKK
                    </p>
                    <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                      Isi formulir di sebelah kiri dan tekan tombol cari untuk melihat hasil
                      penilaian kompetensi keahlian siswa.
                    </p>
                  </div>
                )}

                {ukkLoading && (
                  <div className="text-center text-sm text-slate-600">
                    Menghubungi server pengumuman sekolah...
                  </div>
                )}

                {ukkResult && ukkResult.locked && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-900">
                    <Lock className="mx-auto h-7 w-7 text-amber-700" />
                    <h4 className="mt-3 font-display text-lg font-bold">
                      Pengumuman Belum Dibuka
                    </h4>
                    <p className="mt-1 text-sm">
                      Akses hasil UKK dijadwalkan terbuka pada:{' '}
                      <strong className="font-mono">{ukkResult.buka}</strong>
                    </p>
                  </div>
                )}

                {ukkResult && !ukkResult.locked && !ukkResult.found && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-900">
                    <AlertCircle className="mx-auto h-7 w-7 text-red-700" />
                    <h4 className="mt-3 font-display text-lg font-bold">
                      Data Siswa Tidak Ditemukan
                    </h4>
                    <p className="mt-1 text-sm">
                      Periksa kembali ejaan Nama Lengkap dan Kelas sesuai data Dapodik sekolah.
                    </p>
                  </div>
                )}

                {ukkResult && !ukkResult.locked && ukkResult.found && (
                  <div
                    className={`rounded-xl border p-6 ${
                      ukkResult.status === 'LULUS'
                        ? 'border-emerald-200 bg-emerald-50/70'
                        : 'border-red-200 bg-red-50/70'
                    }`}
                  >
                    <p className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
                      Hasil Uji Kompetensi Keahlian
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      {ukkResult.status === 'LULUS' ? (
                        <CheckCircle2 className="h-6 w-6 text-emerald-700" />
                      ) : (
                        <AlertCircle className="h-6 w-6 text-red-700" />
                      )}
                      <span
                        className={`font-display text-2xl font-bold ${
                          ukkResult.status === 'LULUS'
                            ? 'text-emerald-800'
                            : 'text-red-800'
                        }`}
                      >
                        {ukkResult.status}
                      </span>
                    </div>

                    <dl className="mt-4 space-y-2 border-t border-slate-200/80 pt-4 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500">Nama Siswa</dt>
                        <dd className="font-semibold text-slate-900">{ukkResult.nama}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500">Kelas</dt>
                        <dd className="font-mono text-slate-900">{ukkResult.kelas}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500">Keterangan</dt>
                        <dd className="text-right text-slate-900">{ukkResult.keterangan}</dd>
                      </div>
                    </dl>

                    {ukkResult.video && ukkResult.status === 'LULUS' && (
                      <div className="mt-5">
                        {(() => {
                          const vid = extractYouTubeId(ukkResult.video);
                          if (!vid) return null;
                          return (
                            <div className="aspect-video overflow-hidden rounded-xl border border-slate-200 bg-black">
                              <iframe
                                src={`https://www.youtube.com/embed/${vid}?rel=0`}
                                title="Pesan kelulusan"
                                allow="encrypted-media; picture-in-picture"
                                allowFullScreen
                                className="h-full w-full border-0"
                              />
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'ptk' && (
            <div>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-950">
                    Direktori Pendidik &amp; Tenaga Kependidikan (PTK)
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Daftar resmi guru dan tenaga kependidikan SMK PGRI 2 Kedondong
                    {ptkList.length > 0
                      ? ` · Sinkron Google Spreadsheet (${combinedPtk.length} GTK)`
                      : '.'}
                  </p>
                </div>
                <div className="flex w-full items-center gap-2 sm:w-auto">
                  <div className="relative flex-1 sm:w-72">
                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      value={ptkQuery}
                      onChange={(e) => setPtkQuery(e.target.value)}
                      placeholder="Cari nama atau jabatan..."
                      aria-label="Cari nama atau jabatan PTK"
                      className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={loadPtk}
                    disabled={ptkLoading}
                    title="Muat ulang data dari Google Spreadsheet PTK"
                    aria-label="Muat ulang data PTK dari Spreadsheet"
                    className="inline-flex h-[38px] shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${ptkLoading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Sinkron</span>
                  </button>
                </div>
              </div>

              {ptkLoading && combinedPtk.length === 0 && (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div
                      key={n}
                      className="h-20 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
                    />
                  ))}
                </div>
              )}

              {ptkError && combinedPtk.length === 0 && (
                <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center">
                  <span>{ptkError}</span>
                  <button
                    type="button"
                    onClick={loadPtk}
                    className="cursor-pointer rounded-lg bg-amber-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-800"
                  >
                    Coba Muat Ulang
                  </button>
                </div>
              )}

              {(!ptkLoading || combinedPtk.length > 0) && (!ptkError || combinedPtk.length > 0) && (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredPtk.length === 0 ? (
                    <div className="col-span-full rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                      Tidak ada data PTK yang sesuai dengan pencarian Anda.
                    </div>
                  ) : (
                    filteredPtk.map((guru, idx) => {
                      const ptkKey = `${guru.Nama}-${guru.Jabatan || idx}`;
                      const initials = (guru.Nama || 'P')
                        .split(' ')
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join('')
                        .toUpperCase();
                      const photoBroken = failedPhotos[ptkKey] || !guru.Foto;
                      return (
                        <div
                          key={ptkKey}
                          className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4"
                        >
                          {!photoBroken ? (
                            <img
                              src={guru.Foto}
                              alt={`Foto ${guru.Nama}`}
                              referrerPolicy="no-referrer"
                              onError={() =>
                                setFailedPhotos((prev) => ({ ...prev, [ptkKey]: true }))
                              }
                              className="h-12 w-12 shrink-0 rounded-lg object-cover bg-slate-100"
                            />
                          ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-900 font-display text-xs font-bold text-white">
                              {initials}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-display text-sm font-bold text-slate-950">
                              {guru.Nama}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {guru.Jabatan || 'Pendidik / Staf Sekolah'}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tracer' && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <h3 className="font-display text-xl font-bold text-slate-950">
                  Tracer Alumni &amp; Bursa Kerja Khusus (BKK)
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Penelusuran lulusan SMK PGRI 2 Kedondong membantu sekolah memetakan serapan
                  tenaga kerja industri, wirausaha mandiri, dan studi lanjut perguruan tinggi.
                </p>
                <div className="mt-6 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <Users className="h-4 w-4 text-blue-700" />
                    Jalur Penyaluran Lulusan
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600">
                    Lulusan TKR, TSM, TKJ, TAV, dan Bisnis Digital terhubung
                    dengan mitra bengkel resmi, penyedia layanan internet, studio elektronika,
                    serta perusahaan dan UMKM di Provinsi Lampung maupun Jabodetabek.
                  </p>
                </div>
              </div>

              <form onSubmit={handleTracerSubmit} className="space-y-4 lg:col-span-7">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="alumni-nama"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Nama Lengkap Alumni
                    </label>
                    <input
                      id="alumni-nama"
                      type="text"
                      value={alumniName}
                      onChange={(e) => setAlumniName(e.target.value)}
                      placeholder="Nama sesuai ijazah"
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-blue-700 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="alumni-tahun"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Tahun Lulus
                    </label>
                    <input
                      id="alumni-tahun"
                      type="number"
                      min="2005"
                      max="2030"
                      value={alumniYear}
                      onChange={(e) => setAlumniYear(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm focus:border-blue-700 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="alumni-jurusan"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Program Keahlian
                    </label>
                    <select
                      id="alumni-jurusan"
                      value={alumniMajor}
                      onChange={(e) => setAlumniMajor(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-blue-700 focus:outline-none"
                    >
                      {programs.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.code} — {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="alumni-status"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Aktivitas Saat Ini
                    </label>
                    <select
                      id="alumni-status"
                      value={alumniStatus}
                      onChange={(e) => setAlumniStatus(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-blue-700 focus:outline-none"
                    >
                      <option value="Bekerja di Industri">Bekerja di Industri / Perusahaan</option>
                      <option value="Wirausaha Mandiri">Wirausaha Mandiri</option>
                      <option value="Melanjutkan Kuliah">Melanjutkan Pendidikan Tinggi</option>
                      <option value="Mencari Pekerjaan">Sedang Mencari Penempatan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="alumni-instansi"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Nama Perusahaan / Kampus / Bidang Usaha
                  </label>
                  <input
                    id="alumni-instansi"
                    type="text"
                    value={alumniCompany}
                    onChange={(e) => setAlumniCompany(e.target.value)}
                    placeholder="Contoh: PT Astra Honda Motor / Universitas Lampung"
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-blue-700 focus:outline-none"
                  />
                </div>

                {tracerFeedback && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
                    {tracerFeedback}
                  </div>
                )}

                <button
                  type="submit"
                  className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  Kirim Pembaruan Data Alumni
                </button>
              </form>
            </div>
          )}

          {activeTab === 'kalender' && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <h3 className="font-display text-xl font-bold text-slate-950">
                  Kalender Akademik &amp; Agenda Kegiatan Sekolah
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Jadwal pelaksanaan MPLS, penilaian semester, Praktik Kerja Lapangan (PKL), dan
                  Uji Kompetensi Keahlian (UKK).
                </p>

                <div className="mt-5 divide-y divide-slate-200 rounded-xl border border-slate-200">
                  {academicEvents.map((event) => (
                    <div key={event.title} className="p-4">
                      <p className="font-mono text-xs font-semibold text-blue-700">
                        {event.period}
                      </p>
                      <h4 className="mt-1 font-display text-sm font-bold text-slate-950">
                        {event.title}
                      </h4>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">
                        {event.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5">
                <h3 className="font-display text-xl font-bold text-slate-950">
                  Pedoman &amp; Informasi Resmi
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Ringkasan dokumen operasional bagi siswa, orang tua, dan calon peserta didik.
                </p>
                <div className="mt-5 space-y-3">
                  {SCHOOL_DOCUMENTS.map((doc) => (
                    <div
                      key={doc.title}
                      className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                      <div>
                        <p className="text-xs font-medium text-blue-700">
                          {doc.category} · {doc.format}
                        </p>
                        <p className="mt-0.5 font-display text-sm font-bold text-slate-950">
                          {doc.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'portal' && (
            <div className="space-y-8">
              <div>
                <h3 className="font-display text-xl font-bold text-slate-950">
                  Tautan Akademik &amp; Layanan Internal
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Layanan dinamis terhubung dengan basis data operasional SMK PGRI 2 Kedondong.
                </p>

                {portalLoading && academicItems.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">Memuat daftar layanan...</p>
                ) : academicItems.length > 0 ? (
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {academicItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => openPortalUrl(item)}
                        className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition-colors hover:border-blue-300 hover:bg-white"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <PortalIconBadge
                            icon={item.Icon}
                            logo={item.Logo}
                            sectionId={item.SectionID}
                            altTitle={item.Title}
                          />
                          <span className="truncate text-sm font-semibold text-slate-900">
                            {item.Title}
                          </span>
                        </div>
                        <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">
                    Seluruh layanan akademik utama dapat diakses langsung melalui tab Pengumuman
                    UKK, Direktori PTK, dan Tracer Alumni.
                  </p>
                )}
              </div>

              <div className="border-t border-slate-200 pt-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h4 className="font-display text-base font-bold text-slate-950">
                      Layanan Publik Internal Warga Sekolah
                    </h4>
                    <p className="text-xs text-slate-500">
                      {isLoggedIn
                        ? `Masuk sebagai ${currentUserName || 'Warga Sekolah'}`
                        : 'Masuk dengan akun portal sekolah untuk membuka menu layanan internal.'}
                    </p>
                  </div>
                  {isLoggedIn && (
                    <button
                      type="button"
                      onClick={handlePortalLogout}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Keluar Portal
                    </button>
                  )}
                </div>

                {!isLoggedIn ? (
                  <form
                    onSubmit={handlePortalLogin}
                    className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3"
                  >
                    <input
                      type="text"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="Nama Pengguna"
                      aria-label="Nama Pengguna Portal"
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
                    />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Kata Sandi Portal"
                      aria-label="Kata Sandi Portal"
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      <LogIn className="h-4 w-4" />
                      Masuk Portal
                    </button>
                    {loginError && (
                      <p className="sm:col-span-3 text-xs text-red-700">{loginError}</p>
                    )}
                  </form>
                ) : (
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {internalServiceItems.length > 0 ? (
                      internalServiceItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => openPortalUrl(item)}
                          className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:border-blue-400"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <PortalIconBadge
                              icon={item.Icon}
                              logo={item.Logo}
                              sectionId={item.SectionID}
                              altTitle={item.Title}
                            />
                            <span className="truncate text-sm font-semibold text-slate-900">
                              {item.Title}
                            </span>
                          </div>
                          <ExternalLink className="h-4 w-4 shrink-0 text-blue-700" />
                        </button>
                      ))
                    ) : (
                      <p className="col-span-full text-sm text-slate-500">
                        Belum ada tautan layanan internal aktif saat ini.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
