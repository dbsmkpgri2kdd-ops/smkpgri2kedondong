import {
  AcademicEvent,
  AnalyticsDaily,
  AnalyticsEvent,
  EditorialArticle,
  FaqItem,
  NewsItem,
  PpdbRegistration,
  PtkMember,
  SiteSettings,
  StudyProgram,
} from '../types/admin';

export const AVAILABLE_IMAGES = [
  {
    label: 'Kampus SMK PGRI 2 Kedondong',
    url: '/src/assets/images/hero_campus_clean_1794883667495.jpg',
  },
  {
    label: 'Bengkel Otomotif TKR & TSM',
    url: '/src/assets/images/lab_engineering_automotive_1794883647783.jpg',
  },
  {
    label: 'Lab Teknik Otomotif (Diagnostik)',
    url: '/src/assets/images/vocational_automotive_lab_1794995572022.jpg',
  },
  {
    label: 'Lab Jaringan TKJ & Server',
    url: '/src/assets/images/lab_network_digital_1794883648012.jpg',
  },
  {
    label: 'Studio Jaringan & Bisnis Digital',
    url: '/src/assets/images/vocational_network_studio_1794995573318.jpg',
  },
  {
    label: 'Workshop Elektronika TAV',
    url: '/src/assets/images/studio_electronics_banking_1794883647802.jpg',
  },
];

export const DEFAULT_SITE_SETTINGS: Omit<SiteSettings, 'id' | 'ownerId' | 'updatedAt'> = {
  schoolName: 'SMK PGRI 2 Kedondong',
  shortName: 'PRIDA',
  npsn: '10811003',
  address: 'Jl. Tritura Kedondong, RT 1 / RW 1, Kec. Kedondong, Kab. Pesawaran, Lampung 35381',
  hours: 'Senin – Sabtu · 07.15 – 14.30 WIB',
  email: 'dbsmkpgri2kdd@gmail.com',
  domain: 'https://smkpgri2kedondong.sch.id',
  vision:
    'Terwujudnya lulusan SMK PGRI 2 Kedondong yang berakhlak mulia, terampil, adaptif terhadap perkembangan teknologi industri dan bisnis digital, serta mandiri dalam berkarya.',
  missions: [
    'Menyelenggarakan pembelajaran berbasis praktik bengkel dan laboratorium sesuai standar dunia usaha dan dunia industri (DUDI).',
    'Membentuk karakter disiplin, etos kerja, budaya Keselamatan dan Kesehatan Kerja (K3), serta tanggung jawab sosial bagi seluruh peserta didik.',
    'Mengembangkan literasi digital, kewirausahaan, dan sertifikasi kompetensi keahlian pada lima jurusan unggulan sekolah.',
    'Memperluas jejaring kemitraan Praktik Kerja Lapangan (PKL) dan penyaluran lulusan melalui Bursa Kerja Khusus (BKK).',
  ],
  principalGreeting:
    'Selamat datang di Portal Digital Resmi SMK PGRI 2 Kedondong (PRIDA). Kehadiran portal ini merupakan komitmen kami untuk membuka akses informasi pendidikan vokasi yang transparan, cepat, dan mudah dijangkau oleh peserta didik, orang tua, alumni, serta mitra industri di Kabupaten Pesawaran dan sekitarnya.',
  principalClosing:
    'Kami terus berinovasi memadukan keterampilan teknis otomotif, jaringan komputer, elektronika audio-video, dan bisnis digital agar setiap lulusan siap kerja, siap kuliah, maupun siap berwirausaha.',
  ppdbOpen: true,
  ppdbWaveLabel: 'Gelombang I · Tahun Pelajaran 2026/2027',
  announcementBanner: 'Pra-pendaftaran SPMB / PPDB Online 2026/2027 telah dibuka untuk 5 Program Keahlian.',
  instagramUrl: 'https://www.instagram.com/smkpgri2kdd/',
  tiktokUrl: 'https://www.tiktok.com/@smkpgri2kdd?_r=1&_t=ZS-99hN2VYkopM',
  whatsappUrl: 'https://whatsapp.com/channel/0029VbAdeE6AInPmCmeupj3Z',
  updatedBy: 'Administrator PRIDA',
};

export const DEFAULT_PROGRAMS: Array<Omit<StudyProgram, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>> = [
  {
    code: 'TKR',
    name: 'Teknik Kendaraan Ringan',
    category: 'rekayasa',
    categoryLabel: 'Teknologi & Rekayasa',
    summary:
      'Mempelajari perawatan berkala, diagnostik mesin injeksi elektronik (EFI), sistem sasis, pemindah tenaga, serta kelistrikan bodi dan AC kendaraan roda empat.',
    competencies: [
      'Perawatan dan perbaikan mesin kendaraan bensin & diesel',
      'Diagnostik OBD-II dan sistem kontrol elektronik kendaraan',
      'Sistem rem ABS, suspensi, kemudi, dan spooring-balancing',
      'Kelistrikan bodi, sistem starter, pengisian, dan AC mobil',
    ],
    careers: [
      'Teknisi Bengkel Resmi Otomotif (ATPM)',
      'Service Advisor & Quality Control',
      'Wirausaha Bengkel Servis Kendaraan',
    ],
    certification: 'Uji Kompetensi Keahlian (UKK) Standar Industri Otomotif',
    imageUrl: '/src/assets/images/lab_engineering_automotive_1794883647783.jpg',
    active: true,
  },
  {
    code: 'TSM',
    name: 'Teknik Sepeda Motor',
    category: 'rekayasa',
    categoryLabel: 'Teknologi & Rekayasa',
    summary:
      'Membekali siswa keterampilan teknis perbaikan mesin sepeda motor injeksi (PGM-FI / YMJET-FI), transmisi otomatis CVT, rangka, dan sistem kelistrikan modern.',
    competencies: [
      'Tune-up dan overhaul mesin 4-tak & sistem bahan bakar injeksi',
      'Perawatan transmisi otomatis (CVT) dan kopling manual',
      'Sistem pengereman hidrolik, suspensi, dan rangka',
      'Pembacaan wiring diagram dan troubleshooting kelistrikan motor',
    ],
    careers: [
      'Mekanik Bengkel Resmi Sepeda Motor',
      'Teknisi Sparepart & Injeksi Mandiri',
      'Wirausaha Bengkel Motor & Modifikasi',
    ],
    certification: 'UKK Teknik & Bisnis Sepeda Motor',
    imageUrl: '/src/assets/images/vocational_automotive_lab_1794995572022.jpg',
    active: true,
  },
  {
    code: 'TKJ',
    name: 'Teknik Komputer dan Jaringan',
    category: 'tik',
    categoryLabel: 'TIK & Elektronika',
    summary:
      'Berfokus pada perakitan perangkat keras, administrasi sistem operasi server Linux, instalasi jaringan kabel dan nirkabel, fiber optik FTTH, serta keamanan jaringan dasar.',
    competencies: [
      'Perakitan PC, troubleshooting hardware, dan instalasi OS',
      'Konfigurasi router MikroTik, VLAN, dan manajemen bandwidth',
      'Penyambungan (splicing) kabel fiber optik dan instalasi Wi-Fi',
      'Administrasi server web, DNS, DHCP, dan dasar keamanan siber',
    ],
    careers: [
      'Network Technician / NOC Junior',
      'Teknisi Fiber Optik & ISP Lokal',
      'IT Support Sekolah & Perkantoran',
    ],
    certification: 'UKK Infrastruktur Jaringan & Sertifikasi Kompetensi Kejuruan',
    imageUrl: '/src/assets/images/lab_network_digital_1794883648012.jpg',
    active: true,
  },
  {
    code: 'TAV',
    name: 'Teknik Audio Video',
    category: 'tik',
    categoryLabel: 'TIK & Elektronika',
    summary:
      'Mengembangkan keahlian elektronika terapan, perancangan dan perbaikan perangkat audio amplifier, tata suara panggung, sistem televisi, serta produksi multimedia audio-video.',
    competencies: [
      'Perakitan dan analisis rangkaian elektronika analog & digital',
      'Instalasi sistem tata suara (sound system) dan akustik ruangan',
      'Perawatan perangkat televisi, proyektor, dan receiver digital',
      'Perekaman audio-video dasar dan pengoperasian mixer konsol',
    ],
    careers: [
      'Teknisi Elektronika & Layanan Purna Jual',
      'Operator Tata Suara & Studio Penyiaran',
      'Wirausaha Servis Elektronika & Rental Audio',
    ],
    certification: 'UKK Elektronika Audio Video Terapan',
    imageUrl: '/src/assets/images/studio_electronics_banking_1794883647802.jpg',
    active: true,
  },
  {
    code: 'BD',
    name: 'Bisnis Digital',
    category: 'bisnis',
    categoryLabel: 'Bisnis Digital',
    summary:
      'Menyiapkan talenta pemasaran daring modern: pengelolaan toko e-commerce, optimasi mesin pencari (SEO), produksi konten promosi digital, dan analisis penjualan online.',
    competencies: [
      'Pengelolaan katalog produk di marketplace dan website usaha',
      'Copywriting promosi, desain konten visual, dan media sosial bisnis',
      'Dasar optimasi SEO dan analisis performa kampanye digital',
      'Layanan pelanggan digital dan manajemen pesanan daring',
    ],
    careers: [
      'Digital Marketing Executive UMKM',
      'Admin Marketplace & E-Commerce Specialist',
      'Kreator Konten Promosi & Wirausaha Online',
    ],
    certification: 'UKK Pemasaran Digital & Pengelolaan Toko Daring',
    imageUrl: '/src/assets/images/vocational_network_studio_1794995573318.jpg',
    active: true,
  },
];

export const DEFAULT_NEWS: Array<Omit<NewsItem, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>> = [
  {
    title: 'Informasi Pra-Pendaftaran SPMB SMK PGRI 2 Kedondong Tahun Ajaran Baru Dibuka',
    category: 'Informasi PPDB',
    dateLabel: '16 November 2026',
    summary:
      'Calon peserta didik lulusan SMP/MTs kini dapat mengisi formulir pra-pendaftaran secara daring untuk 5 program keahlian unggulan.',
    status: 'published',
    imageUrl: '/src/assets/images/hero_campus_clean_1794883667495.jpg',
  },
  {
    title: 'Pemantapan Praktik Bengkel & Laboratorium Menjelang Uji Kompetensi Keahlian',
    category: 'Akademik & UKK',
    dateLabel: '12 November 2026',
    summary:
      'Siswa kelas XII dari jurusan TKR, TSM, TKJ, TAV, dan Bisnis Digital mengikuti pendampingan intensif standar penguji industri.',
    status: 'published',
    imageUrl: '/src/assets/images/lab_engineering_automotive_1794883647783.jpg',
  },
  {
    title: 'Pembaruan Portal Digital smkpgri2kedondong.sch.id Terintegrasi Layanan Akademik',
    category: 'Layanan Digital',
    dateLabel: '10 November 2026',
    summary:
      'Portal resmi kini menyediakan fitur cek pengumuman UKK, direktori PTK, tracer alumni BKK, dan pusat literasi kejuruan.',
    status: 'published',
    imageUrl: '/src/assets/images/lab_network_digital_1794883648012.jpg',
  },
];

export const DEFAULT_ARTICLES: Array<Omit<EditorialArticle, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>> = [
  {
    slug: 'panduan-k3-bengkel-otomotif-tkr-tsm',
    title: 'Standar Keselamatan Kerja (K3) di Bengkel Praktik Otomotif TKR dan TSM',
    category: 'Otomotif & K3',
    author: 'Tim Produktif Otomotif SMK PGRI 2 Kedondong',
    publishedAtLabel: '14 November 2026',
    readTime: '4 menit baca',
    excerpt:
      'Penerapan prosedur K3 di bengkel TKR dan TSM menjadi fondasi utama sebelum siswa menyentuh peralatan diagnostik injeksi dan mesin kendaraan.',
    paragraphs: [
      'Setiap peserta didik program keahlian Teknik Kendaraan Ringan (TKR) dan Teknik Sepeda Motor (TSM) wajib mengenakan wearpack kerja, sepatu keselamatan (safety shoes), serta kacamata pelindung sebelum memasuki area praktik.',
      'Kebersihan lantai kerja dari ceceran oli serta penataan kembali perkakas ke papan tool board mencegah kecelakaan tergelincir sekaligus membiasakan etos kerja standar bengkel resmi.',
    ],
    keyTakeaways: [
      'Gunakan wearpack, safety shoes, dan kacamata pelindung sesuai jenis pekerjaan bengkel.',
      'Jaga kebersihan lantai kerja dari ceceran oli serta kembalikan perkakas ke tool board.',
      'Selalu putuskan arus kelistrikan sebelum melakukan pembongkaran komponen elektronik.',
    ],
    status: 'published',
  },
  {
    slug: 'pengenalan-topologi-fiber-optik-manajemen-bandwidth-tkj',
    title: 'Mengenal Topologi Jaringan Fiber Optik dan Manajemen Bandwidth untuk Siswa TKJ',
    category: 'Teknik Komputer & Jaringan',
    author: 'Tim Laboratorium TKJ SMK PGRI 2 Kedondong',
    publishedAtLabel: '8 November 2026',
    readTime: '5 menit baca',
    excerpt:
      'Kebutuhan internet stabil di pedesaan dan perkotaan Pesawaran mendorong kompetensi penyambungan fiber optik serta pengaturan router menjadi keahlian paling dicari.',
    paragraphs: [
      'Dalam arsitektur FTTH, sinyal cahaya dikirimkan dari Optical Line Terminal (OLT) melalui kabel distribusi menuju Optical Distribution Point (ODP), kemudian diteruskan menggunakan kabel dropcore menuju ONT.',
      'Konfigurasi router menggunakan MikroTik RouterOS melatih siswa membagi alokasi bandwidth secara adil melalui fitur Simple Queue maupun Queue Tree serta segmentasi VLAN.',
    ],
    keyTakeaways: [
      'Nilai redaman kabel optik sangat bergantung pada kebersihan core dan presisi splicing.',
      'Segmentasi jaringan dengan VLAN mencegah gangguan lalu lintas antar ruang praktik.',
      'Manajemen bandwidth yang terukur menjamin layanan pembelajaran digital tetap responsif.',
    ],
    status: 'published',
  },
  {
    slug: 'strategi-pemasaran-digital-umkm-lokal-bisnis-digital',
    title: 'Strategi Pemasaran Digital UMKM Lokal bagi Kompetensi Bisnis Digital',
    category: 'Bisnis Digital',
    author: 'Kelompok Keahlian Bisnis Digital',
    publishedAtLabel: '4 November 2026',
    readTime: '4 menit baca',
    excerpt:
      'Bagaimana siswa jurusan Bisnis Digital membantu pelaku usaha pertanian, kuliner, dan kerajinan di Kabupaten Pesawaran menjangkau pasar nasional secara terstruktur.',
    paragraphs: [
      'Kabupaten Pesawaran memiliki beragam produk unggulan daerah mulai dari hasil olahan kopi, keripik pisang, produk perkebunan, hingga kerajinan tapis.',
      'Pada program keahlian Bisnis Digital (BD), peserta didik dilatih menyusun profil produk informatif, copywriting jujur berbasis manfaat, serta pengelolaan katalog marketplace.',
    ],
    keyTakeaways: [
      'Foto produk jelas dan deskripsi lengkap meningkatkan kepercayaan pembeli daring.',
      'Pemilihan kata kunci relevan membantu produk lokal muncul pada hasil pencarian.',
      'Perhitungan biaya pengemasan dan layanan purna jual menjaga keberlanjutan usaha.',
    ],
    status: 'published',
  },
  {
    slug: 'teknik-pengaturan-tata-suara-kalibrasi-audio-video-tav',
    title: 'Teknik Pengaturan Tata Suara dan Kalibrasi Sistem Audio Video untuk Siswa TAV',
    category: 'Teknik Audio Video',
    author: 'Tim Laboratorium Elektronika TAV',
    publishedAtLabel: '1 November 2026',
    readTime: '4 menit baca',
    excerpt:
      'Memahami alur sinyal audio dari mikrofon menuju mixer dan amplifier, pencegahan feedback akustik, serta pengukuran rangkaian elektronika dasar di bengkel TAV.',
    paragraphs: [
      'Di laboratorium TAV SMK PGRI 2 Kedondong, peserta didik dilatih memahami jalur sinyal mulai dari sumber input mikrofon, tahap pencampuran pada audio mixer, hingga penguatan daya menuju pengeras suara.',
      'Pengendalian gain staging dan pengukuran multimeter serta osiloskop memastikan keandalan rangkaian penguat audio.',
    ],
    keyTakeaways: [
      'Pengaturan gain staging yang tepat menjaga kejernihan audio dan mencegah distorsi.',
      'Penempatan speaker dan pemangkasan frekuensi bermasalah mencegah feedback.',
      'Pemeriksaan osiloskop dan multimeter memastikan keandalan rangkaian penguat.',
    ],
    status: 'published',
  },
];

export const DEFAULT_PTK: Array<Omit<PtkMember, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>> = [
  { name: 'Kepala Sekolah SMK PGRI 2 Kedondong', position: 'Kepala Sekolah', department: 'Pimpinan Sekolah', nipOrNuptk: 'NUPTK-001100301', status: 'active' },
  { name: 'Waka Bidang Kurikulum', position: 'Wakil Kepala Sekolah Kurikulum', department: 'Manajemen Akademik', nipOrNuptk: 'NUPTK-001100302', status: 'active' },
  { name: 'Ketua Program Keahlian TKR', position: 'Guru Produktif Otomotif (TKR)', department: 'TKR', nipOrNuptk: 'NUPTK-001100303', status: 'active' },
  { name: 'Ketua Program Keahlian TSM', position: 'Guru Produktif Sepeda Motor (TSM)', department: 'TSM', nipOrNuptk: 'NUPTK-001100304', status: 'active' },
  { name: 'Ketua Program Keahlian TKJ', position: 'Guru Produktif Jaringan & Server (TKJ)', department: 'TKJ', nipOrNuptk: 'NUPTK-001100305', status: 'active' },
  { name: 'Ketua Program Keahlian TAV', position: 'Guru Produktif Elektronika (TAV)', department: 'TAV', nipOrNuptk: 'NUPTK-001100306', status: 'active' },
  { name: 'Ketua Program Bisnis Digital', position: 'Guru Produktif Pemasaran Digital', department: 'BD', nipOrNuptk: 'NUPTK-001100307', status: 'active' },
  { name: 'Kepala Tata Usaha', position: 'Koordinator Administrasi & PPDB', department: 'Tata Usaha', nipOrNuptk: 'NUPTK-001100308', status: 'active' },
];

export const DEFAULT_ACADEMIC_EVENTS: Array<Omit<AcademicEvent, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>> = [
  {
    period: 'Juli 2026',
    title: 'Masa Pengenalan Lingkungan Sekolah (MPLS) & Awal Semester Ganjil',
    description: 'Orientasi peserta didik baru kelas X mengenai tata tertib, budaya K3 bengkel, dan pengenalan jurusan.',
    orderIndex: 1,
  },
  {
    period: 'September – November 2026',
    title: 'Penilaian Tengah Semester & Pembekalan Praktik Kerja Lapangan (PKL)',
    description: 'Evaluasi capaian belajar semester ganjil serta pembekalan administrasi dan kesiapan kerja bagi siswa kelas XI/XII.',
    orderIndex: 2,
  },
  {
    period: 'Desember 2026',
    title: 'Asesmen Sumatif Akhir Semester Ganjil & Pembagian Rapor',
    description: 'Ujian teori dan praktik kejuruan akhir semester dilanjutkan penerimaan laporan hasil belajar.',
    orderIndex: 3,
  },
  {
    period: 'Januari – Maret 2027',
    title: 'Pelaksanaan Praktik Kerja Lapangan (PKL) & Uji Kompetensi Keahlian (UKK)',
    description: 'Penempatan siswa di dunia usaha/industri mitra serta pelaksanaan UKK kelas XII bersama penguji eksternal.',
    orderIndex: 4,
  },
  {
    period: 'April – Juni 2027',
    title: 'Pengumuman Kelulusan UKK & Penerimaan Peserta Didik Baru (PPDB/SPMB)',
    description: 'Publikasi kelulusan siswa melalui portal PRIDA dan pembukaan gelombang pendaftaran siswa baru tahun ajaran berikutnya.',
    orderIndex: 5,
  },
];

export const DEFAULT_FAQS: Array<Omit<FaqItem, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>> = [
  {
    question: 'Apa saja program keahlian yang tersedia di SMK PGRI 2 Kedondong?',
    answer:
      'SMK PGRI 2 Kedondong menyelenggarakan 5 program keahlian: Teknik Kendaraan Ringan (TKR), Teknik Sepeda Motor (TSM), Teknik Komputer dan Jaringan (TKJ), Teknik Audio Video (TAV), dan Bisnis Digital (BD).',
    category: 'Jurusan',
    orderIndex: 1,
  },
  {
    question: 'Di mana alamat resmi dan berapa NPSN SMK PGRI 2 Kedondong?',
    answer:
      'SMK PGRI 2 Kedondong beralamat di Jl. Tritura Kedondong, RT 1 / RW 1, Kecamatan Kedondong, Kabupaten Pesawaran, Provinsi Lampung 35381 dengan NPSN resmi 10811003.',
    category: 'Profil',
    orderIndex: 2,
  },
  {
    question: 'Bagaimana cara mendaftar siswa baru (PPDB / SPMB) secara online?',
    answer:
      'Buka halaman PPDB Online melalui menu atas atau tombol utama di beranda, lengkapi formulir pra-pendaftaran calon siswa baru, lalu simpan ringkasan bukti pendaftaran untuk verifikasi berkas di tata usaha sekolah.',
    category: 'PPDB',
    orderIndex: 3,
  },
  {
    question: 'Bagaimana cara mengecek Pengumuman Kelulusan UKK siswa?',
    answer:
      'Buka menu Layanan, pilih fitur Pengumuman UKK, lalu masukkan Nama Lengkap dan Kelas sesuai data Dapodik (contoh kelas: XII.1). Hasil akan langsung ditampilkan dari sistem pengumuman sekolah.',
    category: 'Layanan UKK',
    orderIndex: 4,
  },
];

export const DEFAULT_PPDB: Array<Omit<PpdbRegistration, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>> = [
  {
    fullName: 'Rizky Pratama Wijaya',
    nisn: '0094812310',
    originSchool: 'SMPN 1 Kedondong',
    programCode: 'TKJ',
    whatsapp: '085279112201',
    status: 'terverifikasi',
    notes: 'Berkas ijazah sementara & KK lengkap di TU.',
  },
  {
    fullName: 'Ahmad Fauzan Hidayat',
    nisn: '0095128834',
    originSchool: 'MTs Al-Khairiyah Way Lima',
    programCode: 'TKR',
    whatsapp: '081369445512',
    status: 'diterima',
    notes: 'Lulus seleksi minat bakat bengkel otomotif.',
  },
  {
    fullName: 'Siti Nurhaliza Putri',
    nisn: '0096331942',
    originSchool: 'SMPN 2 Kedondong',
    programCode: 'BD',
    whatsapp: '082188340019',
    status: 'menunggu',
    notes: 'Menunggu verifikasi surat keterangan lulus.',
  },
  {
    fullName: 'Dimas Arya Saputra',
    nisn: '0093904411',
    originSchool: 'SMPN 1 Way Khilau',
    programCode: 'TSM',
    whatsapp: '085377819204',
    status: 'terverifikasi',
    notes: 'Jadwal wawancara orang tua hari Jumat.',
  },
  {
    fullName: 'Bagas Kurniawan',
    nisn: '0097450192',
    originSchool: 'SMP PGRI 1 Kedondong',
    programCode: 'TAV',
    whatsapp: '089655123490',
    status: 'diterima',
    notes: 'Terdaftar sebagai peserta didik baru gelombang 1.',
  },
];

export function buildDefaultAnalyticsDaily(): Array<Omit<AnalyticsDaily, 'id' | 'ownerId' | 'updatedAt'>> {
  const baseDate = new Date('2026-11-18T12:00:00Z');
  const metrics = [
    { visitors: 248, pageViews: 612, ppdbClicks: 31, ukkChecks: 19, avgDurationSec: 185 },
    { visitors: 274, pageViews: 689, ppdbClicks: 38, ukkChecks: 24, avgDurationSec: 192 },
    { visitors: 312, pageViews: 785, ppdbClicks: 46, ukkChecks: 28, avgDurationSec: 208 },
    { visitors: 295, pageViews: 730, ppdbClicks: 41, ukkChecks: 22, avgDurationSec: 198 },
    { visitors: 368, pageViews: 940, ppdbClicks: 59, ukkChecks: 35, avgDurationSec: 224 },
    { visitors: 415, pageViews: 1084, ppdbClicks: 72, ukkChecks: 43, avgDurationSec: 241 },
    { visitors: 452, pageViews: 1196, ppdbClicks: 84, ukkChecks: 51, avgDurationSec: 256 },
  ];

  return metrics.map((m, idx) => {
    const d = new Date(baseDate);
    d.setUTCDate(baseDate.getUTCDate() - (6 - idx));
    const dateKey = d.toISOString().slice(0, 10);
    return {
      dateKey,
      ...m,
    };
  });
}

export const DEFAULT_ANALYTICS_EVENTS: Array<Omit<AnalyticsEvent, 'id' | 'ownerId' | 'createdAt'>> = [
  { route: 'ppdb', actionType: 'ppdb_submit', device: 'Mobile', referrer: 'Instagram @smkpgri2kdd' },
  { route: 'jurusan', actionType: 'pageview', device: 'Mobile', referrer: 'Google Search' },
  { route: 'layanan', actionType: 'ukk_lookup', device: 'Desktop', referrer: 'smkpgri2kedondong.sch.id' },
  { route: 'literasi', actionType: 'article_read', device: 'Mobile', referrer: 'WhatsApp Channel' },
  { route: 'beranda', actionType: 'pageview', device: 'Desktop', referrer: 'Direct' },
  { route: 'ppdb', actionType: 'pageview', device: 'Mobile', referrer: 'TikTok @smkpgri2kdd' },
];
