import {
  AcademicEvent,
  EditorialArticle,
  Extracurricular,
  FaqEntry,
  PortalRoute,
  SchoolFacility,
  SchoolNewsItem,
  StudyProgram,
} from '../types/portal';

export const SCHOOL_ENDPOINTS = {
  KELULUSAN_API:
    'https://script.google.com/macros/s/AKfycbwE4oaM8yqhsHdyL6aEA4b0y-Z_V-UBpVw7RsJg0oBQeouffCS1W8yEORXBPnE4u7oHyg/exec',
  PORTAL_API:
    'https://script.google.com/macros/s/AKfycbzdUXE8vqAH7g2wa-XnvQWZm1-4cXxMlOjlxsUAufOhjx8OcMfcYe2U8OTa_nKxmsxu/exec',
  PTK_API:
    'https://script.google.com/macros/s/AKfycbxVPghKfdnp99pACz0akNkwD7cTN5xobHZg8lBGF8x7OcopVTTdubahMfkBYvNjfr_5Wg/exec',
};

export const SCHOOL_IDENTITY = {
  name: 'SMK PGRI 2 Kedondong',
  officialName: 'SMKS PGRI 2 Kedondong',
  shortName: 'PRIDA',
  npsn: '10811003',
  level: 'SMK',
  status: 'Swasta (YPLP-PGRI)',
  foundedYear: '2003',
  skPendirian: '24/C/YPLP-PGRI/V/2004 (22 Mei 2004)',
  izinOperasional: '42.5/966/11.2/2006 (24 Februari 2006)',
  landArea: '8.000 m²',
  founder: 'DR. Andi Munandar, M.M., M.Si.',
  landDonor: 'Drs. Hi. Aminullah Ihsan',
  address: 'Jl. Tritura Kedondong, RT 1 / RW 1, Kec. Kedondong, Kab. Pesawaran, Lampung 35381',
  hours: 'Senin – Sabtu · 07.15 – 14.30 WIB',
  domain: 'https://smkpgri2kedondong.sch.id',
  email: 'dbsmkpgri2kdd@gmail.com',
  social: {
    instagram: 'https://www.instagram.com/smkpgri2kdd/',
    facebook: 'https://www.facebook.com/',
    whatsapp: 'https://whatsapp.com/channel/0029VbAdeE6AInPmCmeupj3Z',
    tiktok: 'https://www.tiktok.com/@smkpgri2kdd?_r=1&_t=ZS-99hN2VYkopM',
  },
};

// Konfigurasi Unit Iklan Google AdSense per posisi (ca-pub-3979615977174432).
export const ADSENSE_CONFIG = {
  clientId: 'ca-pub-3979615977174432',
  slots: {
    homeMidBanner: '8949161893', // Iklan Display WebPrida - Beranda
    profileMidBanner: '8949161893', // Iklan Display WebPrida - Halaman Profil
    programBottom: '8949161893', // Iklan Display WebPrida - Program Keahlian
    literacyFeed: '8949161893', // Iklan Display WebPrida - Sumber Literasi Digital
    articleInContent: '6217563484', // Iklan Artikel (In-Article Fluid) - Modal Baca Artikel
    mediaGalleryBanner: '8949161893', // Iklan Display WebPrida - Media & Dokumentasi
  },
};

const BASE_URL = import.meta.env.BASE_URL || '/';

export function withBase(path: string): string {
  const clean = path.replace(/^\/+/, '');
  return `${BASE_URL}${clean}`;
}

export const HERO_MEDIA = {
  campus: withBase('src/assets/images/hero_campus_clean_1794883667495.jpg'),
  automotiveLab: withBase('src/assets/images/lab_engineering_automotive_1794883647783.jpg'),
  networkLab: withBase('src/assets/images/lab_network_digital_1794883648012.jpg'),
  electronicsStudio: withBase('src/assets/images/studio_electronics_banking_1794883647802.jpg'),
};

export const ROUTE_SEO: Record<
  PortalRoute,
  { path: string; title: string; description: string }
> = {
  beranda: {
    path: '/',
    title: 'SMK PGRI 2 Kedondong — Portal Digital Sekolah & Vokasi Unggul',
    description:
      'Portal resmi SMK PGRI 2 Kedondong (NPSN 10811003), Pesawaran, Lampung: 5 program keahlian, PPDB Online, pengumuman UKK, direktori PTK, dan literasi kejuruan.',
  },
  profil: {
    path: '/profil',
    title: 'Profil, Visi Misi & Fasilitas — SMK PGRI 2 Kedondong',
    description:
      'Visi, misi, sejarah berdiri sejak 2003, identitas NPSN 10811003, fasilitas bengkel & laboratorium, ekstrakurikuler, serta kemitraan industri SMK PGRI 2 Kedondong.',
  },
  jurusan: {
    path: '/jurusan',
    title: '5 Program Keahlian — SMK PGRI 2 Kedondong',
    description:
      'Kompetensi keahlian SMK PGRI 2 Kedondong: TKR, TSM, TKJ, TAV, dan Bisnis Digital (BD) lengkap dengan kurikulum praktik dan prospek karier.',
  },
  ppdb: {
    path: '/ppdb',
    title: 'SPMB / PPDB Online — SMK PGRI 2 Kedondong',
    description:
      'Informasi penerimaan peserta didik baru (PPDB/SPMB), persyaratan berkas, jadwal gelombang, dan pendaftaran online SMK PGRI 2 Kedondong.',
  },
  layanan: {
    path: '/layanan',
    title: 'Layanan Akademik, Cek UKK, PTK & Kalender — SMK PGRI 2 Kedondong',
    description:
      'Cek pengumuman kelulusan UKK, direktori guru & tenaga kependidikan (PTK), tracer alumni & BKK, kalender akademik, serta unduhan panduan sekolah.',
  },
  literasi: {
    path: '/literasi',
    title: 'Berita Sekolah & Literasi Vokasi — SMK PGRI 2 Kedondong',
    description:
      'Berita kegiatan sekolah, artikel edukasi kejuruan, panduan keselamatan bengkel otomotif, jaringan komputer, elektronika, dan bisnis digital.',
  },
  media: {
    path: '/media',
    title: 'Media Sosial & Galeri Video Sekolah — SMK PGRI 2 Kedondong',
    description:
      'Dokumentasi kegiatan, galeri video pembelajaran, serta kanal media sosial resmi SMK PGRI 2 Kedondong.',
  },
  kontak: {
    path: '/kontak',
    title: 'Hubungi Kami & FAQ — SMK PGRI 2 Kedondong',
    description:
      'Alamat kampus Jl. Tritura Kedondong Pesawaran, jam layanan tata usaha, pertanyaan umum PPDB dan UKK, serta formulir komunikasi resmi sekolah.',
  },
};

export const VISION_MISSION = {
  vision:
    'Terwujudnya lulusan SMK PGRI 2 Kedondong yang berakhlak mulia, terampil, adaptif terhadap perkembangan teknologi industri dan bisnis digital, serta mandiri dalam berkarya.',
  missions: [
    'Menyelenggarakan pembelajaran berbasis praktik bengkel dan laboratorium sesuai standar dunia usaha dan dunia industri (DUDI).',
    'Membentuk karakter disiplin, etos kerja, budaya Keselamatan dan Kesehatan Kerja (K3), serta tanggung jawab sosial bagi seluruh peserta didik.',
    'Mengembangkan literasi digital, kewirausahaan, dan sertifikasi kompetensi keahlian pada lima jurusan unggulan sekolah.',
    'Memperluas jejaring kemitraan Praktik Kerja Lapangan (PKL) dan penyaluran lulusan melalui Bursa Kerja Khusus (BKK).',
  ],
  principalNote: {
    greeting:
      'Selamat datang di Portal Digital Resmi SMK PGRI 2 Kedondong (PRIDA). Kehadiran portal ini merupakan komitmen kami untuk membuka akses informasi pendidikan vokasi yang transparan, cepat, dan mudah dijangkau oleh peserta didik, orang tua, alumni, serta mitra industri di Kabupaten Pesawaran dan sekitarnya.',
    closing:
      'Kami terus berinovasi memadukan keterampilan teknis otomotif, jaringan komputer, elektronika audio-video, dan bisnis digital agar setiap lulusan siap kerja, siap kuliah, maupun siap berwirausaha.',
  },
};

export const HISTORY_PARAGRAPHS = [
  'Pendirian SMK PGRI 2 Kedondong dilatarbelakangi oleh kondisi wilayah Kecamatan Kedondong dan sekitarnya—meliputi Way Lima, Way Khilau, Padang Cermin (dahulu Kabupaten Lampung Selatan, kini Kabupaten Pesawaran) serta Kecamatan Pardasuka Kabupaten Tanggamus—yang pada masa itu belum memiliki Sekolah Menengah Kejuruan bidang teknologi.',
  'SMK PGRI 2 Kedondong diprakarsai oleh panitia pendiri yang dimotori oleh DR. Andi Munandar, M.M., M.Si. pada tahun 2003. Sekolah ini langsung menerima peserta didik angkatan pertama pada tahun pelajaran 2003/2004 berdasarkan Surat Keputusan Pengurus Yayasan Pembina Lembaga Pendidikan Persatuan Guru Republik Indonesia (YPLP-PGRI) Nomor 24/C/YPLP-PGRI/V/2004 tertanggal 22 Mei 2004.',
  'Izin operasional resmi diterbitkan dengan Nomor 42.5/966/11.2/2006 pada tanggal 24 Februari 2006 oleh Kepala Dinas Pendidikan Kabupaten Lampung Selatan. Kampus sekolah berdiri di atas tanah seluas 8.000 m² milik Drs. Hi. Aminullah Ihsan.',
  'Seiring pemekaran wilayah melalui Undang-Undang Nomor 33 Tahun 2007 yang diresmikan pada 2 November 2007, SMK PGRI 2 Kedondong resmi menjadi bagian dari Kabupaten Pesawaran, Provinsi Lampung, dan terus berkembang menyelenggarakan lima program keahlian bidang teknologi rekayasa, elektronika, dan bisnis digital.',
];

export const SCHOOL_FACILITIES: SchoolFacility[] = [
  {
    name: 'Bengkel Praktik Otomotif TKR & TSM',
    unit: '2 Unit Bengkel Terpisah',
    description:
      'Dilengkapi car lift, scanner diagnostik injeksi EFI/OBD-II, bike lift sepeda motor, peralatan servis CVT, serta papan perkakas standar bengkel resmi.',
  },
  {
    name: 'Laboratorium Komputer, Server & Fiber Optik',
    unit: 'Lab TKJ & Studio Digital',
    description:
      'Perangkat workstation desktop, rak server jaringan, router MikroTik, fusion splicer fiber optik FTTH, dan koneksi internet berkecepatan tinggi.',
  },
  {
    name: 'Workshop Elektronika & Studio Audio Video',
    unit: 'Bengkel Praktik TAV',
    description:
      'Meja praktik elektronika lengkap dengan osiloskop digital, multimeter presisi, stasiun solder, audio mixer konsol, serta perangkat tata suara lapangan.',
  },
  {
    name: 'Studio Pemasaran & Kewirausahaan Digital',
    unit: 'Lab Bisnis Digital',
    description:
      'Ruang praktik foto produk UMKM, produksi konten promosi, pengelolaan katalog toko daring, dan simulasi layanan pelanggan digital.',
  },
  {
    name: 'Perpustakaan, Ruang Kelas & Sarana Ibadah',
    unit: 'Area Kampus 8.000 m²',
    description:
      'Ruang belajar representatif, perpustakaan koleksi buku kejuruan, lapangan olahraga serbaguna, mushola sekolah, dan area parkir tertib.',
  },
];

export const EXTRACURRICULARS: Extracurricular[] = [
  {
    name: 'Pramuka Penegak',
    schedule: 'Jumat · 14.30 WIB',
    focus: 'Kepemimpinan, kemandirian, dan pengabdian masyarakat.',
  },
  {
    name: 'Paskibra Sekolah',
    schedule: 'Sabtu · 08.00 WIB',
    focus: 'Kedisiplinan baris-berbaris dan tata upacara bendera.',
  },
  {
    name: 'Rohani Islam (Rohis)',
    schedule: 'Jumat · 13.00 WIB',
    focus: 'Pembinaan akhlak, kajian keagamaan, dan kegiatan sosial.',
  },
  {
    name: 'Klub IT, Jaringan & Multimedia',
    schedule: 'Rabu · 14.30 WIB',
    focus: 'Persiapan Lomba Kompetensi Siswa (LKS), desain, dan jaringan.',
  },
  {
    name: 'Olahraga Prestasi (Futsal & Voli)',
    schedule: 'Selasa & Kamis · 15.00 WIB',
    focus: 'Kebugaran jasmani, sportivitas, dan turnamen antar-pelajar.',
  },
  {
    name: 'Palang Merah Remaja (PMR)',
    schedule: 'Sabtu · 10.00 WIB',
    focus: 'Pertolongan pertama, kesehatan sekolah, dan tanggap darurat.',
  },
];

export const INDUSTRY_PARTNERS = [
  'Bengkel Resmi & Mitra Servis Otomotif Roda Empat di Lampung',
  'Jaringan Bengkel Sepeda Motor Resmi Wilayah Pesawaran & Bandar Lampung',
  'Penyedia Layanan Internet (ISP) Lokal & Teknisi Infrastruktur Fiber Optik',
  'Studio Penyiaran, Penyedia Tata Suara & Layanan Purna Jual Elektronika',
  'Pelaku UMKM Unggulan Pesawaran & Mitra Pemasaran E-Commerce',
];

export const ACADEMIC_CALENDAR: AcademicEvent[] = [
  {
    period: 'Juli 2026',
    title: 'Masa Pengenalan Lingkungan Sekolah (MPLS) & Awal Semester Ganjil',
    description:
      'Orientasi peserta didik baru kelas X mengenai tata tertib, budaya K3 bengkel, dan pengenalan jurusan.',
  },
  {
    period: 'September – November 2026',
    title: 'Penilaian Tengah Semester & Pembekalan Praktik Kerja Lapangan (PKL)',
    description:
      'Evaluasi capaian belajar semester ganjil serta pembekalan administrasi dan kesiapan kerja bagi siswa kelas XI/XII.',
  },
  {
    period: 'Desember 2026',
    title: 'Asesmen Sumatif Akhir Semester Ganjil & Pembagian Rapor',
    description:
      'Ujian teori dan praktik kejuruan akhir semester dilanjutkan penerimaan laporan hasil belajar.',
  },
  {
    period: 'Januari – Maret 2027',
    title: 'Pelaksanaan Praktik Kerja Lapangan (PKL) & Uji Kompetensi Keahlian (UKK)',
    description:
      'Penempatan siswa di dunia usaha/industri mitra serta pelaksanaan UKK kelas XII bersama penguji eksternal.',
  },
  {
    period: 'April – Juni 2027',
    title: 'Pengumuman Kelulusan UKK & Penerimaan Peserta Didik Baru (PPDB/SPMB)',
    description:
      'Publikasi kelulusan siswa melalui portal PRIDA dan pembukaan gelombang pendaftaran siswa baru tahun ajaran berikutnya.',
  },
];

export const SCHOOL_NEWS: SchoolNewsItem[] = [
  {
    id: 'spmb-2027',
    date: '16 November 2026',
    category: 'Informasi PPDB',
    title: 'Informasi Pra-Pendaftaran SPMB SMK PGRI 2 Kedondong Tahun Ajaran Baru Dibuka',
    summary:
      'Calon peserta didik lulusan SMP/MTs kini dapat mengisi formulir pra-pendaftaran secara daring untuk 5 program keahlian unggulan.',
  },
  {
    id: 'persiapan-ukk',
    date: '12 November 2026',
    category: 'Akademik & UKK',
    title: 'Pemantapan Praktik Bengkel & Laboratorium Menjelang Uji Kompetensi Keahlian',
    summary:
      'Siswa kelas XII dari jurusan TKR, TSM, TKJ, TAV, dan Bisnis Digital mengikuti pendampingan intensif standar penguji industri.',
  },
  {
    id: 'portal-prida-baru',
    date: '10 November 2026',
    category: 'Layanan Digital',
    title: 'Pembaruan Portal Digital smkpgri2kedondong.sch.id Terintegrasi Layanan Akademik',
    summary:
      'Portal resmi kini menyediakan fitur cek pengumuman UKK, direktori PTK, tracer alumni BKK, dan pusat literasi kejuruan.',
  },
];

export const SCHOOL_DOCUMENTS = [
  {
    title: 'Brosur Profil & 5 Program Keahlian SMK PGRI 2 Kedondong',
    category: 'Informasi PPDB',
    format: 'Ringkasan Digital · Siap Cetak',
  },
  {
    title: 'Panduan Tata Tertib & Budaya Keselamatan Kerja (K3) Bengkel',
    category: 'Kesiswaan',
    format: 'Pedoman Siswa',
  },
  {
    title: 'Pedoman Praktik Kerja Lapangan (PKL) Dunia Usaha & Industri',
    category: 'Kurikulum & Hubin',
    format: 'Panduan Kelas XI/XII',
  },
  {
    title: 'Alur Pengecekan Pengumuman Kelulusan UKK & Verifikasi Dapodik',
    category: 'Akademik',
    format: 'Petunjuk Layanan',
  },
];

export const STUDY_PROGRAMS: StudyProgram[] = [
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
    image: HERO_MEDIA.automotiveLab,
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
    image: HERO_MEDIA.automotiveLab,
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
    image: HERO_MEDIA.networkLab,
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
    image: HERO_MEDIA.electronicsStudio,
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
    image: HERO_MEDIA.networkLab,
  },
];

export const EDITORIAL_ARTICLES: EditorialArticle[] = [
  {
    id: 'k3-bengkel-otomotif',
    slug: 'panduan-k3-bengkel-otomotif-tkr-tsm',
    title: 'Standar Keselamatan Kerja (K3) di Bengkel Praktik Otomotif TKR dan TSM',
    category: 'Teknologi & Rekayasa',
    author: 'Tim Kurikulum Produktif Otomotif',
    publishedAt: '10 November 2026',
    readTime: '4 menit baca',
    excerpt:
      'Penerapan prosedur K3 di lingkungan bengkel otomotif bukan sekadar formalitas, melainkan kebiasaan profesional yang melindungi siswa dan menjaga presisi kerja.',
    paragraphs: [
      'Di lingkungan bengkel praktik Teknik Kendaraan Ringan (TKR) maupun Teknik Sepeda Motor (TSM), siswa setiap hari berhadapan dengan komponen bergerak, cairan mudah terbakar, tekanan hidrolik, serta peralatan bertenaga listrik. Oleh karena itu, budaya Keselamatan dan Kesehatan Kerja (K3) ditanamkan sejak semester pertama sebelum peserta didik memegang unit kendaraan praktik.',
      'Langkah paling mendasar adalah penggunaan Alat Pelindung Diri (APD) standar bengkel: wearpack berlengan pas yang tidak mudah tersangkut komponen berputar, sepatu keselamatan (safety shoes) berujung baja anti-selip, serta kacamata pelindung saat melakukan penggerindaan atau pembersihan dengan udara bertekanan.',
      'Selain perlengkapan pribadi, tata letak bengkel yang rapi berperan besar menekan risiko kecelakaan. Tumpahan oli atau cairan pendingin harus segera dibersihkan dengan serbuk penyerap agar lantai tetap kesat. Kunci pas, kunci sok, dan alat ukur presisi wajib dikembalikan ke papan perkakas (tool board) setelah digunakan agar tidak tertinggal di ruang mesin.',
      'Pada kendaraan berteknologi injeksi modern dan kelistrikan bertegangan tinggi, prosedur pemutusan terminal negatif baterai sebelum membongkar sistem kelistrikan menjadi aturan wajib. Kebiasaan disiplin ini mempersiapkan lulusan SMK PGRI 2 Kedondong agar langsung memenuhi standar operasional bengkel resmi industri.',
    ],
    keyTakeaways: [
      'Gunakan wearpack, safety shoes, dan kacamata pelindung sesuai jenis pekerjaan bengkel.',
      'Jaga kebersihan lantai kerja dari ceceran oli serta kembalikan perkakas ke tool board.',
      'Selalu putuskan arus kelistrikan sebelum melakukan pembongkaran komponen elektronik.',
    ],
  },
  {
    id: 'jaringan-fiber-mikrotik-tkj',
    slug: 'pengenalan-topologi-fiber-optik-manajemen-bandwidth-tkj',
    title: 'Mengenal Topologi Jaringan Fiber Optik dan Manajemen Bandwidth untuk Siswa TKJ',
    category: 'Teknik Komputer & Jaringan',
    author: 'Tim Laboratorium TKJ SMK PGRI 2 Kedondong',
    publishedAt: '8 November 2026',
    readTime: '5 menit baca',
    excerpt:
      'Kebutuhan internet stabil di pedesaan dan perkotaan Pesawaran mendorong kompetensi penyambungan fiber optik serta pengaturan router menjadi keahlian paling dicari.',
    paragraphs: [
      'Perkembangan layanan internet berbasis Fiber to the Home (FTTH) hingga ke tingkat kecamatan menciptakan peluang kerja luas bagi lulusan Teknik Komputer dan Jaringan (TKJ). Di laboratorium jaringan SMK PGRI 2 Kedondong, siswa tidak hanya mempelajari kabel tembaga UTP, tetapi juga mengenal struktur kabel serat optik single-mode dan multimode.',
      'Dalam arsitektur FTTH, sinyal cahaya dikirimkan dari Optical Line Terminal (OLT) melalui kabel distribusi menuju Optical Distribution Point (ODP), kemudian diteruskan ke rumah pelanggan atau sekolah menggunakan kabel dropcore menuju Optical Network Terminal (ONT). Ketelitian saat mengupas jaket kabel, membersihkan core serat dengan alkohol, dan melakukan penyambungan menggunakan fusion splicer menentukan kecilnya nilai redaman (attenuation).',
      'Di sisi pengelolaan lalu lintas data, konfigurasi router menggunakan MikroTik RouterOS melatih siswa membagi alokasi bandwidth secara adil melalui fitur Simple Queue maupun Queue Tree. Pemahaman subnetting, VLAN untuk memisahkan jaringan laboratorium komputer dan akses tamu, serta aturan firewall dasar membuat jaringan lokal aman dan bebas kemacetan lalu lintas data.',
      'Kombinasi penguasaan lapisan fisik (kabel dan fiber optik) dan lapisan konfigurasi logis (routing dan keamanan jaringan) menjadikan siswa TKJ siap terjun sebagai teknisi penyedia jasa internet maupun administrator jaringan instansi.',
    ],
    keyTakeaways: [
      'Nilai redaman kabel optik sangat bergantung pada kebersihan core dan presisi splicing.',
      'Segmentasi jaringan dengan VLAN mencegah gangguan lalu lintas antar ruang praktik.',
      'Manajemen bandwidth yang terukur menjamin layanan pembelajaran digital tetap responsif.',
    ],
  },
  {
    id: 'pemasaran-digital-umkm-pesawaran',
    slug: 'strategi-pemasaran-digital-umkm-lokal-bisnis-digital',
    title: 'Strategi Pemasaran Digital UMKM Lokal bagi Kompetensi Bisnis Digital',
    category: 'Bisnis Digital',
    author: 'Kelompok Keahlian Bisnis Digital',
    publishedAt: '4 November 2026',
    readTime: '4 menit baca',
    excerpt:
      'Bagaimana siswa jurusan Bisnis Digital membantu pelaku usaha pertanian, kuliner, dan kerajinan di Kabupaten Pesawaran menjangkau pasar nasional secara terstruktur.',
    paragraphs: [
      'Kabupaten Pesawaran memiliki beragam produk unggulan daerah mulai dari hasil olahan kopi, keripik pisang, produk perkebunan, hingga kerajinan tapis. Tantangan utama pelaku usaha mikro dan kecil sering kali terletak pada konsistensi kemasan informasi produk dan pemanfaatan kanal penjualan daring.',
      'Pada program keahlian Bisnis Digital (BD), peserta didik dilatih menyusun profil produk yang informatif: foto produk dengan pencahayaan bersih, deskripsi spesifikasi yang jujur termasuk berat bersih dan komposisi, serta penentuan kata kunci pencarian agar mudah ditemukan calon pembeli di mesin pencari maupun lokapasar.',
      'Siswa juga mempraktikkan penulisan naskah promosi (copywriting) yang berfokus pada manfaat nyata produk, bukan sekadar kalimat berlebihan. Selain itu, pencatatan pesanan, penghitungan margin keuntungan setelah biaya pengemasan dan pengiriman, serta pelayanan tanya jawab pelanggan menjadi materi praktik rutin di kelas kewirausahaan.',
      'Melalui praktik proyek nyata bersama pelaku usaha sekitar Kedondong, siswa Bisnis Digital memperoleh pengalaman membangun portofolio penjualan sebelum lulus.',
    ],
    keyTakeaways: [
      'Foto produk jelas dan deskripsi lengkap meningkatkan kepercayaan pembeli daring.',
      'Pemilihan kata kunci relevan membantu produk lokal muncul pada hasil pencarian.',
      'Perhitungan biaya pengemasan dan layanan purna jual menjaga keberlanjutan usaha.',
    ],
  },
  {
    id: 'kalibrasi-tata-suara-tav',
    slug: 'teknik-pengaturan-tata-suara-kalibrasi-audio-video-tav',
    title: 'Teknik Pengaturan Tata Suara dan Kalibrasi Sistem Audio Video untuk Siswa TAV',
    category: 'Teknik Audio Video',
    author: 'Tim Laboratorium Elektronika TAV',
    publishedAt: '1 November 2026',
    readTime: '4 menit baca',
    excerpt:
      'Memahami alur sinyal audio dari mikrofon menuju mixer dan amplifier, pencegahan feedback akustik, serta pengukuran rangkaian elektronika dasar di bengkel TAV.',
    paragraphs: [
      'Program keahlian Teknik Audio Video (TAV) menuntut ketelitian tinggi dalam merakit rangkaian elektronika sekaligus kepekaan dalam mengatur kualitas suara dan gambar. Di laboratorium TAV SMK PGRI 2 Kedondong, peserta didik dilatih memahami jalur sinyal (signal flow) mulai dari sumber input seperti mikrofon dan pemutar media, tahap pencampuran pada audio mixer, hingga penguatan daya menuju pengeras suara.',
      'Salah satu keterampilan yang paling sering diterapkan dalam acara sekolah maupun kegiatan masyarakat adalah pengendalian gain staging dan pencegahan umpan balik akustik (feedback). Dengan menyeimbangkan sensitivitas masukan (gain) pada konsol mixer serta mengatur posisi mikrofon relatif terhadap speaker monitor, suara vokal terdengar jernih tanpa dengung atau lengkingan tajam.',
      'Selain tata suara lapangan, siswa juga mempelajari teknik penyolderan komponen elektronika yang presisi serta penggunaan multimeter dan osiloskop untuk memeriksa tegangan kerja catu daya maupun bentuk gelombang sinyal penguat audio.',
      'Kombinasi penguasaan teori elektronika terapan dan praktik instalasi sistem audio-video langsung di lapangan membekali lulusan TAV agar siap bekerja di industri penyiaran, layanan purna jual elektronika, maupun jasa tata suara profesional.',
    ],
    keyTakeaways: [
      'Pengaturan gain staging yang tepat menjaga kejernihan audio dan mencegah distorsi.',
      'Penempatan speaker dan pemangkasan frekuensi bermasalah mencegah feedback.',
      'Pemeriksaan osiloskop dan multimeter memastikan keandalan rangkaian penguat.',
    ],
  },
];

export const FAQ_ITEMS: FaqEntry[] = [
  {
    question: 'Apa saja program keahlian yang tersedia di SMK PGRI 2 Kedondong?',
    answer:
      'SMK PGRI 2 Kedondong menyelenggarakan 5 program keahlian: Teknik Kendaraan Ringan (TKR), Teknik Sepeda Motor (TSM), Teknik Komputer dan Jaringan (TKJ), Teknik Audio Video (TAV), dan Bisnis Digital (BD).',
  },
  {
    question: 'Di mana alamat resmi dan berapa NPSN SMK PGRI 2 Kedondong?',
    answer:
      'SMK PGRI 2 Kedondong beralamat di Jl. Tritura Kedondong, RT 1 / RW 1, Kecamatan Kedondong, Kabupaten Pesawaran, Provinsi Lampung 35381 dengan NPSN resmi 10811003.',
  },
  {
    question: 'Bagaimana cara mendaftar siswa baru (PPDB / SPMB) secara online?',
    answer:
      'Buka halaman PPDB Online melalui menu atas atau tombol utama di beranda, lengkapi formulir pra-pendaftaran calon siswa baru, lalu simpan ringkasan bukti pendaftaran untuk verifikasi berkas di tata usaha sekolah.',
  },
  {
    question: 'Bagaimana cara mengecek Pengumuman Kelulusan UKK siswa?',
    answer:
      'Buka menu Layanan, pilih fitur Pengumuman UKK, lalu masukkan Nama Lengkap dan Kelas sesuai data Dapodik (contoh kelas: XII.1). Hasil akan langsung ditampilkan dari sistem pengumuman sekolah.',
  },
  {
    question: 'Bagaimana alumni dapat memperbarui status karier atau studi lanjut?',
    answer:
      'Alumni dapat mengisi formulir Tracer Alumni yang tersedia pada menu Layanan untuk mencatat tahun kelulusan, program keahlian, serta status bekerja, berwirausaha, atau melanjutkan kuliah.',
  },
];
