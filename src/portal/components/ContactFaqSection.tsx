import React, { useState } from 'react';
import { ChevronDown, Mail, MapPin, Send } from 'lucide-react';
import { FAQ_ITEMS, SCHOOL_IDENTITY } from '../data/schoolData';
import { PublicSiteIdentity } from '../services/usePortalData';
import { FaqEntry } from '../types/portal';

interface ContactFaqSectionProps {
  faqs?: FaqEntry[];
  siteIdentity?: PublicSiteIdentity;
}

export const ContactFaqSection: React.FC<ContactFaqSectionProps> = ({
  faqs = FAQ_ITEMS,
  siteIdentity,
}) => {
  const email = siteIdentity?.email || SCHOOL_IDENTITY.email;
  const address = siteIdentity?.address || SCHOOL_IDENTITY.address;
  const schoolName = siteIdentity?.name || SCHOOL_IDENTITY.name;

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('Informasi PPDB & Program Keahlian');
  const [message, setMessage] = useState('');
  const [formNotice, setFormNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail.trim());
    if (!senderName.trim() || !emailValid || message.trim().length < 10) {
      setFormNotice({
        type: 'err',
        text: 'Mohon isi nama lengkap, alamat email yang valid, dan pesan minimal 10 karakter.',
      });
      return;
    }

    setFormNotice({
      type: 'ok',
      text: `Terima kasih, ${senderName.trim()}. Pesan Anda telah tercatat untuk diteruskan ke tata usaha ${schoolName} (${email}).`,
    });
    setSenderName('');
    setSenderEmail('');
    setMessage('');
  };

  return (
    <section
      id="kontak-kami"
      aria-labelledby="heading-kontak"
      className="border-t border-slate-200 bg-slate-50 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* FAQ Column */}
          <div className="lg:col-span-6">
            <p className="text-xs font-semibold tracking-wider text-blue-700 uppercase">
              Pertanyaan Umum
            </p>
            <h2
              id="heading-kontak"
              className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-950"
            >
              Informasi Seputar Layanan &amp; Sekolah
            </h2>

            <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
              {faqs.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={item.question} className="p-5">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="flex w-full cursor-pointer items-center justify-between gap-4 text-left"
                    >
                      <span className="font-display text-sm font-bold text-slate-950 sm:text-base">
                        {item.question}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-150 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">
                        {item.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Form & Address Column */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <h3 className="font-display text-xl font-bold text-slate-950">
                Hubungi Pengelola Portal &amp; Sekolah
              </h3>
              <div className="mt-4 space-y-2.5 text-sm text-slate-600">
                <p className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                  <span>{address}</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-blue-700" />
                  <a
                    href={`mailto:${email}`}
                    className="font-medium text-blue-700 hover:underline"
                  >
                    {email}
                  </a>
                </p>
              </div>

              <form onSubmit={handleContactSubmit} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Nama Pengirim
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Nama Anda"
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-blue-700 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Alamat Email
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-blue-700 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Perihal
                  </label>
                  <select
                    id="contact-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-blue-700 focus:outline-none"
                  >
                    <option value="Informasi PPDB & Program Keahlian">
                      Informasi PPDB &amp; Program Keahlian
                    </option>
                    <option value="Layanan Akademik & Pengumuman UKK">
                      Layanan Akademik &amp; Pengumuman UKK
                    </option>
                    <option value="Kerja Sama Industri / Prakerin">
                      Kerja Sama Industri / Praktik Kerja Lapangan
                    </option>
                    <option value="Privasi & Koreksi Data Portal">
                      Privasi &amp; Koreksi Data Portal
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Pesan
                  </label>
                  <textarea
                    id="contact-message"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tuliskan pertanyaan atau kebutuhan Anda..."
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-blue-700 focus:outline-none"
                  />
                </div>

                {formNotice && (
                  <div
                    role="status"
                    className={`rounded-lg border p-3 text-xs ${
                      formNotice.type === 'ok'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                        : 'border-red-200 bg-red-50 text-red-900'
                    }`}
                  >
                    {formNotice.text}
                  </div>
                )}

                <button
                  type="submit"
                  className="inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
                >
                  <Send className="h-4 w-4" />
                  Kirim Pesan ke Sekolah
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
