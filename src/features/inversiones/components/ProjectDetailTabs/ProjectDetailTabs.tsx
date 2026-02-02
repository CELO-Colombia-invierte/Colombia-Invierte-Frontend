import React from 'react';
import './ProjectDetailTabs.css';

interface ProjectDetailTabsProps {
  activeTab: 'resumen' | 'finanzas' | 'documentos' | 'solicitudes';
  onTabChange: (
    tab: 'resumen' | 'finanzas' | 'documentos' | 'solicitudes'
  ) => void;
  isOwner?: boolean;
}

export const ProjectDetailTabs: React.FC<ProjectDetailTabsProps> = ({
  activeTab,
  onTabChange,
  isOwner = false,
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
