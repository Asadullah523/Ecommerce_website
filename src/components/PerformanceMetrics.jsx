import React from 'react';
import { Card } from './ui/Card';
import { Target, Zap, Waves } from 'lucide-react';

import { useStore } from '../context/StoreContext';

export default function PerformanceMetrics({ metrics }) {
  const { averageOrderValue = 0, conversionRate = 0, goalProgress = 0, revenueGoal = 5000 } = metrics;
  const { formatPrice, currency } = useStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-bg-800/50 border-white/5 p-6 rounded-[2rem] flex items-center justify-between group hover:border-accent-cyan/30 transition-all">
        <div>
          <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Avg Order Value</div>
          <div className="text-2xl font-black text-white italic">{formatPrice(averageOrderValue)}</div>
          <div className="text-[10px] text-green-400 font-bold mt-2">+5.2% from last month</div>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan shadow-[0_0_15px_rgba(0,255,255,0.1)]">
          <Zap className="h-6 w-6" />
        </div>
      </Card>

      <Card className="bg-bg-800/50 border-white/5 p-6 rounded-[2rem] flex items-center justify-between group hover:border-accent-purple/30 transition-all">
        <div>
          <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Conversion Rate</div>
          <div className="text-2xl font-black text-white italic">{conversionRate.toFixed(1)}%</div>
          <div className="text-[10px] text-accent-purple font-bold mt-2">Top 10% in category</div>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-accent-purple/10 flex items-center justify-center text-accent-purple shadow-[0_0_15px_rgba(168,85,247,0.1)]">
          <Waves className="h-6 w-6" />
        </div>
      </Card>

      <Card className="bg-bg-800/50 border-white/5 p-6 rounded-[2rem] flex items-center justify-between group hover:border-green-500/30 transition-all">
        <div className="flex-1">
          <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Monthly Goal</div>
          <div className="flex items-center gap-4">
             <div className="text-2xl font-black text-white italic">{goalProgress}%</div>
             <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-accent-cyan shadow-[0_0_10px_rgba(34,197,94,0.4)]" 
                  style={{ width: `${goalProgress}%` }}
                ></div>
             </div>
          </div>
          <div className="text-[10px] text-gray-400 font-bold mt-2">Target: {formatPrice(revenueGoal)}</div>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)] ml-4">
          <Target className="h-6 w-6" />
        </div>
      </Card>
    </div>
  );
}
