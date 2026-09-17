import { useId, cloneElement, Children } from 'react'

export default function FormField({
  label,
  required,
  hint,
  error,
  children,
  className = '',
}) {
  const id = useId()

  const childrenWithId = children
    ? Children.map(children, (child, i) =>
        i === 0 && child ? cloneElement(child, { id }) : child
      )
    : children

  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label htmlFor={id} className={`form-label${required ? ' required' : ''}`}>
          {label}
        </label>
      )}
      {childrenWithId}
      {hint && !error && <span className="form-hint">{hint}</span>}
      {error && <span className="form-error" role="alert">{error}</span>}
    </div>
  )
}

export function Input({ className = '', ...props }) {
  return <input className={`form-input ${className}`} {...props} />
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={`form-input ${className}`} {...props}>
      {children}
    </select>
  )
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={`form-input ${className}`} {...props} />
}
