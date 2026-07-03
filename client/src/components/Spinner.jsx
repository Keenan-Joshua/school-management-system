function Spinner({ message = 'Loading...' }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div style={{
                width: '36px',
                height: '36px',
                border: '3px solid #e5e7eb',
                borderTop: '3px solid #059669',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ fontSize: '13px', color: '#6b7280' }}>{message}</p>
            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}

export default Spinner;