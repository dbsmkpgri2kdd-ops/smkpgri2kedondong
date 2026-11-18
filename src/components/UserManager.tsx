import React, { useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import { Pencil, Plus, Search, ShieldCheck, Trash2, X } from 'lucide-react';
import { UserProfile, UserRole, UserStatus } from '../types/admin';
import { removeDocument, saveManagedUser } from '../services/firestoreCrud';

interface UserManagerProps {
  currentUser: User;
  users: UserProfile[];
  onNotify: (msg: string) => void;
}

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin Sekolah',
  editor: 'Editor Konten',
  operator_ppdb: 'Operator PPDB',
  viewer: 'Peninjau',
};

const STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Aktif',
  pending: 'Menunggu',
  suspended: 'Dinonaktifkan',
};

export const UserManager: React.FC<UserManagerProps> = ({
  currentUser,
  users,
  onNotify,
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<{
    displayName: string;
    email: string;
    role: UserRole;
    unit: string;
    status: UserStatus;
  }>({
    displayName: '',
    email: '',
    role: 'editor',
    unit: 'Tim Konten & Kurikulum',
    status: 'active',
  });

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchSearch =
        !q ||
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.unit.toLowerCase().includes(q);
      return matchRole && matchSearch;
    });
  }, [users, search, roleFilter]);

  const openCreateModal = () => {
    setEditingUser(null);
    setForm({
      displayName: '',
      email: '',
      role: 'editor',
      unit: 'Tim Konten & Kurikulum',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (u: UserProfile) => {
    setEditingUser(u);
    setForm({
      displayName: u.displayName,
      email: u.email,
      role: u.role,
      unit: u.unit,
      status: u.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.displayName.trim().length < 2 || !form.email.includes('@')) return;
    setSaving(true);
    try {
      await saveManagedUser(currentUser, form, editingUser ?? undefined);
      onNotify(
        editingUser
          ? `Profil pengguna "${form.displayName}" diperbarui.`
          : `Pengguna baru "${form.displayName}" berhasil ditambahkan.`
      );
      setIsModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u: UserProfile) => {
    if (u.uid === currentUser.uid || u.id === currentUser.uid) return;
    await removeDocument(currentUser, 'users', u.id, `${u.displayName} (${u.email})`);
    setConfirmDeleteId(null);
    onNotify(`Akun "${u.displayName}" dihapus dari direktori.`);
  };

  return (
    <div className="space-y-6">
      {/* Filter & Primary Action Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[260px]">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, email, atau unit..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto">
            {(['all', 'super_admin', 'admin', 'editor', 'operator_ppdb', 'viewer'] as const).map(
              (r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    roleFilter === r
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {r === 'all' ? 'Semua' : ROLE_LABELS[r]}
                </button>
              )
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambah Pengguna
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40">
                <th className="py-3 px-4">Nama & Email</th>
                <th className="py-3 px-4">Unit / Bagian</th>
                <th className="py-3 px-4">Peran (Role)</th>
                <th className="py-3 px-4">Status Akun</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {filteredUsers.map((u) => {
                const isSelf = u.uid === currentUser.uid || u.id === currentUser.uid;
                return (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {u.displayName} {isSelf ? '(Anda)' : ''}
                      </div>
                      <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        {u.email}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 text-xs">
                      {u.unit}
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-800 dark:text-slate-200">
                      {ROLE_LABELS[u.role] || u.role}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <span
                        className={
                          u.status === 'active'
                            ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                            : u.status === 'pending'
                            ? 'text-amber-700 dark:text-amber-400 font-medium'
                            : 'text-red-700 dark:text-red-400 font-medium'
                        }
                      >
                        {STATUS_LABELS[u.status] || u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(u)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap shrink-0"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        {!isSelf && (
                          confirmDeleteId === u.id ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleDelete(u)}
                                className="px-2.5 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md whitespace-nowrap shrink-0"
                              >
                                Konfirmasi Hapus
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(u.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors whitespace-nowrap shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Hapus
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-slate-500">
                    Tidak ada pengguna yang cocok dengan filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC Permissions Matrix */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-semibold">Matriks Hak Akses (RBAC) Portal PRIDA</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-2 pr-4">Peran</th>
                <th className="py-2 px-4">Edit Konten & Berita</th>
                <th className="py-2 px-4">Kelola PPDB & PTK</th>
                <th className="py-2 px-4">Manajemen Pengguna</th>
                <th className="py-2 pl-4">Pengaturan Sekolah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <td className="py-2 pr-4 font-medium">Super Admin</td>
                <td className="py-2 px-4">Penuh (CRUD)</td>
                <td className="py-2 px-4">Penuh (CRUD)</td>
                <td className="py-2 px-4">Penuh (CRUD)</td>
                <td className="py-2 pl-4">Penuh</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium">Admin Sekolah</td>
                <td className="py-2 px-4">Penuh (CRUD)</td>
                <td className="py-2 px-4">Penuh (CRUD)</td>
                <td className="py-2 px-4">Kelola Staf</td>
                <td className="py-2 pl-4">Penuh</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium">Editor Konten</td>
                <td className="py-2 px-4">Berita, Artikel, Jurusan</td>
                <td className="py-2 px-4">Lihat Saja</td>
                <td className="py-2 px-4">Tidak Ada</td>
                <td className="py-2 pl-4">Tidak Ada</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium">Operator PPDB</td>
                <td className="py-2 px-4">Lihat Saja</td>
                <td className="py-2 px-4">Verifikasi & CRUD PPDB</td>
                <td className="py-2 px-4">Tidak Ada</td>
                <td className="py-2 pl-4">Tidak Ada</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium">Peninjau (Viewer)</td>
                <td className="py-2 px-4">Baca Saja</td>
                <td className="py-2 px-4">Baca Saja</td>
                <td className="py-2 px-4">Profil Sendiri</td>
                <td className="py-2 pl-4">Tidak Ada</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {editingUser ? 'Ubah Peran & Data Pengguna' : 'Tambah Pengelola Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
                aria-label="Tutup modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={120}
                  value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  placeholder="Contoh: Drs. Ahmad Suryadi"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Google Terdaftar
                </label>
                <input
                  type="email"
                  required
                  maxLength={160}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  placeholder="nama@gmail.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Unit Kerja / Jabatan
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  placeholder="Contoh: Tata Usaha / Panitia PPDB"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Peran (Role)
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  >
                    {Object.entries(ROLE_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Status Akun
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as UserStatus })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  >
                    {Object.entries(STATUS_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg whitespace-nowrap shrink-0"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
