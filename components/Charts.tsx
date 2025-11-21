import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart
} from 'recharts';
import { QuarterData } from '../types';

interface ChartsProps {
  data: QuarterData[];
}

// Brand Colors derived from index.html config
const COLORS = {
  orange: '#FA4D16',
  black: '#202021',
  red: '#E62102',
  peach: '#F9CCAB',
  pale: '#FCE5D5',
  darkGrey: '#545454',
  grey: '#7F7F7F',
  lightGrey: '#A9A9A9'
};

export const InflationChart: React.FC<ChartsProps> = ({ data }) => {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="dateLabel" 
            tick={{fontSize: 12, fill: COLORS.darkGrey}}
            stroke={COLORS.lightGrey}
            minTickGap={30}
          />
          <YAxis 
            label={{ value: 'Percent %', angle: -90, position: 'insideLeft', fill: COLORS.grey }} 
            domain={['auto', 'auto']}
            tick={{fontSize: 12, fill: COLORS.darkGrey}}
            stroke={COLORS.lightGrey}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '8px', 
              border: 'none', 
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              fontFamily: 'Rund, Arial, sans-serif'
            }}
            formatter={(value: number, name: string) => [`${value.toFixed(2)}%`, name]}
          />
          <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{fontFamily: 'Rund, Arial, sans-serif'}}/>
          
          {/* Target Band Area */}
          <Area 
            type="monotone" 
            dataKey="targetBandUpper" 
            stroke="none" 
            fill={COLORS.pale} 
            fillOpacity={0.6} 
            name="Target Band (2-3%)"
          />
          <Area 
            type="monotone" 
            dataKey="targetBandLower" 
            stroke="none" 
            fill="#ffffff" 
            fillOpacity={1} 
            legendType="none"
            tooltipType="none"
          />

          <ReferenceLine y={2.5} stroke={COLORS.peach} strokeDasharray="4 4" label={{position: 'right',  value: 'Target', fontSize: 10, fill: COLORS.orange}} />
          
          <Line 
            type="monotone" 
            dataKey="cpiAnnualized" 
            stroke={COLORS.orange} 
            strokeWidth={3} 
            dot={false} 
            name="CPI (Annualized)"
            animationDuration={1000}
          />
          
          <Line 
            type="stepAfter" 
            dataKey="nominalCashRate" 
            stroke={COLORS.black} 
            strokeWidth={2} 
            dot={false} 
            name="Nominal Cash Rate"
            strokeDasharray="0 0"
            animationDuration={1000}
          />

        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export const RealRateChart: React.FC<ChartsProps> = ({ data }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="dateLabel" 
            tick={{fontSize: 11, fill: COLORS.darkGrey}}
            stroke={COLORS.lightGrey}
            minTickGap={30}
          />
          <YAxis 
            tick={{fontSize: 11, fill: COLORS.darkGrey}}
            stroke={COLORS.lightGrey}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: number) => [`${value.toFixed(2)}%`, 'Real Rate']}
          />
          <ReferenceLine y={0.5} stroke={COLORS.grey} strokeDasharray="3 3" label={{value: 'Neutral (0.5%)', position: 'insideTopRight', fontSize: 10, fill: COLORS.grey}} />
          <Line 
            type="monotone" 
            dataKey="realCashRate" 
            stroke={COLORS.darkGrey} 
            strokeWidth={2} 
            dot={false} 
            name="Real Cash Rate"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};