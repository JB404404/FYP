import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Friend Group Outing Manager',
    short_name: 'Outings',
    description: 'A web-app to help you coordinate meetings with your friends.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/icons/icon192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}