import { useEffect, useRef, useState } from 'react'

interface UseInfiniteScrollOptions {
  threshold?: number
  rootMargin?: string
  onLoadMore?: () => void
}

export function useInfiniteScroll({
  threshold = 0.5,
  rootMargin = '400px',
  onLoadMore
}: UseInfiniteScrollOptions = {}) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!sentinelRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoading) {
          setIsLoading(true)
          onLoadMore?.()
          setIsLoading(false)
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(sentinelRef.current)

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current)
      }
    }
  }, [isLoading, onLoadMore, threshold, rootMargin])

  return { sentinelRef, isLoading }
}
