import { useEffect } from 'react';

function Toast({ message, type = 'success', onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const styles = {
        success: {
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            icon: '✓',
        },
        error: {
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            icon: '✕',
        },
        info: {
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            color: '#1e40af',
            icon: 'ℹ',
        },
    };

    const s = styles[type] || styles.success;

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '8px',
            background: s.background,
            border: s.border,
            color: s.color,
            fontSize: '13px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            animation: 'slideIn 0.2s ease',
            maxWidth: '360px',
        }}>
            <span style={{ fontWeight: '700', fontSize: '15px' }}>{s.icon}</span>
            <span style={{ flex: 1 }}>{message}</span>
            <button
                onClick={onClose}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: s.color,
                    opacity: 0.6,
                    fontSize: '16px',
                    padding: '0 0 0 8px',
                }}
            >
                ×
            </button>
            <style>{`
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
        </div>
    );
}

export default Toast;