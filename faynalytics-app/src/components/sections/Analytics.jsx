import React from 'react';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine } from 'recharts';
import { formatCurrency, formatPercentage } from '../../utils/helpers';

const Analytics = ({ analytics, theme, journalEntries, performanceGoal }) => {
    const targetBalance = (parseFloat(performanceGoal.initialCapital) || 0) + (parseFloat(performanceGoal.targetPnLEuro) > 1000 ? (parseFloat(performanceGoal.targetPnLEuro) - parseFloat(performanceGoal.initialCapital)) : parseFloat(performanceGoal.targetPnLEuro));
    // Simplified target balance logic: if targetPnLEuro is clearly a balance (e.g. 5400 > 5000), use it. otherwise add profit to initial.
    const finalTarget = (performanceGoal.targetPnLEuro > performanceGoal.initialCapital)
        ? performanceGoal.targetPnLEuro
        : (performanceGoal.initialCapital + performanceGoal.targetPnLEuro);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-sm">
                    <h3 className="text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                        <TrendingUp className="text-purple-600" size={24} />
                        Equity Curve
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analytics.equityData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#27272a' : '#f4f4f5'} opacity={0.5} vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#71717a"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#71717a"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `€${Math.round(value)}`}
                                    domain={([dataMin, dataMax]) => {
                                        const min = Math.min(dataMin, finalTarget);
                                        const max = Math.max(dataMax, finalTarget);
                                        const spread = max - min;
                                        const padding = spread > 0 ? spread * 0.2 : 100;
                                        return [Math.floor(min - padding), Math.ceil(max + padding)];
                                    }}
                                />
                                <Tooltip
                                    formatter={(value) => [formatCurrency(value), 'Cumulative Equity']}
                                    contentStyle={{
                                        backgroundColor: theme === 'dark' ? '#18181b' : '#FFFFFF',
                                        border: '1px solid ' + (theme === 'dark' ? '#27272a' : '#f4f4f5'),
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }}
                                    itemStyle={{ fontWeight: 'bold' }}
                                />
                                <ReferenceLine
                                    y={finalTarget}
                                    stroke="#9333ea"
                                    strokeDasharray="5 5"
                                    label={{
                                        value: `Target: €${finalTarget}`,
                                        position: 'right',
                                        fill: '#9333ea',
                                        fontSize: 10,
                                        fontWeight: 'bold'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="equity"
                                    stroke="#9333ea"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#9333ea', strokeWidth: 2, stroke: theme === 'dark' ? '#09090b' : '#FFF' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-sm">
                    <h3 className="text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                        <BarChart3 className="text-purple-600" size={24} />
                        Asset Performance
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.assetData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#27272a' : '#f4f4f5'} opacity={0.5} vertical={false} />
                                <XAxis
                                    dataKey="asset"
                                    stroke="#71717a"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#71717a"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: theme === 'dark' ? '#18181b' : '#FFFFFF',
                                        border: '1px solid ' + (theme === 'dark' ? '#27272a' : '#f4f4f5'),
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }}
                                    cursor={{ fill: theme === 'dark' ? '#27272a' : '#f4f4f5', opacity: 0.4 }}
                                />
                                <Bar
                                    dataKey="pnl"
                                    radius={[6, 6, 0, 0]}
                                >
                                    {analytics.assetData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Detailed Statistics */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-8 shadow-sm">
                <h3 className="text-xl font-bold mb-6 sm:mb-8 flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                    <BarChart3 className="text-purple-600" size={24} />
                    Detailed Statistics
                </h3>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                    <div className="space-y-4">
                        <h4 className="font-bold mb-4 text-zinc-500 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                            Performance by Asset
                        </h4>
                        <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
                            <table className="w-full text-sm min-w-[400px]">
                                <thead>
                                    <tr className="bg-zinc-50 dark:bg-zinc-800/50">
                                        <th className="text-left py-3 px-4 sm:py-4 sm:px-6 font-bold text-zinc-500 dark:text-zinc-400">Asset</th>
                                        <th className="text-center py-3 px-4 sm:py-4 sm:px-6 font-bold text-zinc-500 dark:text-zinc-400">Trades</th>
                                        <th className="text-center py-3 px-4 sm:py-4 sm:px-6 font-bold text-zinc-500 dark:text-zinc-400">Win Rate</th>
                                        <th className="text-right py-3 px-4 sm:py-4 sm:px-6 font-bold text-zinc-500 dark:text-zinc-400">P&L</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {Object.entries(journalEntries.filter(e => !e.is_draft).reduce((acc, entry) => {
                                        if (!acc[entry.asset]) {
                                            acc[entry.asset] = { totalTrades: 0, wins: 0, pnl: 0 };
                                        }
                                        acc[entry.asset].totalTrades++;
                                        if (entry.resultEuro > 0) acc[entry.asset].wins++;
                                        acc[entry.asset].pnl += entry.resultEuro;
                                        return acc;
                                    }, {})).map(([asset, stats]) => (
                                        <tr key={asset} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                            <td className="py-3 px-4 sm:py-4 sm:px-6 font-bold text-zinc-900 dark:text-zinc-100 uppercase">{asset}</td>
                                            <td className="py-3 px-4 sm:py-4 sm:px-6 text-center font-medium">{stats.totalTrades}</td>
                                            <td className="py-3 px-4 sm:py-4 sm:px-6 text-center">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${(stats.wins / stats.totalTrades) >= 0.5 ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'
                                                    }`}>
                                                    {formatPercentage((stats.wins / stats.totalTrades) * 100)}
                                                </span>
                                            </td>
                                            <td className={`py-3 px-4 sm:py-4 sm:px-6 text-right font-black ${stats.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatCurrency(stats.pnl)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold mb-4 text-zinc-500 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                            Performance by Trade Type
                        </h4>
                        <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
                            <table className="w-full text-sm min-w-[400px]">
                                <thead>
                                    <tr className="bg-zinc-50 dark:bg-zinc-800/50">
                                        <th className="text-left py-3 px-4 sm:py-4 sm:px-6 font-bold text-zinc-500 dark:text-zinc-400">Type</th>
                                        <th className="text-center py-3 px-4 sm:py-4 sm:px-6 font-bold text-zinc-500 dark:text-zinc-400">Trades</th>
                                        <th className="text-center py-3 px-4 sm:py-4 sm:px-6 font-bold text-zinc-500 dark:text-zinc-400">Win Rate</th>
                                        <th className="text-right py-3 px-4 sm:py-4 sm:px-6 font-bold text-zinc-500 dark:text-zinc-400">P&L</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {Object.entries(journalEntries.filter(e => !e.is_draft).reduce((acc, entry) => {
                                        if (!acc[entry.tradeType]) {
                                            acc[entry.tradeType] = { totalTrades: 0, wins: 0, pnl: 0 };
                                        }
                                        acc[entry.tradeType].totalTrades++;
                                        if (entry.resultEuro > 0) acc[entry.tradeType].wins++;
                                        acc[entry.tradeType].pnl += entry.resultEuro;
                                        return acc;
                                    }, {})).map(([type, stats]) => (
                                        <tr key={type} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                            <td className="py-3 px-4 sm:py-4 sm:px-6 font-bold text-zinc-900 dark:text-zinc-100">{type}</td>
                                            <td className="py-3 px-4 sm:py-4 sm:px-6 text-center font-medium">{stats.totalTrades}</td>
                                            <td className="py-3 px-4 sm:py-4 sm:px-6 text-center">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${(stats.wins / stats.totalTrades) >= 0.5 ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'
                                                    }`}>
                                                    {formatPercentage((stats.wins / stats.totalTrades) * 100)}
                                                </span>
                                            </td>
                                            <td className={`py-3 px-4 sm:py-4 sm:px-6 text-right font-black ${stats.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatCurrency(stats.pnl)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
