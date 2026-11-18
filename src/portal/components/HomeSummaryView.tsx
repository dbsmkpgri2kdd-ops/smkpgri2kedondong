import React, { useState } from 'react';
import {
  ArrowRight,
  Building2,
  Calendar,
  GraduationCap,
  Newspaper,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  ADSENSE_CONFIG,
  HERO_MEDIA,
  SCHOOL_IDENTITY,
  SCHOOL_NEWS,
  STUDY_PROGRAMS,
} from '../data/schoolData';
import { PublicSiteIdentity } from '../services/usePortalData';
import { PortalRoute, SchoolNewsItem, StudyProgram } from '../types/portal';
import { AdsenseSlot } from './AdsenseSlot';
import { ServiceSubTab } from './PortalHeader';

interface HomeSummaryViewProps {
  onNavigate: (route: PortalRoute) => void;
  onSelectService: (tab: ServiceSubTab) => void;
  programs?: StudyProgram[];
  news?: SchoolNewsItem[];
  siteIdentity?: PublicSiteIdentity;
}

export const HomeSummaryView: React.FC<HomeSummaryViewProps> = ({
  onNavigate,
  onSelectService,
  programs = STUDY_PROGRAMS,
  news = SCHOOL_NEWS,
  siteIdentity,
}) => {
  const [heroImgError, setHeroImgError] = useState(false);
  const schoolName = siteIdentity?.name || SCHOOL_IDENTITY.name;
  const npsn = siteIdentity?.npsn || SCHOOL_IDENTITY.npsn;
  const announcementBanner = siteIdentity?.announcementBanner?.trim();

  const keyFacts = [
    {
      value: '2003',
      label: 'Tahun Berdiri',
      detail: 'SK YPLP-PGRI No. 24/C/V/2004',
    },
    {
      value: String(programs.length || 5),
      label: 'Program Keahlian',
      detail: programs.map((p) => p.code).join(', ') || 'TKR, TSM, TKJ, TAV, BD',
    },
    {
      value: '8.000 m²',
      label: 'Luas Kampus',
      detail: 'Jl. Tritura Kedondong, Pesawaran',
    },
    {
      value: npsn,
      label: 'NPSN Resmi',
      detail: 'Kemendikdasmen · Swasta',
    },
  ];

  return (
    <div className="bg-white">
      {announcementBanner && (
        <div className="border-b border-blue-200 bg-blue-50 px-4 py-2.5 text-center text-xs font-medium text-blue-900">
          <span>{announcementBanner}</span>
        </div>
      )}

      {/* Compact Executive Hero */}
      <section className="pt-10 pb-12 sm:pt-14 sm:pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="flex flex-col justify-center lg:col-span-6">
              <p className="text-xs font-medium text-slate-500">
                <span className="font-mono font-semibold text-blue-700">
                  NPSN {npsn}
                </span>
                <span className="mx-2" aria-hidden="true">
                  ·
                </span>
                <span>Kabupaten Pesawaran, Provinsi Lampung</span>
              </p>

              <h1
                className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]"
                style={{ textWrap: 'balance' }}
              >
                Pendidikan Vokasi Teknologi, Elektronika, dan Bisnis Digital
              </h1>

              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
                Portal digital resmi {schoolName} untuk akses profil sekolah, informasi
                penerimaan siswa baru (PPDB), pengumuman UKK, serta literasi kejuruan.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => onNavigate('ppdb')}
                  className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-slate-800"
                >
                  Pendaftaran Siswa Baru (PPDB)
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onSelectService('ukk')}
                  className="inline-flex min-h-[44px] cursor-pointer items-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition-colors duration-150 hover:bg-slate-50"
                >
                  Cek Pengumuman UKK
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative h-full min-h-[250px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:min-h-[330px]">
                {!heroImgError ? (
                  <img
                    src={HERO_MEDIA.campus}
                    alt="Lingkungan kampus SMK PGRI 2 Kedondong di Pesawaran, Lampung"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgError(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-3 bg-slate-900 p-8 text-center text-white">
                    <Building2 className="h-10 w-10 text-blue-300" />
                    <p className="font-display text-lg font-bold">{schoolName}</p>
                    <p className="text-xs text-slate-300">
                      Jl. Tritura Kedondong, Kab. Pesawaran, Lampung
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4-Column Key Institutional Facts Strip */}
          <dl className="mt-12 grid grid-cols-2 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-slate-50/70 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
            {keyFacts.map((fact) => (
              <div key={fact.label} className="p-5">
                <dt className="text-xs font-medium text-slate-500">{fact.label}</dt>
                <dd className="mt-1 font-display text-2xl font-extrabold tracking-tight text-slate-950 tabular-nums">
                  {fact.value}
                </dd>
                <dd className="mt-0.5 text-xs text-slate-500">{fact.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Compact 5 Majors Strip */}
      <section className="border-t border-slate-200 bg-slate-50 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold tracking-wider text-blue-700 uppercase">
                Kompetensi Keahlian
              </p>
              <h2 className="mt-1 font-display text-xl font-bold text-slate-950 sm:text-2xl">
                Lima Program Keahlian Unggulan
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('jurusan')}
              className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800"
            >
              Lihat Kurikulum Lengkap
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {programs.map((program) => (
              <button
                key={program.code}
                type="button"
                onClick={() => onNavigate('jurusan')}
                className="flex cursor-pointer flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 text-left transition-colors duration-150 hover:border-blue-300"
              >
                <div>
                  <span className="font-mono text-xs font-semibold text-blue-700">
                    {program.code}
                  </span>
                  <h3 className="mt-1 font-display text-sm font-bold text-slate-950">
                    {program.name}
                  </h3>
                </div>
                <p className="mt-3 text-xs text-slate-500">{program.categoryLabel}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Posisi Iklan Beranda */}
      <AdsenseSlot
        slotId={ADSENSE_CONFIG.slots.homeMidBanner}
        className="py-4"
      />

      {/* Quick Feature Directory (4 Cards) */}
      <section className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-wider text-blue-700 uppercase">
              Akses Cepat Layanan Portal
            </p>
            <h2 className="mt-1 font-display text-xl font-bold text-slate-950 sm:text-2xl">
              Layanan Digital Sekolah dalam Satu Pintu
            </h2>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button
              type="button"
              onClick={() => onNavigate('ppdb')}
              className="flex cursor-pointer flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 text-left transition-colors hover:border-blue-300 hover:bg-slate-50"
            >
              <div>
                <UserPlus className="h-5 w-5 text-blue-700" />
                <h3 className="mt-3 font-display text-base font-bold text-slate-950">
                  PPDB / SPMB Online
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Alur pendaftaran, syarat berkas, dan formulir calon siswa baru.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
                Buka Halaman PPDB <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectService('ukk')}
              className="flex cursor-pointer flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 text-left transition-colors hover:border-blue-300 hover:bg-slate-50"
            >
              <div>
                <GraduationCap className="h-5 w-5 text-blue-700" />
                <h3 className="mt-3 font-display text-base font-bold text-slate-950">
                  Pengumuman UKK
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Cek hasil Uji Kompetensi Keahlian berdasarkan nama dan kelas Dapodik.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
                Cek Kelulusan <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectService('ptk')}
              className="flex cursor-pointer flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 text-left transition-colors hover:border-blue-300 hover:bg-slate-50"
            >
              <div>
                <Users className="h-5 w-5 text-blue-700" />
                <h3 className="mt-3 font-display text-base font-bold text-slate-950">
                  Direktori PTK &amp; Alumni
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Daftar resmi pendidik, tenaga kependidikan, serta layanan BKK alumni.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
                Lihat Direktori <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectService('kalender')}
              className="flex cursor-pointer flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 text-left transition-colors hover:border-blue-300 hover:bg-slate-50"
            >
              <div>
                <Calendar className="h-5 w-5 text-blue-700" />
                <h3 className="mt-3 font-display text-base font-bold text-slate-950">
                  Kalender &amp; Dokumen
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Jadwal PKL, asesmen semester, serta pedoman resmi siswa dan orang tua.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
                Buka Jadwal <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Latest News & Updates Strip (3 Items) */}
      <section className="border-t border-slate-200 bg-slate-50 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="flex items-center gap-2.5">
              <Newspaper className="h-5 w-5 text-blue-700" />
              <div>
                <h2 className="font-display text-xl font-bold text-slate-950">
                  Berita &amp; Informasi Sekolah Terbaru
                </h2>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onNavigate('literasi')}
                className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800"
              >
                Sumber Literasi Digital
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('media')}
                className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-950"
              >
                Media &amp; Dokumentasi
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {news.slice(0, 6).map((item) => (
              <article
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5"
              >
                <div>
                  <p className="text-xs text-slate-500">
                    <span className="font-semibold text-blue-700">{item.category}</span>
                    {' · '}
                    {item.date}
                  </p>
                  <h3 className="mt-2 font-display text-sm font-bold leading-snug text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{item.summary}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('media')}
                  className="mt-4 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
                >
                  Lihat di Media Sekolah <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
