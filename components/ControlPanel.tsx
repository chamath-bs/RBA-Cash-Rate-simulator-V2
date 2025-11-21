import React from 'react';
import { SimulationParams } from '../types';
import { Sliders } from 'lucide-react';

interface ControlPanelProps {
  params: SimulationParams;
  setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ params, setParams }) => {
  
  const handleChange = (key: keyof SimulationParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-brand-black text-white p-6 rounded-xl shadow-xl h-full flex flex-col border border-gray-800">
      <div className="mb-6 pb-6 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-brand-orange" />
          <h2 className="text-xl font-bold">Configuration</h2>
        </div>
        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
          Adjust the parameters below to see how the RBA reaction function responds to different economic conditions.
        </p>
      </div>

      <div className="space-y-8 flex-grow">
        
        {/* Starting Conditions */}
        <div className="space-y-3">
           <div className="flex justify-between items-end">
            <label className="text-sm font-semibold text-gray-200">Starting Cash Rate</label>
            <span className="text-sm font-mono text-brand-orange font-bold">{params.startingCashRate.toFixed(2)}%</span>
          </div>
          <input 
            type="range" 
            min="0.1" 
            max="8.0" 
            step="0.1"
            value={params.startingCashRate}
            onChange={(e) => handleChange('startingCashRate', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-orange"
          />
          <p className="text-xs text-gray-500">Current nominal cash rate target.</p>
        </div>

        <div className="space-y-3">
           <div className="flex justify-between items-end">
            <label className="text-sm font-semibold text-gray-200">Starting Inflation (Ann.)</label>
            <span className="text-sm font-mono text-brand-orange font-bold">{params.startingInflation.toFixed(2)}%</span>
          </div>
          <input 
            type="range" 
            min="0.0" 
            max="10.0" 
            step="0.1"
            value={params.startingInflation}
            onChange={(e) => handleChange('startingInflation', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-orange"
          />
          <p className="text-xs text-gray-500">Seeds the recent historical CPI observations.</p>
        </div>

        <hr className="border-gray-700" />

        {/* Duration */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <label className="text-sm font-semibold text-gray-200">Duration</label>
            <span className="text-sm font-mono text-brand-orange font-bold">{params.quarters} Qtrs</span>
          </div>
          <input 
            type="range" 
            min="20" 
            max="100" 
            step="4"
            value={params.quarters}
            onChange={(e) => handleChange('quarters', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-orange"
          />
          <p className="text-xs text-gray-500">Range: 5 to 25 years</p>
        </div>

        {/* Sensitivity */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <label className="text-sm font-semibold text-gray-200">Taylor Rule Sensitivity</label>
            <span className="text-sm font-mono text-brand-orange font-bold">{params.taylorSensitivity.toFixed(1)}x</span>
          </div>
          <input 
            type="range" 
            min="0.5" 
            max="3.0" 
            step="0.1"
            value={params.taylorSensitivity}
            onChange={(e) => handleChange('taylorSensitivity', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-orange"
          />
          <p className="text-xs text-gray-500">Aggressiveness of RBA response.</p>
        </div>

        {/* Volatility */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <label className="text-sm font-semibold text-gray-200">Economic Volatility</label>
            <span className="text-sm font-mono text-brand-orange font-bold">
              {params.cpiVolatility < 0.3 ? 'Low' : params.cpiVolatility < 0.5 ? 'Medium' : 'High'}
            </span>
          </div>
          <input 
            type="range" 
            min="0.1" 
            max="0.8" 
            step="0.05"
            value={params.cpiVolatility}
            onChange={(e) => handleChange('cpiVolatility', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-orange"
          />
          <p className="text-xs text-gray-500">Magnitude of CPI shocks.</p>
        </div>

      </div>
    </div>
  );
};

export default ControlPanel;