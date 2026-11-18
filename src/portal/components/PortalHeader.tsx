import React, { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  ChevronDown,
  GraduationCap,
  Lock,
  Mail,
  Menu,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { withBase } from '../data/schoolData';
import { PortalRoute } from '../types/portal';
import { ServiceTab } from './ServicesSection';

export type ServiceSubTab = ServiceTab;

interface PortalHeaderProps {
  activeRoute: PortalRoute;
  onNavigate: (route: PortalRoute, sectionId?: string) => void;
  onSelectService: (tab: ServiceSubTab) => void;
  onOpenAdmin: () => void;
  schoolName?: string;
}

type OpenDropdown = 'profil' | 'layanan' | null;

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  activeRoute,
  onNavigate,
  onSelectService,
  onOpenAdmin,
  schoolName = 'SMK PGRI 2 Kedondong',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);
  const [logoError, setLogoError] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenDropdown(null);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const handleLinkClick = (route: PortalRoute, anchor?: string) => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
    onNavigate(route, anchor);
  };

  const handleServiceClick = (tab: ServiceSubTab) => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
    onSelectService(tab);
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single-line Institutional Wordmark */}
        <a
          href={withBase('')}
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('beranda');
          }}
          className="flex shrink-0 items-center gap-3 whitespace-nowrap text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          {!logoError ? (
            <img
              src={withBase('logo-sekolah.png')}
              alt={`Logo ${schoolName}`}
              referrerPolicy="no-referrer"
              onError={() => setLogoError(true)}
              className="h-9 w-9 shrink-0 object-contain"
            />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
              P2
            </span>
          )}
          <span className="font-display text-base font-bold tracking-tight whitespace-nowrap sm:text-lg">
            {schoolName}
          </span>
        </a>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label="Navigasi Utama"
          className="hidden items-center gap-5 lg:flex"
        >
          <a
            href={withBase('')}
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('beranda');
            }}
            className={`whitespace-nowrap shrink-0 border-b-2 py-1 text-sm font-medium transition-colors duration-150 ${
              activeRoute === 'beranda'
                ? 'border-blue-700 text-slate-950'
                : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-950'
            }`}
          >
            Beranda
          </a>

          {/* Profil Dropdown */}
          <div className="relative">
            <button
              type="button"
              aria-expanded={openDropdown === 'profil'}
              aria-haspopup="menu"
              onClick={() =>
                setOpenDropdown((prev) => (prev === 'profil' ? null : 'profil'))
              }
              className={`inline-flex cursor-pointer items-center gap-1 whitespace-nowrap shrink-0 border-b-2 py-1 text-sm font-medium transition-colors duration-150 ${
                activeRoute === 'profil' || activeRoute === 'kontak'
                  ? 'border-blue-700 text-slate-950'
                  : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-950'
              }`}
            >
              Profil
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-150 ${
                  openDropdown === 'profil' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openDropdown === 'profil' && (
              <div
                role="menu"
                className="absolute top-full left-0 mt-3 w-76 rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleLinkClick('profil')}
                  className="flex w-full cursor-pointer items-start gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-slate-50"
                >
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Profil, Visi Misi &amp; Fasilitas
                    </p>
                    <p className="text-xs text-slate-500">
                      Sejarah 2003, bengkel praktik, ekskul &amp; DUDI
                    </p>
                  </div>
                </button>
                <a
                  href={withBase('tentang-kami.html')}
                  role="menuitem"
                  onClick={() => setOpenDropdown(null)}
                  className="flex w-full items-start gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-slate-50"
                >
                  <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Tentang Lembaga (Statis)
                    </p>
                    <p className="text-xs text-slate-500">
                      Ringkasan legalitas &amp; NPSN 10811003
                    </p>
                  </div>
                </a>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleLinkClick('kontak')}
                  className="flex w-full cursor-pointer items-start gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-slate-50"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Hubungi Kami &amp; FAQ
                    </p>
                    <p className="text-xs text-slate-500">
                      Alamat Jl. Tritura &amp; formulir pengaduan/info
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>

          <a
            href={withBase('jurusan')}
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('jurusan');
            }}
            className={`whitespace-nowrap shrink-0 border-b-2 py-1 text-sm font-medium transition-colors duration-150 ${
              activeRoute === 'jurusan'
                ? 'border-blue-700 text-slate-950'
                : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-950'
            }`}
          >
            Program Keahlian
          </a>

          {/* Layanan Dropdown */}
          <div className="relative">
            <button
              type="button"
              aria-expanded={openDropdown === 'layanan'}
              aria-haspopup="menu"
              onClick={() =>
                setOpenDropdown((prev) => (prev === 'layanan' ? null : 'layanan'))
              }
              className={`inline-flex cursor-pointer items-center gap-1 whitespace-nowrap shrink-0 border-b-2 py-1 text-sm font-medium transition-colors duration-150 ${
                activeRoute === 'layanan' || activeRoute === 'ppdb'
                  ? 'border-blue-700 text-slate-950'
                  : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-950'
              }`}
            >
              Layanan
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-150 ${
                  openDropdown === 'layanan' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openDropdown === 'layanan' && (
              <div
                role="menu"
                className="absolute top-full left-0 mt-3 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleLinkClick('ppdb')}
                  className="flex w-full cursor-pointer items-start gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-slate-50"
                >
                  <UserPlus className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      PPDB / SPMB Online
                    </p>
                    <p className="text-xs text-slate-500">
                      Pendaftaran peserta didik baru &amp; syarat berkas
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleServiceClick('ukk')}
                  className="flex w-full cursor-pointer items-start gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-slate-50"
                >
                  <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Pengumuman Kelulusan UKK
                    </p>
                    <p className="text-xs text-slate-500">
                      Cek status Uji Kompetensi Keahlian siswa
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleServiceClick('ptk')}
                  className="flex w-full cursor-pointer items-start gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-slate-50"
                >
                  <Users className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Direktori PTK &amp; Guru
                    </p>
                    <p className="text-xs text-slate-500">
                      Daftar pendidik &amp; tenaga kependidikan
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleServiceClick('tracer')}
                  className="flex w-full cursor-pointer items-start gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-slate-50"
                >
                  <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Tracer Alumni &amp; BKK
                    </p>
                    <p className="text-xs text-slate-500">
                      Penelusuran lulusan &amp; penyaluran kerja
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleServiceClick('kalender')}
                  className="flex w-full cursor-pointer items-start gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-slate-50"
                >
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Kalender Akademik &amp; Dokumen
                    </p>
                    <p className="text-xs text-slate-500">
                      Agenda PKL, asesmen, dan pedoman sekolah
                    </p>
                  </div>
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleServiceClick('portal')}
                  className="flex w-full cursor-pointer items-start gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-slate-50"
                >
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Portal Layanan Warga Sekolah
                    </p>
                    <p className="text-xs text-slate-500">
                      Akses tautan operasional internal
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Dedicated Link: Sumber Literasi Digital */}
          <a
            href={withBase('literasi')}
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('literasi');
            }}
            className={`whitespace-nowrap shrink-0 border-b-2 py-1 text-sm font-medium transition-colors duration-150 ${
              activeRoute === 'literasi'
                ? 'border-blue-700 text-slate-950'
                : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-950'
            }`}
          >
            Literasi Digital
          </a>

          {/* Dedicated Link: Media & Dokumentasi */}
          <a
            href={withBase('media')}
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('media');
            }}
            className={`whitespace-nowrap shrink-0 border-b-2 py-1 text-sm font-medium transition-colors duration-150 ${
              activeRoute === 'media'
                ? 'border-blue-700 text-slate-950'
                : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-950'
            }`}
          >
            Media &amp; Dokumentasi
          </a>
        </nav>

        {/* Zone 3: Primary Actions + Mobile Drawer Trigger */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onOpenAdmin}
            className="hidden whitespace-nowrap shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-950 sm:inline-flex"
          >
            <Lock className="h-3.5 w-3.5 text-slate-500" />
            Panel Admin
          </button>

          <button
            type="button"
            onClick={() => handleLinkClick('ppdb')}
            className="hidden whitespace-nowrap shrink-0 cursor-pointer rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:inline-flex"
          >
            PPDB Online
          </button>

          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition-colors hover:bg-slate-100 lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Structured Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="max-h-[82vh] overflow-y-auto border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
          <nav aria-label="Navigasi Seluler" className="space-y-4">
            <div>
              <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Halaman Utama
              </p>
              <div className="mt-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => handleLinkClick('beranda')}
                  className="flex min-h-[44px] w-full items-center rounded-lg px-3 text-left text-sm font-medium text-slate-800 hover:bg-slate-100"
                >
                  Beranda
                </button>
                <button
                  type="button"
                  onClick={() => handleLinkClick('profil')}
                  className="flex min-h-[44px] w-full items-center rounded-lg px-3 text-left text-sm font-medium text-slate-800 hover:bg-slate-100"
                >
                  Profil, Visi Misi &amp; Fasilitas
                </button>
                <button
                  type="button"
                  onClick={() => handleLinkClick('jurusan')}
                  className="flex min-h-[44px] w-full items-center rounded-lg px-3 text-left text-sm font-medium text-slate-800 hover:bg-slate-100"
                >
                  5 Program Keahlian
                </button>
                <button
                  type="button"
                  onClick={() => handleLinkClick('literasi')}
                  className="flex min-h-[44px] w-full items-center rounded-lg px-3 text-left text-sm font-medium text-slate-800 hover:bg-slate-100"
                >
                  Sumber Literasi Digital
                </button>
                <button
                  type="button"
                  onClick={() => handleLinkClick('media')}
                  className="flex min-h-[44px] w-full items-center rounded-lg px-3 text-left text-sm font-medium text-slate-800 hover:bg-slate-100"
                >
                  Media &amp; Dokumentasi
                </button>
                <button
                  type="button"
                  onClick={() => handleLinkClick('kontak')}
                  className="flex min-h-[44px] w-full items-center rounded-lg px-3 text-left text-sm font-medium text-slate-800 hover:bg-slate-100"
                >
                  Hubungi Kami &amp; FAQ
                </button>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Layanan Sekolah
              </p>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleServiceClick('ukk')}
                  className="flex min-h-[44px] items-center rounded-lg border border-slate-200 px-3 text-left text-xs font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Pengumuman UKK
                </button>
                <button
                  type="button"
                  onClick={() => handleServiceClick('ptk')}
                  className="flex min-h-[44px] items-center rounded-lg border border-slate-200 px-3 text-left text-xs font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Direktori PTK
                </button>
                <button
                  type="button"
                  onClick={() => handleServiceClick('tracer')}
                  className="flex min-h-[44px] items-center rounded-lg border border-slate-200 px-3 text-left text-xs font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Tracer Alumni
                </button>
                <button
                  type="button"
                  onClick={() => handleServiceClick('kalender')}
                  className="flex min-h-[44px] items-center rounded-lg border border-slate-200 px-3 text-left text-xs font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Kalender &amp; Dokumen
                </button>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => handleLinkClick('ppdb')}
                className="flex min-h-[44px] w-full items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Pendaftaran PPDB Online
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                <Lock className="h-4 w-4 text-slate-500" />
                Masuk Panel Admin
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
