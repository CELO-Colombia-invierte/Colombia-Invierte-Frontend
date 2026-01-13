import React from 'react';
import { PortfolioProject } from '@/types';
import { PortfolioCard } from './PortfolioCard';
import './PortfolioGrid.css';

interface PortfolioGridProps {
  projects: PortfolioProject[];
  onProjectClick?: (project: PortfolioProject) => void;
  children?: React.ReactNode;
}

export const PortfolioGrid: React.FC<PortfolioGridProps> = ({
  projects,
  onProjectClick,
  children
}) => {
  return (
    <div className="portfolio-grid">
      {projects.map((project) => (
        <PortfolioCard
          key={project.id}
          project={project}
          onClick={() => onProjectClick?.(project)}
        />
      ))}
      {children}
    </div>
  );
};

export default PortfolioGrid;
