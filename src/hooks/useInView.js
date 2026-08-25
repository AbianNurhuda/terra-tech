import { useEffect, useRef, useState } from 'react'

export function useInView(options = {}) {
  const { threshold = 0.15, triggerOnce = true, rootMargin = '0px' } = options
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (triggerOnce) observer.disconnect()
        } else if (!triggerOnce) {
          setInView(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold, triggerOnce, rootMargin])

  return [ref, inView]
}
