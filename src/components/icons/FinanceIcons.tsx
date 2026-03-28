import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

/** Moneda / Valor de cuota — dorado */
export const CoinIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
    <circle cx="16" cy="16" r="14" fill="#F59E0B" />
    <circle cx="16" cy="16" r="10" fill="#FBBF24" />
    <text x="16" y="21" textAnchor="middle" fontSize="14" fontWeight="700" fill="#92400E">$</text>
  </svg>
);

/** Rendimiento / Crecimiento — verde */
export const GrowthIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
    <circle cx="16" cy="16" r="14" fill="#D1FAE5" />
    <path d="M10 22L16 10L22 22" fill="#10B981" />
    <path d="M13 18H19" stroke="#D1FAE5" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/** Duración / Meses — naranja */
export const DurationIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
    <circle cx="16" cy="16" r="14" fill="#FEE2E2" />
    <circle cx="16" cy="17" r="8" stroke="#EF4444" strokeWidth="2" fill="none" />
    <path d="M16 13V17L19 19" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Calendario / Fecha — azul */
export const CalendarIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
    <circle cx="16" cy="16" r="14" fill="#DBEAFE" />
    <rect x="9" y="11" width="14" height="12" rx="2" fill="#3B82F6" />
    <rect x="9" y="11" width="14" height="4" rx="2" fill="#2563EB" />
    <circle cx="13" cy="20" r="1.5" fill="white" />
    <circle cx="19" cy="20" r="1.5" fill="white" />
    <path d="M12 9V12" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
    <path d="M20 9V12" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/** Token / Moneda cripto — púrpura */
export const TokenIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
    <circle cx="16" cy="16" r="14" fill="#EDE9FE" />
    <circle cx="16" cy="16" r="9" fill="#8B5CF6" />
    <circle cx="16" cy="16" r="6" fill="#A78BFA" />
    <text x="16" y="20.5" textAnchor="middle" fontSize="12" fontWeight="700" fill="white">T</text>
  </svg>
);

/** Gráfico / Estadísticas — azul oscuro */
export const ChartIcon: React.FC<IconProps> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
    <circle cx="16" cy="16" r="14" fill="#E0E7FF" />
    <rect x="10" y="18" width="3" height="6" rx="1" fill="#6366F1" />
    <rect x="14.5" y="14" width="3" height="10" rx="1" fill="#4F46E5" />
    <rect x="19" y="10" width="3" height="14" rx="1" fill="#4338CA" />
  </svg>
);
