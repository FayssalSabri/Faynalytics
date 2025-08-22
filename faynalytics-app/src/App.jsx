import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, 
  BookOpen, 
  BarChart3, 
  Clock, 
  Settings, 
  Menu, 
  X, 
  Sun, 
  Moon,
  Bell,
  User,
  Cloud,
  CloudUpload,
  CloudDownload,
  Target,
  TrendingUp,
  Plus,
  Save,
  Edit,
  Trash2,
  Filter,
  RotateCcw,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  LogOut
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Assurez-vous que l'URL de votre backend est correcte
const BACKEND_URL = 'https://faynalytics-backend.vercel.app';

// Utility functions
const formatCurrency = (amount) => `€${amount.toFixed(2)}`;
const formatPercentage = (value) => `${value.toFixed(2)}%`;

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info
  };

  const colors = {
    success: 'border-green-500 bg-green-50 text-green-800',
    error: 'border-red-500 bg-red-50 text-red-800',
    warning: 'border-yellow-500 bg-yellow-50 text-yellow-800',
    info: 'border-blue-500 bg-blue-50 text-blue-800'
  };

  const Icon = icons[type];

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border-l-4 ${colors[type]} shadow-lg animate-in slide-in-from-right duration-300`}>
      <div className="flex items-center gap-2">
        <Icon size={20} />
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="ml-2">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// Main App Component
const FaynalyticsApp = () => {
  // State management
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [journalEntries, setJournalEntries] = useState(() => {
    const saved = localStorage.getItem('tradingJournalEntries');
    return saved ? JSON.parse(saved) : [];
  });
  const [toast, setToast] = useState(null);
  const [performanceGoal, setPerformanceGoal] = useState(() => {
    const saved = localStorage.getItem('tradingPerformanceGoal');
    return saved ? JSON.parse(saved) : { initialCapital: 10000, targetPnLEuro: 1000 };
  });

  // New state for Google Drive connection
  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [userName, setUserName] = useState(null);

  // Calculator state
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

  // New state for the calculator result
  const [calculatorResult, setCalculatorResult] = useState(null);

  // Journal form state
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

  // Effects
  useEffect(() => {
    localStorage.setItem('tradingJournalEntries', JSON.stringify(journalEntries));
  }, [journalEntries]);

  // CORRECTION : Applique la classe 'dark' sur l'élément <html>, la meilleure pratique
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('class', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('tradingPerformanceGoal', JSON.stringify(performanceGoal));
  }, [performanceGoal]);

  // Check for successful Google Drive connection on page load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'success') {
      setIsDriveConnected(true);
      showToast('Successfully connected to Google Drive!', 'success');
      // Récupérer le nom de l'utilisateur après une connexion réussie
      fetchUserProfile();
      // Clear the query string
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Helper functions
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const closeToast = () => setToast(null);

  // Nouvelle fonction pour récupérer le profil de l'utilisateur
  const fetchUserProfile = async () => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/user-profile`);
        if (response.ok) {
            const data = await response.json();
            setUserName(data.given_name || data.name);
            console.log('User profile:', data); // Pour vérifier les données
        } else {
            console.error('Failed to fetch user profile.');
        }
    } catch (error) {
        console.error('Network error fetching user profile:', error);
    }
  };

  // Navigation items
  const navigationItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
    { id: 'calculator', icon: Calculator, label: 'Position Calculator' },
    { id: 'journal', icon: BookOpen, label: 'Trading Journal' },
    { id: 'analytics', icon: TrendingUp, label: 'Analytics' },
    { id: 'sessions', icon: Clock, label: 'Market Sessions' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  // Currency pairs with pip values
  const currencyPairs = {
    'EURUSD': { name: 'EUR/USD', pipValue: 10, pipDecimal: 0.0001 },
    'GBPUSD': { name: 'GBP/USD', pipValue: 10, pipDecimal: 0.0001 },
    'USDJPY': { name: 'USD/JPY', pipValue: 8.5, pipDecimal: 0.01 },
    'AUDUSD': { name: 'AUD/USD', pipValue: 10, pipDecimal: 0.0001 },
    'USDCAD': { name: 'USD/CAD', pipValue: 10, pipDecimal: 0.0001 },
    'USDCHF': { name: 'USD/CHF', pipValue: 10, pipDecimal: 0.0001 },
    'NZDUSD': { name: 'NZD/USD', pipValue: 10, pipDecimal: 0.0001 },
    'EURJPY': { name: 'EUR/JPY', pipValue: 8.5, pipDecimal: 0.01 },
    'GBPJPY': { name: 'GBP/JPY', pipValue: 8.5, pipDecimal: 0.01 },
    'XAUUSD': { name: 'Gold (XAU/USD)', pipValue: 10, pipDecimal: 0.1 },
    'DAX40': { name: 'DAX 40', pipValue: 1, pipDecimal: 1 },
    'SP500': { name: 'S&P 500', pipValue: 1, pipDecimal: 1 },
    'NASDAQ100': { name: 'NASDAQ 100', pipValue: 1, pipDecimal: 1 },
    'CAC40': { name: 'CAC 40', pipValue: 1, pipDecimal: 1 }
  };

  // Analytics calculations
  const analytics = useMemo(() => {
    const trades = journalEntries.filter(e => !e.is_draft);
    const totalTrades = trades.length;
    const winningTrades = trades.filter(e => e.resultEuro > 0).length;
    const totalPnL = trades.reduce((sum, e) => sum + (e.resultEuro || 0), 0);
    const avgPnL = totalTrades > 0 ? totalPnL / totalTrades : 0;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades * 100) : 0;

    // Equity curve data
    const sortedTrades = trades.sort((a, b) => new Date(a.date) - new Date(b.date));
    let cumulative = 0;
    const equityData = sortedTrades.map(trade => {
      cumulative += trade.resultEuro;
      return {
        date: trade.date,
        equity: cumulative
      };
    });

    // Asset performance
    const assetPerformance = trades.reduce((acc, trade) => {
      acc[trade.asset] = (acc[trade.asset] || 0) + trade.resultEuro;
      return acc;
    }, {});

    const assetData = Object.entries(assetPerformance).map(([asset, pnl]) => ({
      asset,
      pnl
    }));

    return {
      totalTrades,
      winRate,
      totalPnL,
      avgPnL,
      equityData,
      assetData
    };
  }, [journalEntries]);

  // Position size calculator
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
        setCalculatorResult(null);
        return;
      }
      const pipDecimal = currencyPair === 'custom' ? 0.0001 : currencyPairs[currencyPair].pipDecimal;
      pips = Math.abs(entry - sl) / pipDecimal;
    }

    if (!capital || !riskPercentage || !pips || capital <= 0 || riskPercentage <= 0 || pips <= 0) {
      showToast('Please fill all required fields with valid positive numbers', 'error');
      setCalculatorResult(null);
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

  // Journal management
  const addJournalEntry = (isDraft = false) => {
    const { date, asset, customAsset, tradeType, setup, entryPrice, stopLoss, takeProfit, rrr, positionSize, resultEuro, resultPercentage, comment } = journalForm;
    
    const finalAsset = asset === 'other' ? customAsset.toUpperCase() : asset;
    
    if (!date || !finalAsset || !entryPrice || !stopLoss || !takeProfit || !positionSize) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const entry = {
      date,
      asset: finalAsset,
      tradeType,
      setup,
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
    setEditingIndex(-1);
  };

  const editEntry = (index) => {
    const entry = journalEntries[index];
    setJournalForm({
      date: entry.date,
      asset: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD', 'EURJPY', 'GBPJPY', 'XAUUSD', 'DAX40', 'SP500', 'NASDAQ100', 'CAC40'].includes(entry.asset) ? entry.asset : 'other',
      customAsset: !['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD', 'EURJPY', 'GBPJPY', 'XAUUSD', 'DAX40', 'SP500', 'NASDAQ100', 'CAC40'].includes(entry.asset) ? entry.asset : '',
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
    if (window.confirm('Are you sure you want to delete this entry?')) {
      const updatedEntries = journalEntries.filter((_, i) => i !== index);
      setJournalEntries(updatedEntries);
      showToast('Trade deleted', 'success');
    }
  };

  // --- NOUVELLES FONCTIONS POUR LA SAUVEGARDE ET LE CHARGEMENT CLOUD ---
  const handleSaveToCloud = async () => {
    try {
      showToast('Saving to Google Drive...', 'info');
      const response = await fetch(`${BACKEND_URL}/api/save-journal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ journalData: journalEntries }),
      });
  
      if (response.ok) {
        showToast('Journal saved to Google Drive!', 'success');
      } else {
        const errorData = await response.json();
        showToast(`Failed to save: ${errorData.message || response.statusText}`, 'error');
      }
    } catch (error) {
      showToast('Network error. Failed to connect to server.', 'error');
    }
  };
  
  const handleLoadFromCloud = async () => {
    try {
      showToast('Loading from Google Drive...', 'info');
      const response = await fetch(`${BACKEND_URL}/api/load-journal`);
  
      if (response.ok) {
        const data = await response.json();
        setJournalEntries(data);
        showToast('Journal loaded successfully!', 'success');
      } else {
        const errorData = await response.json();
        showToast(`Failed to load: ${errorData.message || response.statusText}`, 'error');
      }
    } catch (error) {
      showToast('Network error. Failed to connect to server.', 'error');
    }
  };

  const handleSignOut = () => {
    // A more complete sign-out would also clear the token on the backend
    setIsDriveConnected(false);
    setUserName(null);
    showToast('Signed out from Google Drive.', 'info');
  };

  // Filtered and sorted entries
  const filteredEntries = useMemo(() => {
    // Affiche toutes les entrées (y compris les brouillons) pour permettre l'édition
    let filtered = [...journalEntries];

    if (filters.asset) {
      filtered = filtered.filter(e => e.asset === filters.asset);
    }
    if (filters.tradeType) {
      filtered = filtered.filter(e => e.tradeType === filters.tradeType);
    }

    return filtered.sort((a, b) => {
      let valA = a[filters.sortBy];
      let valB = b[filters.sortBy];
      
      if (filters.sortBy === 'timestamp' || filters.sortBy === 'date') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      
      return filters.sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }, [journalEntries, filters]);

  // Goal progress
  const goalProgress = useMemo(() => {
    const progress = (analytics.totalPnL / performanceGoal.targetPnLEuro) * 100;
    return Math.min(100, Math.max(0, progress));
  }, [analytics.totalPnL, performanceGoal.targetPnLEuro]);

  // Trading sessions status
  const getTradingSessionStatus = () => {
    const now = new Date();
    const utcHour = now.getUTCHours();
    
    const sessions = [
      { name: 'London', start: 8, end: 16 },
      { name: 'New York', start: 13, end: 21 },
      { name: 'Tokyo', start: 0, end: 9 },
      { name: 'Sydney', start: 22, end: 7 }
    ];

    return sessions.map(session => {
      let isOpen = false;
      if (session.start < session.end) {
        isOpen = utcHour >= session.start && utcHour < session.end;
      } else {
        isOpen = utcHour >= session.start || utcHour < session.end;
      }
      
      return { ...session, isOpen };
    });
  };

  // Component renderers
  const renderSidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Faynalytics
          </h2>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="space-y-2">
          {navigationItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  currentSection === item.id
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );

  const renderHeader = () => (
    <header className="sticky top-4 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200/20 dark:border-gray-700/20 rounded-2xl p-4 mb-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Faynalytics
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage your risk and track your performance</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        
        <button className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
        </button>
        
        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
          <User size={16} className="text-white" />
        </div>
        {userName && (
            <span className="text-gray-700 dark:text-gray-300">
                Bonjour, {userName}!
            </span>
        )}
      </div>
    </header>
  );

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Cloud Sync Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Cloud className="text-purple-600" size={24} />
          Cloud Sync
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Connect to Google Drive to sync your data across devices</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {!isDriveConnected ? (
            <a href={`${BACKEND_URL}/google/auth`} className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Cloud size={16} />
              Connect to Google Drive
            </a>
          ) : (
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors" onClick={handleSaveToCloud}>
              <CloudUpload size={16} />
              Save to Drive
            </button>
          )}

          {isDriveConnected && (
            <>
              <button className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors" onClick={handleLoadFromCloud}>
                <CloudDownload size={16} />
                Load from Drive
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors" onClick={handleSignOut}>
                <LogOut size={16} />
                Sign Out
              </button>
            </>
          )}
        </div>
        <p className={`text-center text-sm mt-4 ${isDriveConnected ? 'text-green-500' : 'text-red-500'}`}>
          {isDriveConnected ? 'Connected to Google Drive.' : 'Not connected to Google Drive.'}
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 border-l-4 border-l-purple-600 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Trades</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.totalTrades}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 border-l-4 border-l-purple-600 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-600 dark:text-gray-400">Win Rate</p>
          <p className={`text-3xl font-bold ${analytics.winRate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercentage(analytics.winRate)}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 border-l-4 border-l-purple-600 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total P&L</p>
          <p className={`text-3xl font-bold ${analytics.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(analytics.totalPnL)}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 border-l-4 border-l-purple-600 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-600 dark:text-gray-400">Avg P&L</p>
          <p className={`text-3xl font-bold ${analytics.avgPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(analytics.avgPnL)}
          </p>
        </div>
      </div>

      {/* Performance Goal */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Target className="text-purple-600" size={24} />
          Performance Goal
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Initial Capital (€)
            </label>
            <input
              type="number"
              value={performanceGoal.initialCapital}
              onChange={(e) => setPerformanceGoal(prev => ({ ...prev, initialCapital: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target P&L (€)
            </label>
            <input
              type="number"
              value={performanceGoal.targetPnLEuro}
              onChange={(e) => setPerformanceGoal(prev => ({ ...prev, targetPnLEuro: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => showToast('Performance goal updated!', 'success')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Target size={16} />
              Set Goal
            </button>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
            <span className="text-sm font-bold text-purple-600">{formatPercentage(goalProgress)}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderCalculator = () => {
    const result = calculatorResult;
    
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calculator className="text-purple-600" size={28} />
          Position Size Calculator
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Account Capital (€)
            </label>
            <input
              type="number"
              value={calculatorData.capital}
              onChange={(e) => setCalculatorData(prev => ({ ...prev, capital: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Risk Percentage per Trade (%)
            </label>
            <input
              type="number"
              value={calculatorData.riskPercentage}
              onChange={(e) => setCalculatorData(prev => ({ ...prev, riskPercentage: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              min="0.1"
              max="10"
              step="0.1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Currency Pair / Asset
            </label>
            <select
              value={calculatorData.currencyPair}
              onChange={(e) => setCalculatorData(prev => ({ ...prev, currencyPair: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {Object.entries(currencyPairs).map(([key, pair]) => (
                <option key={key} value={key}>{pair.name}</option>
              ))}
              <option value="custom">Other (enter pip value)</option>
            </select>
          </div>
          
          {calculatorData.stopLossMethod === 'pips_direct' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stop Loss (in Pips)
              </label>
              <input
                type="number"
                value={calculatorData.stopLossPips}
                onChange={(e) => setCalculatorData(prev => ({ ...prev, stopLossPips: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                min="1"
                step="any"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Entry Price
                </label>
                <input
                  type="number"
                  value={calculatorData.entryPrice}
                  onChange={(e) => setCalculatorData(prev => ({ ...prev, entryPrice: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  step="any"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stop Loss Price
                </label>
                <input
                  type="number"
                  value={calculatorData.stopLossPrice}
                  onChange={(e) => setCalculatorData(prev => ({ ...prev, stopLossPrice: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  step="any"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trade Type
                </label>
                <select
                  value={calculatorData.tradeType}
                  onChange={(e) => setCalculatorData(prev => ({ ...prev, tradeType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>
            </>
          )}
        </div>
        
        <button
          onClick={calculatePosition}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium mb-6"
        >
          <Calculator size={20} />
          Calculate Position Size
        </button>
        
        {calculatorResult && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700 p-6">
            <h4 className="font-semibold mb-4 text-blue-800 dark:text-blue-200">Calculation Results</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Position Size</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{calculatorResult.lotSize}</p>
                <p className="text-sm text-gray-500">lots</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pip Value</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">€{calculatorResult.pipValue}</p>
                <p className="text-sm text-gray-500">per pip</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Amount Risked</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">€{calculatorResult.amountRisked}</p>
                <p className="text-sm text-gray-500">total risk</p>
              </div>
            </div>
            {calculatorData.stopLossMethod === 'price_based' && (
              <div className="text-center mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">Calculated Pips</p>
                <p className="text-xl font-semibold">{calculatorResult.calculatedPips}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderJournal = () => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <BookOpen className="text-purple-600" size={28} />
        Trading Journal
      </h2>
      
      {/* Journal Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
          <input
            type="date"
            value={journalForm.date}
            onChange={(e) => setJournalForm(prev => ({ ...prev, date: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Asset</label>
          <select
            value={journalForm.asset}
            onChange={(e) => setJournalForm(prev => ({ ...prev, asset: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="EURUSD">EUR/USD</option>
            <option value="GBPUSD">GBP/USD</option>
            <option value="USDJPY">USD/JPY</option>
            <option value="AUDUSD">AUD/USD</option>
            <option value="USDCAD">USD/CAD</option>
            <option value="USDCHF">USD/CHF</option>
            <option value="NZDUSD">NZD/USD</option>
            <option value="EURJPY">EUR/JPY</option>
            <option value="GBPJPY">GBP/JPY</option>
            <option value="XAUUSD">Gold (XAU/USD)</option>
            <option value="DAX40">DAX 40</option>
            <option value="SP500">S&P 500</option>
            <option value="NASDAQ100">NASDAQ 100</option>
            <option value="CAC40">CAC 40</option>
            <option value="other">Other (enter name)</option>
          </select>
          {journalForm.asset === 'other' && (
            <input
              type="text"
              value={journalForm.customAsset}
              onChange={(e) => setJournalForm(prev => ({ ...prev, customAsset: e.target.value }))}
              className="w-full px-3 py-2 mt-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter asset name"
            />
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trade Type</label>
          <select
            value={journalForm.tradeType}
            onChange={(e) => setJournalForm(prev => ({ ...prev, tradeType: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="Buy">Buy (Long)</option>
            <option value="Sell">Sell (Short)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Setup</label>
          <input
            type="text"
            value={journalForm.setup}
            onChange={(e) => setJournalForm(prev => ({ ...prev, setup: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Ex: Resistance breakout, MA rejection"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Entry Price</label>
          <input
            type="number"
            value={journalForm.entryPrice}
            onChange={(e) => setJournalForm(prev => ({ ...prev, entryPrice: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            step="any"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stop Loss</label>
          <input
            type="number"
            value={journalForm.stopLoss}
            onChange={(e) => setJournalForm(prev => ({ ...prev, stopLoss: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            step="any"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Take Profit</label>
          <input
            type="number"
            value={journalForm.takeProfit}
            onChange={(e) => setJournalForm(prev => ({ ...prev, takeProfit: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            step="any"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">RRR (Ex: 1:2)</label>
          <input
            type="text"
            value={journalForm.rrr}
            onChange={(e) => setJournalForm(prev => ({ ...prev, rrr: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Ex: 1:2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Position Size</label>
          <input
            type="number"
            value={journalForm.positionSize}
            onChange={(e) => setJournalForm(prev => ({ ...prev, positionSize: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            step="any"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Result (€)</label>
          <input
            type="number"
            value={journalForm.resultEuro}
            onChange={(e) => setJournalForm(prev => ({ ...prev, resultEuro: parseFloat(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            step="any"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Result (%)</label>
          <input
            type="number"
            value={journalForm.resultPercentage}
            onChange={(e) => setJournalForm(prev => ({ ...prev, resultPercentage: parseFloat(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            step="any"
          />
        </div>
        
        <div className="lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Comment / Emotion</label>
          <textarea
            value={journalForm.comment}
            onChange={(e) => setJournalForm(prev => ({ ...prev, comment: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 h-20 resize-none"
            placeholder="Notes on the trade, felt emotions..."
          />
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <button
          onClick={() => addJournalEntry(false)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          <Plus size={16} />
          {editingIndex !== -1 ? 'Update Entry' : 'Add to Journal'}
        </button>
        <button
          onClick={() => addJournalEntry(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Save size={16} />
          Save Draft
        </button>
        {editingIndex !== -1 && (
          <button
            onClick={resetJournalForm}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            <X size={16} />
            Cancel Edit
          </button>
        )}
      </div>
      
      {/* Filters */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-6">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Filter className="text-purple-600" size={20} />
          Filter & Sort Options
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Asset</label>
            <select
              value={filters.asset}
              onChange={(e) => setFilters(prev => ({ ...prev, asset: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">All</option>
              {Object.entries(currencyPairs).map(([key, pair]) => (
                <option key={key} value={key}>{pair.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Trade Type</label>
            <select
              value={filters.tradeType}
              onChange={(e) => setFilters(prev => ({ ...prev, tradeType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">All</option>
              <option value="Buy">Buy</option>
              <option value="Sell">Sell</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort by</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="timestamp">Date</option>
              <option value="resultEuro">Result (€)</option>
              <option value="resultPercentage">Result (%)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Order</label>
            <select
              value={filters.sortOrder}
              onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={() => setFilters({ asset: '', tradeType: '', sortBy: 'timestamp', sortOrder: 'desc' })}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium mt-4"
        >
          <RotateCcw size={16} />
          Reset Filters
        </button>
      </div>
      
      {/* Journal Entries */}
      <div>
        <h4 className="font-semibold text-xl mb-4">Journal Entries</h4>
        {filteredEntries.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400 p-8">No journal entries yet. Add your first trade!</p>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry, index) => {
              const actualIndex = journalEntries.indexOf(entry);
              return (
                <div
                  key={actualIndex}
                  className={`bg-white dark:bg-gray-800 rounded-xl border-l-4 p-6 shadow-sm hover:shadow-md transition-shadow ${
                    entry.resultEuro >= 0 ? 'border-l-green-500' : 'border-l-red-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h5 className="font-semibold text-xl">{entry.asset} 
                        <span className="text-sm font-normal text-gray-500 ml-2">({entry.tradeType})</span>
                      </h5>
                      <p className="text-sm text-gray-500">{entry.date}</p>
                    </div>
                    <p className={`font-bold text-2xl ${entry.resultEuro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(entry.resultEuro)}
                    </p>
                  </div>
                  
                  {entry.setup && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <span className="font-medium">Setup:</span> {entry.setup}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-sm text-gray-700 dark:text-gray-300 mb-4">
                    <div><span className="font-medium">Entry:</span> {entry.entryPrice}</div>
                    <div><span className="font-medium">SL:</span> {entry.stopLoss}</div>
                    <div><span className="font-medium">TP:</span> {entry.takeProfit}</div>
                    <div><span className="font-medium">RRR:</span> {entry.rrr || 'N/A'}</div>
                    <div><span className="font-medium">Size:</span> {entry.positionSize} lots</div>
                  </div>
                  
                  {entry.comment && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="font-medium">Notes:</span> {entry.comment}
                    </p>
                  )}
                  
                  {entry.is_draft && (
                    <p className="text-xs font-semibold text-blue-500 mb-2">
                        This is a saved draft.
                    </p>
                  )}

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => editEntry(actualIndex)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteEntry(actualIndex)}
                      className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-8">
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="text-purple-600" size={24} />
            Equity Curve
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.equityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="equity" 
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fill="#8B5CF6"
                  fillOpacity={0.1}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="text-purple-600" size={24} />
            Asset Performance
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.assetData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="asset" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="pnl" 
                  fill={(entry) => entry.pnl >= 0 ? '#10B981' : '#EF4444'}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Detailed Statistics */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <BarChart3 className="text-purple-600" size={24} />
          Detailed Statistics
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="font-medium mb-4 text-lg">Performance by Asset</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Asset</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Trades</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Win Rate</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">P&L (€)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(journalEntries.filter(e => !e.is_draft).reduce((acc, entry) => {
                    if (!acc[entry.asset]) {
                      acc[entry.asset] = { totalTrades: 0, wins: 0, pnl: 0 };
                    }
                    acc[entry.asset].totalTrades++;
                    if (entry.resultEuro > 0) acc[entry.asset].wins++;
                    acc[entry.asset].pnl += entry.resultEuro;
                    return acc;
                  }, {})).map(([asset, stats]) => (
                    <tr key={asset} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 font-medium">{asset}</td>
                      <td className="py-3 px-4">{stats.totalTrades}</td>
                      <td className="py-3 px-4">{formatPercentage((stats.wins / stats.totalTrades) * 100)}</td>
                      <td className={`py-3 px-4 font-semibold ${stats.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(stats.pnl)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-4 text-lg">Performance by Trade Type</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Trades</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Win Rate</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">P&L (€)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(journalEntries.filter(e => !e.is_draft).reduce((acc, entry) => {
                    if (!acc[entry.tradeType]) {
                      acc[entry.tradeType] = { totalTrades: 0, wins: 0, pnl: 0 };
                    }
                    acc[entry.tradeType].totalTrades++;
                    if (entry.resultEuro > 0) acc[entry.tradeType].wins++;
                    acc[entry.tradeType].pnl += entry.resultEuro;
                    return acc;
                  }, {})).map(([type, stats]) => (
                    <tr key={type} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 font-medium">{type}</td>
                      <td className="py-3 px-4">{stats.totalTrades}</td>
                      <td className="py-3 px-4">{formatPercentage((stats.wins / stats.totalTrades) * 100)}</td>
                      <td className={`py-3 px-4 font-semibold ${stats.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(stats.pnl)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSessions = () => {
    const sessions = getTradingSessionStatus();
    
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Clock className="text-purple-600" size={28} />
          Trading Sessions Status (UTC)
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {sessions.map(session => (
            <div key={session.name} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-center shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div 
                  className={`w-3 h-3 rounded-full ${session.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
                />
                <span className="font-medium text-gray-900 dark:text-white">{session.name}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {session.start.toString().padStart(2, '0')}:00 - {session.end.toString().padStart(2, '0')}:00
              </p>
              <p className="text-xs mt-1 font-medium">
                {session.isOpen ? (
                  <span className="text-green-600">OPEN</span>
                ) : (
                  <span className="text-red-600">CLOSED</span>
                )}
              </p>
            </div>
          ))}
        </div>
        
        {/* Session Timeline Visualization */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4">24-Hour Session Timeline</h3>
          <div className="relative h-12 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            {sessions.map((session, index) => {
              const colors = ['#7C3AED', '#8B5CF6', '#3B82F6', '#2563EB'];
              const sessionBars = [];
              
              if (session.start < session.end) {
                // Normal session (doesn't cross midnight)
                sessionBars.push({
                  left: (session.start / 24) * 100,
                  width: ((session.end - session.start) / 24) * 100,
                  color: colors[index]
                });
              } else {
                // Session crosses midnight
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
                  className="absolute h-full flex items-center justify-center text-white text-xs font-medium"
                  style={{
                    left: `${bar.left}%`,
                    width: `${bar.width}%`,
                    backgroundColor: bar.color
                  }}
                >
                  {barIndex === 0 && bar.width > 8 && session.name}
                </div>
              ));
            })}
            
            {/* Current time indicator */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
              style={{
                left: `${(new Date().getUTCHours() + new Date().getUTCMinutes() / 60) / 24 * 100}%`
              }}
            >
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full"></div>
            </div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-2">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>24:00</span>
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Settings className="text-purple-600" size={28} />
        Settings
      </h2>
      
      <div className="space-y-8">
        {/* Appearance */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Appearance</h3>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
              <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
            </div>
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                theme === 'dark' ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
        
        {/* Data Management */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Data Management</h3>
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
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Download size={16} />
              Export Journal Data
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
                          throw new Error('Invalid file format.');
                        }
                      } catch (err) {
                        showToast('Failed to import data. Invalid file.', 'error');
                      }
                    };
                    reader.readAsText(file);
                  }
                };
                fileInput.click();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
            >
              <Upload size={16} />
              Import Journal Data
            </button>
            
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                  setJournalEntries([]);
                  showToast('All data has been cleared.', 'success');
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <Trash2 size={16} />
              Clear All Data
            </button>
          </div>
        </div>
        
        {/* Notifications */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Notifications</h3>
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" className="mr-3 h-4 w-4 text-purple-600 rounded focus:ring-purple-500" />
              <span className="text-gray-700 dark:text-gray-300">Goal achievement notifications</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" className="mr-3 h-4 w-4 text-purple-600 rounded focus:ring-purple-500" />
              <span className="text-gray-700 dark:text-gray-300">Market session notifications</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" className="mr-3 h-4 w-4 text-purple-600 rounded focus:ring-purple-500" />
              <span className="text-gray-700 dark:text-gray-300">Trade reminder notifications</span>
            </label>
          </div>
        </div>
        
        {/* About */}
        <div>
          <h3 className="text-lg font-semibold mb-4">About</h3>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <TrendingUp size={24} className="text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Faynalytics</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Professional Trading Journal</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Version 2.0.0 - Built with React and modern web technologies for professional traders.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-full">React</span>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">Tailwind CSS</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">Recharts</span>
              <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">Lucide Icons</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Section renderer
  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return renderDashboard();
      case 'calculator':
        return renderCalculator();
      case 'journal':
        return renderJournal();
      case 'analytics':
        return renderAnalytics();
      case 'sessions':
        return renderSessions();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    // CORRECTION : Supprime la classe conditionnelle 'dark' pour éviter les conflits
    <div className="min-h-screen transition-colors duration-300">
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
        {/* Sidebar */}
        {renderSidebar()}
        
        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Main Content */}
        <div className="lg:pl-80">
          <div className="p-4 lg:p-8">
            {renderHeader()}
            {renderCurrentSection()}
          </div>
        </div>
        
        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={closeToast}
          />
        )}
      </div>
    </div>
  );
};

export default FaynalyticsApp;