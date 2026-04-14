import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'danger'
    fullWidth?: boolean
  }
>

const variantMap = {
  primary:
    'bg-neon-green/90 text-slate-950 shadow-neonGreen hover:bg-neon-green active:scale-[0.98]',
  secondary:
    'bg-white/10 text-white border border-white/20 hover:bg-white/20 active:scale-[0.98]',
  danger:
    'bg-neon-red/90 text-white shadow-neonRed hover:bg-neon-red active:scale-[0.98]',
}

export function Button({
  children,
  className = '',
  variant = 'primary',
  fullWidth = false,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'rounded-2xl px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-yellow/90',
        fullWidth ? 'w-full' : '',
        variantMap[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
