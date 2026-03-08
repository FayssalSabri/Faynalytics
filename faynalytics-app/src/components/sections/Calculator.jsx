import React from 'react';
import { Calculator as CalcIcon } from 'lucide-react';
import { currencyPairs } from '../../constants/assets';

const Calculator = ({
    calculatorData,
    setCalculatorData,
    calculatePosition,
    calculatorResult
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
            {/* Configuration Side */}
            <div className="lg:col-span-7 space-y-6">
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <CalcIcon className="text-zinc-400" size={20} />
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Position Size Calculator</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Account Capital</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">€</span>
                                    <input
                                        type="number"
                                        value={calculatorData.capital}
                                        onChange={(e) => setCalculatorData(v => ({ ...v, capital: parseFloat(e.target.value) || 0 }))}
                                        className="w-full pl-8 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-50 text-sm focus:ring-1 focus:ring-purple-500 outline-none"
                                        placeholder="10000"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Risk Percentage</label>
                                <div className="relative">
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">%</span>
                                    <input
                                        type="number"
                                        value={calculatorData.riskPercentage}
                                        onChange={(e) => setCalculatorData(v => ({ ...v, riskPercentage: parseFloat(e.target.value) || 0 }))}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-50 text-sm focus:ring-1 focus:ring-purple-500 outline-none"
                                        placeholder="1"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Currency Pair</label>
                                <select
                                    value={calculatorData.currencyPair}
                                    onChange={(e) => setCalculatorData(v => ({ ...v, currencyPair: e.target.value }))}
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-50 text-sm focus:ring-1 focus:ring-purple-500 outline-none"
                                >
                                    {Object.keys(currencyPairs).map(pair => (
                                        <option key={pair} value={pair}>{pair}</option>
                                    ))}
                                    <option value="custom">Custom Pip Value</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Stop Loss Mode</label>
                                <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                    <button
                                        onClick={() => setCalculatorData(v => ({ ...v, stopLossMethod: 'pips_direct' }))}
                                        className={`py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${calculatorData.stopLossMethod === 'pips_direct'
                                                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm'
                                                : 'text-zinc-400 hover:text-zinc-600'
                                            }`}
                                    >
                                        Pips
                                    </button>
                                    <button
                                        onClick={() => setCalculatorData(v => ({ ...v, stopLossMethod: 'price_action' }))}
                                        className={`py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${calculatorData.stopLossMethod === 'price_action'
                                                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm'
                                                : 'text-zinc-400 hover:text-zinc-600'
                                            }`}
                                    >
                                        Price
                                    </button>
                                </div>
                            </div>

                            {calculatorData.stopLossMethod === 'pips_direct' ? (
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">SL distance (Pips)</label>
                                    <input
                                        type="number"
                                        value={calculatorData.stopLossPips}
                                        onChange={(e) => setCalculatorData(v => ({ ...v, stopLossPips: e.target.value }))}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-50 text-sm focus:ring-1 focus:ring-purple-500 outline-none"
                                        placeholder="20"
                                    />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Entry Price</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={calculatorData.entryPrice}
                                            onChange={(e) => setCalculatorData(v => ({ ...v, entryPrice: e.target.value }))}
                                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-50 text-sm focus:ring-1 focus:ring-purple-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">SL Price</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={calculatorData.stopLossPrice}
                                            onChange={(e) => setCalculatorData(v => ({ ...v, stopLossPrice: e.target.value }))}
                                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-50 text-sm focus:ring-1 focus:ring-purple-500 outline-none border-rose-200 dark:border-rose-900/50"
                                        />
                                    </div>
                                </div>
                            )}

                            {calculatorData.currencyPair === 'custom' && (
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Lot Value (€/lot/pip)</label>
                                    <input
                                        type="number"
                                        value={calculatorData.customPipValue}
                                        onChange={(e) => setCalculatorData(v => ({ ...v, customPipValue: parseFloat(e.target.value) || 0 }))}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-50 text-sm focus:ring-1 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={calculatePosition}
                        className="w-full mt-8 py-3 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity active:scale-[0.98]"
                    >
                        Calculate Risk
                    </button>
                </div>
            </div>

            {/* Results Side */}
            <div className="lg:col-span-5">
                {calculatorResult ? (
                    <div className="bg-zinc-900 dark:bg-zinc-50 rounded-xl p-8 text-white dark:text-zinc-900 h-full flex flex-col shadow-sm border border-zinc-800 dark:border-zinc-200">
                        <h3 className="text-zinc-400 dark:text-zinc-500 text-xs font-bold uppercase tracking-widest mb-10">Calculated Results</h3>

                        <div className="flex-1 space-y-8">
                            <div className="flex justify-between items-end border-b border-white/10 dark:border-zinc-900/10 pb-4">
                                <span className="text-zinc-400 dark:text-zinc-500 text-sm">Recommended Size</span>
                                <span className="text-4xl font-black">{calculatorResult.lotSize} Lots</span>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-400 dark:text-zinc-500 font-medium">Amount to Risk</span>
                                    <span className="font-bold text-rose-400 dark:text-rose-600">€{calculatorResult.amountRisked}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-400 dark:text-zinc-500 font-medium">SL Distance</span>
                                    <span className="font-bold">{calculatorResult.calculatedPips} pips</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-400 dark:text-zinc-500 font-medium">Pip Value</span>
                                    <span className="font-bold">€{calculatorResult.pipValue}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 p-4 bg-white/5 dark:bg-zinc-900/5 rounded-lg flex gap-3 text-xs text-zinc-400 dark:text-zinc-500">
                            <CalcIcon size={16} /> {/* Changed AlertCircle to CalcIcon as AlertCircle was not imported */}
                            <p>Always verify lot sizes on your broker terminal before executing.</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 h-full flex flex-col items-center justify-center p-10 text-center shadow-sm">
                        <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 mb-4">
                            <CalcIcon size={24} />
                        </div>
                        <p className="text-sm font-bold text-zinc-400">Enter parameters to see calculation result</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Calculator;
