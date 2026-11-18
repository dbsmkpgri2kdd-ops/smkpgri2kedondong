import React, { useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import { Activity, ArrowUpRight, Radio, Users, FileText, GraduationCap } from 'lucide-react';
import {
  AnalyticsDaily,
  AnalyticsEvent,
  AuditLog,
  EditorialArticle,
  NewsItem,
  PpdbRegistration,
  PtkMember,
  StudyProgram,
} from '../types/admin';
import { recordLiveAnalyticsEvent } from '../services/firestoreCrud';

interface AnalyticsDashboardProps {
  user: User;
  dailyMetrics: AnalyticsDaily[];
  liveEvents: AnalyticsEvent[];
  auditLogs: AuditLog[];
  news: NewsItem[];
  programs: StudyProgram[];
  articles: EditorialArticle[];
  ptkMembers: PtkMember[];
  ppdbList: PpdbRegistration[];
  onSeedData: () => Promise<void>;
  seeding: boolean;
  onNotify: (msg: string) => void;
}

const ROUTE_LABELS: Record<AnalyticsEvent['route'], string> = {
  beranda: 'Beranda Utama',
  profil: 'Profil Sekolah',
  jurusan: '5 Program Keahlian',
  ppdb: 'SPMB / PPDB Online',
  layanan: 'Cek UKK & PTK',
  literasi: 'Literasi Vokasi',
  media: 'Galeri Media',
  kontak: 'Kontak & FAQ',
};

const ACTION_LABELS: Record<AnalyticsEvent['actionType'], string> = {
  pageview: 'Kunjungan Halaman',
  ppdb_submit: 'Interaksi PPDB',
  ukk_lookup: 'Cek Kelulusan UKK',
  article_read: 'Baca Artikel Vokasi',
};

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  user,
  dailyMetrics,
  liveEvents,
  auditLogs,
  news,
  programs,
  articles,
  ptkMembers,
  ppdbList,
  onSeedData,
  seeding,
  onNotify,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [simRoute, setSimRoute] = useState<AnalyticsEvent['route']>('ppdb');

  const sortedDaily = useMemo(() => {
    return [...dailyMetrics].sort((a, b) => a.dateKey.localeCompare(b.dateKey)).slice(-7);
  }, [dailyMetrics]);

  const totals = useMemo(() => {
    const latest = sortedDaily[sortedDaily.length - 1];
    const prev = sortedDaily[sortedDaily.length - 2];
    const totalPageViews = sortedDaily.reduce((acc, d) => acc + d.pageViews, 0);
    const totalVisitors = sortedDaily.reduce((acc, d) => acc + d.visitors, 0);
    const totalUkk = sortedDaily.reduce((acc, d) => acc + d.ukkChecks, 0);
    const avgDuration =
      sortedDaily.length > 0
        ? Math.round(sortedDaily.reduce((acc, d) => acc + d.avgDurationSec, 0) / sortedDaily.length)
        : 0;
    const deltaPct =
      latest && prev && prev.visitors > 0
        ? Math.round(((latest.visitors - prev.visitors) / prev.visitors) * 100)
        : 0;

    return {
      todayVisitors: latest?.visitors ?? 0,
      todayPageViews: latest?.pageViews ?? 0,
      deltaPct,
      totalPageViews,
      totalVisitors,
      totalUkk,
      avgDuration,
    };
  }, [sortedDaily]);

  const routeDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    liveEvents.forEach((ev) => {
      counts[ev.route] = (counts[ev.route] || 0) + 1;
    });
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const maxCount = entries[0]?.[1] || 1;
    return entries.map(([route, count]) => ({
      route: route as AnalyticsEvent['route'],
      label: ROUTE_LABELS[route as AnalyticsEvent['route']] || route,
      count,
      pct: Math.round((count / Math.max(1, liveEvents.length)) * 100),
      barWidth: Math.max(8, Math.round((count / maxCount) * 100)),
    }));
  }, [liveEvents]);

  const deviceStats = useMemo(() => {
    const map = { Mobile: 0, Desktop: 0, Tablet: 0 };
    liveEvents.forEach((e) => {
      if (e.device in map) map[e.device] += 1;
    });
    const total = Math.max(1, liveEvents.length);
    return [
      { label: 'Mobile', count: map.Mobile, pct: Math.round((map.Mobile / total) * 100) },
      { label: 'Desktop', count: map.Desktop, pct: Math.round((map.Desktop / total) * 100) },
      { label: 'Tablet', count: map.Tablet, pct: Math.round((map.Tablet / total) * 100) },
    ];
  }, [liveEvents]);

  const totalPublishedContent =
    news.filter((n) => n.status === 'published').length +
    programs.filter((p) => p.active).length +
    articles.filter((a) => a.status === 'published').length +
    ptkMembers.filter((p) => p.status === 'active').length;

  const handleSimulateLiveEvent = async () => {
    setSimulating(true);
    try {
      const actionMap: Record<AnalyticsEvent['route'], AnalyticsEvent['actionType']> = {
        ppdb: 'ppdb_submit',
        layanan: 'ukk_lookup',
        literasi: 'article_read',
        beranda: 'pageview',
        profil: 'pageview',
        jurusan: 'pageview',
        media: 'pageview',
        kontak: 'pageview',
      };
      const devices: AnalyticsEvent['device'][] = ['Mobile', 'Desktop', 'Mobile', 'Tablet'];
      const refs = [
        'Google Search',
        'Instagram @smkpgri2kdd',
        'WhatsApp Channel',
        'smkpgri2kedondong.sch.id',
      ];
      const randomDevice = devices[Math.floor(Math.random() * devices.length)];
      const randomRef = refs[Math.floor(Math.random() * refs.length)];
      await recordLiveAnalyticsEvent(
        user,
        simRoute,
        actionMap[simRoute],
        randomDevice,
        randomRef
      );
      onNotify(`Kejadian analitik live pada "${ROUTE_LABELS[simRoute]}" tercatat ke Firestore.`);
    } finally {
      setSimulating(false);
    }
  };

  // SVG Chart Geometry
  const chartW = 680;
  const chartH = 220;
  const padL = 42;
  const padR = 16;
  const padT = 16;
  const padB = 30;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;
  const maxVal = Math.max(100, ...sortedDaily.map((d) => d.pageViews));

  const pointsPv = sortedDaily.map((d, i) => {
    const x =
      sortedDaily.length <= 1 ? padL + plotW / 2 : padL + (i / (sortedDaily.length - 1)) * plotW;
    const y = padT + plotH - (d.pageViews / maxVal) * plotH;
    return { x, y, d };
  });

  const pointsVis = sortedDaily.map((d, i) => {
    const x =
      sortedDaily.length <= 1 ? padL + plotW / 2 : padL + (i / (sortedDaily.length - 1)) * plotW;
    const y = padT + plotH - (d.visitors / maxVal) * plotH;
    return { x, y, d };
  });

  const linePv = pointsPv.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPv =
    pointsPv.length > 0
      ? `M ${pointsPv[0].x},${padT + plotH} ` +
        pointsPv.map((p) => `L ${p.x},${p.y}`).join(' ') +
        ` L ${pointsPv[pointsPv.length - 1].x},${padT + plotH} Z`
      : '';
  const lineVis = pointsVis.map((p) => `${p.x},${p.y}`).join(' ');

  const isEmpty = sortedDaily.length === 0 && news.length === 0 && programs.length === 0;

  if (isEmpty) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
          <Activity className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1.5">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Database Portal SMK PGRI 2 Kedondong Masih Kosong
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Muat data awal resmi portal PRIDA (5 Program Keahlian, Berita, Artikel Literasi, Kalender, PPDB, dan metrik analitik) ke Firestore dalam satu klik. Data PTK utama diambil langsung dari Google Spreadsheet sekolah.
          </p>
        </div>
        <button
          type="button"
          disabled={seeding}
          onClick={onSeedData}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          {seeding ? 'Menginisialisasi Data...' : 'Inisialisasi Data Portal PRIDA'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Control Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-3.5">
        <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
          <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-medium">Sinkronisasi Firestore Real-Time Aktif</span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
          <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
            {liveEvents.length} peristiwa terekam · Durasi rata-rata {Math.floor(totals.avgDuration / 60)}m {totals.avgDuration % 60}d
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <select
            aria-label="Pilih rute untuk simulasi kunjungan"
            value={simRoute}
            onChange={(e) => setSimRoute(e.target.value as AnalyticsEvent['route'])}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(ROUTE_LABELS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={simulating}
            onClick={handleSimulateLiveEvent}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Activity className="w-3.5 h-3.5" />
            {simulating ? 'Mencatat...' : 'Catat Kunjungan Live'}
          </button>
        </div>
      </div>

      {/* 4-Column KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Pengunjung Hari Ini</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {totals.todayVisitors.toLocaleString('id-ID')}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className={totals.deltaPct >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-amber-600 font-medium'}>
              {totals.deltaPct >= 0 ? `+${totals.deltaPct}%` : `${totals.deltaPct}%`}
            </span>
            <span aria-hidden="true">·</span>
            <span>{totals.todayPageViews.toLocaleString('id-ID')} tayangan hari ini</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Tayangan Portal (7 Hari)</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {totals.totalPageViews.toLocaleString('id-ID')}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            {totals.totalVisitors.toLocaleString('id-ID')} sesi unik · {totals.totalUkk} cek UKK
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Pendaftar PPDB Terdata</span>
            <GraduationCap className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {ppdbList.length.toLocaleString('id-ID')}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            {ppdbList.filter((p) => p.status === 'diterima').length} diterima · {ppdbList.filter((p) => p.status === 'menunggu').length} menunggu verifikasi
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Konten Aktif Terbit</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {totalPublishedContent.toLocaleString('id-ID')}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            {programs.length} jurusan · {news.length} berita · {articles.length} artikel
          </div>
        </div>
      </div>

      {/* Main Chart + Channel Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Tren Kunjungan Harian Portal
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Perbandingan tayangan halaman dan pengunjung unik 7 hari terakhir
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-blue-600 inline-block" /> Tayangan Halaman
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-emerald-600 inline-block" /> Pengunjung Unik
              </span>
            </div>
          </div>

          <div className="relative w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full h-56 select-none"
              role="img"
              aria-label="Grafik kunjungan harian portal SMK PGRI 2 Kedondong"
            >
              <defs>
                <linearGradient id="pvAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {[0, 0.25, 0.5, 0.75, 1].map((t) => {
                const y = padT + plotH * (1 - t);
                const val = Math.round(maxVal * t);
                return (
                  <g key={t}>
                    <line
                      x1={padL}
                      y1={y}
                      x2={chartW - padR}
                      y2={y}
                      stroke="currentColor"
                      className="text-slate-200 dark:text-slate-800"
                      strokeWidth="1"
                    />
                    <text
                      x={padL - 8}
                      y={y + 4}
                      textAnchor="end"
                      className="fill-slate-400 text-[10px] font-mono"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {areaPv && <path d={areaPv} fill="url(#pvAreaGrad)" />}
              {linePv && (
                <polyline
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2.25"
                  strokeLinejoin="round"
                  points={linePv}
                />
              )}
              {lineVis && (
                <polyline
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  strokeLinejoin="round"
                  points={lineVis}
                />
              )}

              {pointsPv.map((pt, idx) => (
                <g key={pt.d.dateKey}>
                  <text
                    x={pt.x}
                    y={chartH - 8}
                    textAnchor="middle"
                    className="fill-slate-500 dark:fill-slate-400 text-[10px] font-mono"
                  >
                    {pt.d.dateKey.slice(5)}
                  </text>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredIdx === idx ? 5 : 3.5}
                    className="fill-blue-600 stroke-white dark:stroke-slate-900"
                    strokeWidth="1.5"
                  />
                  {pointsVis[idx] && (
                    <circle
                      cx={pointsVis[idx].x}
                      cy={pointsVis[idx].y}
                      r={hoveredIdx === idx ? 4.5 : 3}
                      className="fill-emerald-600 stroke-white dark:stroke-slate-900"
                      strokeWidth="1.5"
                    />
                  )}
                  <rect
                    x={pt.x - 24}
                    y={padT}
                    width="48"
                    height={plotH}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                </g>
              ))}
            </svg>

            {hoveredIdx !== null && pointsPv[hoveredIdx] && (
              <div className="mt-2 flex flex-wrap items-center gap-4 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-mono tabular-nums">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {pointsPv[hoveredIdx].d.dateKey}
                </span>
                <span className="text-blue-600 dark:text-blue-400">
                  Tayangan: {pointsPv[hoveredIdx].d.pageViews}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  Pengunjung: {pointsPv[hoveredIdx].d.visitors}
                </span>
                <span className="text-slate-600 dark:text-slate-300">
                  Klik PPDB: {pointsPv[hoveredIdx].d.ppdbClicks}
                </span>
                <span className="text-slate-600 dark:text-slate-300">
                  Cek UKK: {pointsPv[hoveredIdx].d.ukkChecks}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Route & Device Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-5">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Halaman Paling Ramai
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Distribusi rute berdasarkan stream peristiwa
            </p>
          </div>

          <div className="space-y-3">
            {routeDistribution.slice(0, 5).map((item) => (
              <div key={item.route} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                    {item.label}
                  </span>
                  <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
                    {item.count} ({item.pct}%)
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-blue-600 dark:bg-blue-500 transition-all"
                    style={{ width: `${item.barWidth}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Proporsi Perangkat Pengunjung
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {deviceStats.map((dev) => (
                <div
                  key={dev.label}
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800"
                >
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{dev.label}</div>
                  <div className="text-sm font-semibold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                    {dev.pct}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Events Stream & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Aliran Kunjungan Real-Time
            </h3>
            <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
              {liveEvents.length} terbaru
            </span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
            {liveEvents.slice(0, 10).map((ev) => (
              <div key={ev.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                    {ACTION_LABELS[ev.actionType] || ev.actionType} — {ROUTE_LABELS[ev.route] || ev.route}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 truncate">
                    {ev.device} · Sumber: {ev.referrer}
                  </div>
                </div>
                <span className="font-mono tabular-nums text-slate-400 shrink-0">
                  {ev.createdAt?.toDate
                    ? ev.createdAt.toDate().toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Baru'}
                </span>
              </div>
            ))}
            {liveEvents.length === 0 && (
              <p className="py-6 text-center text-xs text-slate-500">
                Belum ada aliran peristiwa tercatat.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Jejak Audit Aktivitas Admin
            </h3>
            <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
              {auditLogs.length} log
            </span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
            {auditLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                    {log.actorName} ·{' '}
                    <span className="text-blue-600 dark:text-blue-400 uppercase">{log.action}</span>{' '}
                    di {log.collectionName}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 truncate">{log.targetTitle}</div>
                </div>
                <span className="font-mono tabular-nums text-slate-400 shrink-0">
                  {log.createdAt?.toDate
                    ? log.createdAt.toDate().toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Baru'}
                </span>
              </div>
            ))}
            {auditLogs.length === 0 && (
              <p className="py-6 text-center text-xs text-slate-500">
                Belum ada riwayat perubahan data.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
