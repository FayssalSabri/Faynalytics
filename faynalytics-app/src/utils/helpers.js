export const formatCurrency = (amount) => {
    const isNegative = Number(amount) < 0;
    return `${isNegative ? '-' : ''}€${Math.abs(Number(amount)).toFixed(2)}`;
};
export const formatPercentage = (value) => `${Number(value).toFixed(2)}%`;

export const getTradingSessionStatus = () => {
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
