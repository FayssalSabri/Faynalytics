import React from 'react';
import { Clock } from 'lucide-react';
import { getTradingSessionStatus } from '../../utils/helpers';

const Sessions = () => {
    const sessions = getTradingSessionStatus();

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                <Clock className="text-purple-600" size={28} />
                Market Sessions Status (UTC)
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {sessions.map(session => (
                    <div key={session.name} className={`p-5 rounded-2xl text-center shadow-sm border transition-all ${session.isOpen
                        ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 ring-2 ring-emerald-500/20'
                        : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800'
                        }`}>
                        <div className="flex items-center justify-center gap-3 mb-3">
                            <div
                                className={`w-3.5 h-3.5 rounded-full shadow-sm ${session.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}
                            />
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">{session.name}</span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                {session.start.toString().padStart(2, '0')}:00 - {session.end.toString().padStart(2, '0')}:00
                            </p>
                            <div className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full inline-block uppercase ${session.isOpen ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30' : 'text-rose-700 bg-rose-100 dark:bg-rose-900/30'
                                }`}>
                                {session.isOpen ? 'Active' : 'Closed'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Session Timeline Visualization */}
            <div className="bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl p-8 border border-zinc-100 dark:border-zinc-800">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                    <div className="w-1.5 h-5 bg-purple-600 rounded-full"></div>
                    24-Hour Session Timeline
                </h3>
                <div className="relative h-16 bg-zinc-200 dark:bg-zinc-700 rounded-xl overflow-hidden shadow-inner border border-zinc-300 dark:border-zinc-600">
                    {sessions.map((session, index) => {
                        const colors = ['#9333ea', '#2563eb', '#10b981', '#f59e0b'];
                        const sessionBars = [];

                        if (session.start < session.end) {
                            sessionBars.push({
                                left: (session.start / 24) * 100,
                                width: ((session.end - session.start) / 24) * 100,
                                color: colors[index]
                            });
                        } else {
                            sessionBars.push({
                                left: (session.start / 24) * 100,
                                width: ((24 - session.start) / 24) * 100,
                                color: colors[index]
                            });
                            sessionBars.push({
                                left: 0,
                                width: (session.end / 24) * 100,
                                color: colors[index]
                            });
                        }

                        return sessionBars.map((bar, barIndex) => (
                            <div
                                key={`${session.name}-${barIndex}`}
                                className="absolute h-full flex items-center justify-center text-white text-[10px] font-black uppercase tracking-tighter overflow-hidden whitespace-nowrap px-1 group transition-all hover:brightness-110 active:scale-y-95"
                                style={{
                                    left: `${bar.left}%`,
                                    width: `${bar.width}%`,
                                    backgroundColor: bar.color
                                }}
                            >
                                {barIndex === 0 && bar.width > 10 && (
                                    <span className="drop-shadow-sm">{session.name}</span>
                                )}
                            </div>
                        ));
                    })}

                    {/* Current time indicator */}
                    <div
                        className="absolute top-0 bottom-0 w-1 bg-red-500 z-10 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                        style={{
                            left: `${(new Date().getUTCHours() + new Date().getUTCMinutes() / 60) / 24 * 100}%`
                        }}
                    >
                        <div className="absolute top-0 -left-[5px] w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950 shadow-sm"></div>
                        <div className="absolute bottom-0 -left-[5px] w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950 shadow-sm"></div>
                    </div>
                </div>

                <div className="flex justify-between text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mt-4 px-1">
                    {['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '24:00'].map(t => (
                        <span key={t}>{t}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Sessions;
