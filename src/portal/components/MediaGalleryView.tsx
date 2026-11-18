import React, { useState } from 'react';
import { Clapperboard, ExternalLink, Newspaper, Play, RefreshCw } from 'lucide-react';
import { ADSENSE_CONFIG, SCHOOL_IDENTITY, SCHOOL_NEWS } from '../data/schoolData';
import { extractYouTubeId, isExternalBlockedForIframe } from '../services/schoolApi';
import { PublicSiteIdentity } from '../services/usePortalData';
import { DynamicPortalItem, SchoolNewsItem } from '../types/portal';
import { AdsenseSlot } from './AdsenseSlot';
import { PortalIconBadge } from './PortalIconBadge';

interface MediaGalleryViewProps {
  portalItems: DynamicPortalItem[];
  portalLoading: boolean;
  onRefreshPortal: () => void;
  onOpenExternal: (title: string, url: string) => void;
  news?: SchoolNewsItem[];
  siteIdentity?: PublicSiteIdentity;
}

export const MediaGalleryView: React.FC<MediaGalleryViewProps> = ({
  portalItems,
  portalLoading,
  onRefreshPortal,
  onOpenExternal,
  news = SCHOOL_NEWS,
  siteIdentity,
}) => {
  const [playingVideos, setPlayingVideos] = useState<Record<string, boolean>>({});
  const [failedThumbs, setFailedThumbs] = useState<Record<string, boolean>>({});

  const socialUrls = siteIdentity?.social || SCHOOL_IDENTITY.social;
  const officialSocials = [
    {
      title: 'Instagram Resmi (@smkpgri2kdd)',
      subtitle: 'Foto kegiatan siswa & info cepat',
      url: socialUrls.instagram,
      icon: 'fa-brands fa-instagram',
    },
    {
      title: 'Saluran WhatsApp Sekolah',
      subtitle: 'Siaran pengumuman resmi sekolah',
      url: socialUrls.whatsapp,
      icon: 'fa-brands fa-whatsapp',
    },
    {
      title: 'TikTok (@smkpgri2kdd)',
      subtitle: 'Video pendek aktivitas jurusan',
      url: socialUrls.tiktok,
      icon: 'fa-brands fa-tiktok',
    },
    {
      title: 'Facebook SMK PGRI 2 Kedondong',
      subtitle: 'Komunitas wali murid & alumni',
      url: socialUrls.facebook,
      icon: 'fa-brands fa-facebook-f',
    },
  ];

  const mediaLinks = portalItems.filter(
    (item) => item.SectionID?.toLowerCase().trim() === 'media'
  );

  const videoItems = portalItems.filter(
    (item) => item.Thumbnail && item.Thumbnail.startsWith('http')
  );

  const handleOpenLink = (item: DynamicPortalItem) => {
    const targetUrl = item.Url || item.URL || item.url;
    if (!targetUrl) return;
    if (isExternalBlockedForIframe(targetUrl)) {
      const a = document.createElement('a');
      a.href = targetUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.click();
    } else {
      onOpenExternal(item.Title, targetUrl);
    }
  };

  return (
    <div className="bg-white">
      {/* Page Header */}
      <section className="border-b border-slate-200 bg-slate-50 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-wider text-blue-700 uppercase">
            Publikasi, Kanal Sosial &amp; Video
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Media &amp; Dokumentasi Sekolah
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
            Direktori kanal media resmi sekolah dari basis data spreadsheet beserta dokumentasi
            video kegiatan dan warta SMK PGRI 2 Kedondong.
          </p>
        </div>
      </section>

      {/* Spreadsheet Media Channels + Official Channels */}
      <section className="py-12 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-950">
                Kanal Media &amp; Publikasi Digital
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Menampilkan ikon/logo setiap kanal media yang terdaftar pada spreadsheet sekolah
              </p>
            </div>
            <button
              type="button"
              onClick={onRefreshPortal}
              title="Muat ulang kanal media"
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            >
              <RefreshCw className={`h-4 w-4 ${portalLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Dynamic Spreadsheet Media Items */}
          {portalLoading && mediaLinks.length === 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-20 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
                />
              ))}
            </div>
          ) : mediaLinks.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mediaLinks.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleOpenLink(item)}
                  className="group flex cursor-pointer items-center justify-between gap-3.5 rounded-xl border border-slate-200 bg-white p-4 text-left transition-colors duration-150 hover:border-blue-300 hover:bg-slate-50"
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    <PortalIconBadge
                      icon={item.Icon}
                      logo={item.Logo}
                      sectionId="media"
                      altTitle={item.Title}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-500">Media Sekolah</p>
                      <p className="mt-0.5 truncate font-display text-sm font-bold text-slate-950 group-hover:text-blue-700">
                        {item.Title}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-blue-700" />
                </button>
              ))}
            </div>
          ) : null}

          {/* Official Institutional Social Channels */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {officialSocials.map((social) => (
              <a
                key={social.title}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition-colors hover:border-blue-300 hover:bg-white"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <PortalIconBadge
                    icon={social.icon}
                    sectionId="media"
                    altTitle={social.title}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-bold text-slate-950 group-hover:text-blue-700">
                      {social.title}
                    </p>
                    <p className="truncate text-xs text-slate-500">{social.subtitle}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Video Documentation Gallery */}
      <section className="border-t border-slate-200 bg-slate-50 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <Clapperboard className="h-5 w-5 text-blue-700" />
            <div>
              <h2 className="font-display text-xl font-bold text-slate-950">
                Galeri Video Dokumentasi Kegiatan
              </h2>
              <p className="text-xs text-slate-500">
                Video profil sekolah, praktik bengkel, dan dokumentasi acara SMK PGRI 2 Kedondong
              </p>
            </div>
          </div>

          {videoItems.length > 0 ? (
            <div className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {videoItems.map((video) => {
                const videoUrl = video.Url || video.URL || video.url || '';
                const videoId = extractYouTubeId(videoUrl);
                const isPlaying = playingVideos[video.id];
                const thumbBroken = failedThumbs[video.id];

                return (
                  <article
                    key={video.id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                  >
                    <div className="relative aspect-video bg-slate-900">
                      {isPlaying && videoId ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                          title={video.Title}
                          allow="autoplay; encrypted-media; picture-in-picture"
                          allowFullScreen
                          className="h-full w-full border-0"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (videoId) {
                              setPlayingVideos((prev) => ({ ...prev, [video.id]: true }));
                            } else if (videoUrl) {
                              handleOpenLink(video);
                            }
                          }}
                          aria-label={`Putar video ${video.Title}`}
                          className="group relative flex h-full w-full cursor-pointer items-center justify-center"
                        >
                          {!thumbBroken && video.Thumbnail ? (
                            <img
                              src={video.Thumbnail}
                              alt={video.Title}
                              referrerPolicy="no-referrer"
                              onError={() =>
                                setFailedThumbs((prev) => ({ ...prev, [video.id]: true }))
                              }
                              className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
                            />
                          ) : (
                            <div className="h-full w-full bg-slate-800" />
                          )}
                          <span className="absolute flex h-12 w-12 items-center justify-center rounded-full bg-blue-700 text-white transition-transform group-hover:scale-105">
                            <Play className="ml-0.5 h-5 w-5" />
                          </span>
                        </button>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-display text-sm font-bold text-slate-900">
                        {video.Title}
                      </h3>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              Galeri video sedang disinkronkan dari basis data dokumentasi sekolah. Anda juga dapat
              menyaksikan liputan kegiatan terbaru melalui Instagram dan TikTok resmi sekolah.
            </div>
          )}
        </div>
      </section>

      {/* Posisi Iklan Halaman Media & Dokumentasi */}
      <AdsenseSlot
        slotId={ADSENSE_CONFIG.slots.mediaGalleryBanner}
        className="border-t border-slate-200 bg-white py-6"
      />

      {/* School News Archive */}
      <section className="border-t border-slate-200 bg-white py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-blue-700 uppercase">
            <Newspaper className="h-4 w-4" />
            Warta &amp; Agenda Sekolah
          </div>
          <h2 className="mt-2 font-display text-xl font-bold text-slate-950">
            Siaran Informasi &amp; Pengumuman Terbaru
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            {news.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-5"
              >
                <p className="text-xs text-slate-500">
                  <span className="font-semibold text-blue-700">{item.category}</span>
                  {' · '}
                  {item.date}
                </p>
                <h3 className="mt-2 font-display text-base font-bold leading-snug text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.summary}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
