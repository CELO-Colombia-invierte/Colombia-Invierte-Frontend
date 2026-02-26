import React from 'react';
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
  | 'hitos';

interface ProjectDetailTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  isOwner?: boolean;
  isMember?: boolean;
  hasV2?: boolean;
}

export const ProjectDetailTabs: React.FC<ProjectDetailTabsProps> = ({
  activeTab,
  onTabChange,
  isOwner = false,
  isMember = false,
  hasV2 = false,
}) => {
  return (
    <div className="project-detail-tabs">
      <button
        className={`tab-button ${activeTab === 'resumen' ? 'active' : ''}`}
        onClick={() => onTabChange('resumen')}
      >
        Resumen
      </button>
      <button
        className={`tab-button ${activeTab === 'finanzas' ? 'active' : ''}`}
        onClick={() => onTabChange('finanzas')}
      >
        Finanzas
      </button>
      <button
        className={`tab-button ${activeTab === 'documentos' ? 'active' : ''}`}
        onClick={() => onTabChange('documentos')}
      >
        Documentos
      </button>
      {(isOwner || isMember) && (
        <button
          className={`tab-button ${activeTab === 'participantes' ? 'active' : ''}`}
          onClick={() => onTabChange('participantes')}
        >
          Participantes
        </button>
      )}
      {isOwner && (
        <button
          className={`tab-button ${activeTab === 'solicitudes' ? 'active' : ''}`}
          onClick={() => onTabChange('solicitudes')}
        >
          Solicitudes
        </button>
      )}
      {(isOwner || isMember) && (
        <button
          className={`tab-button ${activeTab === 'historial' ? 'active' : ''}`}
          onClick={() => onTabChange('historial')}
        >
          Historial
        </button>
      )}
      {hasV2 && (
        <button
          className={`tab-button ${activeTab === 'gobernanza' ? 'active' : ''}`}
          onClick={() => onTabChange('gobernanza')}
        >
          Gobernanza
        </button>
      )}
      {hasV2 && (
        <button
          className={`tab-button ${activeTab === 'disputas' ? 'active' : ''}`}
          onClick={() => onTabChange('disputas')}
        >
          Disputas
        </button>
      )}
      {hasV2 && (
        <button
          className={`tab-button ${activeTab === 'hitos' ? 'active' : ''}`}
          onClick={() => onTabChange('hitos')}
        >
          Hitos
        </button>
      )}
    </div>
  );
};
