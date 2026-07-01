'use client'

import type { ReactNode } from 'react'
import { useEditableReveal } from '@/editable/hooks/useEditableReveal'

/**
 * Client wrapper that fades/slides children into view on scroll, so async
 * server components (archive grids, home sections) can get staggered reveal
 * animation without themselves becoming client components. Content stays
 * visible if JS never runs — CSS default is opacity:1 and the class is only
 * added client-side.
 */
export function EditableReveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const { ref, visible } = useEditableReveal<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className={`editable-reveal ${visible ? 'editable-reveal-in' : ''} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  )
}
