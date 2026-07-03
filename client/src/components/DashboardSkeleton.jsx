function SkeletonBlock({ height = '16px', width = '100%', className = '' }) {
    return (
        <div
            className={className}
            style={{
                height,
                width,
                background: 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.4s infinite',
                borderRadius: '6px',
            }}
        />
    );
}

function SkeletonCard() {
    return (
        <div style={{
            background: 'white',
            borderRadius: '12px',
            border: '0.5px solid #e5e7eb',
            padding: '20px',
        }}>
            <SkeletonBlock height="14px" width="40%" />
            <div style={{ marginTop: '6px', marginBottom: '16px' }}>
                <SkeletonBlock height="11px" width="60%" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <SkeletonBlock height="13px" width="90%" />
                <SkeletonBlock height="13px" width="75%" />
                <SkeletonBlock height="13px" width="85%" />
                <SkeletonBlock height="13px" width="65%" />
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="p-8">
            <div style={{ marginBottom: '24px' }}>
                <SkeletonBlock height="22px" width="220px" />
                <div style={{ marginTop: '8px' }}>
                    <SkeletonBlock height="14px" width="300px" />
                </div>
            </div>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px',
            }}>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </div>
            <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
        </div>
    );
}

export default DashboardSkeleton;