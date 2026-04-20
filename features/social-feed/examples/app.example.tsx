import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n'
import { SocialFeedPage } from '../features/social-feed'
import { ThemeProvider } from '../context/theme-context'

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

export default function RootApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <SocialFeedPage />
        </ThemeProvider>
      </I18nextProvider>
    </QueryClientProvider>
  )
}
