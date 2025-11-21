import { SimulationParams, QuarterData, SimulationResult } from '../types';
import { 
  RBA_TARGET_MIDPOINT, 
  RBA_TARGET_LOWER, 
  RBA_TARGET_UPPER, 
  NEUTRAL_REAL_RATE,
  NEUTRAL_NOMINAL_RATE,
  HISTORICAL_MEAN_CPI_Q
} from '../constants';

// Box-Muller transform for normal distribution
const generateGaussian = (mean: number, stdDev: number): number => {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z * stdDev + mean;
};

// Helper to calculate Quarter Label string based on current date
const getQuarterDateLabel = (quartersToAdd: number): string => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11
  const currentQuarter = Math.floor(currentMonth / 3) + 1; // 1-4

  // Calculate absolute quarter count
  // We assume t=0 is "current quarter", so simulation step 1 is currentQuarter + 1
  const totalQuarters = (currentYear * 4) + (currentQuarter - 1) + quartersToAdd;
  
  const year = Math.floor(totalQuarters / 4);
  const q = (totalQuarters % 4) + 1;
  
  return `Q${q} ${year}`;
};

export const runSimulation = (params: SimulationParams): SimulationResult => {
  const data: QuarterData[] = [];
  
  // Initialize history for the AR(1) process and RBA lag
  // We convert the user's Annualized Starting Inflation to a Quarterly equivalent
  // Formula: (1 + Annual/100)^(1/4) - 1
  const initialQuarterlyCpi = (Math.pow(1 + params.startingInflation / 100, 0.25) - 1) * 100;

  let prevCpiQ = initialQuarterlyCpi;
  let prevPrevCpiQ = initialQuarterlyCpi;
  let currentCashRate = params.startingCashRate;

  // Investment tracking
  let wealthIndex = 1.0; // Starts at $1
  let cpiIndex = 1.0; // Price level starts at 1.0

  for (let q = 1; q <= params.quarters; q++) {
    // 1. Generate Stochastic CPI (Quarterly %)
    // AR(1) process: X_t = c + rho * (X_{t-1} - mu) + epsilon
    const shock = generateGaussian(0, params.cpiVolatility);
    const cpiQuarterly = HISTORICAL_MEAN_CPI_Q + 
      params.inflationPersistence * (prevCpiQ - HISTORICAL_MEAN_CPI_Q) + 
      shock;

    // 2. Calculate RBA Decision Metric
    // "Annualised extrapolation of the past two quarterly CPI prints"
    // Formula: ((1+q1)(1+q2))^2 - 1, converted to %.
    // Using the current generated quarter (t) and previous (t-1) as the "prints" available
    // However, prompt says RBA responds with a LAG of one quarter.
    // So at quarter T, the RBA sees data from T-1 and T-2.
    
    const rbaViewCpiT1 = prevCpiQ / 100;
    const rbaViewCpiT2 = prevPrevCpiQ / 100;
    
    // Annualized rate seen by RBA
    const rbaObservedInflation = (((1 + rbaViewCpiT1) * (1 + rbaViewCpiT2)) ** 2 - 1) * 100;

    // 3. RBA Reaction Function
    let targetRealRateDiff = 0;
    let inflationStatus: QuarterData['inflationStatus'] = 'neutral';

    if (rbaObservedInflation < RBA_TARGET_LOWER) {
      // Accommodative: Inflation below 2%
      // Taylor Rule: Target Real = Neutral + Alpha * (Inflation - Target)
      // Note: (Inflation - Target) will be negative here.
      targetRealRateDiff = params.taylorSensitivity * (rbaObservedInflation - RBA_TARGET_MIDPOINT);
      inflationStatus = 'accommodative';
    } else if (rbaObservedInflation > RBA_TARGET_UPPER) {
      // Restrictive: Inflation above 3%
      targetRealRateDiff = params.taylorSensitivity * (rbaObservedInflation - RBA_TARGET_MIDPOINT);
      inflationStatus = 'restrictive';
    } else {
      // Neutral: Inflation 2-3%
      targetRealRateDiff = 0;
      inflationStatus = 'neutral';
    }

    const targetRealRate = NEUTRAL_REAL_RATE + targetRealRateDiff;
    const targetNominalRate = targetRealRate + RBA_TARGET_MIDPOINT; // Real + 2.5% target

    // 4. Rate Adjustment Constraints
    // Max change 50bps, 25bps increments
    const rateDiff = targetNominalRate - currentCashRate;
    
    let adjustment = 0;
    
    // Round desired change to nearest 0.25
    let desiredAdjustment = Math.round(rateDiff / 0.25) * 0.25;

    // Clamp to +/- 0.50
    if (desiredAdjustment > 0.50) desiredAdjustment = 0.50;
    if (desiredAdjustment < -0.50) desiredAdjustment = -0.50;

    currentCashRate = currentCashRate + desiredAdjustment;
    
    // Ensure rate doesn't go below 0 (Zero Lower Bound) - implied constraint in reality
    if (currentCashRate < 0.10) currentCashRate = 0.10; 

    // 5. Investment Compounding
    // Cash Rate is annual, so quarterly return is rate/4
    wealthIndex = wealthIndex * (1 + (currentCashRate / 100) / 4);
    
    // CPI Quarterly is already % over the quarter
    cpiIndex = cpiIndex * (1 + cpiQuarterly / 100);

    // Store data
    // For display, we calculate the *actual* annualized inflation for this quarter
    // to show what is happening vs what RBA saw (lagged)
    const currentAnnualized = (((1 + cpiQuarterly/100) * (1 + prevCpiQ/100)) ** 2 - 1) * 100;

    data.push({
      quarter: q,
      dateLabel: getQuarterDateLabel(q),
      cpiQuarterly: parseFloat(cpiQuarterly.toFixed(2)),
      cpiAnnualized: parseFloat(currentAnnualized.toFixed(2)),
      nominalCashRate: parseFloat(currentCashRate.toFixed(2)),
      realCashRate: parseFloat((currentCashRate - RBA_TARGET_MIDPOINT).toFixed(2)),
      neutralRate: NEUTRAL_NOMINAL_RATE,
      targetBandUpper: RBA_TARGET_UPPER,
      targetBandLower: RBA_TARGET_LOWER,
      inflationStatus
    });

    // Update history
    prevPrevCpiQ = prevCpiQ;
    prevCpiQ = cpiQuarterly;
  }

  // Summary stats
  const rates = data.map(d => d.nominalCashRate);
  const cpi = data.map(d => d.cpiAnnualized);

  // Calculate CAGRs
  const years = params.quarters / 4;
  const cagrNominal = (Math.pow(wealthIndex, 1 / years) - 1) * 100;
  
  // Real Return = (Final Wealth / Final Price Index)^(1/years) - 1
  const realWealthIndex = wealthIndex / cpiIndex;
  const cagrReal = (Math.pow(realWealthIndex, 1 / years) - 1) * 100;
  
  return {
    data,
    summary: {
      avgInflation: cpi.reduce((a, b) => a + b, 0) / cpi.length,
      maxRate: Math.max(...rates),
      minRate: Math.min(...rates),
      volatility: Math.sqrt(cpi.reduce((sq, n) => sq + Math.pow(n - (cpi.reduce((a,b)=>a+b,0)/cpi.length), 2), 0) / cpi.length),
      cagrNominal,
      cagrReal
    }
  };
};