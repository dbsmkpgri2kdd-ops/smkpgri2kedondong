import React from 'react';
import { SCHOOL_IDENTITY, withBase } from '../data/schoolData';
import { PublicSiteIdentity } from '../services/usePortalData';
import { PortalRoute } from '../types/portal';

interface PortalFooterProps {
  onNavigate: (route: PortalRoute, sectionId?: string) => void;
  onOpenAdmin: () => void;
  siteIdentity?: PublicSiteIdentity;
}

export const PortalFooter: React.FC<PortalFooterProps> = ({
  onNavigate,
  onOpenAdmin,
  siteIdentity,
}) => {
  const identity = siteIdentity || {
    ...SCHOOL_IDENTITY,
    social: SCHOOL_IDENTITY.social,
  };

  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Institutional Identity */}
          <div className="space-y-3">
            <h2 className="font-display text-base font-bold text-white">
              {identity.name}
            </h2>
            <p className="text-xs leading-relaxed text-slate-400">
              Satuan Pendidikan Menengah Kejuruan di bawah naungan YPLP-PGRI ·
              NPSN <span className="font-mono text-slate-200">{identity.npsn}</span>
            </p>
            <p className="text-xs leading-relaxed text-slate-400">
              {identity.address}
            </p>
            <p className="text-xs text-slate-400">
              Email:{' '}
              <a
                href={`mailto:${identity.email}`}
                className="text-slate-200 underline decoration-slate-600 underline-offset-2 hover:text-white"
              >
                {identity.email}
              </a>
            </p>
          </div>

          {/* Column 2: Portal Navigation */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wider text-white uppercase">
              Navigasi Portal
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={withBase('')}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('beranda');
                  }}
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Beranda Utama
                </a>
              </li>
              <li>
                <a
                  href={withBase('profil')}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('profil');
                  }}
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Profil, Visi Misi &amp; Fasilitas
                </a>
              </li>
              <li>
                <a
                  href={withBase('jurusan')}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('jurusan');
                  }}
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  5 Program Keahlian
                </a>
              </li>
              <li>
                <a
                  href={withBase('ppdb')}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('ppdb');
                  }}
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  PPDB / SPMB Online
                </a>
              </li>
              <li>
                <a
                  href={withBase('layanan')}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('layanan');
                  }}
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Layanan Akademik &amp; UKK
                </a>
              </li>
              <li>
                <a
                  href={withBase('literasi')}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('literasi');
                  }}
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Sumber Literasi Digital
                </a>
              </li>
              <li>
                <a
                  href={withBase('media')}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('media');
                  }}
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Media &amp; Dokumentasi
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & AdSense Compliance */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wider text-white uppercase">
              Informasi &amp; Kepatuhan
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={withBase('tentang-kami.html')}
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Tentang Lembaga
                </a>
              </li>
              <li>
                <a
                  href={withBase('kebijakan-privasi.html')}
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Kebijakan Privasi
                </a>
              </li>
              <li>
                <a
                  href={withBase('ketentuan-layanan.html')}
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Ketentuan Layanan
                </a>
              </li>
              <li>
                <a
                  href={withBase('kontak')}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('kontak', 'kontak-kami');
                  }}
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Hubungi Kami &amp; FAQ
                </a>
              </li>
              <li>
                <a
                  href={withBase('peta-situs.html')}
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Peta Situs Portal
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="cursor-pointer text-left text-blue-300 transition-colors hover:text-white"
                >
                  Panel Admin PRIDA
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Official Social Channels */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wider text-white uppercase">
              Kanal Resmi Sekolah
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={identity.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Instagram (@smkpgri2kdd)
                </a>
              </li>
              <li>
                <a
                  href={identity.social.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Saluran WhatsApp Resmi
                </a>
              </li>
              <li>
                <a
                  href={identity.social.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  TikTok (@smkpgri2kdd)
                </a>
              </li>
              <li>
                <a
                  href={identity.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Facebook Sekolah
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-slate-800 pt-8 text-xs text-slate-400 sm:flex-row sm:items-center">
          <p>
            &copy; 2026 {identity.name} · Portal Digital Sekolah (PRIDA)
          </p>
          <p className="font-mono text-slate-500">smkpgri2kedondong.sch.id</p>
        </div>
      </div>
    </footer>
  );
};
