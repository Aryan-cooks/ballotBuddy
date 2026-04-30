import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'BallotBuddy',
        short_name: 'BallotBuddy',
        description: 'Your smart companion for a confident democratic journey.',
        theme_color: '#2B5292',
        background_color: '#F7F9FC',
        display: 'standalone',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/5554/5554625.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://cdn-icons-png.flaticon.com/512/5554/5554625.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
