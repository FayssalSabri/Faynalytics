import React from 'react';
import { Settings as SettingsIcon, Sun, Moon, Download, Upload, Trash2, TrendingUp } from 'lucide-react';

const Settings = ({
    theme,
    setTheme,
    journalEntries,
    setJournalEntries,
    showToast
}) => {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm animate-in fade-in duration-500 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
            <h2 className="text-3xl font-black mb-10 flex items-center gap-3 text-zinc-900 dark:text-white">
                <SettingsIcon className="text-purple-600" size={32} />
                Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-10">
                    {/* Appearance */}
                    <div>
                        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-4 ml-1">Appearance</h3>
                        <div className="flex items-center justify-between p-6 bg-zinc-50 dark:bg-zinc-800/20 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-purple-200 dark:hover:border-purple-900/30 transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800 text-purple-600">
                                    {theme === 'light' ? <Sun size={24} /> : <Moon size={24} />}
                                </div>
                                <div>
                                    <p className="font-bold text-zinc-900 dark:text-white">Dark Mode</p>
                                    <p className="text-xs text-zinc-500 font-medium tracking-tight">Adjust the visual theme for high clarity</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                                className={`relative w-14 h-7 rounded-full transition-all duration-500 ease-spring ${theme === 'dark' ? 'bg-purple-600 shadow-lg shadow-purple-500/20' : 'bg-zinc-200'
                                    }`}
                            >
                                <div
                                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-500 ease-spring flex items-center justify-center ${theme === 'dark' ? 'translate-x-8' : 'translate-x-1'
                                        }`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full ${theme === 'dark' ? 'bg-purple-600' : 'bg-zinc-300'}`}></div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div>
                        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-4 ml-1">Notifications</h3>
                        <div className="space-y-3 p-6 bg-zinc-50 dark:bg-zinc-800/20 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                            {[
                                'Goal achievement alerts',
                                'Market session reminders',
                                'Morning trade review'
                            ].map((notif, idx) => (
                                <label key={idx} className="flex items-center group cursor-pointer justify-between py-1">
                                    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-purple-600 transition-colors">{notif}</span>
                                    <div className="relative flex items-center">
                                        <input type="checkbox" className="peer hidden" />
                                        <div className="w-5 h-5 border-2 border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 peer-checked:bg-purple-600 peer-checked:border-purple-600 transition-all duration-300"></div>
                                        <div className="absolute inset-0 flex items-center justify-center scale-50 opacity-0 peer-checked:opacity-100 peer-checked:scale-100 transition-all duration-300">
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-10">
                    {/* Data Management */}
                    <div>
                        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-4 ml-1">Data Management</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    const dataStr = JSON.stringify(journalEntries, null, 2);
                                    const blob = new Blob([dataStr], { type: 'application/json' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = 'faynalytics_journal_export.json';
                                    a.click();
                                    URL.revokeObjectURL(url);
                                    showToast('Data exported successfully!', 'success');
                                }}
                                className="w-full flex items-center justify-between px-6 py-4 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-200 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-blue-500/30 hover:bg-white dark:hover:bg-zinc-800 transition-all duration-300 font-bold group shadow-sm"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600">
                                        <Download size={20} />
                                    </div>
                                    <div className="text-left">
                                        <span className="block">Export Journal</span>
                                        <span className="block text-[10px] text-zinc-400 font-medium">Backup your trades to JSON</span>
                                    </div>
                                </div>
                                <div className="text-[10px] bg-blue-500/10 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 px-3 py-1 rounded-full uppercase tracking-widest font-black">Export</div>
                            </button>

                            <button
                                onClick={() => {
                                    const fileInput = document.createElement('input');
                                    fileInput.type = 'file';
                                    fileInput.accept = '.json';
                                    fileInput.onchange = (e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                                try {
                                                    const importedData = JSON.parse(event.target.result);
                                                    if (Array.isArray(importedData)) {
                                                        setJournalEntries(importedData);
                                                        showToast('Data imported successfully!', 'success');
                                                    } else {
                                                        throw new Error('Invalid format');
                                                    }
                                                } catch (err) {
                                                    showToast('Failed to import data.', 'error');
                                                }
                                            };
                                            reader.readAsText(file);
                                        }
                                    };
                                    fileInput.click();
                                }}
                                className="w-full flex items-center justify-between px-6 py-4 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-200 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-amber-500/30 hover:bg-white dark:hover:bg-zinc-800 transition-all duration-300 font-bold group shadow-sm"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600">
                                        <Upload size={20} />
                                    </div>
                                    <div className="text-left">
                                        <span className="block">Import Journal</span>
                                        <span className="block text-[10px] text-zinc-400 font-medium">Restore from backup file</span>
                                    </div>
                                </div>
                                <div className="text-[10px] bg-amber-500/10 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400 px-3 py-1 rounded-full uppercase tracking-widest font-black">Import</div>
                            </button>

                            <button
                                onClick={() => {
                                    if (window.confirm('Delete all data? This cannot be undone.')) {
                                        setJournalEntries([]);
                                        showToast('Data cleared.', 'success');
                                    }
                                }}
                                className="w-full flex items-center gap-3 px-6 py-4 text-zinc-400 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all duration-300 font-bold group"
                            >
                                <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 group-hover:bg-red-500/10 rounded-xl flex items-center justify-center transition-colors">
                                    <Trash2 size={20} />
                                </div>
                                <div className="text-left">
                                    <span className="block text-sm">Clear Workspace</span>
                                    <span className="block text-[10px] font-medium text-zinc-400">Permanently delete all data</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
