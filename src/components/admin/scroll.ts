import { useEffect, useRef } from "react"

export function useAutoScroll() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current != null) {
      const gap = 40
      var elementPosition = ref.current.getBoundingClientRect().top;
      var offsetPosition = elementPosition + window.scrollY - gap;
      window.scrollTo({top: offsetPosition, behavior: 'smooth'})
    }
  }, [])
  return ref
}
