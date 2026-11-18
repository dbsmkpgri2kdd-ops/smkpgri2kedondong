import React, { useEffect, useState } from 'react';
import { CheckCircle2, ClipboardCheck, FileText, History, Printer } from 'lucide-react';
import { SCHOOL_IDENTITY, STUDY_PROGRAMS } from '../data/schoolData';
import { PublicPpdbInput, PublicSiteIdentity } from '../services/usePortalData';
import { StudyProgram } from '../types/portal';

interface RegistrationReceipt {
  regCode: string;
  fullName: string;
  nisn: string;
  originSchool: string;
  choice1: string;
  choice2: string;
  phone: string;
  submittedAt: string;
}

interface PpdbViewProps {
  programs?: StudyProgram[];
  siteIdentity?: PublicSiteIdentity;
  onSubmitPpdb?: (data: PublicPpdbInput) => Promise<void>;
  preselectedProgram?: string;
}

const REGISTRATION_STEPS = [
  {
    step: '01',
    title: 'Isi Formulir Pra-Pendaftaran',
    detail: 'Lengkapi identitas calon peserta didik dan pilih kompetensi keahlian yang diminati.',
  },
  {
    step: '02',
    title: 'Simpan Bukti Pra-Pendaftaran',
    detail: 'Cetak atau simpan kode registrasi yang tampil setelah formulir dikirim.',
  },
  {
    step: '03',
    title: 'Verifikasi Berkas di Sekolah',
    detail: 'Serahkan fotokopi rapor, KK, dan SKL/ijazah ke panitia PPDB Jl. Tritura Kedondong.',
  },
  {
    step: '04',
    title: 'Wawancara Minat & Daftar Ulang',
    detail: 'Mengikuti pemetaan jurusan serta registrasi resmi peserta didik baru.',
  },
];

const REQUIRED_DOCS = [
  'Fotokopi Ijazah SMP/MTs atau Surat Keterangan Lulus (SKL) yang dilegalisasi',
  'Fotokopi Kartu Keluarga (KK) dan Akta Kelahiran calon peserta didik',
  'Fotokopi Kartu NISN atau cetakan data NISN aktif',
  'Pas foto berwarna ukuran 3x4 sebanyak 4 lembar',
  'Fotokopi KIP / PKH / KKS apabila memiliki kartu program bantuan pendidikan',
];

export const PpdbView: React.FC<PpdbViewProps> = ({
  programs = STUDY_PROGRAMS,
  siteIdentity,
  onSubmitPpdb,
  preselectedProgram,
}) => {
  const activePrograms = programs.length > 0 ? programs : STUDY_PROGRAMS;
  const ppdbOpen = siteIdentity?.ppdbOpen ?? true;
  const waveLabel = siteIdentity?.ppdbWaveLabel || 'Gelombang I · Tahun Pelajaran 2026/2027';
  const address = siteIdentity?.address || SCHOOL_IDENTITY.address;
  const hours = siteIdentity?.hours || SCHOOL_IDENTITY.hours;

  const [fullName, setFullName] = useState('');
  const [nisn, setNisn] = useState('');
  const [originSchool, setOriginSchool] = useState('');
  const [choice1, setChoice1] = useState(
    preselectedProgram || activePrograms[0]?.code || 'TKR'
  );
  const [choice2, setChoice2] = useState(activePrograms[2]?.code || activePrograms[0]?.code || 'TKJ');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<RegistrationReceipt | null>(null);
  const [savedReceipts, setSavedReceipts] = useState<RegistrationReceipt[]>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('prida_ppdb_records') || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (preselectedProgram) {
      setChoice1(preselectedProgram);
    }
  }, [preselectedProgram]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ppdbOpen) {
      setErrorMsg('Pendaftaran PPDB Online saat ini sedang ditutup oleh panitia sekolah.');
      return;
    }
    if (fullName.trim().length < 2 || originSchool.trim().length < 3 || phone.trim().length < 9) {
      setErrorMsg('Mohon lengkapi nama lengkap, asal SMP/MTs, dan nomor WhatsApp yang aktif.');
      return;
    }
    if (nisn.trim() && !/^\d{10}$/.test(nisn.trim())) {
      setErrorMsg('NISN harus terdiri dari tepat 10 digit angka (atau kosongkan jika belum ada).');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      if (onSubmitPpdb) {
        const allowedCodes = ['TKR', 'TSM', 'TKJ', 'TAV', 'BD'] as const;
        const safeProg = allowedCodes.includes(choice1 as (typeof allowedCodes)[number])
          ? (choice1 as (typeof allowedCodes)[number])
          : 'TKJ';
        await onSubmitPpdb({
          fullName: fullName.trim(),
          nisn: nisn.trim(),
          originSchool: originSchool.trim(),
          programCode: safeProg,
          choice2,
          whatsapp: phone.trim(),
        });
      }

      const regCode = `PPDB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const record: RegistrationReceipt = {
        regCode,
        fullName: fullName.trim(),
        nisn: nisn.trim() || 'Belum diisi',
        originSchool: originSchool.trim(),
        choice1,
        choice2,
        phone: phone.trim(),
        submittedAt: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      };

      try {
        const parsed = JSON.parse(localStorage.getItem('prida_ppdb_records') || '[]');
        const saved = Array.isArray(parsed) ? parsed : [];
        saved.unshift(record);
        const trimmed = saved.slice(0, 10);
        localStorage.setItem('prida_ppdb_records', JSON.stringify(trimmed));
        setSavedReceipts(trimmed);
      } catch {
        // Ignore storage restrictions or malformed local cache
      }

      setReceipt(record);
      setFullName('');
      setNisn('');
      setOriginSchool('');
      setPhone('');
    } catch {
      setErrorMsg('Gagal mengirim formulir pendaftaran ke server sekolah. Silakan coba sesaat lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="border-b border-slate-200 bg-slate-50 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-wider text-blue-700 uppercase">
            SPMB / Penerimaan Peserta Didik Baru · {waveLabel}
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Informasi &amp; Pra-Pendaftaran PPDB Online
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
            Penerimaan siswa baru {siteIdentity?.name || SCHOOL_IDENTITY.name} untuk {activePrograms.length} program keahlian:{' '}
            {activePrograms.map((p) => p.code).join(', ')}.
          </p>
        </div>
      </section>

      {/* 4-Step Flow */}
      <section className="py-12 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-xl font-bold text-slate-950">
            Alur Pendaftaran Peserta Didik Baru
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {REGISTRATION_STEPS.map((item) => (
              <div
                key={item.step}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-5"
              >
                <span className="font-mono text-xs font-bold text-blue-700">{item.step}</span>
                <h3 className="mt-2 font-display text-sm font-bold text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form & Requirements */}
      <section className="border-t border-slate-200 bg-slate-50 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* Requirements & Schedule */}
            <div className="space-y-6 lg:col-span-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-2 font-display text-base font-bold text-slate-950">
                  <FileText className="h-4 w-4 text-blue-700" />
                  Persyaratan Berkas Pendaftaran
                </div>
                <ul className="mt-4 space-y-2.5 text-sm text-slate-700">
                  {REQUIRED_DOCS.map((doc) => (
                    <li key={doc} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
                <h3 className="font-display text-base font-bold text-slate-950">
                  Sekretariat Panitia PPDB
                </h3>
                <p className="mt-2 leading-relaxed">{address}</p>
                <p className="mt-2 text-xs text-slate-500">
                  Jam Layanan: {hours}
                </p>
              </div>

              {savedReceipts.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex items-center gap-2 font-display text-sm font-bold text-slate-950">
                    <History className="h-4 w-4 text-blue-700" />
                    Riwayat Bukti di Perangkat Ini
                  </div>
                  <div className="mt-3 divide-y divide-slate-100">
                    {savedReceipts.slice(0, 4).map((item) => (
                      <div
                        key={item.regCode}
                        className="flex items-center justify-between gap-3 py-2.5 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{item.fullName}</p>
                          <p className="font-mono text-slate-500">
                            {item.regCode} · {item.choice1}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setReceipt(item)}
                          className="shrink-0 cursor-pointer rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-semibold text-blue-700 hover:bg-blue-50"
                        >
                          Lihat Bukti
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Registration Form */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
                <h2 className="font-display text-xl font-bold text-slate-950">
                  Formulir Pra-Pendaftaran Calon Siswa Baru
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Isi data dengan benar untuk memperoleh nomor registrasi awal PPDB.
                </p>

                {receipt ? (
                  <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/70 p-6">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <ClipboardCheck className="h-5 w-5" />
                      <h3 className="font-display text-lg font-bold">
                        Bukti Pra-Pendaftaran Tercatat
                      </h3>
                    </div>
                    <dl className="mt-4 space-y-2 border-t border-emerald-200 pt-4 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-600">Kode Registrasi</dt>
                        <dd className="font-mono font-bold text-slate-950">{receipt.regCode}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-600">Nama Calon Siswa</dt>
                        <dd className="font-semibold text-slate-950">{receipt.fullName}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-600">NISN</dt>
                        <dd className="font-mono text-slate-950">{receipt.nisn}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-600">Asal Sekolah</dt>
                        <dd className="text-slate-950">{receipt.originSchool}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-600">Pilihan Jurusan</dt>
                        <dd className="font-mono font-semibold text-blue-800">
                          1. {receipt.choice1} · 2. {receipt.choice2}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-600">Tanggal Daftar</dt>
                        <dd className="text-slate-950">{receipt.submittedAt}</dd>
                      </div>
                    </dl>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                      >
                        <Printer className="h-4 w-4" />
                        Cetak Bukti
                      </button>
                      <button
                        type="button"
                        onClick={() => setReceipt(null)}
                        className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Daftarkan Siswa Lain
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="ppdb-nama"
                          className="block text-xs font-semibold text-slate-700"
                        >
                          Nama Lengkap (Sesuai Ijazah/KK)
                        </label>
                        <input
                          id="ppdb-nama"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Nama lengkap calon siswa"
                          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-700 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="ppdb-nisn"
                          className="block text-xs font-semibold text-slate-700"
                        >
                          NISN (10 Digit, Opsional)
                        </label>
                        <input
                          id="ppdb-nisn"
                          type="text"
                          value={nisn}
                          onChange={(e) => setNisn(e.target.value)}
                          placeholder="0012345678"
                          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 font-mono text-sm focus:border-blue-700 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="ppdb-asal"
                          className="block text-xs font-semibold text-slate-700"
                        >
                          Asal SMP / MTs
                        </label>
                        <input
                          id="ppdb-asal"
                          type="text"
                          value={originSchool}
                          onChange={(e) => setOriginSchool(e.target.value)}
                          placeholder="Contoh: SMP Negeri 1 Kedondong"
                          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-700 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="ppdb-wa"
                          className="block text-xs font-semibold text-slate-700"
                        >
                          Nomor WhatsApp Aktif (Siswa/Ortu)
                        </label>
                        <input
                          id="ppdb-wa"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="08xxxxxxxxxx"
                          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 font-mono text-sm focus:border-blue-700 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="ppdb-jurusan1"
                          className="block text-xs font-semibold text-slate-700"
                        >
                          Pilihan Program Keahlian 1
                        </label>
                        <select
                          id="ppdb-jurusan1"
                          value={choice1}
                          onChange={(e) => setChoice1(e.target.value)}
                          className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-blue-700 focus:outline-none"
                        >
                          {activePrograms.map((p) => (
                            <option key={p.code} value={p.code}>
                              {p.code} — {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="ppdb-jurusan2"
                          className="block text-xs font-semibold text-slate-700"
                        >
                          Pilihan Program Keahlian 2
                        </label>
                        <select
                          id="ppdb-jurusan2"
                          value={choice2}
                          onChange={(e) => setChoice2(e.target.value)}
                          className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-blue-700 focus:outline-none"
                        >
                          {activePrograms.map((p) => (
                            <option key={p.code} value={p.code}>
                              {p.code} — {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {!ppdbOpen && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                        Gelombang pendaftaran daring sementara sedang ditutup oleh panitia PPDB sekolah.
                      </div>
                    )}

                    {errorMsg && (
                      <div
                        role="alert"
                        className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800"
                      >
                        {errorMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting || !ppdbOpen}
                      className="inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? 'Mengirim Pendaftaran...' : 'Kirim Pra-Pendaftaran PPDB'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
