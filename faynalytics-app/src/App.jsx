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
    return saved ? JSON.parse(saved) : [];
  });

  const [performanceGoal, setPerformanceGoal] = useState(() => {
    const saved = localStorage.getItem('tradingPerformanceGoal');
    return saved ? JSON.parse(saved) : { initialCapital: 10000, targetPnLEuro: 1000 };
  });

  // Calculator State
  const [calculatorData, setCalculatorData] = useState({
    capital: 1000,
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
  const [editingIndex, setEditingIndex] = useState(-1);
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

  // --- ACTIONS ---
  const showToast = (message, type = 'info') => setToast({ message, type });
  const closeToast = () => setToast(null);

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
    const { date, asset, customAsset, tradeType, setup, entryPrice, stopLoss, takeProfit, rrr, positionSize, resultEuro, resultPercentage, comment } = journalForm;
    const finalAsset = asset === 'other' ? customAsset.toUpperCase() : asset;

    if (!date || !finalAsset || !entryPrice || !stopLoss || !takeProfit || !positionSize) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const entry = {
      date, asset: finalAsset, tradeType, setup,
      entryPrice: parseFloat(entryPrice),
      stopLoss: parseFloat(stopLoss),
      takeProfit: parseFloat(takeProfit),
      rrr,
      positionSize: parseFloat(positionSize),
      resultEuro: parseFloat(resultEuro) || 0,
      resultPercentage: parseFloat(resultPercentage) || 0,
      comment,
      is_draft: isDraft,
      timestamp: new Date().toISOString()
    };

    if (editingIndex !== -1) {
      const updatedEntries = [...journalEntries];
      updatedEntries[editingIndex] = { ...updatedEntries[editingIndex], ...entry };
      setJournalEntries(updatedEntries);
      setEditingIndex(-1);
      showToast('Entry updated successfully!', 'success');
    } else {
      setJournalEntries([entry, ...journalEntries]);
      showToast(isDraft ? 'Draft saved!' : 'Trade added to journal!', 'success');
    }
    resetJournalForm();
  };

  const resetJournalForm = () => {
    setJournalForm({
      date: new Date().toISOString().split('T')[0],
      asset: 'EURUSD', customAsset: '', tradeType: 'Buy', setup: '',
      entryPrice: '', stopLoss: '', takeProfit: '', rrr: '',
      positionSize: '', resultEuro: 0, resultPercentage: 0, comment: ''
    });
    setEditingIndex(-1);
  };

  const editEntry = (index) => {
    const entry = journalEntries[index];
    setJournalForm({
      date: entry.date,
      asset: Object.keys(currencyPairs).includes(entry.asset) ? entry.asset : 'other',
      customAsset: !Object.keys(currencyPairs).includes(entry.asset) ? entry.asset : '',
      tradeType: entry.tradeType,
      setup: entry.setup,
      entryPrice: entry.entryPrice.toString(),
      stopLoss: entry.stopLoss.toString(),
      takeProfit: entry.takeProfit.toString(),
      rrr: entry.rrr,
      positionSize: entry.positionSize.toString(),
      resultEuro: entry.resultEuro,
      resultPercentage: entry.resultPercentage,
      comment: entry.comment
    });
    setEditingIndex(index);
  };

  const deleteEntry = (index) => {
    if (window.confirm('Delete this entry?')) {
      setJournalEntries(journalEntries.filter((_, i) => i !== index));
      showToast('Trade deleted', 'success');
    }
  };

  // --- CLOUD SYNC ---
  const handleSaveToCloud = async () => {
    try {
      showToast('Saving to Google Drive...', 'info');
      const response = await fetch(`${BACKEND_URL}/api/save-journal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ journalData: journalEntries }),
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

    const sortedTrades = [...trades].sort((a, b) => new Date(a.date) - new Date(b.date));
    let cumulative = 0;
    const equityData = sortedTrades.map(trade => ({
      date: trade.date,
      equity: cumulative += trade.resultEuro
    }));

    const assetPerformance = trades.reduce((acc, trade) => {
      acc[trade.asset] = (acc[trade.asset] || 0) + trade.resultEuro;
      return acc;
    }, {});
    const assetData = Object.entries(assetPerformance).map(([asset, pnl]) => ({ asset, pnl }));

    return { totalTrades, winRate, totalPnL, avgPnL, equityData, assetData };
  }, [journalEntries]);

  const goalProgress = useMemo(() => {
    const progress = (analytics.totalPnL / performanceGoal.targetPnLEuro) * 100;
    return Math.min(100, Math.max(0, progress));
  }, [analytics.totalPnL, performanceGoal.targetPnLEuro]);

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
      dashboard: { isDriveConnected, handleSaveToCloud, handleLoadFromCloud, handleSignOut, BACKEND_URL, analytics, performanceGoal, setPerformanceGoal, goalProgress, showToast },
      calculator: { calculatorData, setCalculatorData, calculatePosition, calculatorResult },
      journal: { journalEntries, setJournalEntries, journalForm, setJournalForm, editingIndex, setEditingIndex, addJournalEntry, resetJournalForm, editEntry, deleteEntry, filters, setFilters, showToast },
      analytics: { analytics, theme, journalEntries },
      sessions: {},
      settings: { theme, setTheme, journalEntries, setJournalEntries, showToast }
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
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>
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