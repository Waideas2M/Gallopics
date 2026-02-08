import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'danger';

interface PgToastProps {
    type: ToastType;
    message: string;
    onUndo?: () => void;
    style?: React.CSSProperties;
    className?: string;
}

export const PgToast: React.FC<PgToastProps> = ({ type, message, onUndo, style, className }) => {
    // Styles mapping
    const variants = {
        success: { bg: '#fff', border: '#bbf7d0', accent: '#22c55e', text: '#111', icon: <CheckCircle size={18} /> },
        info: { bg: '#fff', border: '#bfdbfe', accent: '#3b82f6', text: '#111', icon: <AlertCircle size={18} /> },
        danger: { bg: '#fff', border: '#fecaca', accent: '#ef4444', text: '#111', icon: <AlertCircle size={18} /> }
    };
    const v = variants[type];

    return (
        <div style={{
            position: 'absolute',
            display: 'flex', alignItems: 'center', gap: 12,
            background: v.bg, border: `1px solid ${v.border}`, borderRadius: '99px',
            padding: '10px 20px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 9000,
            overflow: 'hidden',
            minWidth: 320, maxWidth: 460,
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            ...style
        }} className={className}>
            {/* Accent Stripe */}
            <div style={{ width: 4, height: 20, borderRadius: 2, background: v.accent, flexShrink: 0 }} />

            {/* Icon */}
            <div style={{ color: v.accent, display: 'flex', alignItems: 'center' }}>
                {v.icon}
            </div>

            {/* Message */}
            <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#111', flex: 1 }}>{message}</span>

            {/* Undo */}
            {onUndo && (
                <button
                    onClick={onUndo}
                    style={{
                        background: 'none', border: 'none', borderLeft: '1px solid #e5e7eb',
                        paddingLeft: 12, marginLeft: 0, color: '#666', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer',
                        whiteSpace: 'nowrap'
                    }}
                >
                    Undo
                </button>
            )}
            <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
        </div>
    );
};
