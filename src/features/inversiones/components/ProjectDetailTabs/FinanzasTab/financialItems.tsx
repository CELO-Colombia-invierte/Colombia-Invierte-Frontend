import React from 'react';
import {
  CoinIcon,
  GrowthIcon,
  DurationIcon,
  CalendarIcon,
  TokenIcon,
  ChartIcon,
} from '@/components/icons/FinanceIcons';
import { Project } from '@/models/projects';
import { formatCurrency, formatDate } from './formatters';

export interface FinancialItem {
  iconComponent: React.ReactNode;
  label: string;
  value: string;
  tooltip: string;
}

export function buildFinancialItems(project: Project): FinancialItem[] {
  const isNatillera = project.type === 'NATILLERA';
  const items: FinancialItem[] = [];

  if (isNatillera && project.natillera_details) {
    const d = project.natillera_details;
    items.push(
      {
        iconComponent: <CoinIcon />,
        label: 'Valor de la cuota mensual',
        value: `${formatCurrency(d.monthly_fee_amount)} ${d.monthly_fee_currency}`,
        tooltip: 'Cantidad que debes aportar cada mes',
      },
      {
        iconComponent: <GrowthIcon />,
        label: 'Rendimiento anual esperado',
        value: `${d.expected_annual_return_pct}%`,
        tooltip: 'Porcentaje de retorno estimado al año',
      },
      {
        iconComponent: <DurationIcon />,
        label: 'Cantidad de meses',
        value: `${d.duration_months} Meses`,
        tooltip: 'Duración total del proyecto de ahorro',
      },
      {
        iconComponent: <CalendarIcon />,
        label: 'Fecha máxima de pago mensual',
        value: formatDate(d.payment_deadline_at),
        tooltip: 'Fecha límite para realizar el pago mensual',
      },
    );
    return items;
  }

  if (project.tokenization_details) {
    const d = project.tokenization_details;
    items.push(
      {
        iconComponent: <CoinIcon />,
        label: 'Valor del Activo',
        value: `${formatCurrency(d.asset_value_amount)} ${d.asset_value_currency}`,
        tooltip: 'Valor total del activo tokenizado',
      },
      {
        iconComponent: <GrowthIcon />,
        label: 'Rendimiento anual proyectado',
        value: `${d.expected_annual_return_pct}%`,
        tooltip: 'Proyección del creator. No es automático: depende de que el creator deposite rendimientos vía depositRevenue.',
      },
      {
        iconComponent: <TokenIcon />,
        label: 'Precio por Token',
        value: `${formatCurrency(d.price_per_token_amount)} ${d.price_per_token_currency}`,
        tooltip: 'Costo de cada token individual',
      },
      {
        iconComponent: <ChartIcon />,
        label: 'Total de Tokens',
        value: formatCurrency(d.total_tokens),
        tooltip: 'Cantidad total de tokens disponibles',
      },
    );

    if (d.presale_enabled && d.presale_starts_at) {
      items.push({
        iconComponent: <CalendarIcon />,
        label: 'Inicio de Preventa',
        value: formatDate(d.presale_starts_at),
        tooltip: 'Fecha de inicio de la preventa',
      });
    }
    if (d.public_sale_starts_at) {
      items.push({
        iconComponent: <CalendarIcon />,
        label: 'Venta Pública',
        value: formatDate(d.public_sale_starts_at),
        tooltip: 'Fecha de inicio de la venta pública',
      });
    }
  }

  return items;
}
