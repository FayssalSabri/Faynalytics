import React, { useMemo } from 'react';
import { Lightbulb, TrendingUp, Target, Award } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/helpers';

const SmartInsights = ({ journalEntries }) => {
    const insights = useMemo(() => {
        if (!journalEntries || journalEntries.length === 0) return null;

        const assetPerformance = {};
        const typePerformance = { Buy: { pnl: 0, wins: 0, total: 0 }, Sell: { pnl: 0, wins: 0, total: 0 } };

        journalEntries.forEach(entry => {
            // Asset Performance
            if (!assetPerformance[entry.asset]) {
                assetPerformance[entry.asset] = { pnl: 0, wins: 0, total: 0 };
            }
            assetPerformance[entry.asset].pnl += entry.resultEuro;
            assetPerformance[entry.asset].total += 1;
            if (entry.resultEuro > 0) assetPerformance[entry.asset].wins += 1;

            // Type Performance
            if (typePerformance[entry.tradeType]) {
                typePerformance[entry.tradeType].pnl += entry.resultEuro;
                typePerformance[entry.tradeType].total += 1;
                if (entry.resultEuro > 0) typePerformance[entry.tradeType].wins += 1;
            }
        });

        const bestAsset = Object.entries(assetPerformance).reduce((a, b) => b[1].pnl > a[1].pnl ? b : a);
        const bestType = Object.entries(typePerformance).reduce((a, b) => b[1].wins / b[1].total > a[1].wins / a[1].total ? b : a);

        return {
            bestAsset: { name: bestAsset[0], pnl: bestAsset[1].pnl },
            bestType: { name: bestType[0], winRate: (bestType[1].wins / bestType[1].total) * 100 }
        };
    }, [journalEntries]);

    if (!insights) return (
        <div className="h-full bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm flex flex-col items-center justify-center text-center">
            <Lightbulb className="text-zinc-300 dark:text-zinc-700 mb-2" size={24} />
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">No Data Yet</p>
            <p className="text-[10px] text-zinc-500 mt-1">Add trades to see your edge</p>
        </div>
    );

    return (
        <div className="h-full bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-3xl rounded-full -mr-12 -mt-12 transition-colors duration-500"></div>

            <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="text-purple-500" size={16} />
                <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Smart Edge</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 relative z-10">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2 mb-1">
                        <Award className="text-emerald-500" size={12} />
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">Top Asset</span>
                    </div>
                    <p className="text-sm font-black text-zinc-900 dark:text-white truncate">{insights.bestAsset.name}</p>
                    <p className="text-[10px] font-bold text-emerald-600">+{formatCurrency(insights.bestAsset.pnl)}</p>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2 mb-1">
                        <Target className="text-purple-500" size={12} />
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">Best Type</span>
                    </div>
                    <p className="text-sm font-black text-zinc-900 dark:text-white">{insights.bestType.name}s</p>
                    <p className="text-[10px] font-bold text-purple-600">{formatPercentage(insights.bestType.winRate)} WR</p>
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-[9px] text-zinc-500 font-medium italic">"Your edge is strongest in {insights.bestAsset.name} {insights.bestType.name.toLowerCase()}s. Focus there."</p>
            </div>
        </div>
    );
};

export default SmartInsights;
