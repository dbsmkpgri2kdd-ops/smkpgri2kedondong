import { useCallback, useEffect, useState } from 'react';
import {
  collection,
  doc,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Unsubscribe,
  where,
} from 'firebase/firestore';
import {
  db,
  generateSafeDocId,
  handleFirestoreError,
  OperationType,
} from '../../firebase';
import {
  AcademicEvent as AdminAcademicEvent,
  AnalyticsEvent as AdminAnalyticsEvent,
  EditorialArticle as AdminEditorialArticle,
  FaqItem as AdminFaqItem,
  NewsItem as AdminNewsItem,
  PtkMember as AdminPtkMember,
  SiteSettings as AdminSiteSettings,
  StudyProgram as AdminStudyProgram,
} from '../../types/admin';
import {
  ACADEMIC_CALENDAR,
  EDITORIAL_ARTICLES,
  FAQ_ITEMS,
  HERO_MEDIA,
  resolveAssetUrl,
  SCHOOL_IDENTITY,
  SCHOOL_NEWS,
  STUDY_PROGRAMS,
  VISION_MISSION,
} from '../data/schoolData';
import {
  AcademicEvent,
  EditorialArticle,
  FaqEntry,
  PortalRoute,
  PtkMember,
  SchoolNewsItem,
  StudyProgram,
} from '../types/portal';

export interface PublicSiteIdentity {
  name: string;
  officialName: string;
  shortName: string;
  npsn: string;
  address: string;
  hours: string;
  email: string;
  domain: string;
  vision: string;
  missions: string[];
  principalGreeting: string;
  principalClosing: string;
  ppdbOpen: boolean;
  ppdbWaveLabel: string;
  announcementBanner: string;
  social: {
    instagram: string;
    facebook: string;
    whatsapp: string;
    tiktok: string;
  };
}

export interface PublicPpdbInput {
  fullName: string;
  nisn: string;
  originSchool: string;
  programCode: 'TKR' | 'TSM' | 'TKJ' | 'TAV' | 'BD';
  choice2?: string;
  whatsapp: string;
}

export interface PublicAlumniTracerInput {
  fullName: string;
  graduationYear: string;
  programCode: 'TKR' | 'TSM' | 'TKJ' | 'TAV' | 'BD';
  activityStatus:
    | 'Bekerja di Industri'
    | 'Wirausaha Mandiri'
    | 'Melanjutkan Kuliah'
    | 'Mencari Pekerjaan';
  institution: string;
  whatsapp?: string;
}

export interface PublicContactInput {
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
}

const DEFAULT_IDENTITY: PublicSiteIdentity = {
  name: SCHOOL_IDENTITY.name,
  officialName: SCHOOL_IDENTITY.officialName,
  shortName: SCHOOL_IDENTITY.shortName,
  npsn: SCHOOL_IDENTITY.npsn,
  address: SCHOOL_IDENTITY.address,
  hours: SCHOOL_IDENTITY.hours,
  email: SCHOOL_IDENTITY.email,
  domain: SCHOOL_IDENTITY.domain,
  vision: VISION_MISSION.vision,
  missions: VISION_MISSION.missions,
  principalGreeting: VISION_MISSION.principalNote.greeting,
  principalClosing: VISION_MISSION.principalNote.closing,
  ppdbOpen: true,
  ppdbWaveLabel: 'Tahun Pelajaran 2026/2027',
  announcementBanner: '',
  social: { ...SCHOOL_IDENTITY.social },
};

function detectDevice(): AdminAnalyticsEvent['device'] {
  if (typeof window === 'undefined') return 'Desktop';
  const w = window.innerWidth;
  if (w < 640) return 'Mobile';
  if (w < 1024) return 'Tablet';
  return 'Desktop';
}

function getSafeReferrer(): string {
  if (typeof document === 'undefined' || !document.referrer) return 'Direct';
  try {
    const url = new URL(document.referrer);
    if (url.hostname === window.location.hostname) return 'Internal';
    return url.hostname.slice(0, 120);
  } catch {
    return 'Direct';
  }
}

export function usePortalData() {
  const [siteIdentity, setSiteIdentity] = useState<PublicSiteIdentity>(DEFAULT_IDENTITY);
  const [programs, setPrograms] = useState<StudyProgram[]>(STUDY_PROGRAMS);
  const [news, setNews] = useState<SchoolNewsItem[]>(SCHOOL_NEWS);
  const [articles, setArticles] = useState<EditorialArticle[]>(EDITORIAL_ARTICLES);
  const [ptkMembers, setPtkMembers] = useState<PtkMember[]>([]);
  const [academicEvents, setAcademicEvents] = useState<AcademicEvent[]>(ACADEMIC_CALENDAR);
  const [faqs, setFaqs] = useState<FaqEntry[]>(FAQ_ITEMS);

  useEffect(() => {
    const unsubs: Unsubscribe[] = [];

    // 1. Site Settings (schoolName >= '' satisfies resource.data.schoolName is string rule)
    unsubs.push(
      onSnapshot(
        query(collection(db, 'site_settings'), where('schoolName', '>=', ''), limit(1)),
        (snap) => {
          if (snap.empty) return;
          const d = snap.docs[0].data() as AdminSiteSettings;
          setSiteIdentity({
            name: d.schoolName || DEFAULT_IDENTITY.name,
            officialName: d.schoolName ? `SMKS ${d.schoolName.replace(/^SMK\s+/i, '')}` : DEFAULT_IDENTITY.officialName,
            shortName: d.shortName || DEFAULT_IDENTITY.shortName,
            npsn: d.npsn || DEFAULT_IDENTITY.npsn,
            address: d.address || DEFAULT_IDENTITY.address,
            hours: d.hours || DEFAULT_IDENTITY.hours,
            email: d.email || DEFAULT_IDENTITY.email,
            domain: d.domain || DEFAULT_IDENTITY.domain,
            vision: d.vision || DEFAULT_IDENTITY.vision,
            missions: Array.isArray(d.missions) && d.missions.length > 0 ? d.missions : DEFAULT_IDENTITY.missions,
            principalGreeting: d.principalGreeting || DEFAULT_IDENTITY.principalGreeting,
            principalClosing: d.principalClosing || DEFAULT_IDENTITY.principalClosing,
            ppdbOpen: typeof d.ppdbOpen === 'boolean' ? d.ppdbOpen : true,
            ppdbWaveLabel: d.ppdbWaveLabel || DEFAULT_IDENTITY.ppdbWaveLabel,
            announcementBanner: d.announcementBanner || '',
            social: {
              instagram: d.instagramUrl || DEFAULT_IDENTITY.social.instagram,
              tiktok: d.tiktokUrl || DEFAULT_IDENTITY.social.tiktok,
              whatsapp: d.whatsappUrl || DEFAULT_IDENTITY.social.whatsapp,
              facebook: DEFAULT_IDENTITY.social.facebook,
            },
          });
        },
        () => {
          // Graceful fallback to static defaults if unseeded
        }
      )
    );

    // 2. Programs (active == true)
    unsubs.push(
      onSnapshot(
        query(collection(db, 'programs'), where('active', '==', true), limit(20)),
        (snap) => {
          if (snap.empty) return;
          const mapped: StudyProgram[] = snap.docs.map((docSnap) => {
            const p = docSnap.data() as AdminStudyProgram;
            const fallbackImg =
              p.category === 'rekayasa'
                ? HERO_MEDIA.automotiveLab
                : p.category === 'bisnis'
                  ? HERO_MEDIA.networkLab
                  : HERO_MEDIA.electronicsStudio;
            return {
              code: p.code,
              name: p.name,
              category: p.category,
              categoryLabel: p.categoryLabel,
              summary: p.summary,
              competencies: p.competencies || [],
              careers: p.careers || [],
              certification: p.certification,
              image: resolveAssetUrl(p.imageUrl) || fallbackImg,
            };
          });
          const order = ['TKR', 'TSM', 'TKJ', 'TAV', 'BD'];
          mapped.sort((a, b) => {
            const ia = order.indexOf(a.code);
            const ib = order.indexOf(b.code);
            return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
          });
          setPrograms(mapped);
        },
        () => {}
      )
    );

    // 3. News (status == 'published')
    unsubs.push(
      onSnapshot(
        query(collection(db, 'news'), where('status', '==', 'published'), limit(24)),
        (snap) => {
          if (snap.empty) return;
          const docs = snap.docs
            .map((docSnap) => ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<AdminNewsItem, 'id'>),
            }))
            .sort((a, b) => {
              const ta = a.createdAt?.toMillis?.() ?? 0;
              const tb = b.createdAt?.toMillis?.() ?? 0;
              return tb - ta;
            });
          setNews(
            docs.map((n) => ({
              id: n.id,
              date: n.dateLabel,
              category: n.category,
              title: n.title,
              summary: n.summary,
              image: resolveAssetUrl(n.imageUrl) || HERO_MEDIA.campus,
            }))
          );
        },
        () => {}
      )
    );

    // 4. Articles (status == 'published')
    unsubs.push(
      onSnapshot(
        query(collection(db, 'articles'), where('status', '==', 'published'), limit(24)),
        (snap) => {
          if (snap.empty) return;
          const docs = snap.docs
            .map((docSnap) => ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<AdminEditorialArticle, 'id'>),
            }))
            .sort((a, b) => {
              const ta = a.createdAt?.toMillis?.() ?? 0;
              const tb = b.createdAt?.toMillis?.() ?? 0;
              return tb - ta;
            });
          setArticles(
            docs.map((a) => ({
              id: a.id,
              slug: a.slug,
              title: a.title,
              category: a.category,
              author: a.author,
              publishedAt: a.publishedAtLabel,
              readTime: a.readTime,
              excerpt: a.excerpt,
              paragraphs: a.paragraphs || [],
              keyTakeaways: a.keyTakeaways || [],
            }))
          );
        },
        () => {}
      )
    );

    // 5. PTK Members (status == 'active')
    unsubs.push(
      onSnapshot(
        query(collection(db, 'ptk_members'), where('status', '==', 'active'), limit(100)),
        (snap) => {
          if (snap.empty) {
            setPtkMembers([]);
            return;
          }
          setPtkMembers(
            snap.docs.map((docSnap) => {
              const m = docSnap.data() as AdminPtkMember;
              return {
                Nama: m.name,
                Jabatan: m.department ? `${m.position} · ${m.department}` : m.position,
              };
            })
          );
        },
        () => {}
      )
    );

    // 6. Academic Events (orderIndex >= 0)
    unsubs.push(
      onSnapshot(
        query(collection(db, 'academic_events'), where('orderIndex', '>=', 0), limit(30)),
        (snap) => {
          if (snap.empty) return;
          const docs = snap.docs
            .map((docSnap) => docSnap.data() as AdminAcademicEvent)
            .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
          setAcademicEvents(
            docs.map((e) => ({
              period: e.period,
              title: e.title,
              description: e.description,
            }))
          );
        },
        () => {}
      )
    );

    // 7. FAQs (orderIndex >= 0)
    unsubs.push(
      onSnapshot(
        query(collection(db, 'faqs'), where('orderIndex', '>=', 0), limit(30)),
        (snap) => {
          if (snap.empty) return;
          const docs = snap.docs
            .map((docSnap) => docSnap.data() as AdminFaqItem)
            .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
          setFaqs(
            docs.map((f) => ({
              question: f.question,
              answer: f.answer,
            }))
          );
        },
        () => {}
      )
    );

    return () => {
      unsubs.forEach((u) => u());
    };
  }, []);

  const trackPublicEvent = useCallback(
    async (
      route: PortalRoute,
      actionType: AdminAnalyticsEvent['actionType'] = 'pageview'
    ): Promise<void> => {
      // Deduplicate pageviews per route per browser session to conserve Spark tier writes
      if (actionType === 'pageview') {
        try {
          const key = `prida_pv_${route}`;
          if (sessionStorage.getItem(key)) return;
          sessionStorage.setItem(key, '1');
        } catch {
          // Ignore sessionStorage restriction
        }
      }

      const evtId = generateSafeDocId('pub');
      try {
        await setDoc(doc(db, 'analytics_events', evtId), {
          route,
          actionType,
          device: detectDevice(),
          referrer: getSafeReferrer(),
          ownerId: 'public_visitor',
          createdAt: serverTimestamp(),
        });
      } catch {
        // Non-blocking telemetry: do not disrupt public visitor browsing
      }
    },
    []
  );

  const submitPublicPpdb = useCallback(
    async (input: PublicPpdbInput): Promise<void> => {
      const regId = generateSafeDocId('ppdb');
      const path = `ppdb_registrations/${regId}`;
      const validCodes = ['TKR', 'TSM', 'TKJ', 'TAV', 'BD'] as const;
      const safeCode = validCodes.includes(input.programCode) ? input.programCode : 'TKJ';
      const noteText = input.choice2
        ? `Pilihan 2: ${input.choice2}. Pra-pendaftaran mandiri via Portal PPDB Online.`
        : 'Pra-pendaftaran mandiri via Portal PPDB Online.';

      try {
        await setDoc(doc(db, 'ppdb_registrations', regId), {
          fullName: input.fullName.trim().slice(0, 140),
          nisn: (input.nisn.trim() || 'Belum diisi').slice(0, 20),
          originSchool: input.originSchool.trim().slice(0, 140),
          programCode: safeCode,
          whatsapp: input.whatsapp.trim().slice(0, 24),
          status: 'menunggu',
          notes: noteText.slice(0, 400),
          ownerId: 'public_visitor',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }

      await trackPublicEvent('ppdb', 'ppdb_submit');
    },
    [trackPublicEvent]
  );

  const submitPublicTracer = useCallback(
    async (input: PublicAlumniTracerInput): Promise<void> => {
      const tracerId = generateSafeDocId('trc');
      const path = `alumni_tracer/${tracerId}`;
      const validCodes = ['TKR', 'TSM', 'TKJ', 'TAV', 'BD'] as const;
      const safeCode = validCodes.includes(input.programCode) ? input.programCode : 'TKJ';
      const cleanYear = /^20[0-3][0-9]$/.test(input.graduationYear.trim())
        ? input.graduationYear.trim()
        : String(new Date().getFullYear());

      try {
        await setDoc(doc(db, 'alumni_tracer', tracerId), {
          fullName: input.fullName.trim().slice(0, 140),
          graduationYear: cleanYear,
          programCode: safeCode,
          activityStatus: input.activityStatus,
          institution: input.institution.trim().slice(0, 160),
          whatsapp: (input.whatsapp || '').trim().slice(0, 24),
          status: 'menunggu',
          notes: 'Pengisian mandiri Tracer Alumni via Portal Layanan PRIDA.',
          ownerId: 'public_visitor',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }

      await trackPublicEvent('layanan', 'tracer_submit');
    },
    [trackPublicEvent]
  );

  const submitPublicContact = useCallback(
    async (input: PublicContactInput): Promise<void> => {
      const msgId = generateSafeDocId('msg');
      const path = `contact_messages/${msgId}`;

      try {
        await setDoc(doc(db, 'contact_messages', msgId), {
          senderName: input.senderName.trim().slice(0, 120),
          senderEmail: input.senderEmail.trim().slice(0, 160),
          subject: input.subject.trim().slice(0, 140),
          message: input.message.trim().slice(0, 1500),
          status: 'baru',
          replyNote: '',
          ownerId: 'public_visitor',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }

      await trackPublicEvent('kontak', 'contact_submit');
    },
    [trackPublicEvent]
  );

  return {
    siteIdentity,
    programs,
    news,
    articles,
    ptkMembers,
    academicEvents,
    faqs,
    submitPublicPpdb,
    submitPublicTracer,
    submitPublicContact,
    trackPublicEvent,
  };
}
