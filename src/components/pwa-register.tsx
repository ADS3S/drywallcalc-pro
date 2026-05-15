'use client'

import { useEffect } from 'react'
import { useMobileInputFix } from '@/hooks/use-mobile-input-fix'

export function PWARegister() {
  useMobileInputFix()

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // SW registration failed - non-critical
      })
    }
  }, [])

  return null
}
