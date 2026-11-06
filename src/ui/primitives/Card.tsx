import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from './cx'

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** 'raised' = translucent panel with hairline + top highlight; 'inset' = recessed well; 'ghost' = border only. */
  variant?: 'raised' | 'inset' | 'ghost'
  eyebrow?: ReactNode
  title?: ReactNode
  /** Right side of the header (buttons, badges). */
  actions?: ReactNode
  /** Small line under the title. */
  subtitle?: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
  as?: 'section' | 'div' | 'article' | 'aside'
  /** Accent edge glow in a tone. */
  tone?: 'holds' | 'bruised' | 'broken'
}

export function Card({
  variant = 'raised',
  eyebrow,
  title,
  subtitle,
  actions,
  padding = 'md',
  as: Tag = 'section',
  tone,
  className,
  children,
  ...rest
}: CardProps) {
  const hasHeader = eyebrow || title || actions
  return (
    <Tag className={cx('card', `card--${variant}`, `card--pad-${padding}`, tone && `card--tone-${tone}`, className)} {...rest}>
      {hasHeader && (
        <header className="card__header">
          <div className="card__heading">
            {eyebrow && <div className="t-eyebrow card__eyebrow">{eyebrow}</div>}
            {title && <h2 className="t-h2 card__title">{title}</h2>}
            {subtitle && <p className="t-small card__subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="card__actions">{actions}</div>}
        </header>
      )}
      {children}
    </Tag>
  )
}

/** Panel: a Card without header chrome; nests inside cards. */
export function Panel({ className, ...rest }: Omit<CardProps, 'eyebrow' | 'title' | 'actions' | 'subtitle'>) {
  return <Card variant="inset" padding="sm" as="div" className={className} {...rest} />
}
