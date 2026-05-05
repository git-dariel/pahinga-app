import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from '@renderer/lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary/90 border-transparent',
  secondary: 'bg-surface text-foreground border-border hover:bg-background',
  ghost: 'bg-transparent text-muted border-transparent hover:bg-background hover:text-foreground',
  danger: 'bg-danger text-white hover:bg-danger/90 border-transparent'
}

export function Button({
  variant = 'primary',
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<'button'> & {
  variant?: ButtonVariant
}): React.JSX.Element {
  return (
    <button
      {...props}
      className={cn(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        buttonVariants[variant],
        className
      )}
    >
      {children}
    </button>
  )
}

export function Card({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<'div'>): React.JSX.Element {
  return (
    <div
      {...props}
      className={cn('rounded-xl border border-border bg-surface shadow-sm', className)}
    >
      {children}
    </div>
  )
}

export function Input({
  className,
  ...props
}: ComponentPropsWithoutRef<'input'>): React.JSX.Element {
  return (
    <input
      {...props}
      className={cn(
        'min-h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
    />
  )
}

export function Select({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<'select'>): React.JSX.Element {
  return (
    <select
      {...props}
      className={cn(
        'min-h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
    >
      {children}
    </select>
  )
}

export function Toggle({
  pressed,
  onPressedChange,
  label,
  disabled = false
}: {
  pressed: boolean
  onPressedChange: (next: boolean) => void
  label: string
  disabled?: boolean
}): React.JSX.Element {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={pressed}
      aria-label={label}
      disabled={disabled}
      onClick={() => onPressedChange(!pressed)}
      className={cn(
        'relative h-6 w-10 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50',
        pressed ? 'bg-primary' : 'bg-border'
      )}
    >
      <span
        className={cn(
          'absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all',
          pressed ? 'right-1' : 'left-1'
        )}
      />
    </button>
  )
}

export function LoadingState({
  title = 'Loading',
  rows = 3
}: {
  title?: string
  rows?: number
}): React.JSX.Element {
  return (
    <div className="space-y-3" role="status" aria-label={title}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 rounded-lg bg-border/80 animate-pulse" />
      ))}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  className
}: {
  icon?: ReactNode
  title: string
  description: string
  className?: string
}): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-xl border border-dashed border-border bg-surface px-6 py-8 text-center',
        className
      )}
    >
      {icon ? <div className="mb-3 text-muted">{icon}</div> : null}
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
    </div>
  )
}

export function Modal({
  title,
  children,
  className
}: {
  title: string
  children: ReactNode
  className?: string
}): React.JSX.Element {
  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-xl',
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function PageShell({
  title,
  description,
  action,
  children,
  className
}: {
  title: string
  description: string
  action?: ReactNode
  children: ReactNode
  className?: string
}): React.JSX.Element {
  return (
    <div className={cn('p-6 sm:p-8', className)}>
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
        {action}
      </header>
      {children}
    </div>
  )
}
