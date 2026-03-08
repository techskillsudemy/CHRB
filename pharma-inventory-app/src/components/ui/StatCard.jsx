// src/components/ui/StatCard.jsx
export default function StatCard({ label, value, icon, monetary = false, trend, accentColor, className = '' }) {
  return (
    <div className={`stat-card ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-[0.68rem] font-semibold text-muted uppercase tracking-widest">{label}</p>
        {icon && (
          <span
            className="w-9 h-9 rounded-2xl flex items-center justify-center text-base flex-shrink-0"
            style={{
              background: accentColor
                ? `rgba(${accentColor},0.10)`
                : monetary
                ? 'rgba(245,201,106,0.15)'
                : 'linear-gradient(135deg, rgba(142,143,247,0.12), rgba(168,199,255,0.12))',
            }}
          >
            {icon}
          </span>
        )}
      </div>
      <div className={`font-display text-[1.65rem] font-bold leading-none mt-1 ${
        monetary ? 'text-gold-shimmer' : ''
      }`} style={{ fontFamily: 'var(--font-display)', color: monetary ? undefined : '#2D2F45' }}>
        {monetary && typeof value === 'number'
          ? value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' $'
          : value}
      </div>
      {trend !== undefined && (
        <div className={`mt-2 text-xs font-mono ${
          trend > 0 ? 'text-success' : trend < 0 ? 'text-danger' : 'text-muted'
        }`}>
          {trend > 0 ? '▲' : trend < 0 ? '▼' : '—'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}
