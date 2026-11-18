import React, { useState } from 'react';
import {
  BookOpen,
  Clapperboard,
  Gamepad2,
  Globe,
  Instagram,
  MessageCircle,
  Share2,
  Video,
} from 'lucide-react';

interface PortalIconBadgeProps {
  icon?: string;
  logo?: string;
  sectionId?: string;
  altTitle: string;
}

export const PortalIconBadge: React.FC<PortalIconBadgeProps> = ({
  icon,
  logo,
  sectionId,
  altTitle,
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  const rawVisual = (logo || icon || '').trim();
  const lowerVisual = rawVisual.toLowerCase();
  const isImageUrl =
    rawVisual.startsWith('http://') ||
    rawVisual.startsWith('https://') ||
    rawVisual.startsWith('/') ||
    rawVisual.startsWith('data:image/');

  const sec = (sectionId || '').toLowerCase().trim();

  const toneClass =
    sec === 'game'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/70'
      : sec === 'media'
        ? 'bg-sky-50 text-sky-700 border-sky-200/70'
        : 'bg-blue-50 text-blue-700 border-blue-200/70';

  if (isImageUrl && !imgFailed) {
    return (
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-white p-1.5 ${toneClass}`}
      >
        <img
          src={rawVisual}
          alt={`Ikon ${altTitle}`}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="h-full w-full object-contain"
        />
      </span>
    );
  }

  let FallbackIcon = Globe;
  if (lowerVisual.includes('instagram')) {
    FallbackIcon = Instagram;
  } else if (lowerVisual.includes('whatsapp')) {
    FallbackIcon = MessageCircle;
  } else if (lowerVisual.includes('tiktok')) {
    FallbackIcon = Video;
  } else if (lowerVisual.includes('facebook')) {
    FallbackIcon = Share2;
  } else if (sec === 'game') {
    FallbackIcon = Gamepad2;
  } else if (sec === 'media') {
    FallbackIcon = Clapperboard;
  } else if (sec === 'literasi') {
    FallbackIcon = BookOpen;
  }

  return (
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${toneClass}`}
    >
      <FallbackIcon className="h-5 w-5" />
    </span>
  );
};
