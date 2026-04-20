import { useEffect, useRef } from 'react'

interface ViewTrackerRef {
  ref: React.RefObject<HTMLDivElement>
}

export function useViewTracker(postId: string): ViewTrackerRef {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Track view when post becomes visible
          // This would call an API endpoint
          console.log('Post visible:', postId)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(ref.current)

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [postId])

  return { ref }
}
