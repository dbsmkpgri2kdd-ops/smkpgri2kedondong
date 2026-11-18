import React, { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  Unsubscribe,
  where,
} from 'firebase/firestore';
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Database,
  ExternalLink,
  FileEdit,
  GraduationCap,
  Inbox,
  LogOut,
  Menu,
  Moon,
  Sun,
  Users,
  X,
} from 'lucide-react';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ContentManager } from './components/ContentManager';
import { ErrorBoundary } from './components/ErrorBoundary';
import { InboxManager } from './components/InboxManager';
import { PpdbManager } from './components/PpdbManager';
import { UserManager } from './components/UserManager';
import { stripBasePath, withBase } from './portal/data/schoolData';
import { PublicPortal } from './portal/PublicPortal';
import {
  auth,
  db,
  googleProvider,
  PRIMARY_ADMIN_EMAIL,
  testConnection,
} from './firebase';
import { bootstrapUserProfile, seedInitialPortalData } from './services/firestoreCrud';
import {
  AcademicEvent,
  AdminTab,
  AlumniTracer,
  AnalyticsDaily,
  AnalyticsEvent,
  AuditLog,
  ContactMessage,
  EditorialArticle,
  FaqItem,
  NewsItem,
  PpdbRegistration,
  PtkMember,
  SiteSettings,
  StudyProgram,
  UserProfile,
} from './types/admin';

const NAV_ITEMS: Array<{ id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'analytics', label: 'Dasbor Analitik', icon: BarChart3 },
  { id: 'content', label: 'Edit Konten Portal', icon: FileEdit },
  { id: 'ppdb', label: 'Pendaftar PPDB', icon: GraduationCap },
  { id: 'inbox', label: 'Alumni & Pesan', icon: Inbox },
  { id: 'users', label: 'Manajemen Pengguna', icon: Users },
];

interface AdminConsoleProps {
  onOpenPortal: () => void;
}

function AdminConsole({ onOpenPortal }: AdminConsoleProps) {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Live Firestore Collections
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [programs, setPrograms] = useState<StudyProgram[]>([]);
  const [articles, setArticles] = useState<EditorialArticle[]>([]);
  const [ptkMembers, setPtkMembers] = useState<PtkMember[]>([]);
  const [academicEvents, setAcademicEvents] = useState<AcademicEvent[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [ppdbList, setPpdbList] = useState<PpdbRegistration[]>([]);
  const [alumniList, setAlumniList] = useState<AlumniTracer[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [dailyMetrics, setDailyMetrics] = useState<AnalyticsDaily[]>([]);
  const [liveEvents, setLiveEvents] = useState<AnalyticsEvent[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    document.title = 'Panel Admin PRIDA — SMK PGRI 2 Kedondong';
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    testConnection();
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        try {
          const profile = await bootstrapUserProfile(fbUser);
          setUserProfile(profile);
        } catch (err) {
          console.error('Bootstrap profile error:', err);
        }
      } else {
        setUserProfile(null);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authReady || !user || !userProfile) {
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    const isPrimary = user.email === PRIMARY_ADMIN_EMAIL && user.emailVerified;
    const unsubs: Unsubscribe[] = [];

    const makeQuery = (colName: string, useCreatedOrder = false, maxRows = 100) => {
      const colRef = collection(db, colName);
      if (isPrimary) {
        return useCreatedOrder
          ? query(colRef, orderBy('createdAt', 'desc'), limit(maxRows))
          : query(colRef, limit(maxRows));
      }
      // Hindari composite index (where + orderBy) agar pengguna staf non-primary tidak gagal query
      return query(colRef, where('ownerId', '==', user.uid), limit(maxRows));
    };

    const onListenerError = (colName: string) => (err: unknown) => {
      console.error(`Firestore listener error (${colName}):`, err);
      setDataLoading(false);
    };

    const usersQuery = isPrimary
      ? query(collection(db, 'users'), limit(100))
      : query(collection(db, 'users'), where('uid', '==', user.uid), limit(10));

    unsubs.push(
      onSnapshot(
        makeQuery('site_settings', false, 10),
        (snap) => {
          const doc0 = snap.docs[0];
          setSiteSettings(
            doc0 ? { id: doc0.id, ...(doc0.data() as Omit<SiteSettings, 'id'>) } : null
          );
          setDataLoading(false);
        },
        onListenerError('site_settings')
      )
    );

    unsubs.push(
      onSnapshot(
        makeQuery('news', true, 60),
        (snap) => setNews(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<NewsItem, 'id'>) }))),
        onListenerError('news')
      )
    );

    unsubs.push(
      onSnapshot(
        makeQuery('programs', false, 30),
        (snap) =>
          setPrograms(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<StudyProgram, 'id'>) }))),
        onListenerError('programs')
      )
    );

    unsubs.push(
      onSnapshot(
        makeQuery('articles', true, 60),
        (snap) =>
          setArticles(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<EditorialArticle, 'id'>) }))),
        onListenerError('articles')
      )
    );

    unsubs.push(
      onSnapshot(
        makeQuery('ptk_members', false, 100),
        (snap) =>
          setPtkMembers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PtkMember, 'id'>) }))),
        onListenerError('ptk_members')
      )
    );

    unsubs.push(
      onSnapshot(
        makeQuery('academic_events', false, 50),
        (snap) =>
          setAcademicEvents(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AcademicEvent, 'id'>) }))
          ),
        onListenerError('academic_events')
      )
    );

    unsubs.push(
      onSnapshot(
        makeQuery('faqs', false, 50),
        (snap) => setFaqs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FaqItem, 'id'>) }))),
        onListenerError('faqs')
      )
    );

    unsubs.push(
      onSnapshot(
        makeQuery('ppdb_registrations', true, 120),
        (snap) =>
          setPpdbList(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PpdbRegistration, 'id'>) }))
          ),
        onListenerError('ppdb_registrations')
      )
    );

    unsubs.push(
      onSnapshot(
        makeQuery('alumni_tracer', true, 120),
        (snap) =>
          setAlumniList(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AlumniTracer, 'id'>) }))
          ),
        onListenerError('alumni_tracer')
      )
    );

    unsubs.push(
      onSnapshot(
        makeQuery('contact_messages', true, 120),
        (snap) =>
          setContactMessages(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ContactMessage, 'id'>) }))
          ),
        onListenerError('contact_messages')
      )
    );

    unsubs.push(
      onSnapshot(
        usersQuery,
        (snap) =>
          setUsersList(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<UserProfile, 'id'>) }))),
        onListenerError('users')
      )
    );

    unsubs.push(
      onSnapshot(
        makeQuery('analytics_daily', false, 30),
        (snap) =>
          setDailyMetrics(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AnalyticsDaily, 'id'>) }))
          ),
        onListenerError('analytics_daily')
      )
    );

    unsubs.push(
      onSnapshot(
        makeQuery('analytics_events', true, 40),
        (snap) =>
          setLiveEvents(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AnalyticsEvent, 'id'>) }))
          ),
        onListenerError('analytics_events')
      )
    );

    unsubs.push(
      onSnapshot(
        makeQuery('audit_logs', true, 40),
        (snap) =>
          setAuditLogs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AuditLog, 'id'>) }))),
        onListenerError('audit_logs')
      )
    );

    return () => {
      unsubs.forEach((fn) => fn());
    };
  }, [authReady, user, userProfile]);

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Gagal masuk dengan Google.');
    } finally {
      setSigningIn(false);
    }
  };

  const handleSeedData = async () => {
    if (!user) return;
    setSeeding(true);
    try {
      await seedInitialPortalData(user);
      showToast('Seluruh data awal portal SMK PGRI 2 Kedondong berhasil dimuat ke Firestore.');
    } finally {
      setSeeding(false);
    }
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Memeriksa sesi autentikasi Panel Admin PRIDA...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 space-y-6">
          <div className="flex items-center gap-3.5">
            <img
              src={withBase('logo-sekolah.png')}
              alt="Logo SMK PGRI 2 Kedondong"
              referrerPolicy="no-referrer"
              className="w-12 h-12 object-contain shrink-0"
            />
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Panel Admin PRIDA
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                SMK PGRI 2 Kedondong · NPSN 10811003
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Masuk untuk Mengelola Portal Sekolah
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Gunakan akun Google resmi pengelola (<span className="font-mono text-xs">{PRIMARY_ADMIN_EMAIL}</span>) untuk mengakses fitur edit konten, manajemen pengguna, verifikasi PPDB, dan analitik real-time.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
              {authError}
            </div>
          )}

          <button
            type="button"
            disabled={signingIn}
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
          >
            {signingIn ? 'Menghubungkan Akun Google...' : 'Masuk dengan Akun Google'}
          </button>

          <button
            type="button"
            onClick={onOpenPortal}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Website Publik
          </button>

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Tersinkronisasi langsung dengan smkpgri2kedondong.sch.id · Firebase Spark Free Tier
          </p>
        </div>
      </div>
    );
  }

  const inboxUnreadCount =
    contactMessages.filter((m) => m.status === 'baru').length +
    alumniList.filter((a) => a.status === 'menunggu').length;
  const activeNav = NAV_ITEMS.find((n) => n.id === activeTab)!;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Desktop Sidebar (256px) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <img
            src={withBase('logo-sekolah.png')}
            alt="Logo SMK PGRI 2 Kedondong"
            referrerPolicy="no-referrer"
            className="w-9 h-9 object-contain shrink-0"
          />
          <div className="min-w-0">
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
              Admin PRIDA
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              SMK PGRI 2 Kedondong
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1" aria-label="Menu utama panel admin">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const pendingCount =
              item.id === 'inbox'
                ? inboxUnreadCount
                : item.id === 'ppdb'
                  ? ppdbList.filter((p) => p.status === 'menunggu').length
                  : 0;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                {pendingCount > 0 && (
                  <span className="font-mono text-[11px] font-semibold tabular-nums text-blue-700 dark:text-blue-300 shrink-0">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
              {userProfile?.displayName || user.displayName || 'Admin'}
            </div>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
              {user.email}
            </div>
            <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">
              Peran: {userProfile?.role || 'viewer'}
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenPortal}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Lihat Website Publik
          </button>

          <button
            type="button"
            onClick={() => signOut(auth)}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Keluar Sesi
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/50"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="relative z-10 w-64 bg-white dark:bg-slate-900 h-full flex flex-col border-r border-slate-200 dark:border-slate-800">
            <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-sm font-bold">Admin PRIDA</span>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Tutup menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const pendingCount =
                  item.id === 'inbox'
                    ? inboxUnreadCount
                    : item.id === 'ppdb'
                      ? ppdbList.filter((p) => p.status === 'menunggu').length
                      : 0;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileNavOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium rounded-lg ${
                      activeTab === item.id
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {pendingCount > 0 && (
                      <span className="font-mono text-[11px] font-semibold tabular-nums text-blue-700 dark:text-blue-300 shrink-0">
                        {pendingCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  onOpenPortal();
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 rounded-lg"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Lihat Website Publik
              </button>
              <button
                type="button"
                onClick={() => signOut(auth)}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 rounded-lg"
              >
                <LogOut className="w-3.5 h-3.5" />
                Keluar Sesi
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar Contract: Breadcrumb on left, primary actions on right */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              aria-label="Buka navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm truncate">
              <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
                smkpgri2kedondong.sch.id
              </span>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">/</span>
              <h1 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {activeNav.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenPortal}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Website Publik
            </button>

            <button
              type="button"
              disabled={seeding}
              onClick={handleSeedData}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              {seeding ? 'Memuat...' : 'Muat Data Portal'}
            </button>

            <button
              type="button"
              onClick={() => setDarkMode((d) => !d)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              aria-label="Ganti tema terang/gelap"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 max-w-[1360px] w-full mx-auto">
          {toast && (
            <div
              role="status"
              className="mb-5 flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-xs font-medium text-emerald-800 dark:text-emerald-200"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{toast}</span>
              </div>
              <button type="button" onClick={() => setToast(null)} aria-label="Tutup notifikasi">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {dataLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-28 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse"
                  />
                ))}
              </div>
              <div className="h-72 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
            </div>
          ) : (
            <>
              {activeTab === 'analytics' && (
                <AnalyticsDashboard
                  user={user}
                  dailyMetrics={dailyMetrics}
                  liveEvents={liveEvents}
                  auditLogs={auditLogs}
                  news={news}
                  programs={programs}
                  articles={articles}
                  ptkMembers={ptkMembers}
                  ppdbList={ppdbList}
                  alumniList={alumniList}
                  contactMessages={contactMessages}
                  onSeedData={handleSeedData}
                  seeding={seeding}
                  onNotify={showToast}
                />
              )}

              {activeTab === 'content' && (
                <ContentManager
                  currentUser={user}
                  siteSettings={siteSettings}
                  news={news}
                  programs={programs}
                  articles={articles}
                  ptkMembers={ptkMembers}
                  academicEvents={academicEvents}
                  faqs={faqs}
                  onNotify={showToast}
                />
              )}

              {activeTab === 'ppdb' && (
                <PpdbManager
                  currentUser={user}
                  registrations={ppdbList}
                  onNotify={showToast}
                />
              )}

              {activeTab === 'inbox' && (
                <InboxManager
                  currentUser={user}
                  messages={contactMessages}
                  alumniList={alumniList}
                  onNotify={showToast}
                />
              )}

              {activeTab === 'users' && (
                <UserManager
                  currentUser={user}
                  users={usersList}
                  onNotify={showToast}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function isAdminLocation(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    stripBasePath(window.location.pathname).startsWith('/admin') ||
    new URLSearchParams(window.location.search).get('mode') === 'admin'
  );
}

export default function App() {
  const [mode, setMode] = useState<'portal' | 'admin'>(() =>
    isAdminLocation() ? 'admin' : 'portal'
  );

  useEffect(() => {
    const onPopState = () => {
      setMode(isAdminLocation() ? 'admin' : 'portal');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const openAdmin = useCallback(() => {
    const adminUrl = withBase('admin');
    if (!stripBasePath(window.location.pathname).startsWith('/admin')) {
      window.history.pushState({}, '', adminUrl);
    }
    setMode('admin');
    window.scrollTo({ top: 0 });
  }, []);

  const openPortal = useCallback(() => {
    document.documentElement.classList.remove('dark');
    if (stripBasePath(window.location.pathname).startsWith('/admin')) {
      window.history.pushState({}, '', withBase(''));
    }
    setMode('portal');
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <ErrorBoundary>
      {mode === 'admin' ? (
        <AdminConsole onOpenPortal={openPortal} />
      ) : (
        <PublicPortal onOpenAdmin={openAdmin} />
      )}
    </ErrorBoundary>
  );
}
