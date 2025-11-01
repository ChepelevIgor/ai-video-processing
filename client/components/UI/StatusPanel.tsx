import React from 'react';

interface StatusPanelProps {
    status: string | null;
    type?: 'loading' | 'success' | 'error' | 'info';
}

export default function StatusPanel({ status, type = 'info' }: StatusPanelProps) {
    if (!status) return null;

    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-700';
    let icon = 'ℹ️';
    let animate = '';

    switch (type) {
        case 'loading':
            bgColor = 'bg-yellow-100';
            textColor = 'text-yellow-800';
            icon = '⏳';
            animate = 'animate-pulse';
            break;
        case 'success':
            bgColor = 'bg-green-100';
            textColor = 'text-green-800';
            icon = '✅';
            break;
        case 'error':
            bgColor = 'bg-red-100';
            textColor = 'text-red-800';
            icon = '❌';
            break;
        case 'info':
            bgColor = 'bg-gray-100';
            textColor = 'text-gray-700';
            icon = 'ℹ️';
            break;
    }

    return (
        <div
            className={`w-full rounded-lg px-4 py-2 flex items-center gap-2 shadow-sm ${bgColor} ${textColor} ${animate}`}
        >
            <span className="text-lg">{icon}</span>
            <span className="flex-1">{status}</span>
        </div>
    );
}
