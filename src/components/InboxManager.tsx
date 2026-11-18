import React, { useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import {
  Briefcase,
  Download,
  Mail,
  MessageSquare,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  removeDocument,
  saveAlumniTracer,
  saveContactMessage,
} from '../services/firestoreCrud';
import { AlumniTracer, ContactMessage } from '../types/admin';

interface InboxManagerProps {
  currentUser: User;
  messages: ContactMessage[];
  alumniList: AlumniTracer[];
  onNotify: (msg: string) => void;
}

type InboxSubTab = 'messages' | 'alumni';

const MESSAGE_STATUS_LABELS: Record<ContactMessage['status'], string> = {
  baru: 'Pesan Baru',
  ditindaklanjuti: 'Ditindaklanjuti',
  selesai: 'Selesai',
};

const ALUMNI_STATUS_LABELS: Record<AlumniTracer['status'], string> = {
  menunggu: 'Menunggu Verifikasi',
  terverifikasi: 'Terverifikasi BKK',
};

const PROGRAM_OPTIONS: Array<{ code: AlumniTracer['programCode']; label: string }> = [
  { code: 'TKR', label: 'TKR — Teknik Kendaraan Ringan' },
  { code: 'TSM', label: 'TSM — Teknik Sepeda Motor' },
  { code: 'TKJ', label: 'TKJ — Teknik Komputer & Jaringan' },
  { code: 'TAV', label: 'TAV — Teknik Audio Video' },
  { code: 'BD', label: 'BD — Bisnis Digital' },
];

export const InboxManager: React.FC<InboxManagerProps> = ({
  currentUser,
  messages,
  alumniList,
  onNotify,
}) => {
  const [subTab, setSubTab] = useState<InboxSubTab>('messages');
  const [search, setSearch] = useState('');
  const [msgStatusFilter, setMsgStatusFilter] = useState<'all' | ContactMessage['status']>('all');
  const [alumniProgFilter, setAlumniProgFilter] = useState<'all' | AlumniTracer['programCode']>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Message detail modal
  const [activeMsg, setActiveMsg] = useState<ContactMessage | null>(null);
  const [msgStatusDraft, setMsgStatusDraft] = useState<ContactMessage['status']>('baru');
  const [msgNoteDraft, setMsgNoteDraft] = useState('');
  const [savingMsg, setSavingMsg] = useState(false);

  // Alumni add/edit modal
  const [alumniModal, setAlumniModal] = useState(false);
  const [editingAlumni, setEditingAlumni] = useState<AlumniTracer | null>(null);
  const [alumniForm, setAlumniForm] = useState<
    Omit<AlumniTracer, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>
  >({
    fullName: '',
    graduationYear: '2025',
    programCode: 'TKJ',
    activityStatus: 'Bekerja di Industri',
    institution: '',
    whatsapp: '',
    status: 'terverifikasi',
    notes: '',
  });
  const [savingAlumni, setSavingAlumni] = useState(false);

  const filteredMessages = useMemo(() => {
    const q = search.trim().toLowerCase();
    return messages.filter((m) => {
      const okStatus = msgStatusFilter === 'all' || m.status === msgStatusFilter;
      const okSearch =
        !q ||
        m.senderName.toLowerCase().includes(q) ||
        m.senderEmail.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q);
      return okStatus && okSearch;
    });
  }, [messages, search, msgStatusFilter]);

  const filteredAlumni = useMemo(() => {
    const q = search.trim().toLowerCase();
    return alumniList.filter((a) => {
      const okProg = alumniProgFilter === 'all' || a.programCode === alumniProgFilter;
      const okSearch =
        !q ||
        a.fullName.toLowerCase().includes(q) ||
        a.institution.toLowerCase().includes(q) ||
        a.graduationYear.includes(q);
      return okProg && okSearch;
    });
  }, [alumniList, search, alumniProgFilter]);

  const alumniSummary = useMemo(() => {
    const counts = {
      bekerja: alumniList.filter((a) => a.activityStatus === 'Bekerja di Industri').length,
      wirausaha: alumniList.filter((a) => a.activityStatus === 'Wirausaha Mandiri').length,
      kuliah: alumniList.filter((a) => a.activityStatus === 'Melanjutkan Kuliah').length,
      mencari: alumniList.filter((a) => a.activityStatus === 'Mencari Pekerjaan').length,
    };
    return counts;
  }, [alumniList]);

  const openMsgModal = (m: ContactMessage) => {
    setActiveMsg(m);
    setMsgStatusDraft(m.status);
    setMsgNoteDraft(m.replyNote || '');
  };

  const handleSaveMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMsg) return;
    setSavingMsg(true);
    try {
      await saveContactMessage(
        currentUser,
        { status: msgStatusDraft, replyNote: msgNoteDraft },
        activeMsg.id,
        activeMsg.senderName
      );
      onNotify(`Status pesan dari "${activeMsg.senderName}" diperbarui.`);
      setActiveMsg(null);
    } finally {
      setSavingMsg(false);
    }
  };

  const openAddAlumni = () => {
    setEditingAlumni(null);
    setAlumniForm({
      fullName: '',
      graduationYear: '2025',
      programCode: 'TKJ',
      activityStatus: 'Bekerja di Industri',
      institution: '',
      whatsapp: '',
      status: 'terverifikasi',
      notes: '',
    });
    setAlumniModal(true);
  };

  const openEditAlumni = (a: AlumniTracer) => {
    setEditingAlumni(a);
    setAlumniForm({
      fullName: a.fullName,
      graduationYear: a.graduationYear,
      programCode: a.programCode,
      activityStatus: a.activityStatus,
      institution: a.institution,
      whatsapp: a.whatsapp || '',
      status: a.status,
      notes: a.notes || '',
    });
    setAlumniModal(true);
  };

  const handleSaveAlumni = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAlumni(true);
    try {
      await saveAlumniTracer(currentUser, alumniForm, editingAlumni?.id);
      onNotify(
        editingAlumni
          ? `Data alumni "${alumniForm.fullName}" diperbarui.`
          : `Data tracer alumni "${alumniForm.fullName}" ditambahkan.`
      );
      setAlumniModal(false);
    } finally {
      setSavingAlumni(false);
    }
  };

  const handleExportMessagesCsv = () => {
    const header = ['Pengirim', 'Email', 'Perihal', 'Pesan', 'Status', 'Catatan Tindak Lanjut'];
    const rows = filteredMessages.map((m) => [
      `"${m.senderName.replace(/"/g, '""')}"`,
      `"${m.senderEmail.replace(/"/g, '""')}"`,
      `"${m.subject.replace(/"/g, '""')}"`,
      `"${m.message.replace(/"/g, '""')}"`,
      MESSAGE_STATUS_LABELS[m.status],
      `"${(m.replyNote || '').replace(/"/g, '""')}"`,
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pesan-kontak-smkpgri2kdd-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onNotify('Pesan kontak masuk diekspor ke berkas CSV.');
  };

  const handleExportAlumniCsv = () => {
    const header = ['Nama Alumni', 'Tahun Lulus', 'Jurusan', 'Aktivitas', 'Instansi/Kampus', 'Status BKK'];
    const rows = filteredAlumni.map((a) => [
      `"${a.fullName.replace(/"/g, '""')}"`,
      a.graduationYear,
      a.programCode,
      `"${a.activityStatus}"`,
      `"${a.institution.replace(/"/g, '""')}"`,
      ALUMNI_STATUS_LABELS[a.status],
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tracer-alumni-smkpgri2kdd-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onNotify('Data Tracer Alumni BKK diekspor ke berkas CSV.');
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setSubTab('messages');
              setSearch('');
              setConfirmDeleteId(null);
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              subTab === 'messages'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Pesan Kontak ({messages.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setSubTab('alumni');
              setSearch('');
              setConfirmDeleteId(null);
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              subTab === 'alumni'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Tracer Alumni & BKK ({alumniList.length})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 flex-1 justify-end">
          <div className="relative min-w-[200px] max-w-xs flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                subTab === 'messages'
                  ? 'Cari pengirim, email, perihal...'
                  : 'Cari nama alumni, tahun, instansi...'
              }
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {subTab === 'messages' ? (
            <>
              <select
                aria-label="Filter status pesan"
                value={msgStatusFilter}
                onChange={(e) =>
                  setMsgStatusFilter(e.target.value as 'all' | ContactMessage['status'])
                }
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200"
              >
                <option value="all">Semua Status</option>
                <option value="baru">Pesan Baru</option>
                <option value="ditindaklanjuti">Ditindaklanjuti</option>
                <option value="selesai">Selesai</option>
              </select>
              <button
                type="button"
                onClick={handleExportMessagesCsv}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                Unduh CSV
              </button>
            </>
          ) : (
            <>
              <select
                aria-label="Filter jurusan alumni"
                value={alumniProgFilter}
                onChange={(e) =>
                  setAlumniProgFilter(e.target.value as 'all' | AlumniTracer['programCode'])
                }
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200"
              >
                <option value="all">Semua Jurusan</option>
                {PROGRAM_OPTIONS.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.code}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleExportAlumniCsv}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                Unduh CSV
              </button>
              <button
                type="button"
                onClick={openAddAlumni}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4" />
                Input Alumni
              </button>
            </>
          )}
        </div>
      </div>

      {subTab === 'messages' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40">
                  <th className="py-3 px-4">Pengirim & Email</th>
                  <th className="py-3 px-4">Perihal & Ringkasan Pesan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredMessages.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 align-top">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {m.senderName}
                      </div>
                      <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        {m.senderEmail}
                      </div>
                    </td>
                    <td className="py-3 px-4 align-top max-w-md">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {m.subject}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {m.message}
                      </p>
                    </td>
                    <td className="py-3 px-4 align-top">
                      <span
                        className={`text-xs font-medium ${
                          m.status === 'selesai'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : m.status === 'ditindaklanjuti'
                              ? 'text-blue-700 dark:text-blue-400'
                              : 'text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {MESSAGE_STATUS_LABELS[m.status]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right align-top">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openMsgModal(m)}
                          className="px-2.5 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-md whitespace-nowrap shrink-0"
                        >
                          Buka & Tindak Lanjuti
                        </button>
                        {confirmDeleteId === m.id ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={async () => {
                                await removeDocument(currentUser, 'contact_messages', m.id, m.senderName);
                                setConfirmDeleteId(null);
                                onNotify(`Pesan dari "${m.senderName}" dihapus.`);
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
                            onClick={() => setConfirmDeleteId(m.id)}
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

                {filteredMessages.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-sm text-slate-500">
                      Belum ada pesan kontak masuk dari pengunjung portal.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Alumni Career Breakdown Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Bekerja di Industri', count: alumniSummary.bekerja },
              { label: 'Wirausaha Mandiri', count: alumniSummary.wirausaha },
              { label: 'Melanjutkan Kuliah', count: alumniSummary.kuliah },
              { label: 'Mencari Penempatan', count: alumniSummary.mencari },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4"
              >
                <div className="text-xs text-slate-500 dark:text-slate-400">{item.label}</div>
                <div className="mt-1 text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                  {item.count}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40">
                    <th className="py-3 px-4">Nama Alumni & Lulus</th>
                    <th className="py-3 px-4">Jurusan</th>
                    <th className="py-3 px-4">Aktivitas & Instansi</th>
                    <th className="py-3 px-4">Status BKK</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {filteredAlumni.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {a.fullName}
                        </div>
                        <div className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                          Lulus {a.graduationYear}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono font-semibold text-blue-700 dark:text-blue-400">
                        {a.programCode}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {a.activityStatus}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400">{a.institution}</div>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <button
                          type="button"
                          onClick={async () => {
                            const nextStatus =
                              a.status === 'menunggu' ? 'terverifikasi' : 'menunggu';
                            await saveAlumniTracer(
                              currentUser,
                              {
                                fullName: a.fullName,
                                graduationYear: a.graduationYear,
                                programCode: a.programCode,
                                activityStatus: a.activityStatus,
                                institution: a.institution,
                                whatsapp: a.whatsapp || '',
                                status: nextStatus,
                                notes: a.notes || '',
                              },
                              a.id
                            );
                            onNotify(`Status alumni "${a.fullName}" diubah menjadi ${ALUMNI_STATUS_LABELS[nextStatus]}.`);
                          }}
                          className={`font-medium cursor-pointer hover:underline ${
                            a.status === 'terverifikasi'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {ALUMNI_STATUS_LABELS[a.status]}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditAlumni(a)}
                            className="px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md whitespace-nowrap shrink-0"
                          >
                            Edit
                          </button>
                          {confirmDeleteId === a.id ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={async () => {
                                  await removeDocument(currentUser, 'alumni_tracer', a.id, a.fullName);
                                  setConfirmDeleteId(null);
                                  onNotify(`Data alumni "${a.fullName}" dihapus.`);
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
                              onClick={() => setConfirmDeleteId(a.id)}
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

                  {filteredAlumni.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-sm text-slate-500">
                        Belum ada data tracer alumni yang tercatat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Message Review Modal */}
      {activeMsg && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {activeMsg.subject}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Dari {activeMsg.senderName} ({activeMsg.senderEmail})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveMsg(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                aria-label="Tutup modal pesan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
              {activeMsg.message}
            </div>

            <form onSubmit={handleSaveMsg} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Status Tindak Lanjut
                </label>
                <select
                  value={msgStatusDraft}
                  onChange={(e) => setMsgStatusDraft(e.target.value as ContactMessage['status'])}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  <option value="baru">Pesan Baru</option>
                  <option value="ditindaklanjuti">Sedang Ditindaklanjuti</option>
                  <option value="selesai">Selesai Ditangani</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Internal / Ringkasan Balasan TU
                </label>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={msgNoteDraft}
                  onChange={(e) => setMsgNoteDraft(e.target.value)}
                  placeholder="Catat hasil tindak lanjut atau balasan email..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <a
                  href={`mailto:${activeMsg.senderEmail}?subject=${encodeURIComponent(
                    `Re: ${activeMsg.subject} — SMK PGRI 2 Kedondong`
                  )}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 rounded-lg hover:bg-blue-100"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Balas via Email
                </a>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveMsg(null)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  >
                    Tutup
                  </button>
                  <button
                    type="submit"
                    disabled={savingMsg}
                    className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg"
                  >
                    {savingMsg ? 'Menyimpan...' : 'Simpan Status'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alumni Modal */}
      {alumniModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {editingAlumni ? 'Edit Data Tracer Alumni' : 'Tambah Data Tracer Alumni'}
              </h3>
              <button
                type="button"
                onClick={() => setAlumniModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                aria-label="Tutup modal alumni"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAlumni} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap Alumni
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={140}
                    value={alumniForm.fullName}
                    onChange={(e) => setAlumniForm({ ...alumniForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tahun Lulus
                  </label>
                  <input
                    type="text"
                    required
                    pattern="^20[0-3][0-9]$"
                    value={alumniForm.graduationYear}
                    onChange={(e) =>
                      setAlumniForm({ ...alumniForm, graduationYear: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Program Keahlian
                  </label>
                  <select
                    value={alumniForm.programCode}
                    onChange={(e) =>
                      setAlumniForm({
                        ...alumniForm,
                        programCode: e.target.value as AlumniTracer['programCode'],
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    {PROGRAM_OPTIONS.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Aktivitas Saat Ini
                  </label>
                  <select
                    value={alumniForm.activityStatus}
                    onChange={(e) =>
                      setAlumniForm({
                        ...alumniForm,
                        activityStatus: e.target.value as AlumniTracer['activityStatus'],
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <option value="Bekerja di Industri">Bekerja di Industri</option>
                    <option value="Wirausaha Mandiri">Wirausaha Mandiri</option>
                    <option value="Melanjutkan Kuliah">Melanjutkan Kuliah</option>
                    <option value="Mencari Pekerjaan">Mencari Pekerjaan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Perusahaan / Kampus / Bidang Usaha
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={160}
                  value={alumniForm.institution}
                  onChange={(e) => setAlumniForm({ ...alumniForm, institution: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    WhatsApp (Opsional)
                  </label>
                  <input
                    type="text"
                    maxLength={24}
                    value={alumniForm.whatsapp || ''}
                    onChange={(e) => setAlumniForm({ ...alumniForm, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Status Verifikasi BKK
                  </label>
                  <select
                    value={alumniForm.status}
                    onChange={(e) =>
                      setAlumniForm({
                        ...alumniForm,
                        status: e.target.value as AlumniTracer['status'],
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <option value="menunggu">Menunggu Verifikasi</option>
                    <option value="terverifikasi">Terverifikasi BKK</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Catatan BKK
                </label>
                <textarea
                  rows={2}
                  maxLength={400}
                  value={alumniForm.notes || ''}
                  onChange={(e) => setAlumniForm({ ...alumniForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAlumniModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingAlumni}
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg"
                >
                  {savingAlumni ? 'Menyimpan...' : 'Simpan Data Alumni'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
