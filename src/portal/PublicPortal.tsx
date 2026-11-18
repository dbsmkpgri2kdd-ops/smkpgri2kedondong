import React, { useCallback, useEffect, useState } from 'react';
import { ContactFaqSection } from './components/ContactFaqSection';
import { CookieConsent } from './components/CookieConsent';
import { HomeSummaryView } from './components/HomeSummaryView';
import { LegalModal } from './components/LegalModal';
import { LiteracyDigitalView } from './components/LiteracyDigitalView';
import { MediaGalleryView } from './components/MediaGalleryView';
import { PortalFooter } from './components/PortalFooter';
import { PortalHeader, ServiceSubTab } from './components/PortalHeader';
import { PpdbView } from './components/PpdbView';
import { ProfileFullView } from './components/ProfileFullView';
import { ProgramsSection } from './components/ProgramsSection';
import { ServicesSection, ServiceTab } from './components/ServicesSection';
import { ROUTE_SEO, stripBasePath, withBase } from './data/schoolData';
import { fetchPortalItems, getCachedPortalItems } from './services/schoolApi';
import { usePortalData } from './services/usePortalData';
import { DynamicPortalItem, PortalRoute } from './types/portal';

interface PublicPortalProps {
  onOpenAdmin: () => void;
}

function resolveRouteFromPath(pathname: string): PortalRoute {
  const stripped = stripBasePath(pathname);
  const clean = stripped.replace(/\/+$/, '') || '/';
  const match = (Object.keys(ROUTE_SEO) as PortalRoute[]).find(
    (r) => ROUTE_SEO[r].path === clean
  );
  return match || 'beranda';
}

export const PublicPortal: React.FC<PublicPortalProps> = ({ onOpenAdmin }) => {
  const [activeRoute, setActiveRoute] = useState<PortalRoute>(() =>
    resolveRouteFromPath(window.location.pathname)
  );
  const [serviceTab, setServiceTab] = useState<ServiceTab>('ukk');
  const [portalItems, setPortalItems] = useState<DynamicPortalItem[]>(() =>
    getCachedPortalItems()
  );
  const [portalLoading, setPortalLoading] = useState(false);
  const [externalModal, setExternalModal] = useState<{ title: string; url: string } | null>(
    null
  );
  const [preselectedPpdbProgram, setPreselectedPpdbProgram] = useState<string>('');

  const {
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
  } = usePortalData();

  const refreshPortalItems = useCallback(async () => {
    setPortalLoading(true);
    try {
      const items = await fetchPortalItems();
      setPortalItems(items);
    } catch {
      // Fall back to cached or empty gracefully
    } finally {
      setPortalLoading(false);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    refreshPortalItems();
  }, [refreshPortalItems]);

  useEffect(() => {
    const seo = ROUTE_SEO[activeRoute];
    if (seo) {
      document.title = seo.title;
    }
    trackPublicEvent(activeRoute, 'pageview');
  }, [activeRoute, trackPublicEvent]);

  useEffect(() => {
    const onPopState = () => {
      if (stripBasePath(window.location.pathname).startsWith('/admin')) return;
      setActiveRoute(resolveRouteFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleNavigate = useCallback((route: PortalRoute, sectionId?: string) => {
    setActiveRoute(route);
    const targetPath = ROUTE_SEO[route]?.path || '/';
    const fullTargetUrl = withBase(targetPath);
    if (window.location.pathname !== fullTargetUrl) {
      window.history.pushState({}, '', fullTargetUrl);
    }
    if (sectionId) {
      window.setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleSelectService = useCallback(
    (tab: ServiceSubTab) => {
      setServiceTab(tab);
      handleNavigate('layanan');
    },
    [handleNavigate]
  );

  const handleApplyProgramFromQuiz = useCallback(
    (programCode: string) => {
      setPreselectedPpdbProgram(programCode);
      handleNavigate('ppdb');
    },
    [handleNavigate]
  );

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <PortalHeader
        activeRoute={activeRoute}
        onNavigate={handleNavigate}
        onSelectService={handleSelectService}
        onOpenAdmin={onOpenAdmin}
        schoolName={siteIdentity.name}
      />

      <main className="flex-1">
        {activeRoute === 'beranda' && (
          <HomeSummaryView
            onNavigate={handleNavigate}
            onSelectService={handleSelectService}
            programs={programs}
            news={news}
            siteIdentity={siteIdentity}
          />
        )}

        {activeRoute === 'profil' && <ProfileFullView siteIdentity={siteIdentity} />}

        {activeRoute === 'jurusan' && (
          <ProgramsSection programs={programs} onApplyProgram={handleApplyProgramFromQuiz} />
        )}

        {activeRoute === 'ppdb' && (
          <PpdbView
            programs={programs}
            siteIdentity={siteIdentity}
            onSubmitPpdb={submitPublicPpdb}
            preselectedProgram={preselectedPpdbProgram}
          />
        )}

        {activeRoute === 'layanan' && (
          <ServicesSection
            portalItems={portalItems}
            portalLoading={portalLoading}
            onOpenExternal={(title, url) => setExternalModal({ title, url })}
            activeTab={serviceTab}
            onTabChange={setServiceTab}
            firestorePtk={ptkMembers}
            academicEvents={academicEvents}
            programs={programs}
            onTrackUkk={() => trackPublicEvent('layanan', 'ukk_lookup')}
            onSubmitTracer={submitPublicTracer}
          />
        )}

        {activeRoute === 'literasi' && (
          <LiteracyDigitalView
            portalItems={portalItems}
            portalLoading={portalLoading}
            onRefreshPortal={refreshPortalItems}
            onOpenExternal={(title, url) => setExternalModal({ title, url })}
            articles={articles}
            onArticleRead={() => trackPublicEvent('literasi', 'article_read')}
          />
        )}

        {activeRoute === 'media' && (
          <MediaGalleryView
            portalItems={portalItems}
            portalLoading={portalLoading}
            onRefreshPortal={refreshPortalItems}
            onOpenExternal={(title, url) => setExternalModal({ title, url })}
            news={news}
            siteIdentity={siteIdentity}
            onNavigate={handleNavigate}
          />
        )}

        {activeRoute === 'kontak' && (
          <ContactFaqSection
            faqs={faqs}
            siteIdentity={siteIdentity}
            onSubmitContact={submitPublicContact}
          />
        )}
      </main>

      <PortalFooter
        onNavigate={handleNavigate}
        onOpenAdmin={onOpenAdmin}
        siteIdentity={siteIdentity}
      />

      <CookieConsent />

      {externalModal && (
        <LegalModal
          title={externalModal.title}
          iframeUrl={externalModal.url}
          onClose={() => setExternalModal(null)}
        />
      )}
    </div>
  );
};
