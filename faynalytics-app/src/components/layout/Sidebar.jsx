import React from 'react';
import { X } from 'lucide-react';

const Sidebar = ({
    sidebarOpen,
    setSidebarOpen,
    navigationItems,
    currentSection,
    setCurrentSection
}) => {
    return (
        <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
            <div className="p-8">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                        Faynalytics
                    </h2>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="space-y-1">
                    {navigationItems.map(item => {
                        const Icon = item.icon;
                        const isActive = currentSection === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setCurrentSection(item.id);
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${isActive
                                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                                        : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white'
                                    }`}
                            >
                                <Icon size={18} className={isActive ? 'text-purple-600' : ''} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
};

export default Sidebar;
