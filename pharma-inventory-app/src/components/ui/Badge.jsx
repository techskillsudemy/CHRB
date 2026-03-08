// src/components/ui/Badge.jsx
export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-surface2 text-muted',
    success: 'bg-success/20 text-success',
    danger: 'bg-danger/20 text-danger',
    warn: 'bg-warn/20 text-warn',
    accent: 'bg-accent/20 text-accent',
    gold: 'bg-gold/20 text-gold',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </span>
  );
}
