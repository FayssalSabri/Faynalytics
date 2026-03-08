import React from 'react';
import { Menu, Sun, Moon, Bell, User } from 'lucide-react';

const Header = ({
    setSidebarOpen,
    theme,
    setTheme,
    userName
}) => {
    return (
        <header className="sticky top-4 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 mb-4 sm:mb-8 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                    <Menu size={20} />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                        Faynalytics
                    </h1>
                    <p className="hidden sm:block text-xs text-zinc-500">Trading Journal</p>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                <button
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>

                <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-zinc-200 dark:border-zinc-800">
                    {userName && (
                        <span className="hidden md:block text-sm font-medium text-zinc-600 dark:text-zinc-400">
                            {userName}
                        </span>
                    )}
                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                        <User size={16} className="text-zinc-600 dark:text-zinc-400" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
