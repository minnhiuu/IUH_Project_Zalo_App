'use client'
import React, { forwardRef, memo } from 'react'
import { H1, H2, H3, H4, H5, H6 } from '@expo/html-elements'
import { headingStyle } from './styles'
import type { VariantProps } from '@gluestack-ui/nativewind-utils'
import { cssInterop } from 'nativewind'

;[H1, H2, H3, H4, H5, H6].forEach((H) => cssInterop(H, { className: 'style' }))

type IHeadingProps = VariantProps<typeof headingStyle> &
  React.ComponentPropsWithoutRef<typeof H1> & {
    as?: React.ElementType
  }

const MappedHeading = memo(
  forwardRef<React.ComponentRef<typeof H1>, IHeadingProps>(({ size, className, ...props }, ref) => {
    const sizeMap: Record<string, React.ElementType> = {
      '5xl': H1,
      '4xl': H1,
      '3xl': H1,
      '2xl': H2,
      xl: H3,
      lg: H4,
      md: H5,
      sm: H6,
      xs: H6
    }

    const Component = sizeMap[size as string] || H4

    return (
      <Component
        {...props}
        ref={ref}
        className={headingStyle({
          size,
          class: className,
          ...props
        })}
      />
    )
  })
)

const Heading = memo(
  forwardRef<React.ComponentRef<typeof H1>, IHeadingProps>(({ className, size = 'lg', as: AsComp, ...props }, ref) => {
    if (AsComp) {
      return (
        <AsComp
          {...props}
          // @ts-ignore
          ref={ref}
          className={headingStyle({ size, class: className, ...props })}
        />
      )
    }

    return <MappedHeading className={className} size={size} ref={ref} {...props} />
  })
)

Heading.displayName = 'Heading'

export { Heading }
