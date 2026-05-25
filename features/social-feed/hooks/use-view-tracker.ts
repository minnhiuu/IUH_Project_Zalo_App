import { useEffect, useRef } from 'react'

interface ViewTrackerRef {
  ref: React.RefObject<any>
}

export function useViewTracker(postId: string): ViewTrackerRef {
  const ref = useRef<any>(null)

  useEffect(() => {
    if (!ref.current) return

    if (typeof IntersectionObserver === 'undefined') return

    const observer = new (IntersectionObserver as any)(
      ([entry]: any) => {
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
