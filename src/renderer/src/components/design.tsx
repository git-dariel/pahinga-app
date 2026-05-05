import type { ReactNode } from 'react'
import { CheckCircle, Droplet, Eye, Layers, User, Hand, Waves, type LucideIcon } from 'lucide-react'
import { cn } from '@renderer/lib/cn'

export function ScreenHeader({
  title,
  description,
  action,
  className
}: {
  title: string
  description: string
  action?: ReactNode
  className?: string
}): React.JSX.Element {
  return (
    <header className={cn('mb-7 flex items-start justify-between gap-6', className)}>
      <div>
        <h1 className="text-[28px] font-bold tracking-[-0.01em] text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      {action}
    </header>
  )
}

export function DesignCard({
  children,
  className
}: {
  children: ReactNode
  className?: string
}): React.JSX.Element {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-surface shadow-[0_1px_2px_rgba(26,43,34,0.08)]',
        className
      )}
    >
      {children}
    </div>
  )
}

export function Pill({
  children,
  className
}: {
  children: ReactNode
  className?: string
}): React.JSX.Element {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted shadow-sm',
        className
      )}
    >
      {children}
    </div>
  )
}

export function RingTimer({
  value,
  subtitle,
  size = 192,
  progress = 0.18,
  className
}: {
  value: string
  subtitle?: string
  size?: number
  progress?: number
  className?: string
}): React.JSX.Element {
  const stroke = 2
  const radius = size / 2 - stroke
  const circumference = 2 * Math.PI * radius
  const dash = circumference * Math.max(0, Math.min(1, progress))

  return (
    <div
      className={cn('relative grid place-items-center', className)}
      style={{ width: size, height: size }}
    >
      <svg className="absolute inset-0 -rotate-90" width={size} height={size} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#ebe6dc"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#3f7656"
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="text-center">
        <p className="text-[54px] font-bold leading-none tracking-[-0.02em] text-foreground tabular-nums">
          {value}
        </p>
        {subtitle ? <p className="mt-2 text-xs text-muted">{subtitle}</p> : null}
      </div>
    </div>
  )
}

export function DesignButton({
  children,
  variant = 'secondary',
  className,
  ...props
}: React.ComponentPropsWithoutRef<'button'> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}): React.JSX.Element {
  return (
    <button
      {...props}
      className={cn(
        'inline-flex h-9 items-center justify-center gap-2 rounded-md border px-4 text-xs font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50',
        variant === 'primary'
          ? 'border-primary bg-primary text-white hover:bg-primary/90'
          : variant === 'ghost'
            ? 'border-transparent bg-transparent text-muted hover:text-foreground'
            : 'border-border bg-surface text-foreground hover:bg-background',
        className
      )}
    >
      {children}
    </button>
  )
}

export function SmallIconBox({
  icon: Icon,
  tone = 'green'
}: {
  icon: LucideIcon
  tone?: 'green' | 'beige' | 'blue'
}): React.JSX.Element {
  return (
    <div
      className={cn(
        'grid h-7 w-7 place-items-center rounded-md',
        tone === 'green' && 'bg-primary-soft text-primary',
        tone === 'beige' && 'bg-[#eee9de] text-[#766f5e]',
        tone === 'blue' && 'bg-[#e1e8e9] text-[#4f6b70]'
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </div>
  )
}

export const stretchIconMap = {
  neck: User,
  shoulder: Layers,
  wrist: Hand,
  eyes: Eye
} as const

export function CompletedPill({ count }: { count: number }): React.JSX.Element | null {
  if (count <= 0) return null
  return (
    <Pill className="text-primary">
      <CheckCircle className="h-3.5 w-3.5" aria-hidden />
      <span>{count}</span>
      <span>completed today</span>
    </Pill>
  )
}

export const statIcons = {
  break: Droplet,
  water: Waves
}
