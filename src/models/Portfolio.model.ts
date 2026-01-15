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
  baseAmount: number;
  baseCurrency: string;
  valueCop: number;
  changePercentage: number;

  constructor(data: {
    id: string;
    projectId: string;
    projectName: string;
    baseAmount: number;
    baseCurrency: string;
    valueCop: number;
    changePercentage: number;
  }) {
    this.id = data.id;
    this.projectId = data.projectId;
    this.projectName = data.projectName;
    this.baseAmount = data.baseAmount;
    this.baseCurrency = data.baseCurrency;
    this.valueCop = data.valueCop;
    this.changePercentage = data.changePercentage;
  }

  toJSON() {
    return {
      id: this.id,
      projectId: this.projectId,
      projectName: this.projectName,
      baseAmount: this.baseAmount,
      baseCurrency: this.baseCurrency,
      valueCop: this.valueCop,
      changePercentage: this.changePercentage,
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
      positions: this.positions.map(p => p.toJSON()),
    };
  }
}
