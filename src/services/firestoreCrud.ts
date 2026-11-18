import { User } from 'firebase/auth';
import {
  deleteDoc,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  buildDefaultAnalyticsDaily,
  DEFAULT_ACADEMIC_EVENTS,
  DEFAULT_ANALYTICS_EVENTS,
  DEFAULT_ARTICLES,
  DEFAULT_FAQS,
  DEFAULT_NEWS,
  DEFAULT_PPDB,
  DEFAULT_PROGRAMS,
  DEFAULT_PTK,
  DEFAULT_SITE_SETTINGS,
} from '../data/seedDefaults';
import {
  db,
  generateSafeDocId,
  handleFirestoreError,
  OperationType,
  PRIMARY_ADMIN_EMAIL,
} from '../firebase';
import {
  AcademicEvent,
  AnalyticsEvent,
  EditorialArticle,
  FaqItem,
  NewsItem,
  PpdbRegistration,
  PtkMember,
  SiteSettings,
  StudyProgram,
  UserProfile,
} from '../types/admin';

function clampStr(val: string | undefined, max: number, fallback = ''): string {
  const s = (val ?? fallback).trim();
  return s.slice(0, max);
}

function clampList(arr: string[] | undefined, maxItems: number, maxItemLen = 300): string[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((item) => item.trim().slice(0, maxItemLen))
    .filter((item) => item.length > 0)
    .slice(0, maxItems);
}

export async function logAuditAction(
  actor: User,
  action: 'create' | 'update' | 'delete' | 'seed',
  collectionName: string,
  targetTitle: string
): Promise<void> {
  const logId = generateSafeDocId('log');
  const path = `audit_logs/${logId}`;
  try {
    await setDoc(doc(db, 'audit_logs', logId), {
      actorUid: actor.uid,
      actorName: clampStr(actor.displayName || actor.email || 'Admin', 120, 'Admin'),
      action,
      collectionName: clampStr(collectionName, 60, 'content'),
      targetTitle: clampStr(targetTitle, 200, 'Item'),
      ownerId: actor.uid,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function bootstrapUserProfile(user: User): Promise<UserProfile> {
  const userPath = `users/${user.uid}`;
  const isPrimary = user.email === PRIMARY_ADMIN_EMAIL && user.emailVerified;

  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      const payload = {
        uid: user.uid,
        displayName: clampStr(user.displayName || user.email?.split('@')[0] || 'Pengguna PRIDA', 120),
        email: clampStr(user.email || 'admin@smkpgri2kedondong.sch.id', 160),
        role: isPrimary ? 'super_admin' : 'viewer',
        unit: isPrimary ? 'Administrator Utama' : 'Staf Portal',
        status: isPrimary ? 'active' : 'pending',
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActiveAt: serverTimestamp(),
      };
      await setDoc(userRef, payload);

      if (isPrimary) {
        const adminRef = doc(db, 'admins', user.uid);
        const adminSnap = await getDoc(adminRef);
        if (!adminSnap.exists()) {
          await setDoc(adminRef, {
            uid: user.uid,
            email: payload.email,
            level: 'super_admin',
            grantedBy: user.uid,
            createdAt: serverTimestamp(),
          });
        }
      }

      const freshSnap = await getDoc(userRef);
      return { id: freshSnap.id, ...(freshSnap.data() as Omit<UserProfile, 'id'>) };
    }

    await updateDoc(userRef, {
      displayName: clampStr(
        (snap.data() as UserProfile).displayName || user.displayName || 'Admin PRIDA',
        120
      ),
      lastActiveAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (isPrimary) {
      const adminRef = doc(db, 'admins', user.uid);
      const adminSnap = await getDoc(adminRef);
      if (!adminSnap.exists()) {
        await setDoc(adminRef, {
          uid: user.uid,
          email: clampStr(user.email || PRIMARY_ADMIN_EMAIL, 160),
          level: 'super_admin',
          grantedBy: user.uid,
          createdAt: serverTimestamp(),
        });
      }
    }

    const updatedSnap = await getDoc(userRef);
    return { id: updatedSnap.id, ...(updatedSnap.data() as Omit<UserProfile, 'id'>) };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }
}

export async function seedInitialPortalData(actor: User): Promise<void> {
  const uid = actor.uid;
  try {
    const batch = writeBatch(db);

    const settingsRef = doc(db, 'site_settings', 'profile');
    batch.set(settingsRef, {
      ...DEFAULT_SITE_SETTINGS,
      ownerId: uid,
      updatedBy: clampStr(actor.displayName || actor.email || 'Admin', 120),
      updatedAt: serverTimestamp(),
    });

    DEFAULT_PROGRAMS.forEach((prog) => {
      const id = prog.code;
      batch.set(doc(db, 'programs', id), {
        ...prog,
        ownerId: uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    DEFAULT_NEWS.forEach((item, idx) => {
      const id = `news_seed_${idx + 1}`;
      batch.set(doc(db, 'news', id), {
        ...item,
        ownerId: uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    DEFAULT_ARTICLES.forEach((art, idx) => {
      const id = `article_seed_${idx + 1}`;
      batch.set(doc(db, 'articles', id), {
        ...art,
        ownerId: uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    DEFAULT_PTK.forEach((ptk, idx) => {
      const id = `ptk_seed_${idx + 1}`;
      batch.set(doc(db, 'ptk_members', id), {
        ...ptk,
        ownerId: uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    DEFAULT_ACADEMIC_EVENTS.forEach((ev, idx) => {
      const id = `event_seed_${idx + 1}`;
      batch.set(doc(db, 'academic_events', id), {
        ...ev,
        ownerId: uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    DEFAULT_FAQS.forEach((faq, idx) => {
      const id = `faq_seed_${idx + 1}`;
      batch.set(doc(db, 'faqs', id), {
        ...faq,
        ownerId: uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    DEFAULT_PPDB.forEach((reg, idx) => {
      const id = `ppdb_seed_${idx + 1}`;
      batch.set(doc(db, 'ppdb_registrations', id), {
        ...reg,
        ownerId: uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    buildDefaultAnalyticsDaily().forEach((day) => {
      batch.set(doc(db, 'analytics_daily', day.dateKey), {
        ...day,
        ownerId: uid,
        updatedAt: serverTimestamp(),
      });
    });

    DEFAULT_ANALYTICS_EVENTS.forEach((ev, idx) => {
      batch.set(doc(db, 'analytics_events', `evt_seed_${idx + 1}`), {
        ...ev,
        ownerId: uid,
        createdAt: serverTimestamp(),
      });
    });

    batch.set(doc(db, 'audit_logs', generateSafeDocId('seed')), {
      actorUid: uid,
      actorName: clampStr(actor.displayName || actor.email || 'Admin', 120),
      action: 'seed',
      collectionName: 'portal_prida',
      targetTitle: 'Inisialisasi Data Awal Portal SMK PGRI 2 Kedondong',
      ownerId: uid,
      createdAt: serverTimestamp(),
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'batch_seed_portal');
  }
}

export async function saveSiteSettings(
  actor: User,
  data: Omit<SiteSettings, 'id' | 'ownerId' | 'updatedBy' | 'updatedAt'>,
  existingOwnerId?: string
): Promise<void> {
  const path = 'site_settings/profile';
  try {
    const ref = doc(db, 'site_settings', 'profile');
    const snap = await getDoc(ref);
    const payload = {
      schoolName: clampStr(data.schoolName, 120),
      shortName: clampStr(data.shortName, 32),
      npsn: clampStr(data.npsn, 16),
      address: clampStr(data.address, 280),
      hours: clampStr(data.hours, 120),
      email: clampStr(data.email, 160),
      domain: clampStr(data.domain, 160),
      vision: clampStr(data.vision, 600),
      missions: clampList(data.missions, 10, 400),
      principalGreeting: clampStr(data.principalGreeting, 1200),
      principalClosing: clampStr(data.principalClosing, 1200),
      ppdbOpen: Boolean(data.ppdbOpen),
      ppdbWaveLabel: clampStr(data.ppdbWaveLabel, 120),
      announcementBanner: clampStr(data.announcementBanner, 300),
      instagramUrl: clampStr(data.instagramUrl, 240),
      tiktokUrl: clampStr(data.tiktokUrl, 240),
      whatsappUrl: clampStr(data.whatsappUrl, 240),
      ownerId: existingOwnerId || actor.uid,
      updatedBy: clampStr(actor.displayName || actor.email || 'Admin', 120),
      updatedAt: serverTimestamp(),
    };
    if (snap.exists()) {
      await updateDoc(ref, payload);
    } else {
      await setDoc(ref, payload);
    }
    await logAuditAction(actor, 'update', 'site_settings', 'Pengaturan Identitas & Profil Sekolah');
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveNewsItem(
  actor: User,
  item: Omit<NewsItem, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Promise<void> {
  const id = existingId || generateSafeDocId('news');
  const path = `news/${id}`;
  try {
    const payload = {
      title: clampStr(item.title, 200),
      category: clampStr(item.category, 80),
      dateLabel: clampStr(item.dateLabel, 60),
      summary: clampStr(item.summary, 1000),
      status: item.status,
      imageUrl: clampStr(item.imageUrl, 300),
      updatedAt: serverTimestamp(),
    };
    if (existingId) {
      await updateDoc(doc(db, 'news', id), payload);
      await logAuditAction(actor, 'update', 'news', payload.title);
    } else {
      await setDoc(doc(db, 'news', id), {
        ...payload,
        ownerId: actor.uid,
        createdAt: serverTimestamp(),
      });
      await logAuditAction(actor, 'create', 'news', payload.title);
    }
  } catch (error) {
    handleFirestoreError(error, existingId ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function saveStudyProgram(
  actor: User,
  prog: Omit<StudyProgram, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Promise<void> {
  const safeCode = prog.code.toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 12) || 'PROG';
  const id = existingId || safeCode;
  const path = `programs/${id}`;
  try {
    const payload = {
      code: safeCode,
      name: clampStr(prog.name, 140),
      category: prog.category,
      categoryLabel: clampStr(prog.categoryLabel, 80),
      summary: clampStr(prog.summary, 1000),
      competencies: clampList(prog.competencies, 12, 240),
      careers: clampList(prog.careers, 12, 200),
      certification: clampStr(prog.certification, 200),
      imageUrl: clampStr(prog.imageUrl, 300),
      active: Boolean(prog.active),
      updatedAt: serverTimestamp(),
    };
    if (existingId) {
      await updateDoc(doc(db, 'programs', id), payload);
      await logAuditAction(actor, 'update', 'programs', `${payload.code} - ${payload.name}`);
    } else {
      await setDoc(doc(db, 'programs', id), {
        ...payload,
        ownerId: actor.uid,
        createdAt: serverTimestamp(),
      });
      await logAuditAction(actor, 'create', 'programs', `${payload.code} - ${payload.name}`);
    }
  } catch (error) {
    handleFirestoreError(error, existingId ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function saveArticle(
  actor: User,
  art: Omit<EditorialArticle, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Promise<void> {
  const id = existingId || generateSafeDocId('art');
  const path = `articles/${id}`;
  const cleanSlug =
    art.slug
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 160) || `artikel-${Date.now()}`;

  try {
    const payload = {
      slug: cleanSlug,
      title: clampStr(art.title, 220),
      category: clampStr(art.category, 80),
      author: clampStr(art.author, 120),
      publishedAtLabel: clampStr(art.publishedAtLabel, 60),
      readTime: clampStr(art.readTime, 40),
      excerpt: clampStr(art.excerpt, 600),
      paragraphs: clampList(art.paragraphs, 20, 1200),
      keyTakeaways: clampList(art.keyTakeaways, 10, 300),
      status: art.status,
      updatedAt: serverTimestamp(),
    };
    if (existingId) {
      await updateDoc(doc(db, 'articles', id), payload);
      await logAuditAction(actor, 'update', 'articles', payload.title);
    } else {
      await setDoc(doc(db, 'articles', id), {
        ...payload,
        ownerId: actor.uid,
        createdAt: serverTimestamp(),
      });
      await logAuditAction(actor, 'create', 'articles', payload.title);
    }
  } catch (error) {
    handleFirestoreError(error, existingId ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function savePtkMember(
  actor: User,
  member: Omit<PtkMember, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Promise<void> {
  const id = existingId || generateSafeDocId('ptk');
  const path = `ptk_members/${id}`;
  try {
    const payload = {
      name: clampStr(member.name, 140),
      position: clampStr(member.position, 140),
      department: clampStr(member.department, 80),
      nipOrNuptk: clampStr(member.nipOrNuptk, 40),
      status: member.status,
      updatedAt: serverTimestamp(),
    };
    if (existingId) {
      await updateDoc(doc(db, 'ptk_members', id), payload);
      await logAuditAction(actor, 'update', 'ptk_members', payload.name);
    } else {
      await setDoc(doc(db, 'ptk_members', id), {
        ...payload,
        ownerId: actor.uid,
        createdAt: serverTimestamp(),
      });
      await logAuditAction(actor, 'create', 'ptk_members', payload.name);
    }
  } catch (error) {
    handleFirestoreError(error, existingId ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function saveAcademicEvent(
  actor: User,
  ev: Omit<AcademicEvent, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Promise<void> {
  const id = existingId || generateSafeDocId('cal');
  const path = `academic_events/${id}`;
  try {
    const payload = {
      period: clampStr(ev.period, 80),
      title: clampStr(ev.title, 180),
      description: clampStr(ev.description, 600),
      orderIndex: Math.max(0, Math.min(500, Math.round(ev.orderIndex || 0))),
      updatedAt: serverTimestamp(),
    };
    if (existingId) {
      await updateDoc(doc(db, 'academic_events', id), payload);
      await logAuditAction(actor, 'update', 'academic_events', payload.title);
    } else {
      await setDoc(doc(db, 'academic_events', id), {
        ...payload,
        ownerId: actor.uid,
        createdAt: serverTimestamp(),
      });
      await logAuditAction(actor, 'create', 'academic_events', payload.title);
    }
  } catch (error) {
    handleFirestoreError(error, existingId ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function saveFaqItem(
  actor: User,
  faq: Omit<FaqItem, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Promise<void> {
  const id = existingId || generateSafeDocId('faq');
  const path = `faqs/${id}`;
  try {
    const payload = {
      question: clampStr(faq.question, 240),
      answer: clampStr(faq.answer, 1000),
      category: clampStr(faq.category, 60),
      orderIndex: Math.max(0, Math.min(500, Math.round(faq.orderIndex || 0))),
      updatedAt: serverTimestamp(),
    };
    if (existingId) {
      await updateDoc(doc(db, 'faqs', id), payload);
      await logAuditAction(actor, 'update', 'faqs', payload.question);
    } else {
      await setDoc(doc(db, 'faqs', id), {
        ...payload,
        ownerId: actor.uid,
        createdAt: serverTimestamp(),
      });
      await logAuditAction(actor, 'create', 'faqs', payload.question);
    }
  } catch (error) {
    handleFirestoreError(error, existingId ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function savePpdbRegistration(
  actor: User,
  reg: Omit<PpdbRegistration, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Promise<void> {
  const id = existingId || generateSafeDocId('ppdb');
  const path = `ppdb_registrations/${id}`;
  try {
    const payload = {
      fullName: clampStr(reg.fullName, 140),
      nisn: clampStr(reg.nisn, 20),
      originSchool: clampStr(reg.originSchool, 140),
      programCode: reg.programCode,
      whatsapp: clampStr(reg.whatsapp, 24),
      status: reg.status,
      notes: clampStr(reg.notes, 400),
      updatedAt: serverTimestamp(),
    };
    if (existingId) {
      await updateDoc(doc(db, 'ppdb_registrations', id), payload);
      await logAuditAction(actor, 'update', 'ppdb_registrations', `${payload.fullName} (${payload.status})`);
    } else {
      await setDoc(doc(db, 'ppdb_registrations', id), {
        ...payload,
        ownerId: actor.uid,
        createdAt: serverTimestamp(),
      });
      await logAuditAction(actor, 'create', 'ppdb_registrations', payload.fullName);
    }
  } catch (error) {
    handleFirestoreError(error, existingId ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function saveManagedUser(
  actor: User,
  userData: Pick<UserProfile, 'displayName' | 'email' | 'role' | 'unit' | 'status'>,
  existingUser?: UserProfile
): Promise<void> {
  const id = existingUser?.id || generateSafeDocId('usr');
  const path = `users/${id}`;
  try {
    const payload = {
      displayName: clampStr(userData.displayName, 120),
      email: clampStr(userData.email, 160),
      role: userData.role,
      unit: clampStr(userData.unit, 100),
      status: userData.status,
      updatedAt: serverTimestamp(),
    };
    if (existingUser) {
      await updateDoc(doc(db, 'users', id), payload);
      await logAuditAction(actor, 'update', 'users', `${payload.displayName} (${payload.role})`);
    } else {
      await setDoc(doc(db, 'users', id), {
        ...payload,
        uid: id,
        ownerId: actor.uid,
        createdAt: serverTimestamp(),
        lastActiveAt: serverTimestamp(),
      });
      await logAuditAction(actor, 'create', 'users', `${payload.displayName} (${payload.role})`);
    }
  } catch (error) {
    handleFirestoreError(error, existingUser ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function removeDocument(
  actor: User,
  collectionName: string,
  docId: string,
  label: string
): Promise<void> {
  const path = `${collectionName}/${docId}`;
  try {
    await deleteDoc(doc(db, collectionName, docId));
    await logAuditAction(actor, 'delete', collectionName, label);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function recordLiveAnalyticsEvent(
  actor: User,
  route: AnalyticsEvent['route'],
  actionType: AnalyticsEvent['actionType'],
  device: AnalyticsEvent['device'],
  referrer: string
): Promise<void> {
  const evtId = generateSafeDocId('evt');
  const todayKey = new Date().toISOString().slice(0, 10);
  const dailyRef = doc(db, 'analytics_daily', todayKey);

  try {
    await setDoc(doc(db, 'analytics_events', evtId), {
      route,
      actionType,
      device,
      referrer: clampStr(referrer, 120, 'Direct'),
      ownerId: actor.uid,
      createdAt: serverTimestamp(),
    });

    const dailySnap = await getDoc(dailyRef);
    if (dailySnap.exists()) {
      await updateDoc(dailyRef, {
        visitors: increment(1),
        pageViews: increment(actionType === 'pageview' ? 2 : 1),
        ppdbClicks: increment(actionType === 'ppdb_submit' ? 1 : 0),
        ukkChecks: increment(actionType === 'ukk_lookup' ? 1 : 0),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(dailyRef, {
        dateKey: todayKey,
        visitors: 1,
        pageViews: 2,
        ppdbClicks: actionType === 'ppdb_submit' ? 1 : 0,
        ukkChecks: actionType === 'ukk_lookup' ? 1 : 0,
        avgDurationSec: 195,
        ownerId: actor.uid,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `analytics_events/${evtId}`);
  }
}
