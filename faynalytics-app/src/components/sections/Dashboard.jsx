import React from 'react';
import { Cloud, CloudUpload, CloudDownload, LogOut, Target, Lightbulb } from 'lucide-react';
import SmartInsights from '../ui/SmartInsights';
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
    setCurrentSection,
    journalEntries,
    showToast
}) => {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Cloud Sync Section */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm overflow-hidden relative flex flex-col justify-center">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
                    <div className="flex items-center gap-3 mb-4">
                        <Cloud className="text-zinc-400" size={18} />
                        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Cloud Synchronization</h2>
                    </div>
                    <div className="flex flex-wrap gap-2 relative z-10">
                        {!isDriveConnected ? (
                            <a href={`${BACKEND_URL}/google/auth`} className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg hover:opacity-90 transition-opacity text-xs font-medium">
                                <Cloud size={14} />
                                Connect Google Drive
                            </a>
                        ) : (
                            <>
                                <button
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg hover:opacity-90 transition-opacity text-xs font-medium"
                                    onClick={handleSaveToCloud}
                                >
                                    <CloudUpload size={14} />
                                    Save
                                </button>
                                <button
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-xs font-medium border border-zinc-200 dark:border-zinc-700"
                                    onClick={handleLoadFromCloud}
                                >
                                    <CloudDownload size={14} />
                                    Load
                                </button>
                                <button
                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors text-xs font-medium"
                                    onClick={handleSignOut}
                                >
                                    <LogOut size={14} />
                                    Disconnect
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Live Market Pulse */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm overflow-hidden relative group flex flex-col justify-center">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl rounded-full -mr-12 -mt-12 transition-colors duration-500"></div>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Market Pulse</h2>
                        </div>
                        <span className="text-[9px] font-black text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full uppercase">UTC {new Date().getUTCHours().toString().padStart(2, '0')}:{new Date().getUTCMinutes().toString().padStart(2, '0')}</span>
                    </div>

                    <div className="space-y-3 relative z-10">
                        {(() => {
                            const sessions = [
                                { name: 'London', start: 8, end: 16 },
                                { name: 'New York', start: 13, end: 21 },
                                { name: 'Tokyo', start: 0, end: 9 },
                                { name: 'Sydney', start: 22, end: 7 }
                            ];
                            const utcHour = new Date().getUTCHours();
                            const activeSessions = sessions.filter(s => {
                                if (s.start < s.end) return utcHour >= s.start && utcHour < s.end;
                                return utcHour >= s.start || utcHour < s.end;
                            });

                            if (activeSessions.length > 0) {
                                return (
                                    <div className="flex flex-wrap gap-1.5">
                                        {activeSessions.map(s => (
                                            <span key={s.name} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md text-[10px] font-black uppercase tracking-tight border border-emerald-500/20">
                                                {s.name}
                                            </span>
                                        ))}
                                    </div>
                                );
                            } else {
                                return (
                                    <p className="text-[10px] font-black text-zinc-400 uppercase">Inter-Session Reach</p>
                                );
                            }
                        })()}

                        <button
                            onClick={() => setCurrentSection('sessions')}
                            className="w-full py-1.5 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 text-zinc-500 dark:text-zinc-400 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border border-zinc-100 dark:border-zinc-800"
                        >
                            View Schedule
                        </button>
                    </div>
                </div>

                {/* Smart Insights Section */}
                <div className="lg:col-span-1">
                    <SmartInsights journalEntries={journalEntries} />
                </div>
            </div>

            {/* Metrics Card Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Trades', value: analytics.totalTrades },
                    { label: 'Win Rate', value: formatPercentage(analytics.winRate), isWinRate: true },
                    { label: 'Total P&L', value: formatCurrency(analytics.totalPnL), isPnL: true },
                    { label: 'Avg P&L', value: formatCurrency(analytics.avgPnL), isPnL: true }
                ].map((metric, idx) => (
                    <div key={idx} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{metric.label}</p>
                        <p className={`text-xl font-bold ${metric.isWinRate ? (analytics.winRate >= 50 ? 'text-emerald-600' : 'text-rose-600') :
                            metric.isPnL ? (parseFloat(metric.value.replace('€', '')) >= 0 ? 'text-emerald-600' : 'text-rose-600') :
                                'text-zinc-900 dark:text-white'
                            }`}>
                            {metric.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Performance Goal - Horizontal Layout */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm overflow-hidden relative">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Target className="text-purple-500" size={18} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Performance Target</h2>
                            <p className="text-[10px] text-zinc-500 font-medium">Track your growth in real-time</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Initial</span>
                            <div className="relative w-24">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400 text-[10px]">€</span>
                                <input
                                    type="number"
                                    value={performanceGoal.initialCapital}
                                    onChange={(e) => setPerformanceGoal(prev => ({ ...prev, initialCapital: parseFloat(e.target.value) || 0 }))}
                                    className="w-full pl-5 pr-2 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-50 text-xs focus:ring-1 focus:ring-purple-500 outline-none font-bold"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Goal</span>
                            <div className="relative w-24">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400 text-[10px]">€</span>
                                <input
                                    type="number"
                                    value={performanceGoal.targetPnLEuro}
                                    onChange={(e) => setPerformanceGoal(prev => ({ ...prev, targetPnLEuro: parseFloat(e.target.value) || 0 }))}
                                    className="w-full pl-5 pr-2 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-50 text-xs focus:ring-1 focus:ring-purple-500 outline-none font-bold"
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => showToast('Target updated', 'success')}
                            className="px-4 py-1.5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
                        >
                            Update
                        </button>
                    </div>

                    <div className="flex-1 lg:max-w-xs w-full space-y-2">
                        <div className="flex justify-between items-center px-0.5">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Progress</span>
                            <span className="text-xs font-black text-purple-600 dark:text-purple-400">{formatPercentage(goalProgress)}</span>
                        </div>
                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                            <div
                                className="h-full bg-purple-600 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(147,51,234,0.3)]"
                                style={{ width: `${Math.min(100, Math.max(0, goalProgress))}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
