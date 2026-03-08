// src/components/ui/Badge.jsx
export default function Badge({ children, variant = 'default', className = '' }) {
  const cls = {
    default: 'badge badge-default',
    success: 'badge badge-success',
    danger:  'badge badge-danger',
    warn:    'badge badge-warn',
    accent:  'badge badge-accent',
    gold:    'badge badge-gold',
  };
  return (
    <span className={`${cls[variant] || cls.default} ${className}`}>
      {children}
    </span>
  );
}
