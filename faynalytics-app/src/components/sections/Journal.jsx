import React, { useState, useMemo } from 'react';
import { BookOpen, Plus, Save, X, Filter, RotateCcw, Edit, Trash2, ChevronRight, Calculator, AlertCircle } from 'lucide-react';
import { currencyPairs } from '../../constants/assets';
import { formatCurrency } from '../../utils/helpers';

const Journal = ({
    journalEntries,
    setJournalEntries,
    journalForm,
    setJournalForm,
    editingIndex,
    setEditingIndex,
    addJournalEntry,
    resetJournalForm,
    editEntry,
    deleteEntry,
    filters,
    setFilters,
    showToast
}) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Filtered and sorted entries
    const filteredEntries = useMemo(() => {
        let filtered = [...journalEntries];
        if (filters.asset) filtered = filtered.filter(e => e.asset === filters.asset);
        if (filters.tradeType) filtered = filtered.filter(e => e.tradeType === filters.tradeType);

        return filtered.sort((a, b) => {
            let valA = a[filters.sortBy];
            let valB = b[filters.sortBy];
            if (['timestamp', 'date'].includes(filters.sortBy)) {
                valA = new Date(valA).getTime();
                valB = new Date(valB).getTime();
            }
            return filters.sortOrder === 'asc' ? valA - valB : valB - valA;
        });
    }, [journalEntries, filters]);

    const handleOpenDrawer = () => {
        resetJournalForm();
        setIsDrawerOpen(true);
    };

    const handleEdit = (index) => {
        editEntry(index);
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        resetJournalForm();
    };

    const handleSave = (isDraft) => {
        addJournalEntry(isDraft);
        // If successfully saved (implied in original logic), close drawer
        setIsDrawerOpen(false);
    };

    return (
        <div className="relative min-h-[600px] animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-black flex items-center gap-3 text-zinc-900 dark:text-white">
                        <BookOpen className="text-purple-600" size={32} />
                        Trading Journal
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                        Track your trades, analyze performance, grow your edge.
                    </p>
                </div>

                <button
                    onClick={handleOpenDrawer}
                    className="group flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-all font-bold shadow-lg shadow-purple-500/20 active:scale-95"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    Add New Trade
                </button>
            </div>

            {/* Filters Bar */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6 mb-8 shadow-sm flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[150px]">
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Asset</label>
                    <select
                        value={filters.asset}
                        onChange={(e) => setFilters(prev => ({ ...prev, asset: e.target.value }))}
                        className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-purple-500 text-sm font-bold"
                    >
                        <option value="">All Assets</option>
                        {Object.keys(currencyPairs).map(pair => <option key={pair} value={pair}>{pair}</option>)}
                    </select>
                </div>

                <div className="flex-1 min-w-[150px]">
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Type</label>
                    <select
                        value={filters.tradeType}
                        onChange={(e) => setFilters(prev => ({ ...prev, tradeType: e.target.value }))}
                        className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-purple-500 text-sm font-bold"
                    >
                        <option value="">All Types</option>
                        <option value="Buy">Buy (Long)</option>
                        <option value="Sell">Sell (Short)</option>
                    </select>
                </div>

                <div className="flex-1 min-w-[150px]">
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Sort By</label>
                    <div className="flex gap-2">
                        <select
                            value={filters.sortBy}
                            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                            className="flex-1 px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-purple-500 text-sm font-bold"
                        >
                            <option value="timestamp">Date</option>
                            <option value="resultEuro">Profit/Loss</option>
                            <option value="rrr">RRR</option>
                        </select>
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }))}
                            className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                        >
                            {filters.sortOrder === 'asc' ? '↑' : '↓'}
                        </button>
                    </div>
                </div>

                <button
                    onClick={() => setFilters({ asset: '', tradeType: '', sortBy: 'timestamp', sortOrder: 'desc' })}
                    className="p-2.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-all"
                    title="Reset Filters"
                >
                    <RotateCcw size={20} />
                </button>
            </div>

            {/* Entries List */}
            <div className="space-y-4">
                {filteredEntries.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="text-zinc-400" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">No entries found</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Start documenting your trading journey today.</p>
                    </div>
                ) : (
                    filteredEntries.map((entry, idx) => (
                        <div
                            key={entry.timestamp || idx}
                            className={`group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 shadow-sm hover:shadow-xl hover:border-purple-200 dark:hover:border-purple-900/50 transition-all duration-300 relative overflow-hidden`}
                        >
                            <div className={`absolute top-0 left-0 w-1.5 h-full ${entry.resultEuro >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>

                            <div className="flex flex-col lg:flex-row justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest ${entry.tradeType === 'Buy' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30'
                                            }`}>
                                            {entry.tradeType}
                                        </span>
                                        <h4 className="text-xl font-black text-zinc-900 dark:text-white uppercase">{entry.asset}</h4>
                                        <span className="text-xs font-bold text-zinc-400">{entry.date}</span>
                                        {entry.is_draft && (
                                            <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] px-2 py-0.5 rounded-full font-black uppercase">Draft</span>
                                        )}
                                    </div>

                                    {entry.setup && (
                                        <p className="text-sm font-bold text-purple-600 dark:text-purple-400 mb-4 bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-lg inline-block">
                                            {entry.setup}
                                        </p>
                                    )}

                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                        {[
                                            { label: 'Entry', value: entry.entryPrice },
                                            { label: 'Stop Loss', value: entry.stopLoss },
                                            { label: 'Take Profit', value: entry.takeProfit },
                                            { label: 'RRR', value: entry.rrr || 'N/A' },
                                            { label: 'Size', value: entry.positionSize + ' lots' }
                                        ].map((stat, i) => (
                                            <div key={i}>
                                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                                                <p className="text-sm font-black text-zinc-700 dark:text-zinc-300">{stat.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="lg:text-right flex lg:flex-col justify-between items-center lg:items-end gap-2">
                                    <div className="space-y-1">
                                        <p className={`text-3xl font-black tracking-tighter ${entry.resultEuro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(entry.resultEuro)}
                                        </p>
                                        <p className={`text-xs font-bold uppercase tracking-widest ${entry.resultEuro >= 0 ? 'text-green-600/70' : 'text-red-600/70'}`}>
                                            {entry.resultPercentage.toFixed(2)}% ROI
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(journalEntries.indexOf(entry))}
                                            className="p-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 hover:text-purple-600 dark:hover:text-purple-400 rounded-xl transition-all"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => deleteEntry(journalEntries.indexOf(entry))}
                                            className="p-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 hover:text-red-500 rounded-xl transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {entry.comment && (
                                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed italic">
                                        "{entry.comment}"
                                    </p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Slide-out Drawer */}
            {isDrawerOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
                        onClick={handleCloseDrawer}
                    ></div>
                    <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white dark:bg-zinc-900 z-[70] shadow-2xl p-0 animate-in slide-in-from-right duration-500 ease-out border-l border-zinc-100 dark:border-zinc-800">
                        <div className="h-full flex flex-col">
                            {/* Drawer Header */}
                            <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/30">
                                <div>
                                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white">
                                        {editingIndex !== -1 ? 'Edit Trade' : 'New Journal Entry'}
                                    </h3>
                                    <p className="text-sm text-zinc-500 font-medium">Capture the details of your trade</p>
                                </div>
                                <button
                                    onClick={handleCloseDrawer}
                                    className="p-3 bg-white dark:bg-zinc-800 rounded-2xl text-zinc-400 hover:text-red-500 shadow-sm transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Drawer Content */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                {/* Visual Step Indicator (Simplified) */}
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">General Info</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Trade Date *</label>
                                                <input
                                                    type="date"
                                                    value={journalForm.date}
                                                    onChange={(e) => setJournalForm(v => ({ ...v, date: e.target.value }))}
                                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border-none focus:ring-2 focus:ring-purple-500 font-bold"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Asset *</label>
                                                <select
                                                    value={journalForm.asset}
                                                    onChange={(e) => setJournalForm(v => ({ ...v, asset: e.target.value }))}
                                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border-none focus:ring-2 focus:ring-purple-500 font-bold"
                                                >
                                                    {Object.keys(currencyPairs).map(pair => <option key={pair} value={pair}>{pair}</option>)}
                                                    <option value="other">Other Asset</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Type</label>
                                                <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                                                    <button
                                                        onClick={() => setJournalForm(v => ({ ...v, tradeType: 'Buy' }))}
                                                        className={`py-2 px-4 rounded-lg text-sm font-black uppercase tracking-widest transition-all ${journalForm.tradeType === 'Buy'
                                                            ? 'bg-white dark:bg-zinc-700 text-blue-600 shadow-sm shadow-blue-500/10'
                                                            : 'text-zinc-400 hover:text-zinc-600'
                                                            }`}
                                                    >
                                                        LONG
                                                    </button>
                                                    <button
                                                        onClick={() => setJournalForm(v => ({ ...v, tradeType: 'Sell' }))}
                                                        className={`py-2 px-4 rounded-lg text-sm font-black uppercase tracking-widest transition-all ${journalForm.tradeType === 'Sell'
                                                            ? 'bg-white dark:bg-zinc-700 text-amber-600 shadow-sm shadow-amber-500/10'
                                                            : 'text-zinc-400 hover:text-zinc-600'
                                                            }`}
                                                    >
                                                        SHORT
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Entry Details</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Entry Price *</label>
                                                <input
                                                    type="number"
                                                    step="any"
                                                    value={journalForm.entryPrice}
                                                    onChange={(e) => setJournalForm(v => ({ ...v, entryPrice: e.target.value }))}
                                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border-none focus:ring-2 focus:ring-purple-500 font-bold"
                                                    placeholder="0.0000"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Take Profit *</label>
                                                <input
                                                    type="number"
                                                    step="any"
                                                    value={journalForm.takeProfit}
                                                    onChange={(e) => setJournalForm(v => ({ ...v, takeProfit: e.target.value }))}
                                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border-none focus:ring-2 focus:ring-purple-500 font-bold text-green-600 dark:text-green-400"
                                                    placeholder="0.0000"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Stop Loss *</label>
                                                <input
                                                    type="number"
                                                    step="any"
                                                    value={journalForm.stopLoss}
                                                    onChange={(e) => setJournalForm(v => ({ ...v, stopLoss: e.target.value }))}
                                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border-none focus:ring-2 focus:ring-purple-500 font-bold text-red-600 dark:text-red-400"
                                                    placeholder="0.0000"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Execution & Outcome</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Setup / Strategy</label>
                                            <input
                                                type="text"
                                                value={journalForm.setup}
                                                onChange={(e) => setJournalForm(v => ({ ...v, setup: e.target.value }))}
                                                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border-none focus:ring-2 focus:ring-purple-500 font-bold"
                                                placeholder="e.g. Breakout"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">RRR (Min 1:x)</label>
                                            <input
                                                type="text"
                                                value={journalForm.rrr}
                                                onChange={(e) => setJournalForm(v => ({ ...v, rrr: e.target.value }))}
                                                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border-none focus:ring-2 focus:ring-purple-500 font-bold"
                                                placeholder="1:2"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Lot Size *</label>
                                            <input
                                                type="number"
                                                step="any"
                                                value={journalForm.positionSize}
                                                onChange={(e) => setJournalForm(v => ({ ...v, positionSize: e.target.value }))}
                                                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border-none focus:ring-2 focus:ring-purple-500 font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Result (€)</label>
                                            <input
                                                type="number"
                                                step="any"
                                                value={journalForm.resultEuro}
                                                onChange={(e) => setJournalForm(v => ({ ...v, resultEuro: parseFloat(e.target.value) || 0 }))}
                                                className={`w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border-none focus:ring-2 focus:ring-purple-500 font-bold ${journalForm.resultEuro >= 0 ? 'text-green-600' : 'text-red-600'}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">ROI (%)</label>
                                            <input
                                                type="number"
                                                step="any"
                                                value={journalForm.resultPercentage}
                                                onChange={(e) => setJournalForm(v => ({ ...v, resultPercentage: parseFloat(e.target.value) || 0 }))}
                                                className={`w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border-none focus:ring-2 focus:ring-purple-500 font-bold ${journalForm.resultPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Trade Comments / Emotion Journal</label>
                                    <textarea
                                        value={journalForm.comment}
                                        onChange={(e) => setJournalForm(v => ({ ...v, comment: e.target.value }))}
                                        className="w-full px-4 py-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border-none focus:ring-2 focus:ring-purple-500 font-medium h-32 resize-none"
                                        placeholder="How did you feel? Did you follow your plan?"
                                    ></textarea>
                                </div>
                            </div>

                            {/* Drawer Footer Actions */}
                            <div className="p-8 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleSave(true)}
                                        className="flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-2xl hover:bg-zinc-100 transition-all font-bold shadow-sm"
                                    >
                                        <Save size={18} />
                                        Save Draft
                                    </button>
                                    <button
                                        onClick={() => handleSave(false)}
                                        className="flex items-center justify-center gap-2 px-6 py-4 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-all font-black uppercase tracking-widest shadow-lg shadow-purple-500/20 active:scale-95"
                                    >
                                        {editingIndex !== -1 ? 'Update Trade' : 'Post Journal'}
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Journal;
