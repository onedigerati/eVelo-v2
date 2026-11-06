import { motion } from 'framer-motion'
import { useId, type ReactNode } from 'react'
import { springBouncy } from '../motion'
import { cx } from './cx'

export interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  label: ReactNode
  description?: ReactNode
  disabled?: boolean
  className?: string
}

export function Toggle({ checked, onChange, label, description, disabled, className }: ToggleProps) {
  const uid = useId()
  return (
    <div className={cx('toggle', disabled && 'is-disabled', className)}>
      <span className="toggle__text">
        <span className="field__label" id={`${uid}-l`}>
          {label}
        </span>
        {description && (
          <span className="field__hint" id={`${uid}-d`}>
            {description}
          </span>
        )}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${uid}-l`}
        aria-describedby={description ? `${uid}-d` : undefined}
        disabled={disabled}
        className={cx('toggle__switch', checked && 'is-on')}
        onClick={() => onChange(!checked)}
      >
        <motion.span
          className="toggle__thumb"
          initial={false}
          animate={{ x: checked ? 20 : 0 }}
          whileTap={{ scaleX: 1.18 }}
          transition={springBouncy}
        />
      </button>
    </div>
  )
}
