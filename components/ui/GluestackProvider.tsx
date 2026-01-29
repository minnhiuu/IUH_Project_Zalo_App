import { config } from '@gluestack-ui/config'
import { GluestackUIProvider } from '@gluestack-ui/themed'
import React from 'react'

interface GluestackProviderProps {
  children: React.ReactNode
}

export const GluestackProvider: React.FC<GluestackProviderProps> = ({ children }) => {
  return <GluestackUIProvider config={config}>{children}</GluestackUIProvider>
}

export default GluestackProvider
