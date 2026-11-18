import { Timestamp } from 'firebase/firestore';

export type AdminTab = 'analytics' | 'content' | 'ppdb' | 'inbox' | 'users';
export type ContentSubTab = 'news' | 'programs' | 'articles' | 'ptk' | 'calendar_faq' | 'settings';

export type UserRole = 'super_admin' | 'admin' | 'editor' | 'operator_ppdb' | 'viewer';
export type UserStatus = 'active' | 'suspended' | 'pending';

export interface UserProfile {
  id: string;
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  unit: string;
  status: UserStatus;
  ownerId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  lastActiveAt?: Timestamp;
}

export interface SiteSettings {
  id: string;
  schoolName: string;
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
  announcementBanner?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  whatsappUrl?: string;
  ownerId: string;
  updatedBy: string;
  updatedAt?: Timestamp;
}

export interface NewsItem {
  id: string;
  title: string;
  category: string;
  dateLabel: string;
  summary: string;
  status: 'published' | 'draft' | 'archived';
  imageUrl?: string;
  ownerId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface StudyProgram {
  id: string;
  code: string;
  name: string;
  category: 'rekayasa' | 'tik' | 'bisnis';
  categoryLabel: string;
  summary: string;
  competencies: string[];
  careers: string[];
  certification: string;
  imageUrl?: string;
  active: boolean;
  ownerId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface EditorialArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  author: string;
  publishedAtLabel: string;
  readTime: string;
  excerpt: string;
  paragraphs: string[];
  keyTakeaways: string[];
  status: 'published' | 'draft';
  ownerId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface PtkMember {
  id: string;
  name: string;
  position: string;
  department: string;
  nipOrNuptk?: string;
  status: 'active' | 'inactive';
  ownerId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface AcademicEvent {
  id: string;
  period: string;
  title: string;
  description: string;
  orderIndex: number;
  ownerId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  orderIndex: number;
  ownerId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface PpdbRegistration {
  id: string;
  fullName: string;
  nisn: string;
  originSchool: string;
  programCode: 'TKR' | 'TSM' | 'TKJ' | 'TAV' | 'BD';
  whatsapp: string;
  status: 'menunggu' | 'terverifikasi' | 'diterima' | 'ditolak';
  notes?: string;
  ownerId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface AlumniTracer {
  id: string;
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
  status: 'menunggu' | 'terverifikasi';
  notes?: string;
  ownerId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ContactMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  status: 'baru' | 'ditindaklanjuti' | 'selesai';
  replyNote?: string;
  ownerId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface AnalyticsDaily {
  id: string;
  dateKey: string;
  visitors: number;
  pageViews: number;
  ppdbClicks: number;
  ukkChecks: number;
  avgDurationSec: number;
  ownerId: string;
  updatedAt?: Timestamp;
}

export interface AnalyticsEvent {
  id: string;
  route: 'beranda' | 'profil' | 'jurusan' | 'ppdb' | 'layanan' | 'literasi' | 'media' | 'kontak';
  actionType:
    | 'pageview'
    | 'ppdb_submit'
    | 'ukk_lookup'
    | 'article_read'
    | 'tracer_submit'
    | 'contact_submit';
  device: 'Desktop' | 'Mobile' | 'Tablet';
  referrer: string;
  ownerId: string;
  createdAt?: Timestamp;
}

export interface AuditLog {
  id: string;
  actorUid: string;
  actorName: string;
  action: 'create' | 'update' | 'delete' | 'seed';
  collectionName: string;
  targetTitle: string;
  ownerId: string;
  createdAt?: Timestamp;
}
