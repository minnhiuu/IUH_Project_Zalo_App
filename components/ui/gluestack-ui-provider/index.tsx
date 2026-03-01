import React from 'react'

interface Props {
  children: React.ReactNode
}

export function GluestackProvider({ children }: Props) {
  return <>{children}</>
}

export default GluestackProvider
