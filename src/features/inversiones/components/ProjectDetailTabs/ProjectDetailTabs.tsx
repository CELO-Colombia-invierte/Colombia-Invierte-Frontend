import React, { useRef, useState, useEffect } from 'react';
import './ProjectDetailTabs.css';

export type TabId =
  | 'resumen'
  | 'finanzas'
  | 'documentos'
  | 'participantes'
  | 'solicitudes'
  | 'historial'
  | 'gobernanza'
  | 'disputas'
  | 'hitos'
  | 'propuestas';

interface ProjectDetailTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  isOwner?: boolean;
  isMember?: boolean;
  hasV2?: boolean;
  hasActivePropuesta?: boolean;
  hasPendingRewards?: boolean;
  isNatillera?: boolean;
}

export const ProjectDetailTabs: React.FC<ProjectDetailTabsProps> = ({
  activeTab,
  onTabChange,
  isOwner = false,
  isMember = false,
  hasV2 = false,
  hasActivePropuesta = false,
  hasPendingRewards = false,
  isNatillera = false,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  };

  useEffect(() => {
    const el = scrollRef.current;
    checkScroll();
    el?.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el?.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(checkScroll, 50);
    return () => clearTimeout(t);
  }, [isOwner, isMember, hasV2]);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -160 : 160, behavior: 'smooth' });
  };

  const tabs: { id: TabId; label: string; visible: boolean }[] = [
    { id: 'resumen', label: 'Resumen', visible: true },
    { id: 'finanzas', label: 'Finanzas', visible: true },
    { id: 'documentos', label: 'Documentos', visible: true },
    { id: 'participantes', label: 'Participantes', visible: isOwner || isMember },
    { id: 'solicitudes', label: 'Solicitudes', visible: isOwner },
    { id: 'historial', label: 'Historial', visible: true },
    { id: 'gobernanza', label: 'Decisiones', visible: hasV2 },
    { id: 'disputas', label: 'Reclamos', visible: hasV2 },
    { id: 'hitos', label: 'Etapas', visible: hasV2 && !isNatillera },
    { id: 'propuestas', label: 'Propuestas', visible: isOwner || isMember },
  ];

  return (
    <div className="tabs-wrapper">
      <button
        className={`tabs-scroll-btn tabs-scroll-btn--left ${!canScrollLeft ? 'tabs-scroll-btn--hidden' : ''}`}
        onClick={() => scroll('left')}
        aria-label="Desplazar tabs a la izquierda"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <div className="project-detail-tabs" ref={scrollRef}>
        {tabs.filter((t) => t.visible).map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
            {tab.id === 'propuestas' && hasActivePropuesta && (
              <span className="tab-active-dot" />
            )}
            {tab.id === 'finanzas' && hasPendingRewards && (
              <span className="tab-active-dot" />
            )}
          </button>
        ))}
      </div>

      <button
        className={`tabs-scroll-btn tabs-scroll-btn--right ${!canScrollRight ? 'tabs-scroll-btn--hidden' : ''}`}
        onClick={() => scroll('right')}
        aria-label="Desplazar tabs a la derecha"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
};
