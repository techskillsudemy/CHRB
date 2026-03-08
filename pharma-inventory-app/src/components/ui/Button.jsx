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
    'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.97]';

  const variants = {
    primary:
      'text-white',
    secondary:
      'text-ink border border-border hover:border-accent/40 hover:text-accent',
    danger:
      'text-white',
    ghost:
      'text-muted hover:text-ink',
    gold:
      'text-white',
  };

  const bgStyles = {
    primary: {
      background: 'linear-gradient(135deg, #8E8FF7 0%, #7B7CF5 100%)',
      boxShadow: '0 4px 16px rgba(142,143,247,0.25)',
    },
    secondary: {
      background: 'rgba(255,255,255,0.7)',
      backdropFilter: 'blur(8px)',
    },
    danger: {
      background: 'linear-gradient(135deg, #F28B8B 0%, #E66B6B 100%)',
      boxShadow: '0 4px 16px rgba(242,139,139,0.25)',
    },
    ghost: {
      background: 'rgba(142,143,247,0.06)',
    },
    gold: {
      background: 'linear-gradient(135deg, #F5C96A 0%, #E8B845 100%)',
      boxShadow: '0 4px 16px rgba(245,201,106,0.25)',
    },
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2 text-sm gap-2',
    lg: 'px-7 py-3 text-sm gap-2',
  };

  return (
    <button
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      style={bgStyles[variant] || bgStyles.primary}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
