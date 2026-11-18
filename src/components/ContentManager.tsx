import React, { useEffect, useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import { Building2, Pencil, Plus, Save, Search, Trash2, X } from 'lucide-react';
import { AVAILABLE_IMAGES, DEFAULT_SITE_SETTINGS } from '../data/seedDefaults';
import {
  removeDocument,
  saveAcademicEvent,
  saveArticle,
  saveFaqItem,
  saveNewsItem,
  savePtkMember,
  saveSiteSettings,
  saveStudyProgram,
} from '../services/firestoreCrud';
import {
  AcademicEvent,
  ContentSubTab,
  EditorialArticle,
  FaqItem,
  NewsItem,
  PtkMember,
  SiteSettings,
  StudyProgram,
} from '../types/admin';

interface ContentManagerProps {
  currentUser: User;
  siteSettings: SiteSettings | null;
  news: NewsItem[];
  programs: StudyProgram[];
  articles: EditorialArticle[];
  ptkMembers: PtkMember[];
  academicEvents: AcademicEvent[];
  faqs: FaqItem[];
  onNotify: (msg: string) => void;
}

const SUB_TABS: Array<{ id: ContentSubTab; label: string }> = [
  { id: 'news', label: 'Berita Sekolah' },
  { id: 'programs', label: 'Program Keahlian' },
  { id: 'articles', label: 'Literasi Vokasi' },
  { id: 'ptk', label: 'Direktori PTK' },
  { id: 'calendar_faq', label: 'Kalender & FAQ' },
  { id: 'settings', label: 'Profil & Pengaturan' },
];

export const ContentManager: React.FC<ContentManagerProps> = ({
  currentUser,
  siteSettings,
  news,
  programs,
  articles,
  ptkMembers,
  academicEvents,
  faqs,
  onNotify,
}) => {
  const [subTab, setSubTab] = useState<ContentSubTab>('news');
  const [search, setSearch] = useState('');
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // News Modal State
  const [newsModal, setNewsModal] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [newsForm, setNewsForm] = useState({
    title: '',
    category: 'Informasi PPDB',
    dateLabel: '18 November 2026',
    summary: '',
    status: 'published' as NewsItem['status'],
    imageUrl: AVAILABLE_IMAGES[0].url,
  });

  // Program Modal State
  const [progModal, setProgModal] = useState(false);
  const [editingProg, setEditingProg] = useState<StudyProgram | null>(null);
  const [progForm, setProgForm] = useState({
    code: '',
    name: '',
    category: 'rekayasa' as StudyProgram['category'],
    categoryLabel: 'Teknologi & Rekayasa',
    summary: '',
    competenciesText: '',
    careersText: '',
    certification: '',
    imageUrl: AVAILABLE_IMAGES[1].url,
    active: true,
  });

  // Article Modal State
  const [artModal, setArtModal] = useState(false);
  const [editingArt, setEditingArt] = useState<EditorialArticle | null>(null);
  const [artForm, setArtForm] = useState({
    slug: '',
    title: '',
    category: 'Otomotif & K3',
    author: 'Tim Kurikulum SMK PGRI 2 Kedondong',
    publishedAtLabel: '18 November 2026',
    readTime: '4 menit baca',
    excerpt: '',
    paragraphsText: '',
    takeawaysText: '',
    status: 'published' as EditorialArticle['status'],
  });

  // PTK Modal State
  const [ptkModal, setPtkModal] = useState(false);
  const [editingPtk, setEditingPtk] = useState<PtkMember | null>(null);
  const [ptkForm, setPtkForm] = useState({
    name: '',
    position: '',
    department: 'TKJ',
    nipOrNuptk: '',
    status: 'active' as PtkMember['status'],
  });

  // Academic Event Modal
  const [calModal, setCalModal] = useState(false);
  const [editingCal, setEditingCal] = useState<AcademicEvent | null>(null);
  const [calForm, setCalForm] = useState({
    period: '',
    title: '',
    description: '',
    orderIndex: 1,
  });

  // FAQ Modal
  const [faqModal, setFaqModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    category: 'PPDB',
    orderIndex: 1,
  });

  // Site Settings Form
  const [settingsForm, setSettingsForm] = useState({
    schoolName: DEFAULT_SITE_SETTINGS.schoolName,
    shortName: DEFAULT_SITE_SETTINGS.shortName,
    npsn: DEFAULT_SITE_SETTINGS.npsn,
    address: DEFAULT_SITE_SETTINGS.address,
    hours: DEFAULT_SITE_SETTINGS.hours,
    email: DEFAULT_SITE_SETTINGS.email,
    domain: DEFAULT_SITE_SETTINGS.domain,
    vision: DEFAULT_SITE_SETTINGS.vision,
    missionsText: DEFAULT_SITE_SETTINGS.missions.join('\n'),
    principalGreeting: DEFAULT_SITE_SETTINGS.principalGreeting,
    principalClosing: DEFAULT_SITE_SETTINGS.principalClosing,
    ppdbOpen: DEFAULT_SITE_SETTINGS.ppdbOpen,
    ppdbWaveLabel: DEFAULT_SITE_SETTINGS.ppdbWaveLabel,
    announcementBanner: DEFAULT_SITE_SETTINGS.announcementBanner || '',
    instagramUrl: DEFAULT_SITE_SETTINGS.instagramUrl || '',
    tiktokUrl: DEFAULT_SITE_SETTINGS.tiktokUrl || '',
    whatsappUrl: DEFAULT_SITE_SETTINGS.whatsappUrl || '',
  });

  useEffect(() => {
    if (siteSettings) {
      setSettingsForm({
        schoolName: siteSettings.schoolName,
        shortName: siteSettings.shortName,
        npsn: siteSettings.npsn,
        address: siteSettings.address,
        hours: siteSettings.hours,
        email: siteSettings.email,
        domain: siteSettings.domain,
        vision: siteSettings.vision,
        missionsText: (siteSettings.missions || []).join('\n'),
        principalGreeting: siteSettings.principalGreeting,
        principalClosing: siteSettings.principalClosing,
        ppdbOpen: siteSettings.ppdbOpen,
        ppdbWaveLabel: siteSettings.ppdbWaveLabel,
        announcementBanner: siteSettings.announcementBanner || '',
        instagramUrl: siteSettings.instagramUrl || '',
        tiktokUrl: siteSettings.tiktokUrl || '',
        whatsappUrl: siteSettings.whatsappUrl || '',
      });
    }
  }, [siteSettings]);

  const q = search.trim().toLowerCase();

  const filteredNews = useMemo(
    () =>
      news.filter(
        (n) =>
          !q || n.title.toLowerCase().includes(q) || n.category.toLowerCase().includes(q)
      ),
    [news, q]
  );

  const filteredPrograms = useMemo(
    () =>
      programs.filter(
        (p) =>
          !q ||
          p.code.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.categoryLabel.toLowerCase().includes(q)
      ),
    [programs, q]
  );

  const filteredArticles = useMemo(
    () =>
      articles.filter(
        (a) =>
          !q ||
          a.title.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.author.toLowerCase().includes(q)
      ),
    [articles, q]
  );

  const filteredPtk = useMemo(
    () =>
      ptkMembers.filter(
        (m) =>
          !q ||
          m.name.toLowerCase().includes(q) ||
          m.position.toLowerCase().includes(q) ||
          m.department.toLowerCase().includes(q)
      ),
    [ptkMembers, q]
  );

  const sortedCalendar = useMemo(
    () =>
      [...academicEvents]
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .filter((e) => !q || e.title.toLowerCase().includes(q) || e.period.toLowerCase().includes(q)),
    [academicEvents, q]
  );

  const sortedFaqs = useMemo(
    () =>
      [...faqs]
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .filter((f) => !q || f.question.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)),
    [faqs, q]
  );

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveSiteSettings(
        currentUser,
        {
          schoolName: settingsForm.schoolName,
          shortName: settingsForm.shortName,
          npsn: settingsForm.npsn,
          address: settingsForm.address,
          hours: settingsForm.hours,
          email: settingsForm.email,
          domain: settingsForm.domain,
          vision: settingsForm.vision,
          missions: settingsForm.missionsText
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
          principalGreeting: settingsForm.principalGreeting,
          principalClosing: settingsForm.principalClosing,
          ppdbOpen: settingsForm.ppdbOpen,
          ppdbWaveLabel: settingsForm.ppdbWaveLabel,
          announcementBanner: settingsForm.announcementBanner,
          instagramUrl: settingsForm.instagramUrl,
          tiktokUrl: settingsForm.tiktokUrl,
          whatsappUrl: settingsForm.whatsappUrl,
        },
        siteSettings?.ownerId
      );
      onNotify('Profil dan pengaturan portal SMK PGRI 2 Kedondong disimpan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Segmented Sub-Tab Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto">
          {SUB_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setSubTab(t.id);
                setSearch('');
                setConfirmDeleteKey(null);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                subTab === t.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {subTab !== 'settings' && (
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari konten..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg w-48 text-slate-900 dark:text-slate-100"
              />
            </div>

            {subTab === 'news' && (
              <button
                type="button"
                onClick={() => {
                  setEditingNews(null);
                  setNewsForm({
                    title: '',
                    category: 'Informasi PPDB',
                    dateLabel: new Date().toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    }),
                    summary: '',
                    status: 'published',
                    imageUrl: AVAILABLE_IMAGES[0].url,
                  });
                  setNewsModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Berita
              </button>
            )}

            {subTab === 'programs' && (
              <button
                type="button"
                onClick={() => {
                  setEditingProg(null);
                  setProgForm({
                    code: '',
                    name: '',
                    category: 'rekayasa',
                    categoryLabel: 'Teknologi & Rekayasa',
                    summary: '',
                    competenciesText: '',
                    careersText: '',
                    certification: '',
                    imageUrl: AVAILABLE_IMAGES[1].url,
                    active: true,
                  });
                  setProgModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Jurusan
              </button>
            )}

            {subTab === 'articles' && (
              <button
                type="button"
                onClick={() => {
                  setEditingArt(null);
                  setArtForm({
                    slug: '',
                    title: '',
                    category: 'Otomotif & K3',
                    author: 'Tim Kurikulum SMK PGRI 2 Kedondong',
                    publishedAtLabel: new Date().toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    }),
                    readTime: '4 menit baca',
                    excerpt: '',
                    paragraphsText: '',
                    takeawaysText: '',
                    status: 'published',
                  });
                  setArtModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Tulis Artikel
              </button>
            )}

            {subTab === 'ptk' && (
              <button
                type="button"
                onClick={() => {
                  setEditingPtk(null);
                  setPtkForm({
                    name: '',
                    position: '',
                    department: 'TKJ',
                    nipOrNuptk: '',
                    status: 'active',
                  });
                  setPtkModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah PTK
              </button>
            )}
          </div>
        )}
      </div>

      {/* 1. BERITA SEKOLAH */}
      {subTab === 'news' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
          {filteredNews.map((item) => (
            <div
              key={item.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.dateLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={
                        item.status === 'published'
                          ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                          : 'text-amber-600 dark:text-amber-400 font-medium'
                      }
                    >
                      {item.status === 'published' ? 'Terbit' : item.status === 'draft' ? 'Draf' : 'Arsip'}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {item.summary}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingNews(item);
                    setNewsForm({
                      title: item.title,
                      category: item.category,
                      dateLabel: item.dateLabel,
                      summary: item.summary,
                      status: item.status,
                      imageUrl: item.imageUrl || AVAILABLE_IMAGES[0].url,
                    });
                    setNewsModal(true);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md whitespace-nowrap shrink-0"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                {confirmDeleteKey === `news:${item.id}` ? (
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={async () => {
                        await removeDocument(currentUser, 'news', item.id, item.title);
                        setConfirmDeleteKey(null);
                        onNotify(`Berita "${item.title}" dihapus.`);
                      }}
                      className="px-2.5 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md"
                    >
                      Hapus
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteKey(null)}
                      className="px-2 py-1.5 text-xs text-slate-500"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteKey(`news:${item.id}`)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md whitespace-nowrap shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus
                  </button>
                )}
              </div>
            </div>
          ))}
          {filteredNews.length === 0 && (
            <div className="p-10 text-center text-sm text-slate-500">
              Belum ada berita sekolah. Klik &ldquo;Tambah Berita&rdquo; untuk membuat publikasi baru.
            </div>
          )}
        </div>
      )}

      {/* 2. PROGRAM KEAHLIAN */}
      {subTab === 'programs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPrograms.map((prog) => (
            <div
              key={prog.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                        {prog.code}
                      </span>{' '}
                      · {prog.categoryLabel} ·{' '}
                      <span className={prog.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'}>
                        {prog.active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                    <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {prog.name}
                    </h4>
                  </div>
                  {prog.imageUrl && (
                    <img
                      src={prog.imageUrl}
                      alt={prog.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {prog.summary}
                </p>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Kompetensi: {prog.competencies.length} butir · Prospek Karier: {prog.careers.length} bidang
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 truncate max-w-[220px]">
                  {prog.certification}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProg(prog);
                      setProgForm({
                        code: prog.code,
                        name: prog.name,
                        category: prog.category,
                        categoryLabel: prog.categoryLabel,
                        summary: prog.summary,
                        competenciesText: prog.competencies.join('\n'),
                        careersText: prog.careers.join('\n'),
                        certification: prog.certification,
                        imageUrl: prog.imageUrl || AVAILABLE_IMAGES[1].url,
                        active: prog.active,
                      });
                      setProgModal(true);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  {confirmDeleteKey === `prog:${prog.id}` ? (
                    <button
                      type="button"
                      onClick={async () => {
                        await removeDocument(currentUser, 'programs', prog.id, prog.name);
                        setConfirmDeleteKey(null);
                        onNotify(`Jurusan "${prog.name}" dihapus.`);
                      }}
                      className="px-2.5 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md"
                    >
                      Konfirmasi
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteKey(`prog:${prog.id}`)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. ARTIKEL LITERASI VOKASI */}
      {subTab === 'articles' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
          {filteredArticles.map((art) => (
            <div key={art.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{art.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{art.publishedAtLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>{art.readTime}</span>
                  <span aria-hidden="true">·</span>
                  <span className={art.status === 'published' ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-amber-600'}>
                    {art.status === 'published' ? 'Terbit' : 'Draf'}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {art.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{art.excerpt}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingArt(art);
                    setArtForm({
                      slug: art.slug,
                      title: art.title,
                      category: art.category,
                      author: art.author,
                      publishedAtLabel: art.publishedAtLabel,
                      readTime: art.readTime,
                      excerpt: art.excerpt,
                      paragraphsText: art.paragraphs.join('\n\n'),
                      takeawaysText: art.keyTakeaways.join('\n'),
                      status: art.status,
                    });
                    setArtModal(true);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                {confirmDeleteKey === `art:${art.id}` ? (
                  <button
                    type="button"
                    onClick={async () => {
                      await removeDocument(currentUser, 'articles', art.id, art.title);
                      setConfirmDeleteKey(null);
                      onNotify(`Artikel "${art.title}" dihapus.`);
                    }}
                    className="px-2.5 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md"
                  >
                    Konfirmasi
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteKey(`art:${art.id}`)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. DIREKTORI PTK */}
      {subTab === 'ptk' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40">
                  <th className="py-3 px-4">Nama Pendidik / Tenaga Kependidikan</th>
                  <th className="py-3 px-4">Jabatan</th>
                  <th className="py-3 px-4">Unit / Jurusan</th>
                  <th className="py-3 px-4">NIP / NUPTK</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredPtk.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                      {m.name}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-700 dark:text-slate-300">
                      {m.position}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">
                      {m.department}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono tabular-nums text-slate-500">
                      {m.nipOrNuptk || '-'}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <span className={m.status === 'active' ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-500'}>
                        {m.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPtk(m);
                            setPtkForm({
                              name: m.name,
                              position: m.position,
                              department: m.department,
                              nipOrNuptk: m.nipOrNuptk || '',
                              status: m.status,
                            });
                            setPtkModal(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        {confirmDeleteKey === `ptk:${m.id}` ? (
                          <button
                            type="button"
                            onClick={async () => {
                              await removeDocument(currentUser, 'ptk_members', m.id, m.name);
                              setConfirmDeleteKey(null);
                              onNotify(`Data PTK "${m.name}" dihapus.`);
                            }}
                            className="px-2.5 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md"
                          >
                            Konfirmasi
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteKey(`ptk:${m.id}`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Hapus
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. KALENDER AKADEMIK & FAQ */}
      {subTab === 'calendar_faq' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar Column */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Kalender Akademik
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingCal(null);
                  setCalForm({
                    period: '',
                    title: '',
                    description: '',
                    orderIndex: sortedCalendar.length + 1,
                  });
                  setCalModal(true);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                Agenda
              </button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedCalendar.map((ev) => (
                <div key={ev.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-xs font-mono text-blue-600 dark:text-blue-400">
                      #{ev.orderIndex} · {ev.period}
                    </div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {ev.title}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{ev.description}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCal(ev);
                        setCalForm({
                          period: ev.period,
                          title: ev.title,
                          description: ev.description,
                          orderIndex: ev.orderIndex,
                        });
                        setCalModal(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                      aria-label="Edit agenda"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await removeDocument(currentUser, 'academic_events', ev.id, ev.title);
                        onNotify(`Agenda "${ev.title}" dihapus.`);
                      }}
                      className="p-1.5 text-red-500 hover:text-red-700"
                      aria-label="Hapus agenda"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Column */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Pertanyaan Umum (FAQ)
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingFaq(null);
                  setFaqForm({
                    question: '',
                    answer: '',
                    category: 'PPDB',
                    orderIndex: sortedFaqs.length + 1,
                  });
                  setFaqModal(true);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                FAQ
              </button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedFaqs.map((faq) => (
                <div key={faq.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      #{faq.orderIndex} · {faq.category}
                    </div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {faq.question}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{faq.answer}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingFaq(faq);
                        setFaqForm({
                          question: faq.question,
                          answer: faq.answer,
                          category: faq.category,
                          orderIndex: faq.orderIndex,
                        });
                        setFaqModal(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                      aria-label="Edit FAQ"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await removeDocument(currentUser, 'faqs', faq.id, faq.question);
                        onNotify('Pertanyaan FAQ dihapus.');
                      }}
                      className="p-1.5 text-red-500 hover:text-red-700"
                      aria-label="Hapus FAQ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. PROFIL & PENGATURAN SEKOLAH */}
      {subTab === 'settings' && (
        <form
          onSubmit={handleSaveSettings}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Identitas, Visi Misi & Konfigurasi Portal
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Perubahan di sini langsung menyinkronkan data profil smkpgri2kedondong.sch.id di Firestore
              </p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg whitespace-nowrap shrink-0"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nama Resmi Sekolah
              </label>
              <input
                type="text"
                required
                maxLength={120}
                value={settingsForm.schoolName}
                onChange={(e) => setSettingsForm({ ...settingsForm, schoolName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Sebutan Singkat
              </label>
              <input
                type="text"
                required
                maxLength={32}
                value={settingsForm.shortName}
                onChange={(e) => setSettingsForm({ ...settingsForm, shortName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                NPSN
              </label>
              <input
                type="text"
                required
                maxLength={16}
                value={settingsForm.npsn}
                onChange={(e) => setSettingsForm({ ...settingsForm, npsn: e.target.value })}
                className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Alamat Kampus
              </label>
              <input
                type="text"
                required
                maxLength={280}
                value={settingsForm.address}
                onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Jam Layanan Tata Usaha
              </label>
              <input
                type="text"
                required
                maxLength={120}
                value={settingsForm.hours}
                onChange={(e) => setSettingsForm({ ...settingsForm, hours: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Banner Pengumuman Beranda
              </label>
              <input
                type="text"
                maxLength={300}
                value={settingsForm.announcementBanner}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, announcementBanner: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Label Gelombang PPDB
                </label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={settingsForm.ppdbWaveLabel}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, ppdbWaveLabel: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <label className="inline-flex items-center gap-2 pb-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={settingsForm.ppdbOpen}
                  onChange={(e) => setSettingsForm({ ...settingsForm, ppdbOpen: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                PPDB Dibuka
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Visi Sekolah
              </label>
              <textarea
                rows={2}
                required
                maxLength={600}
                value={settingsForm.vision}
                onChange={(e) => setSettingsForm({ ...settingsForm, vision: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Misi Sekolah (satu butir per baris, maksimal 10 butir)
              </label>
              <textarea
                rows={4}
                required
                value={settingsForm.missionsText}
                onChange={(e) => setSettingsForm({ ...settingsForm, missionsText: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Sambutan Kepala Sekolah (Pembuka)
                </label>
                <textarea
                  rows={3}
                  required
                  maxLength={1200}
                  value={settingsForm.principalGreeting}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, principalGreeting: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Sambutan Kepala Sekolah (Penutup)
                </label>
                <textarea
                  rows={3}
                  required
                  maxLength={1200}
                  value={settingsForm.principalClosing}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, principalClosing: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* MODAL: BERITA */}
      {newsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">
                {editingNews ? 'Edit Berita Sekolah' : 'Tambah Berita Sekolah'}
              </h3>
              <button type="button" onClick={() => setNewsModal(false)} aria-label="Tutup">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSaving(true);
                try {
                  await saveNewsItem(currentUser, newsForm, editingNews?.id);
                  onNotify('Berita sekolah berhasil disimpan.');
                  setNewsModal(false);
                } finally {
                  setSaving(false);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-medium mb-1">Judul Berita</label>
                <input
                  type="text"
                  required
                  minLength={4}
                  maxLength={200}
                  value={newsForm.title}
                  onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Kategori</label>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    value={newsForm.category}
                    onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Tanggal Tampil</label>
                  <input
                    type="text"
                    required
                    maxLength={60}
                    value={newsForm.dateLabel}
                    onChange={(e) => setNewsForm({ ...newsForm, dateLabel: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Status Publikasi</label>
                  <select
                    value={newsForm.status}
                    onChange={(e) =>
                      setNewsForm({ ...newsForm, status: e.target.value as NewsItem['status'] })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <option value="published">Terbit (Published)</option>
                    <option value="draft">Draf</option>
                    <option value="archived">Arsip</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Foto Dokumentasi</label>
                  <select
                    value={newsForm.imageUrl}
                    onChange={(e) => setNewsForm({ ...newsForm, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    {AVAILABLE_IMAGES.map((img) => (
                      <option key={img.url} value={img.url}>
                        {img.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Ringkasan Berita</label>
                <textarea
                  rows={3}
                  required
                  minLength={10}
                  maxLength={1000}
                  value={newsForm.summary}
                  onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setNewsModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Berita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PROGRAM KEAHLIAN */}
      {progModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">
                {editingProg ? `Edit Jurusan ${editingProg.code}` : 'Tambah Program Keahlian'}
              </h3>
              <button type="button" onClick={() => setProgModal(false)} aria-label="Tutup">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSaving(true);
                try {
                  await saveStudyProgram(
                    currentUser,
                    {
                      code: progForm.code,
                      name: progForm.name,
                      category: progForm.category,
                      categoryLabel: progForm.categoryLabel,
                      summary: progForm.summary,
                      competencies: progForm.competenciesText
                        .split('\n')
                        .map((s) => s.trim())
                        .filter(Boolean),
                      careers: progForm.careersText
                        .split('\n')
                        .map((s) => s.trim())
                        .filter(Boolean),
                      certification: progForm.certification,
                      imageUrl: progForm.imageUrl,
                      active: progForm.active,
                    },
                    editingProg?.id
                  );
                  onNotify(`Program keahlian "${progForm.name}" disimpan.`);
                  setProgModal(false);
                } finally {
                  setSaving(false);
                }
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Kode (Huruf Besar)</label>
                  <input
                    type="text"
                    required
                    maxLength={12}
                    value={progForm.code}
                    disabled={Boolean(editingProg)}
                    onChange={(e) =>
                      setProgForm({ ...progForm, code: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-60"
                    placeholder="TKR"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium mb-1">Nama Program Keahlian</label>
                  <input
                    type="text"
                    required
                    maxLength={140}
                    value={progForm.name}
                    onChange={(e) => setProgForm({ ...progForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Rumpun Bidang</label>
                  <select
                    value={progForm.category}
                    onChange={(e) => {
                      const c = e.target.value as StudyProgram['category'];
                      const labels = {
                        rekayasa: 'Teknologi & Rekayasa',
                        tik: 'TIK & Elektronika',
                        bisnis: 'Bisnis Digital',
                      };
                      setProgForm({ ...progForm, category: c, categoryLabel: labels[c] });
                    }}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <option value="rekayasa">Teknologi & Rekayasa</option>
                    <option value="tik">TIK & Elektronika</option>
                    <option value="bisnis">Bisnis Digital</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Foto Bengkel / Lab</label>
                  <select
                    value={progForm.imageUrl}
                    onChange={(e) => setProgForm({ ...progForm, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    {AVAILABLE_IMAGES.map((img) => (
                      <option key={img.url} value={img.url}>
                        {img.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Deskripsi Program</label>
                <textarea
                  rows={2}
                  required
                  minLength={10}
                  maxLength={1000}
                  value={progForm.summary}
                  onChange={(e) => setProgForm({ ...progForm, summary: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Kompetensi (per baris)</label>
                  <textarea
                    rows={3}
                    value={progForm.competenciesText}
                    onChange={(e) => setProgForm({ ...progForm, competenciesText: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Prospek Karier (per baris)</label>
                  <textarea
                    rows={3}
                    value={progForm.careersText}
                    onChange={(e) => setProgForm({ ...progForm, careersText: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1">Sertifikasi UKK</label>
                  <input
                    type="text"
                    required
                    maxLength={200}
                    value={progForm.certification}
                    onChange={(e) => setProgForm({ ...progForm, certification: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <label className="inline-flex items-center gap-2 pt-5 text-xs font-medium cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={progForm.active}
                    onChange={(e) => setProgForm({ ...progForm, active: e.target.checked })}
                  />
                  Jurusan Aktif
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setProgModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Jurusan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ARTIKEL LITERASI */}
      {artModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">
                {editingArt ? 'Edit Artikel Literasi' : 'Tulis Artikel Literasi Vokasi'}
              </h3>
              <button type="button" onClick={() => setArtModal(false)} aria-label="Tutup">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSaving(true);
                try {
                  await saveArticle(
                    currentUser,
                    {
                      slug:
                        artForm.slug ||
                        artForm.title
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-|-$/g, ''),
                      title: artForm.title,
                      category: artForm.category,
                      author: artForm.author,
                      publishedAtLabel: artForm.publishedAtLabel,
                      readTime: artForm.readTime,
                      excerpt: artForm.excerpt,
                      paragraphs: artForm.paragraphsText
                        .split(/\n{2,}/)
                        .map((s) => s.trim())
                        .filter(Boolean),
                      keyTakeaways: artForm.takeawaysText
                        .split('\n')
                        .map((s) => s.trim())
                        .filter(Boolean),
                      status: artForm.status,
                    },
                    editingArt?.id
                  );
                  onNotify('Artikel literasi vokasi berhasil disimpan.');
                  setArtModal(false);
                } finally {
                  setSaving(false);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-medium mb-1">Judul Artikel</label>
                <input
                  type="text"
                  required
                  minLength={5}
                  maxLength={220}
                  value={artForm.title}
                  onChange={(e) => setArtForm({ ...artForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Kategori</label>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    value={artForm.category}
                    onChange={(e) => setArtForm({ ...artForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Penulis</label>
                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={artForm.author}
                    onChange={(e) => setArtForm({ ...artForm, author: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Tanggal</label>
                  <input
                    type="text"
                    required
                    value={artForm.publishedAtLabel}
                    onChange={(e) => setArtForm({ ...artForm, publishedAtLabel: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Waktu Baca</label>
                  <input
                    type="text"
                    required
                    value={artForm.readTime}
                    onChange={(e) => setArtForm({ ...artForm, readTime: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Status</label>
                  <select
                    value={artForm.status}
                    onChange={(e) =>
                      setArtForm({ ...artForm, status: e.target.value as 'published' | 'draft' })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <option value="published">Terbit</option>
                    <option value="draft">Draf</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Ringkasan (Excerpt)</label>
                <textarea
                  rows={2}
                  required
                  minLength={10}
                  maxLength={600}
                  value={artForm.excerpt}
                  onChange={(e) => setArtForm({ ...artForm, excerpt: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Isi Paragraf (pisahkan antar paragraf dengan baris kosong)
                </label>
                <textarea
                  rows={4}
                  value={artForm.paragraphsText}
                  onChange={(e) => setArtForm({ ...artForm, paragraphsText: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Poin Utama (satu poin per baris)</label>
                <textarea
                  rows={2}
                  value={artForm.takeawaysText}
                  onChange={(e) => setArtForm({ ...artForm, takeawaysText: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setArtModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Artikel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PTK */}
      {ptkModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">
                {editingPtk ? 'Edit Data PTK' : 'Tambah Data Guru / Staf (PTK)'}
              </h3>
              <button type="button" onClick={() => setPtkModal(false)} aria-label="Tutup">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSaving(true);
                try {
                  await savePtkMember(currentUser, ptkForm, editingPtk?.id);
                  onNotify(`Data PTK "${ptkForm.name}" disimpan.`);
                  setPtkModal(false);
                } finally {
                  setSaving(false);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-medium mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  maxLength={140}
                  value={ptkForm.name}
                  onChange={(e) => setPtkForm({ ...ptkForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Jabatan</label>
                <input
                  type="text"
                  required
                  maxLength={140}
                  value={ptkForm.position}
                  onChange={(e) => setPtkForm({ ...ptkForm, position: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Unit / Jurusan</label>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    value={ptkForm.department}
                    onChange={(e) => setPtkForm({ ...ptkForm, department: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">NIP / NUPTK</label>
                  <input
                    type="text"
                    maxLength={40}
                    value={ptkForm.nipOrNuptk}
                    onChange={(e) => setPtkForm({ ...ptkForm, nipOrNuptk: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Status</label>
                <select
                  value={ptkForm.status}
                  onChange={(e) =>
                    setPtkForm({ ...ptkForm, status: e.target.value as 'active' | 'inactive' })
                  }
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPtkModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  {saving ? 'Menyimpan...' : 'Simpan PTK'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KALENDER AKADEMIK */}
      {calModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">
                {editingCal ? 'Edit Agenda Kalender' : 'Tambah Agenda Akademik'}
              </h3>
              <button type="button" onClick={() => setCalModal(false)} aria-label="Tutup">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSaving(true);
                try {
                  await saveAcademicEvent(currentUser, calForm, editingCal?.id);
                  onNotify('Agenda kalender akademik disimpan.');
                  setCalModal(false);
                } finally {
                  setSaving(false);
                }
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium mb-1">Periode Waktu</label>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    value={calForm.period}
                    onChange={(e) => setCalForm({ ...calForm, period: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    placeholder="Januari – Maret 2027"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Urutan</label>
                  <input
                    type="number"
                    min={0}
                    max={500}
                    required
                    value={calForm.orderIndex}
                    onChange={(e) =>
                      setCalForm({ ...calForm, orderIndex: Number(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Judul Agenda</label>
                <input
                  type="text"
                  required
                  maxLength={180}
                  value={calForm.title}
                  onChange={(e) => setCalForm({ ...calForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Keterangan</label>
                <textarea
                  rows={3}
                  required
                  maxLength={600}
                  value={calForm.description}
                  onChange={(e) => setCalForm({ ...calForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCalModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FAQ */}
      {faqModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">
                {editingFaq ? 'Edit FAQ' : 'Tambah Pertanyaan Umum'}
              </h3>
              <button type="button" onClick={() => setFaqModal(false)} aria-label="Tutup">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSaving(true);
                try {
                  await saveFaqItem(currentUser, faqForm, editingFaq?.id);
                  onNotify('FAQ portal disimpan.');
                  setFaqModal(false);
                } finally {
                  setSaving(false);
                }
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium mb-1">Kategori</label>
                  <input
                    type="text"
                    required
                    maxLength={60}
                    value={faqForm.category}
                    onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Urutan</label>
                  <input
                    type="number"
                    min={0}
                    max={500}
                    required
                    value={faqForm.orderIndex}
                    onChange={(e) =>
                      setFaqForm({ ...faqForm, orderIndex: Number(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Pertanyaan</label>
                <input
                  type="text"
                  required
                  maxLength={240}
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Jawaban</label>
                <textarea
                  rows={4}
                  required
                  minLength={10}
                  maxLength={1000}
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setFaqModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
