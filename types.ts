export interface SimulationParams {
  quarters: number;
  taylorSensitivity: number; // Alpha in the Taylor rule
  cpiVolatility: number; // Standard deviation for CPI shock
  inflationPersistence: number; // AR(1) coefficient
  startingCashRate: number; // User defined starting rate
  startingInflation: number; // User defined starting annualized inflation
}

export interface QuarterData {
  quarter: number;
  dateLabel: string; // e.g. Q4 2025
  cpiQuarterly: number; // % q/q
  cpiAnnualized: number; // The metric RBA uses (past 2 quarters annualized)
  nominalCashRate: number; // The RBA target
  realCashRate: number; // Nominal - 2.5%
  neutralRate: number; // Constant 3.0% (Nominal)
  targetBandUpper: number; // 3.0%
  targetBandLower: number; // 2.0%
  inflationStatus: 'accommodative' | 'restrictive' | 'neutral';
}

export interface SimulationResult {
  data: QuarterData[];
  summary: {
    avgInflation: number;
    maxRate: number;
    minRate: number;
    volatility: number;
    cagrNominal: number; // Annualised nominal return on cash
    cagrReal: number; // Annualised real return on cash
  };
}