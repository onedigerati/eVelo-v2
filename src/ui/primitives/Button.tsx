import { m as motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'
import { cx } from './cx'

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md'
  icon?: ReactNode
  children?: ReactNode
}

export function Button({ variant = 'secondary', size = 'md', icon, children, className, type = 'button', ...rest }: ButtonProps) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 700, damping: 30 }}
      className={cx('btn', `btn--${variant}`, `btn--${size}`, !children && 'btn--icon', className)}
      {...rest}
    >
      {icon && <span className="btn__icon">{icon}</span>}
      {children && <span className="btn__label">{children}</span>}
    </motion.button>
  )
}

export function IconButton({ label, children, className, ...rest }: Omit<ButtonProps, 'icon' | 'aria-label'> & { label: string }) {
  return (
    <Button variant="ghost" aria-label={label} title={label} className={cx('icon-btn', className)} {...rest} icon={children} />
  )
}
