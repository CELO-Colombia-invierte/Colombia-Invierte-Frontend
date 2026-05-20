export interface ProjectDto {
  id: string;
  name: string;
  description: string | null;
  type: 'NATILLERA' | 'TOKENIZATION';
  visibility: 'PUBLIC' | 'PRIVATE';
  category: string | null;
  cover_asset_id: string | null;
  created_at: string;
  updated_at: string;
  natillera_details?: {
    cuota_mensual: number;
    rendimiento_anual: number;
    duracion_meses: number;
  };
  tokenization_details?: {
    asset_value: number;
    token_price: number;
    total_supply: number;
  };
}

export interface ProjectsResponseDto {
  projects: ProjectDto[];
  total: number;
  page: number;
  limit: number;
}
