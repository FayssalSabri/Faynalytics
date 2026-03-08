import React from 'react';
import { Cloud, CloudUpload, CloudDownload, LogOut, Target } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/helpers';

const Dashboard = ({
    isDriveConnected,
    handleSaveToCloud,
    handleLoadFromCloud,
    handleSignOut,
    BACKEND_URL,
    analytics,
    performanceGoal,
    setPerformanceGoal,
    goalProgress,
    showToast
}) => {
    return (
        <div className="space-y-6">
            {/* Cloud Sync Section */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <Cloud className="text-zinc-400" size={20} />
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Cloud Synchronization</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                    {!isDriveConnected ? (
                        <a href={`${BACKEND_URL}/google/auth`} className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
                            <Cloud size={16} />
                            Connect Google Drive
                        </a>
                    ) : (
                        <>
                            <button
                                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                                onClick={handleSaveToCloud}
                            >
                                <CloudUpload size={16} />
                                Save Data
                            </button>
                            <button
                                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-sm font-medium border border-zinc-200 dark:border-zinc-700"
                                onClick={handleLoadFromCloud}
                            >
                                <CloudDownload size={16} />
                                Load Data
                            </button>
                            <button
                                className="inline-flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors text-sm font-medium"
                                onClick={handleSignOut}
                            >
                                <LogOut size={16} />
                                Disconnect
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Metrics Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Trades', value: analytics.totalTrades },
                    { label: 'Win Rate', value: formatPercentage(analytics.winRate), isWinRate: true },
                    { label: 'Total P&L', value: formatCurrency(analytics.totalPnL), isPnL: true },
                    { label: 'Avg P&L', value: formatCurrency(analytics.avgPnL), isPnL: true }
                ].map((metric, idx) => (
                    <div key={idx} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">{metric.label}</p>
                        <p className={`text-2xl font-bold ${metric.isWinRate ? (analytics.winRate >= 50 ? 'text-emerald-600' : 'text-rose-600') :
                            metric.isPnL ? (parseFloat(metric.value.replace('€', '')) >= 0 ? 'text-emerald-600' : 'text-rose-600') :
                                'text-zinc-900 dark:text-white'
                            }`}>
                            {metric.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Performance Goal */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <Target className="text-zinc-400" size={20} />
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Performance Target</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                            Initial Capital
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">€</span>
                            <input
                                type="number"
                                value={performanceGoal.initialCapital}
                                onChange={(e) => setPerformanceGoal(prev => ({ ...prev, initialCapital: parseFloat(e.target.value) || 0 }))}
                                className="w-full pl-8 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-50 text-sm focus:ring-1 focus:ring-purple-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                            Target P&L
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">€</span>
                            <input
                                type="number"
                                value={performanceGoal.targetPnLEuro}
                                onChange={(e) => setPerformanceGoal(prev => ({ ...prev, targetPnLEuro: parseFloat(e.target.value) || 0 }))}
                                className="w-full pl-8 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-50 text-sm focus:ring-1 focus:ring-purple-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={() => showToast('Target updated', 'success')}
                            className="px-6 py-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
                        >
                            Update Target
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Progress</span>
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{formatPercentage(goalProgress)}</span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                        <div
                            className="h-full bg-purple-600 transition-all duration-700 ease-out"
                            style={{ width: `${goalProgress}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
