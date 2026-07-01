'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Flags an element visible once it scrolls into view. Immediately visible
 * (no animation) when `prefers-reduced-motion: reduce` is set, or if
 * IntersectionObserver isn't available — content never hides behind JS.
 */
export function useEditableReveal<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -80px 0px', ...options }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [options])

  return { ref, visible }
}
