export type ProjectType = 'NATILLERA' | 'TOKENIZATION';

export class Project {
  id: string;
  name: string;
  description: string | null;
  type: ProjectType;
  visibility: 'PUBLIC' | 'PRIVATE';
  category: string | null;
  coverAssetId: string | null;
  createdAt: Date;
  updatedAt: Date;
  natilleraDetails?: {
    cuotaMensual: number;
    rendimientoAnual: number;
    duracionMeses: number;
  };
  tokenizationDetails?: {
    assetValue: number;
    tokenPrice: number;
    totalSupply: number;
  };

  constructor(data: {
    id: string;
    name: string;
    description: string | null;
    type: ProjectType;
    visibility: 'PUBLIC' | 'PRIVATE';
    category: string | null;
    coverAssetId: string | null;
    createdAt: Date;
    updatedAt: Date;
    natilleraDetails?: {
      cuotaMensual: number;
      rendimientoAnual: number;
      duracionMeses: number;
    };
    tokenizationDetails?: {
      assetValue: number;
      tokenPrice: number;
      totalSupply: number;
    };
  }) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.type = data.type;
    this.visibility = data.visibility;
    this.category = data.category;
    this.coverAssetId = data.coverAssetId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.natilleraDetails = data.natilleraDetails;
    this.tokenizationDetails = data.tokenizationDetails;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      visibility: this.visibility,
      category: this.category,
      coverAssetId: this.coverAssetId,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      natilleraDetails: this.natilleraDetails,
      tokenizationDetails: this.tokenizationDetails,
    };
  }
}
