import React from 'react'

interface Props {
  children: React.ReactNode
}

/**
 * Gluestack UI v4 with NativeWind doesn't require a provider
 * This component is kept for compatibility and future enhancements
 */
export function GluestackProvider({ children }: Props) {
  return <>{children}</>
}

export default GluestackProvider
