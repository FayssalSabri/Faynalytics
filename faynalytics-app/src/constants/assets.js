export const currencyPairs = {
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

export const assetOptions = [
    ...Object.keys(currencyPairs),
    'other'
];
