import React, { useState, useEffect } from 'react';
import ControlPanel from './components/ControlPanel';
import { InflationChart, RealRateChart } from './components/Charts';
import StatCard from './components/StatCard';
import { SimulationParams, SimulationResult } from './types';
import { runSimulation } from './services/simulationService';
import { Activity, TrendingUp, Info, Play } from 'lucide-react';

const App: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>({
    quarters: 40,
    taylorSensitivity: 1.5, // Standard Taylor rule coefficient often 1.5
    cpiVolatility: 0.4,
    inflationPersistence: 0.6,
    startingCashRate: 3.60,
    startingInflation: 2.50, // Default to target midpoint
  });

  const [result, setResult] = useState<SimulationResult | null>(null);

  const handleRun = () => {
    const simResult = runSimulation(params);
    setResult(simResult);
  };

  // Run once on mount
  useEffect(() => {
    handleRun();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-brand-offwhite text-brand-black font-sans selection:bg-brand-peach">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-brand-orange p-2.5 rounded-lg shadow-sm">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-brand-black tracking-tight leading-none">RBA Simulator</h1>
              <p className="text-sm text-brand-black/60 hidden sm:block mt-0.5">Monetary Policy Reaction Function Model</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-brand-offwhite rounded-full border border-gray-200 text-xs font-semibold text-brand-black/70">
                <Info className="w-3.5 h-3.5" />
                <span>Target Band: 2-3%</span>
             </div>
             <button 
               onClick={handleRun}
               className="flex items-center gap-2 bg-brand-orange hover:bg-brand-chart-red text-white px-5 py-2.5 rounded-full font-bold text-sm transition-colors shadow-sm hover:shadow-md active:transform active:scale-95"
             >
               <Play className="w-4 h-4 fill-current" />
               Run Simulation
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Controls */}
          <div className="lg:col-span-3">
            <div className="sticky top-28">
              <ControlPanel params={params} setParams={setParams} />
              
              <div className="mt-6 bg-white p-5 rounded-xl border border-gray-200 shadow-sm text-sm text-brand-black/80">
                <h4 className="font-bold mb-3 text-brand-black text-base">Model Assumptions</h4>
                <ul className="space-y-2.5 list-disc pl-4 text-brand-black/70 leading-relaxed">
                  <li>Target Real Rate: Neutral (+0.5%) + Taylor Adjustment.</li>
                  <li>Lag: 1 Quarter.</li>
                  <li>Max Change: ±50bps per quarter.</li>
                  <li>Metric: Annualized extrapolation of past 2 quarters.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Main Dashboard */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Stats Row */}
            {result && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                  title="Avg Inflation" 
                  value={`${result.summary.avgInflation.toFixed(2)}%`}
                  subValue="Target: 2-3%"
                  icon={<Activity className="w-5 h-5" />}
                  trend={result.summary.avgInflation > 3 ? 'up' : result.summary.avgInflation < 2 ? 'down' : 'neutral'}
                />
                
                <StatCard 
                  title="Nominal Return (p.a.)" 
                  value={`${result.summary.cagrNominal.toFixed(2)}%`}
                  subValue="On Cash"
                  trend="neutral"
                />

                <StatCard 
                  title="Real Return (p.a.)" 
                  value={`${result.summary.cagrReal.toFixed(2)}%`}
                  subValue="Inflation Adjusted"
                  trend={result.summary.cagrReal > 0.5 ? 'up' : 'down'}
                />

                <StatCard 
                  title="Cash Rate Range" 
                  value={`${result.summary.minRate.toFixed(2)}% - ${result.summary.maxRate.toFixed(2)}%`}
                  subValue="Min - Max"
                  trend="neutral"
                />
              </div>
            )}

            {/* Charts */}
            {result && (
              <div className="space-y-6">
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="mb-6 border-b border-gray-100 pb-4">
                    <h3 className="text-xl font-bold text-brand-black">Inflation & Cash Rate Target</h3>
                    <p className="text-sm text-brand-black/60 mt-1">Simulated CPI vs RBA Cash Rate Response</p>
                  </div>
                  <InflationChart data={result.data} />
                </div>

                {/* Real Rate Chart - Full Width */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="mb-6 border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-bold text-brand-black">Real Cash Rate</h3>
                    <p className="text-sm text-brand-black/60 mt-1">Nominal Rate less Target Inflation (2.5%)</p>
                  </div>
                  <RealRateChart data={result.data} />
                </div>

              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;