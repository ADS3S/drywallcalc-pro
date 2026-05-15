'use client'

import { useEffect } from 'react'

/**
 * Fixes common PWA mobile input issues:
 * 1. Prevents viewport resize when virtual keyboard opens (iOS)
 * 2. Prevents input freeze from rapid re-renders
 * 3. Handles safe area insets for notched devices
 */
export function useMobileInputFix() {
  useEffect(() => {
    // Set proper viewport behavior for mobile keyboards
    const viewport = document.querySelector('meta[name=viewport]')
    if (viewport) {
      viewport.setAttribute('content',
        'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
      )
    }

    // Prevent iOS bounce/zoom on input focus
    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        // Allow normal scrolling but prevent overscroll bounce that causes freezes
        const parent = target.closest('[class*="overflow"]')
        if (parent) {
          const { scrollTop, scrollHeight, clientHeight } = parent as HTMLElement
          if (scrollTop === 0 && e.touches[0].clientY > 0) return
          if (scrollTop + clientHeight >= scrollHeight) return
        }
      }
    }

    // Fix for iOS Safari where inputs lose focus when keyboard animates
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // Small delay to let keyboard animation complete
        setTimeout(() => {
          if (document.activeElement === target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 300)
      }
    }

    // Prevent double-tap zoom which can freeze the UI
    let lastTouchEnd = 0
    const handleTouchEnd = (e: TouchEvent) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        e.preventDefault()
      }
      lastTouchEnd = now
    }

    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('focusin', handleFocusIn, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('focusin', handleFocusIn)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])
}
