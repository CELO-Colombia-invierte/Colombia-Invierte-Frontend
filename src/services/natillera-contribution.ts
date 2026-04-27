import { apiService } from './api/api.service';

export interface QuotaPaidEvent {
  event_data: Record<string, string>;
}

export async function fetchQuotaPaidEvents(projectId: string): Promise<QuotaPaidEvent[]> {
  const resp = await apiService.get<{ events: QuotaPaidEvent[] }>(
    `/projects/${projectId}/events?type=QUOTA_PAID&limit=500&offset=0`,
  );
  return resp.data.events;
}

export interface ContributionInputs {
  events: QuotaPaidEvent[];
  myAddress: string;
  quotaCop: number;
  vaultCop: number;
}

export interface ContributionResult {
  paidMonths: number;
  totalCop: number;
  myDeltaCop: number;
  currentValueCop: number;
  pctYield: number;
  activeMembers: number;
}

export function computeNatilleraContribution({
  events,
  myAddress,
  quotaCop,
  vaultCop,
}: ContributionInputs): ContributionResult {
  const lower = myAddress.toLowerCase();
  const uniquePayments = new Set<string>();
  const activeMembers = new Set<string>();
  const myPayments = new Set<string>();
  for (const ev of events) {
    const user = ev.event_data?.user?.toLowerCase();
    const monthId = ev.event_data?.monthId;
    if (!user || monthId == null) continue;
    uniquePayments.add(`${user}:${monthId}`);
    activeMembers.add(user);
    if (user === lower) myPayments.add(monthId);
  }
  const paidMonths = myPayments.size;
  const totalCop = paidMonths * quotaCop;
  const totalQuotasCop = uniquePayments.size * quotaCop;
  const deltaCop = vaultCop - totalQuotasCop;
  const myDeltaCop = activeMembers.size > 0 ? Math.round(deltaCop / activeMembers.size) : 0;
  const currentValueCop = Math.max(0, totalCop + myDeltaCop);
  const pctYield = totalCop > 0 ? (myDeltaCop / totalCop) * 100 : 0;
  return { paidMonths, totalCop, myDeltaCop, currentValueCop, pctYield, activeMembers: activeMembers.size };
}
