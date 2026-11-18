import React, { useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import { Download, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { PpdbRegistration } from '../types/admin';
import { removeDocument, savePpdbRegistration } from '../services/firestoreCrud';

interface PpdbManagerProps {
  currentUser: User;
  registrations: PpdbRegistration[];
  onNotify: (msg: string) => void;
}

const STATUS_TEXT: Record<PpdbRegistration['status'], string> = {
  menunggu: 'Menunggu Verifikasi',
  terverifikasi: 'Berkas Terverifikasi',
  diterima: 'Diterima',
  ditolak: 'Ditolak',
};

const PROGRAM_NAMES: Record<PpdbRegistration['programCode'], string> = {
  TKR: 'Teknik Kendaraan Ringan',
  TSM: 'Teknik Sepeda Motor',
  TKJ: 'Teknik Komputer & Jaringan',
  TAV: 'Teknik Audio Video',
  BD: 'Bisnis Digital',
};

export const PpdbManager: React.FC<PpdbManagerProps> = ({
  currentUser,
  registrations,
  onNotify,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PpdbRegistration['status']>('all');
  const [programFilter, setProgramFilter] = useState<'all' | PpdbRegistration['programCode']>('all');
  const [editing, setEditing] = useState<PpdbRegistration | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<Omit<PpdbRegistration, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>>({
    fullName: '',
    nisn: '',
    originSchool: '',
    programCode: 'TKJ',
    whatsapp: '',
    status: 'menunggu',
    notes: '',
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return registrations.filter((r) => {
      const okStatus = statusFilter === 'all' || r.status === statusFilter;
      const okProgram = programFilter === 'all' || r.programCode === programFilter;
      const okSearch =
        !q ||
        r.fullName.toLowerCase().includes(q) ||
        r.nisn.toLowerCase().includes(q) ||
        r.originSchool.toLowerCase().includes(q);
      return okStatus && okProgram && okSearch;
    });
  }, [registrations, search, statusFilter, programFilter]);

  const openAdd = () => {
    setEditing(null);
    setForm({
      fullName: '',
      nisn: '',
      originSchool: '',
      programCode: 'TKJ',
      whatsapp: '',
      status: 'menunggu',
      notes: '',
    });
    setModalOpen(true);
  };

  const openEdit = (r: PpdbRegistration) => {
    setEditing(r);
    setForm({
      fullName: r.fullName,
      nisn: r.nisn,
      originSchool: r.originSchool,
      programCode: r.programCode,
      whatsapp: r.whatsapp,
      status: r.status,
      notes: r.notes || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await savePpdbRegistration(currentUser, form, editing?.id);
      onNotify(
        editing
          ? `Data pendaftar "${form.fullName}" diperbarui.`
          : `Pendaftar PPDB "${form.fullName}" ditambahkan.`
      );
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatus = async (
    r: PpdbRegistration,
    newStatus: PpdbRegistration['status']
  ) => {
    await savePpdbRegistration(
      currentUser,
      {
        fullName: r.fullName,
        nisn: r.nisn,
        originSchool: r.originSchool,
        programCode: r.programCode,
        whatsapp: r.whatsapp,
        status: newStatus,
        notes: r.notes || '',
      },
      r.id
    );
    onNotify(`Status ${r.fullName} diubah menjadi ${STATUS_TEXT[newStatus]}.`);
  };

  const handleExportCsv = () => {
    const header = ['Nama Lengkap', 'NISN', 'Asal Sekolah', 'Jurusan', 'WhatsApp', 'Status', 'Catatan'];
    const rows = filtered.map((r) => [
      `"${r.fullName.replace(/"/g, '""')}"`,
      `"${r.nisn}"`,
      `"${r.originSchool.replace(/"/g, '""')}"`,
      r.programCode,
      `"${r.whatsapp}"`,
      STATUS_TEXT[r.status],
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csv = [header.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ppdb-smkpgri2kdd-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onNotify('Data pendaftar PPDB diekspor ke berkas CSV.');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, NISN, atau asal SMP..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            aria-label="Filter Program Keahlian"
            value={programFilter}
            onChange={(e) =>
              setProgramFilter(e.target.value as 'all' | PpdbRegistration['programCode'])
            }
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200"
          >
            <option value="all">Semua Jurusan</option>
            {Object.entries(PROGRAM_NAMES).map(([code, name]) => (
              <option key={code} value={code}>
                {code} — {name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto">
            {(['all', 'menunggu', 'terverifikasi', 'diterima', 'ditolak'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  statusFilter === s
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {s === 'all' ? 'Semua' : STATUS_TEXT[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Unduh CSV
          </button>
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            Input Pendaftar
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40">
                <th className="py-3 px-4">Calon Siswa & NISN</th>
                <th className="py-3 px-4">Asal Sekolah</th>
                <th className="py-3 px-4">Pilihan Jurusan</th>
                <th className="py-3 px-4">No. WhatsApp</th>
                <th className="py-3 px-4">Status Seleksi</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{r.fullName}</div>
                    <div className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      NISN: {r.nisn}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-700 dark:text-slate-300">
                    {r.originSchool}
                  </td>
                  <td className="py-3 px-4 text-xs font-medium text-slate-800 dark:text-slate-200">
                    {r.programCode} · {PROGRAM_NAMES[r.programCode]}
                  </td>
                  <td className="py-3 px-4 text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300">
                    {r.whatsapp}
                  </td>
                  <td className="py-3 px-4 text-xs">
                    <select
                      aria-label={`Ubah status ${r.fullName}`}
                      value={r.status}
                      onChange={(e) =>
                        handleQuickStatus(r, e.target.value as PpdbRegistration['status'])
                      }
                      className={`text-xs font-medium bg-transparent border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 ${
                        r.status === 'diterima'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : r.status === 'terverifikasi'
                          ? 'text-blue-700 dark:text-blue-400'
                          : r.status === 'ditolak'
                          ? 'text-red-700 dark:text-red-400'
                          : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {Object.entries(STATUS_TEXT).map(([k, label]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(r)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md whitespace-nowrap shrink-0"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      {confirmDeleteId === r.id ? (
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={async () => {
                              await removeDocument(currentUser, 'ppdb_registrations', r.id, r.fullName);
                              setConfirmDeleteId(null);
                              onNotify(`Data PPDB "${r.fullName}" dihapus.`);
                            }}
                            className="px-2.5 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md whitespace-nowrap shrink-0"
                          >
                            Hapus
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1.5 text-xs text-slate-500"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(r.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md whitespace-nowrap shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Hapus
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
                    Belum ada data pendaftar PPDB yang sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {editing ? 'Edit Pendaftar PPDB' : 'Tambah Pendaftar PPDB Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                aria-label="Tutup modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap Calon Siswa
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={140}
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    NISN
                  </label>
                  <input
                    type="text"
                    required
                    minLength={5}
                    maxLength={20}
                    value={form.nisn}
                    onChange={(e) => setForm({ ...form, nisn: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Asal Sekolah (SMP/MTs)
                  </label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={140}
                    value={form.originSchool}
                    onChange={(e) => setForm({ ...form, originSchool: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nomor WhatsApp Aktif
                  </label>
                  <input
                    type="text"
                    required
                    minLength={8}
                    maxLength={24}
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Pilihan Jurusan
                  </label>
                  <select
                    value={form.programCode}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        programCode: e.target.value as PpdbRegistration['programCode'],
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    {Object.entries(PROGRAM_NAMES).map(([code, name]) => (
                      <option key={code} value={code}>
                        {code} — {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Status Verifikasi
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as PpdbRegistration['status'],
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    {Object.entries(STATUS_TEXT).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Panitia PPDB
                </label>
                <textarea
                  rows={2}
                  maxLength={400}
                  value={form.notes || ''}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Data PPDB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
