import { apiService } from '@/services/api/api.service';
import { authService } from '@/services/auth';
import { Propuesta, PropuestaFormData, PaginatedPropuestas } from '@/types/propuesta';

const BASE_URL = import.meta.env.VITE_API_URL || '';

class PropuestasService {
  async getByProject(projectId: string, page = 1, limit = 10): Promise<PaginatedPropuestas> {
    try {
      const response = await apiService.get<PaginatedPropuestas>(
        `/projects/${projectId}/propuestas?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch {
      return { items: [], total: 0, hasMore: false };
    }
  }

  async getById(propuestaId: string): Promise<Propuesta> {
    const response = await apiService.get<Propuesta>(`/propuestas/${propuestaId}`);
    return response.data;
  }

  async create(projectId: string, data: PropuestaFormData): Promise<Propuesta> {
    const token = authService.getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    if (data.background_image) {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('responsible_user_id', data.responsible_user_id);
      formData.append('withdrawal_amount', String(data.withdrawal_amount));
      if (data.estimated_profit !== undefined) {
        formData.append('estimated_profit', String(data.estimated_profit));
      }
      formData.append('background_image', data.background_image);
      
      const res = await fetch(`${BASE_URL}/projects/${projectId}/propuestas`, {
        method: 'POST',
        headers,
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw { status: res.status, message: body?.message ?? res.statusText };
      }
      const json = await res.json();
      return json.data ?? json;
    }

    const payload: Record<string, unknown> = {
      title: data.title,
      description: data.description,
      responsible_user_id: data.responsible_user_id,
      withdrawal_amount: data.withdrawal_amount,
    };
    if (data.estimated_profit !== undefined) {
      payload.estimated_profit = data.estimated_profit;
    }

    const response = await apiService.post<Propuesta>(
      `/projects/${projectId}/propuestas`,
      payload
    );
    return response.data;
  }

  async vote(propuestaId: string, answer: 'YES' | 'NO', txHash?: string): Promise<Propuesta> {
    const response = await apiService.post<Propuesta>(
      `/propuestas/${propuestaId}/vote`,
      { answer, ...(txHash ? { tx_hash: txHash } : {}) }
    );
    return response.data;
  }

  async attachChain(
    propuestaId: string,
    proposalChainId: string,
    proposeTxHash: string,
  ): Promise<Propuesta> {
    const response = await apiService.patch<Propuesta>(
      `/propuestas/${propuestaId}/chain`,
      { proposal_chain_id: proposalChainId, propose_tx_hash: proposeTxHash }
    );
    return response.data;
  }

  async withdraw(
    propuestaId: string,
    executeTxHash: string,
    actualProfit?: number,
  ): Promise<Propuesta> {
    const response = await apiService.post<Propuesta>(
      `/propuestas/${propuestaId}/withdraw`,
      { execute_tx_hash: executeTxHash, actual_profit: actualProfit },
    );
    return response.data;
  }

  async returnYield(
    propuestaId: string,
    amountUsdc: number,
    source: string,
    txHash: string,
  ): Promise<Propuesta> {
    const response = await apiService.post<Propuesta>(
      `/propuestas/${propuestaId}/return-yield`,
      { amount_usdc: amountUsdc, source, tx_hash: txHash },
    );
    return response.data;
  }
}

export const propuestasService = new PropuestasService();
