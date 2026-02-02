import React from 'react';
import ProjectDetailPage from './ProjectDetailPage';

/**
 * InvestmentDetailsPage - Wrapper component que ahora usa ProjectDetailPage
 * Esta es la página que se muestra después de crear un proyecto
 * o cuando un owner quiere ver su proyecto
 */
const InvestmentDetailsPage: React.FC = () => {
  // Simplemente renderiza ProjectDetailPage en modo 'view'
  return <ProjectDetailPage mode="view" />;
};

export default InvestmentDetailsPage;
