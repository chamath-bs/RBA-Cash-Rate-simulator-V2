import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subValue, icon, trend }) => {
  
  // Brand specific styling logic
  // Primary Orange for "Active/High", Dark Grey for "Neutral/Low" to match style guide
  const getIconStyles = () => {
    if (trend === 'up') return 'bg-brand-orange/10 text-brand-orange';
    if (trend === 'down') return 'bg-brand-black/5 text-brand-black';
    return 'bg-gray-100 text-gray-500';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-start justify-between transition-all hover:shadow-md hover:border-brand-orange/30 group h-full">
      <div className="flex flex-col justify-between h-full min-w-0">
        <div>
          <p className="text-xs font-semibold text-brand-black/50 mb-1 font-sans uppercase tracking-wide truncate">{title}</p>
          <h3 className="text-xl font-bold text-brand-black tracking-tight truncate leading-tight">{value}</h3>
        </div>
        {subValue && <p className="text-xs text-gray-400 mt-1 truncate">{subValue}</p>}
      </div>
      {icon && (
        <div className={`p-2 rounded-lg transition-colors ml-3 flex-shrink-0 ${getIconStyles()}`}>
          {icon}
        </div>
      )}
    </div>
  );
};

export default StatCard;