export class Balances {
  cop: number;
  usd: number;
  usdt: number;
  ousd: number;

  constructor(data: { cop: number; usd: number; usdt: number; ousd: number }) {
    this.cop = data.cop;
    this.usd = data.usd;
    this.usdt = data.usdt;
    this.ousd = data.ousd;
  }

  toJSON() {
    return {
      cop: this.cop,
      usd: this.usd,
      usdt: this.usdt,
      ousd: this.ousd,
    };
  }
}

export class Position {
  id: string;
  projectId: string;
  projectName: string;
  projectType: 'NATILLERA' | 'TOKENIZATION';
  projectCoverUrl: string | null;
  baseAmount: number;
  baseCurrency: string;
  createdAt: string;

  constructor(data: {
    id: string;
    projectId: string;
    projectName: string;
    projectType: 'NATILLERA' | 'TOKENIZATION';
    projectCoverUrl: string | null;
    baseAmount: number;
    baseCurrency: string;
    createdAt: string;
  }) {
    this.id = data.id;
    this.projectId = data.projectId;
    this.projectName = data.projectName;
    this.projectType = data.projectType;
    this.projectCoverUrl = data.projectCoverUrl;
    this.baseAmount = data.baseAmount;
    this.baseCurrency = data.baseCurrency;
    this.createdAt = data.createdAt;
  }

  toJSON() {
    return {
      id: this.id,
      projectId: this.projectId,
      projectName: this.projectName,
      projectType: this.projectType,
      projectCoverUrl: this.projectCoverUrl,
      baseAmount: this.baseAmount,
      baseCurrency: this.baseCurrency,
      createdAt: this.createdAt,
    };
  }
}

export class Portfolio {
  balances: Balances;
  positions: Position[];

  constructor(data: { balances: Balances; positions: Position[] }) {
    this.balances = data.balances;
    this.positions = data.positions;
  }

  toJSON() {
    return {
      balances: this.balances.toJSON(),
      positions: this.positions.map((p) => p.toJSON()),
    };
  }
}
