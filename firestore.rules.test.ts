/**
 * Verifikasi keamanan Dirty Dozen terhadap firestore.rules
 * Dijalankan dengan Firebase Emulator (@firebase/rules-unit-testing) apabila tersedia.
 */

export interface DirtyDozenCase {
  id: number;
  name: string;
  collection: string;
  operation: 'create' | 'update' | 'get' | 'list';
  expected: 'PERMISSION_DENIED';
  payload?: Record<string, unknown>;
}

export const DIRTY_DOZEN_TESTS: DirtyDozenCase[] = [
  {
    id: 1,
    name: 'Unverified Email Spoof on Site Settings',
    collection: 'site_settings/profile',
    operation: 'update',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Self-Assigned Super Admin on User Registration',
    collection: 'users/attacker_uid',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { uid: 'attacker_uid', role: 'super_admin', status: 'active' },
  },
  {
    id: 3,
    name: 'Shadow Field Injection on News',
    collection: 'news/news_1',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { title: 'Test', shadowFlag: true },
  },
  {
    id: 4,
    name: 'Path Variable Poisoning (>128 chars / invalid chars)',
    collection: 'news/invalid$id!@#',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'OwnerId Spoofing on Article Creation',
    collection: 'articles/art_1',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { ownerId: 'victim_uid' },
  },
  {
    id: 6,
    name: 'Client Timestamp Forgery on Create',
    collection: 'news/news_2',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Immutable CreatedAt Modification on Update',
    collection: 'news/news_1',
    operation: 'update',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Blanket List Scraping on PPDB PII',
    collection: 'ppdb_registrations',
    operation: 'list',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Terminal Status Bypass on PPDB',
    collection: 'ppdb_registrations/reg_1',
    operation: 'update',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Unbounded Array Exhaustion on Programs',
    collection: 'programs/TKR',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Type Poisoning on Site Settings ppdbOpen',
    collection: 'site_settings/profile',
    operation: 'update',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Unauthorized Self-Promotion to Admins Collection',
    collection: 'admins/attacker_uid',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
  },
];
