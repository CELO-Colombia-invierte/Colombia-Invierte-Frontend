import { apiService } from "../api/api.service";

export interface CreateNatilleraDto {
  name: string;
  description_rich?: string;
  highlights_rich?: string;
  cover_asset_id?: string;
  category_id?: string;
  visibility?: "PUBLIC" | "PRIVATE";
  financial_details: {
    monthly_fee_amount: number;
    monthly_fee_currency: "COP" | "USD";
    expected_annual_return_pct: number;
    duration_months: number;
    payment_deadline_at: string;
  };
}

export interface Natillera {
  id: string;
  name: string;
  description_rich?: string;
  highlights_rich?: string;
  visibility: string;
  share_slug: string;
  created_at: string;
  natillera_details: {
    monthly_fee_amount: number;
    monthly_fee_currency: string;
    expected_annual_return_pct: number;
    duration_months: number;
    payment_deadline_at: string;
  };
}

class NatilleraService {
  async create(data: CreateNatilleraDto): Promise<Natillera> {
    const response = await apiService.post<Natillera>("/natillera", data);
    return response.data;
  }

  async findAll(): Promise<Natillera[]> {
    const response = await apiService.get<Natillera[]>("/natillera");
    return response.data;
  }

  async findOne(id: string): Promise<Natillera> {
    const response = await apiService.get<Natillera>(`/natillera/${id}`);
    return response.data;
  }
}

export const natilleraService = new NatilleraService();

export interface JoinNatilleraDto {
  invitation_id?: string;
}

class NatilleraMembershipService {
  async join(natilleraId: string, data?: JoinNatilleraDto): Promise<any> {
    const response = await apiService.post<any>(
      `/natillera/${natilleraId}/membership/join`,
      data || {}
    );
    return response.data;
  }

  async getMembers(natilleraId: string): Promise<any[]> {
    const response = await apiService.get<any[]>(
      `/natillera/${natilleraId}/membership/members`
    );
    return response.data;
  }
}

export const natilleraMembershipService = new NatilleraMembershipService();
