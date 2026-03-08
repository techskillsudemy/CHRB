// src/components/ui/Button.jsx
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:
      'bg-accent text-bg font-semibold hover:bg-accent/90 active:scale-[0.97] shadow-[0_0_0_0_rgba(45,212,191,0)] hover:shadow-[0_0_18px_rgba(45,212,191,0.35)]',
    secondary:
      'bg-surface2 text-ink border border-border hover:border-accent/30 hover:bg-surface hover:text-accent active:scale-[0.97]',
    danger:
      'bg-danger/15 text-danger border border-danger/25 hover:bg-danger/25 hover:shadow-[0_0_14px_rgba(251,113,133,0.25)] active:scale-[0.97]',
    ghost:
      'text-muted hover:text-ink hover:bg-surface2 active:scale-[0.97]',
    gold:
      'bg-gold/15 text-gold border border-gold/25 hover:bg-gold/25 hover:shadow-[0_0_14px_rgba(201,168,76,0.25)] active:scale-[0.97]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
