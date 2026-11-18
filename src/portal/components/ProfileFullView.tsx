import React, { useMemo, useState } from 'react';
import { Award, Building2, CheckCircle2, Copy, Handshake, Wrench } from 'lucide-react';
import {
  ADSENSE_CONFIG,
  EXTRACURRICULARS,
  HISTORY_PARAGRAPHS,
  INDUSTRY_PARTNERS,
  resolveAssetUrl,
  SCHOOL_FACILITIES,
  SCHOOL_IDENTITY,
  VISION_MISSION,
} from '../data/schoolData';
import { PublicSiteIdentity } from '../services/usePortalData';
import { AdsenseSlot } from './AdsenseSlot';

interface ProfileFullViewProps {
  siteIdentity?: PublicSiteIdentity;
}

type EkskulFilter = 'semua' | 'kepemimpinan' | 'keahlian';

export const ProfileFullView: React.FC<ProfileFullViewProps> = ({ siteIdentity }) => {
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [ekskulFilter, setEkskulFilter] = useState<EkskulFilter>('semua');

  const npsn = siteIdentity?.npsn || SCHOOL_IDENTITY.npsn;
  const officialName = siteIdentity?.officialName || SCHOOL_IDENTITY.officialName;
  const schoolName = siteIdentity?.name || SCHOOL_IDENTITY.name;
  const address = siteIdentity?.address || 'Jl. Tritura Kedondong, RT 1 / RW 1';
  const domain = (siteIdentity?.domain || 'smkpgri2kedondong.sch.id').replace(/^https?:\/\//, '');
  const vision = siteIdentity?.vision || VISION_MISSION.vision;
  const missions =
    siteIdentity?.missions && siteIdentity.missions.length > 0
      ? siteIdentity.missions
      : VISION_MISSION.missions;
  const principalGreeting =
    siteIdentity?.principalGreeting || VISION_MISSION.principalNote.greeting;
  const principalClosing =
    siteIdentity?.principalClosing || VISION_MISSION.principalNote.closing;

  const filteredExtracurriculars = useMemo(() => {
    if (ekskulFilter === 'semua') return EXTRACURRICULARS;
    return EXTRACURRICULARS.filter((e) => e.category === ekskulFilter);
  }, [ekskulFilter]);

  const handleCopyAddress = async () => {
    const fullAddress = `${officialName} (NPSN ${npsn}), ${address}, Kec. Kedondong, Kab. Pesawaran, Lampung 35381`;
    try {
      await navigator.clipboard.writeText(fullAddress);
      setCopiedAddress(true);
      window.setTimeout(() => setCopiedAddress(false), 2500);
    } catch {
      // Clipboard API unavailable
    }
  };

  const identityRows = [
    { label: 'Nama Sekolah', value: officialName },
    { label: 'NPSN', value: npsn, mono: true },
    { label: 'Jenjang & Status', value: `${SCHOOL_IDENTITY.level} · ${SCHOOL_IDENTITY.status}` },
    { label: 'SK Pendirian', value: SCHOOL_IDENTITY.skPendirian },
    { label: 'Izin Operasional', value: SCHOOL_IDENTITY.izinOperasional },
    { label: 'Luas Tanah Kampus', value: SCHOOL_IDENTITY.landArea },
    { label: 'Alamat Kampus', value: address },
    { label: 'Kecamatan / Kode Pos', value: 'Kec. Kedondong · 35381' },
    { label: 'Kabupaten / Provinsi', value: 'Kab. Pesawaran, Prov. Lampung' },
    { label: 'Domain Resmi', value: domain, mono: true },
  ];

  return (
    <div className="bg-white">
      {/* Page Header */}
      <section className="border-b border-slate-200 bg-slate-50 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-wider text-blue-700 uppercase">
            Profil Kelembagaan · NPSN {npsn}
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Profil, Visi Misi, dan Fasilitas {schoolName}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
            Mengenal sejarah berdirinya sekolah sejak tahun 2003, visi pendidikan vokasi, sarana
            praktik bengkel, kegiatan kesiswaan, dan jaringan mitra industri.
          </p>
        </div>
      </section>

      {/* Principal Note + Vision & Mission */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8 lg:col-span-5">
              <p className="text-xs font-semibold tracking-wider text-blue-700 uppercase">
                Sambutan Pimpinan Sekolah
              </p>
              <h2 className="mt-2 font-display text-xl font-bold text-slate-950">
                Komitmen Pendidikan Vokasi di Pesawaran
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                {principalGreeting}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                {principalClosing}
              </p>
              <p className="mt-5 border-t border-slate-200 pt-4 text-xs font-semibold text-slate-900">
                Pimpinan &amp; Dewan Guru {schoolName}
              </p>
            </div>

            <div className="space-y-6 lg:col-span-7">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
                <h2 className="font-display text-xl font-bold text-slate-950">Visi Sekolah</h2>
                <p className="mt-3 text-base font-medium leading-relaxed text-slate-800">
                  “{vision}”
                </p>

                <h3 className="mt-6 font-display text-base font-bold text-slate-950">
                  Misi Strategis
                </h3>
                <ul className="mt-3 space-y-2.5">
                  {missions.map((mission) => (
                    <li
                      key={mission}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-700"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                      <span>{mission}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* History & Official Identity */}
      <section className="border-t border-slate-200 bg-slate-50 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-blue-700 uppercase">
                <Building2 className="h-4 w-4" />
                Sejarah Lembaga
              </div>
              <h2 className="mt-2 font-display text-2xl font-bold text-slate-950">
                Merintis Sekolah Teknologi di Kedondong Sejak 2003
              </h2>
              <div className="mt-5 space-y-4 text-base leading-relaxed text-slate-700">
                {HISTORY_PARAGRAPHS.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-bold text-slate-950">
                    Identitas Resmi Satuan Pendidikan
                  </h3>
                  <button
                    type="button"
                    onClick={handleCopyAddress}
                    className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copiedAddress ? 'Tersalin' : 'Salin Alamat'}
                  </button>
                </div>
                <dl className="mt-4 divide-y divide-slate-100 text-sm">
                  {identityRows.map((row) => (
                    <div
                      key={row.label}
                      className="flex flex-col justify-between gap-1 py-2.5 sm:flex-row sm:items-center sm:gap-4"
                    >
                      <dt className="text-slate-500">{row.label}</dt>
                      <dd
                        className={`font-medium text-slate-900 sm:text-right ${
                          row.mono ? 'font-mono tabular-nums' : ''
                        }`}
                      >
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Posisi Iklan Halaman Profil */}
      <AdsenseSlot
        slotId={ADSENSE_CONFIG.slots.profileMidBanner}
        className="border-t border-slate-200 bg-white py-6"
      />

      {/* Facilities & Workshops */}
      <section className="border-t border-slate-200 bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-blue-700 uppercase">
              <Wrench className="h-4 w-4" />
              Sarana &amp; Prasarana Praktik
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-950">
              Fasilitas Bengkel Kejuruan dan Ruang Belajar
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {SCHOOL_FACILITIES.map((fac) => {
              const imgUrl = fac.image ? resolveAssetUrl(fac.image) : '';
              return (
                <article
                  key={fac.name}
                  className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  {imgUrl && (
                    <div className="aspect-video w-full overflow-hidden border-b border-slate-200 bg-slate-100">
                      <img
                        src={imgUrl}
                        alt={fac.name}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-5 sm:p-6">
                    <p className="font-mono text-xs font-semibold text-blue-700">{fac.unit}</p>
                    <h3 className="mt-1.5 font-display text-base font-bold text-slate-950">
                      {fac.name}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {fac.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Extracurricular & Industry Partnerships */}
      <section className="border-t border-slate-200 bg-slate-50 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-blue-700 uppercase">
                <Award className="h-4 w-4" />
                Pengembangan Bakat Siswa
              </div>
              <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <h2 className="font-display text-2xl font-bold text-slate-950">
                  Kegiatan Ekstrakurikuler
                </h2>
                <div
                  role="tablist"
                  aria-label="Filter Ekstrakurikuler"
                  className="inline-flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1"
                >
                  {[
                    { id: 'semua' as const, label: 'Semua' },
                    { id: 'kepemimpinan' as const, label: 'Kepemimpinan' },
                    { id: 'keahlian' as const, label: 'Teknologi & Prestasi' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={ekskulFilter === tab.id}
                      onClick={() => setEkskulFilter(tab.id)}
                      className={`cursor-pointer whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                        ekskulFilter === tab.id
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                {filteredExtracurriculars.map((ekskul) => (
                  <div
                    key={ekskul.name}
                    className="rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <p className="text-xs font-medium text-blue-700">{ekskul.schedule}</p>
                    <h3 className="mt-1 font-display text-sm font-bold text-slate-950">
                      {ekskul.name}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      {ekskul.focus}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-blue-700 uppercase">
                  <Handshake className="h-4 w-4" />
                  Kemitraan Industri (DUDI)
                </div>
                <h2 className="mt-2 font-display text-xl font-bold text-slate-950">
                  Jejaring Praktik Kerja &amp; Penyaluran Lulusan
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Sekolah menjalin kerja sama pembimbingan Praktik Kerja Lapangan (PKL) dan
                  rekrutmen tenaga kerja dengan berbagai mitra usaha dan industri:
                </p>
                <ul className="mt-4 space-y-2.5 text-sm text-slate-700">
                  {INDUSTRY_PARTNERS.map((partner) => (
                    <li key={partner} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                      <span>{partner}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
