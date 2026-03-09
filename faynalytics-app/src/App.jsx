import React, { useState, useEffect, useMemo } from 'react';
import {
  Calculator as CalculatorIcon,
  BookOpen,
  BarChart3,
  Clock,
  Settings as SettingsIcon,
  TrendingUp
} from 'lucide-react';

// Components
import Toast from './components/ui/Toast';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Sections
import Dashboard from './components/sections/Dashboard';
import Calculator from './components/sections/Calculator';
import Journal from './components/sections/Journal';
import Analytics from './components/sections/Analytics';
import Sessions from './components/sections/Sessions';
import Settings from './components/sections/Settings';

// Utils & Constants
import { currencyPairs } from './constants/assets';
import { formatCurrency, formatPercentage } from './utils/helpers';

// Backend Configuration
const BACKEND_URL = 'https://faynalytics-backend.vercel.app';

const FaynalyticsApp = () => {
  // --- STATE MANAGEMENT ---
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [userName, setUserName] = useState(null);

  // Data State
  const [journalEntries, setJournalEntries] = useState(() => {
    const saved = localStorage.getItem('tradingJournalEntries');
    const parsed = saved ? JSON.parse(saved) : [];
    // Robust ID migration on load
    return parsed.map((e, idx) => ({
      ...e,
      id: e.id || e.timestamp || `${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`
    }));
  });

  const [performanceGoal, setPerformanceGoal] = useState(() => {
    const saved = localStorage.getItem('tradingPerformanceGoal');
    return saved ? JSON.parse(saved) : { initialCapital: 5000, targetPnLEuro: 5400 };
  });

  // Calculator State
  const [calculatorData, setCalculatorData] = useState({
    capital: 5000,
    riskPercentage: 1,
    currencyPair: 'EURUSD',
    stopLossMethod: 'pips_direct',
    stopLossPips: 20,
    entryPrice: '',
    stopLossPrice: '',
    tradeType: 'buy',
    customPipValue: 10
  });
  const [calculatorResult, setCalculatorResult] = useState(null);

  // Journal Form State
  const [journalForm, setJournalForm] = useState({
    date: new Date().toISOString().split('T')[0],
    asset: 'EURUSD',
    customAsset: '',
    tradeType: 'Buy',
    setup: '',
    entryPrice: '',
    stopLoss: '',
    takeProfit: '',
    rrr: '',
    positionSize: '',
    resultEuro: 0,
    resultPercentage: 0,
    comment: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({
    asset: '',
    tradeType: '',
    sortBy: 'timestamp',
    sortOrder: 'desc'
  });

  // --- EFFECTS ---
  useEffect(() => {
    localStorage.setItem('tradingJournalEntries', JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('tradingPerformanceGoal', JSON.stringify(performanceGoal));
  }, [performanceGoal]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'success') {
      setIsDriveConnected(true);
      showToast('Successfully connected to Google Drive!', 'success');
      fetchUserProfile();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Migration for missing IDs (Backup for runtime additions)
  useEffect(() => {
    if (journalEntries.some(e => !e.id)) {
      setJournalEntries(prev => prev.map((e, idx) => ({
        ...e,
        id: e.id || e.timestamp || `${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`
      })));
    }
  }, [journalEntries]);

  // --- ACTIONS ---
  const showToast = (message, type = 'info') => setToast({ message, type });
  const closeToast = () => setToast(null);

  // Migration for performance goal (requested by user)
  useEffect(() => {
    if (performanceGoal.initialCapital === 10000 && performanceGoal.targetPnLEuro === 1000) {
      setPerformanceGoal({ initialCapital: 5000, targetPnLEuro: 5400 });
      showToast('Performance goal updated to defaults', 'success');
    }
  }, [performanceGoal.initialCapital, performanceGoal.targetPnLEuro]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/user-profile`);
      if (response.ok) {
        const data = await response.json();
        setUserName(data.given_name || data.name);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const calculatePosition = () => {
    const { capital, riskPercentage, currencyPair, stopLossMethod, stopLossPips, entryPrice, stopLossPrice, customPipValue } = calculatorData;
    let pips = 0;

    if (stopLossMethod === 'pips_direct') {
      pips = parseFloat(stopLossPips);
    } else {
      const entry = parseFloat(entryPrice);
      const sl = parseFloat(stopLossPrice);
      if (!entry || !sl) {
        showToast('Please enter valid entry and stop loss prices', 'error');
        return;
      }
      const pipDecimal = currencyPair === 'custom' ? 0.0001 : currencyPairs[currencyPair].pipDecimal;
      pips = Math.abs(entry - sl) / pipDecimal;
    }

    if (!capital || !riskPercentage || !pips || capital <= 0 || riskPercentage <= 0 || pips <= 0) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    const amountToRisk = (capital * riskPercentage) / 100;
    const pipValue = currencyPair === 'custom' ? customPipValue : currencyPairs[currencyPair].pipValue;
    const lotSize = amountToRisk / (pips * pipValue);

    setCalculatorResult({
      lotSize: lotSize.toFixed(2),
      pipValue: pipValue.toFixed(2),
      amountRisked: amountToRisk.toFixed(2),
      calculatedPips: pips.toFixed(1)
    });
  };

  const addJournalEntry = (isDraft = false) => {
    const { date, asset, customAsset, tradeType, setup, entryPrice, exitPrice, positionSize, resultEuro, resultPercentage, comment } = journalForm;
    const finalAsset = asset === 'other' ? customAsset.toUpperCase() : asset;

    if (!date || !finalAsset || !entryPrice || !positionSize) {
      showToast('Please fill in all required fields (Entry, Size)', 'error');
      return;
    }

    const entry = {
      date, asset: finalAsset, tradeType, setup,
      entryPrice: parseFloat(entryPrice),
      exitPrice: exitPrice ? parseFloat(exitPrice) : null,
      positionSize: parseFloat(positionSize),
      resultEuro: parseFloat(resultEuro) || 0,
      resultPercentage: parseFloat(resultPercentage) || 0,
      comment,
      is_draft: isDraft,
      timestamp: new Date().toISOString(),
      id: Date.now()
    };

    if (editingId) {
      const next = journalEntries.map(e => e.id === editingId ? { ...e, ...entry, id: editingId } : e);
      setJournalEntries(next);
      setEditingId(null);
      showToast('Entry updated successfully!', 'success');
      if (isDriveConnected) handleSaveToCloud(next);
    } else {
      const next = [entry, ...journalEntries];
      setJournalEntries(next);
      showToast(isDraft ? 'Draft saved!' : 'Trade added to journal!', 'success');
      if (isDriveConnected) handleSaveToCloud(next);
    }
    resetJournalForm();
  };

  const resetJournalForm = () => {
    setJournalForm({
      date: new Date().toISOString().split('T')[0],
      asset: 'EURUSD', customAsset: '', tradeType: 'Buy', setup: '',
      entryPrice: '', exitPrice: '',
      positionSize: '', resultEuro: '', resultPercentage: '', comment: ''
    });
    setEditingId(null);
  };

  const editEntry = (id) => {
    const entry = journalEntries.find(e => e.id === id);
    if (!entry) return;

    setJournalForm({
      date: entry.date,
      asset: Object.keys(currencyPairs).includes(entry.asset) ? entry.asset : 'other',
      customAsset: !Object.keys(currencyPairs).includes(entry.asset) ? entry.asset : '',
      tradeType: entry.tradeType,
      setup: entry.setup || '',
      entryPrice: entry.entryPrice.toString(),
      exitPrice: entry.exitPrice ? entry.exitPrice.toString() : '',
      positionSize: entry.positionSize.toString(),
      resultEuro: entry.resultEuro.toString(),
      resultPercentage: entry.resultPercentage.toString(),
      comment: entry.comment || ''
    });
    setEditingId(id);
  };

  const deleteEntry = async (id) => {
    if (window.confirm('Delete this entry?')) {
      const next = journalEntries.filter(e => e.id !== id);
      setJournalEntries(next);
      showToast('Trade deleted', 'success');
      if (isDriveConnected) handleSaveToCloud(next);
    }
  };

  const clearJournal = async () => {
    if (window.confirm('Are you sure you want to clear your entire workspace? This cannot be undone.')) {
      setJournalEntries([]);
      showToast('Workspace cleared', 'success');
      if (isDriveConnected) handleSaveToCloud([]);
    }
  };

  // --- CLOUD SYNC ---
  const handleSaveToCloud = async (dataOverride = null) => {
    try {
      const dataToSave = dataOverride || journalEntries;
      showToast('Saving to Google Drive...', 'info');
      const response = await fetch(`${BACKEND_URL}/api/save-journal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ journalData: dataToSave }),
      });
      if (response.ok) showToast('Journal saved!', 'success');
      else showToast('Sync failed', 'error');
    } catch (error) { showToast('Network error', 'error'); }
  };

  const handleLoadFromCloud = async () => {
    try {
      showToast('Loading from Google Drive...', 'info');
      const response = await fetch(`${BACKEND_URL}/api/load-journal`);
      if (response.ok) {
        const data = await response.json();
        setJournalEntries(data);
        showToast('Journal loaded!', 'success');
      } else showToast('Load failed', 'error');
    } catch (error) { showToast('Network error', 'error'); }
  };

  const handleSignOut = () => {
    setIsDriveConnected(false);
    setUserName(null);
    showToast('Signed out', 'info');
  };

  // --- CALCULATED DATA ---
  const analytics = useMemo(() => {
    const trades = journalEntries.filter(e => !e.is_draft);
    const totalTrades = trades.length;
    const winningTrades = trades.filter(e => e.resultEuro > 0).length;
    const totalPnL = trades.reduce((sum, e) => sum + (e.resultEuro || 0), 0);
    const avgPnL = totalTrades > 0 ? totalPnL / totalTrades : 0;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades * 100) : 0;

    // Sort by timestamp for accurate chronological order
    const sortedTrades = [...trades].sort((a, b) => new Date(a.timestamp || a.date) - new Date(b.timestamp || b.date));

    // Start with initial capital
    let cumulative = parseFloat(performanceGoal.initialCapital) || 0;

    const equityData = [
      { date: 'Start', equity: cumulative },
      ...sortedTrades.map(trade => {
        cumulative += (parseFloat(trade.resultEuro) || 0);
        return {
          date: trade.date,
          equity: parseFloat(cumulative.toFixed(2))
        };
      })
    ];

    const assetPerformance = trades.reduce((acc, trade) => {
      acc[trade.asset] = (acc[trade.asset] || 0) + trade.resultEuro;
      return acc;
    }, {});
    const assetData = Object.entries(assetPerformance).map(([asset, pnl]) => ({ asset, pnl }));

    return { totalTrades, winRate, totalPnL, avgPnL, equityData, assetData };
  }, [journalEntries, performanceGoal.initialCapital]);

  const goalProgress = useMemo(() => {
    // Determine the profit target:
    // If Goal > Initial, we treat Goal as the target balance.
    // If Goal <= Initial, we treat Goal as the target profit amount.
    const targetProfit = performanceGoal.targetPnLEuro > performanceGoal.initialCapital
      ? (performanceGoal.targetPnLEuro - performanceGoal.initialCapital)
      : performanceGoal.targetPnLEuro;

    if (targetProfit <= 0) return 0;

    const progress = (analytics.totalPnL / targetProfit) * 100;
    return Math.min(100, Math.max(0, progress));
  }, [analytics.totalPnL, performanceGoal.initialCapital, performanceGoal.targetPnLEuro]);

  // --- NAVIGATION CONFIG ---
  const navigationItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
    { id: 'calculator', icon: CalculatorIcon, label: 'Position Calculator' },
    { id: 'journal', icon: BookOpen, label: 'Trading Journal' },
    { id: 'analytics', icon: TrendingUp, label: 'Analytics' },
    { id: 'sessions', icon: Clock, label: 'Market Sessions' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' }
  ];

  // --- RENDER HELPERS ---
  const renderContent = () => {
    const props = {
      dashboard: { isDriveConnected, handleSaveToCloud, handleLoadFromCloud, handleSignOut, BACKEND_URL, analytics, performanceGoal, setPerformanceGoal, goalProgress, showToast, setCurrentSection, journalEntries },
      calculator: { calculatorData, setCalculatorData, calculatePosition, calculatorResult },
      journal: { journalEntries, setJournalEntries, journalForm, setJournalForm, editingId, setEditingId, addJournalEntry, resetJournalForm, editEntry, deleteEntry, filters, setFilters, showToast },
      analytics: { analytics, theme, journalEntries, performanceGoal },
      sessions: {},
      settings: { theme, setTheme, journalEntries, setJournalEntries, clearJournal, showToast }
    };

    switch (currentSection) {
      case 'dashboard': return <Dashboard {...props.dashboard} />;
      case 'calculator': return <Calculator {...props.calculator} />;
      case 'journal': return <Journal {...props.journal} />;
      case 'analytics': return <Analytics {...props.analytics} />;
      case 'sessions': return <Sessions />;
      case 'settings': return <Settings {...props.settings} />;
      default: return <Dashboard {...props.dashboard} />;
    }
  };

  return (
    <div className={`min-h-screen overflow-x-hidden transition-colors duration-300 ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        navigationItems={navigationItems}
        currentSection={currentSection}
        setCurrentSection={setCurrentSection}
      />

      <main className="lg:ml-80 min-h-screen p-4 sm:p-8">
        <Header
          setSidebarOpen={setSidebarOpen}
          theme={theme}
          setTheme={setTheme}
          userName={userName}
        />

        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </div>
  );
};

export default FaynalyticsApp;