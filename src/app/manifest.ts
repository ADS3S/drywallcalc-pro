import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DrywallCalc Pro - Orçamento Data-Driven',
    short_name: 'DrywallCalc',
    description: 'Sistema de orçamento paramétrico para drywall com engine de cálculo data-driven.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f9fafb',
    theme_color: '#ea580c',
    orientation: 'any',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
