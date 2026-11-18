export type PortalRoute =
  | 'beranda'
  | 'profil'
  | 'jurusan'
  | 'ppdb'
  | 'layanan'
  | 'literasi'
  | 'media'
  | 'kontak';

export type MajorCategory = 'semua' | 'rekayasa' | 'tik' | 'bisnis';

export interface StudyProgram {
  code: string;
  name: string;
  category: Exclude<MajorCategory, 'semua'>;
  categoryLabel: string;
  summary: string;
  competencies: string[];
  careers: string[];
  certification: string;
  image?: string;
}

export interface EditorialArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  author: string;
  publishedAt: string;
  readTime: string;
  excerpt: string;
  paragraphs: string[];
  keyTakeaways: string[];
}

export interface DynamicPortalItem {
  id: string;
  Title: string;
  SectionID: string;
  Icon?: string;
  Logo?: string;
  Url?: string;
  URL?: string;
  url?: string;
  Thumbnail?: string;
}

export interface PtkMember {
  Nama: string;
  Jabatan: string;
  Foto?: string;
}

export interface UkkLookupResponse {
  locked?: boolean;
  buka?: string;
  found?: boolean;
  status?: string;
  nama?: string;
  kelas?: string;
  keterangan?: string;
  video?: string;
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface SchoolFacility {
  name: string;
  unit: string;
  description: string;
}

export interface Extracurricular {
  name: string;
  schedule: string;
  focus: string;
}

export interface AcademicEvent {
  period: string;
  title: string;
  description: string;
}

export interface SchoolNewsItem {
  id: string;
  date: string;
  category: string;
  title: string;
  summary: string;
}
