import React from 'react';
import './ProjectDetailTabs.css';

interface ProjectDetailTabsProps {
  activeTab:
    | 'resumen'
    | 'finanzas'
    | 'documentos'
    | 'participantes'
    | 'solicitudes';
  onTabChange: (
    tab: 'resumen' | 'finanzas' | 'documentos' | 'participantes' | 'solicitudes'
  ) => void;
  isOwner?: boolean;
  isMember?: boolean;
}

export const ProjectDetailTabs: React.FC<ProjectDetailTabsProps> = ({
  activeTab,
  onTabChange,
  isOwner = false,
  isMember = false,
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
    </div>
  );
};
