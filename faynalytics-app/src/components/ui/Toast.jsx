import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

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

    const Icon = icons[type] || Info;

    return (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border-l-4 ${colors[type] || colors.info} shadow-lg animate-in slide-in-from-right duration-300`}>
            <div className="flex items-center gap-2">
                <Icon size={20} />
                <span className="text-sm font-medium">{message}</span>
                <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default Toast;
