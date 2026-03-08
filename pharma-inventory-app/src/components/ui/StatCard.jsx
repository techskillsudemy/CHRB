// src/components/ui/StatCard.jsx
export default function StatCard({ label, value, icon, monetary = false, trend, className = '' }) {
  return (
    <div
      className={`glass-card p-5 relative overflow-hidden group border-t-2 border-t-accent ${
        monetary ? 'hover:glow-gold' : 'hover:glow-accent'
      } ${className}`}
    >
      {/* Subtle glow blob */}
      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-accent/5 blur-2xl group-hover:bg-accent/10 transition-all duration-500" />

      <div className="flex items-start justify-between mb-4">
        <span className="text-xs font-semibold text-muted uppercase tracking-widest leading-tight">{label}</span>
        {icon && (
          <span className="text-xl opacity-70 group-hover:opacity-100 transition-opacity">{icon}</span>
        )}
      </div>

      <div className={`font-semibold leading-none ${
        monetary
          ? 'text-gold-shimmer font-mono text-2xl'
          : 'text-ink text-2xl'
      }`}>
        {monetary && typeof value === 'number'
          ? value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' $'
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
