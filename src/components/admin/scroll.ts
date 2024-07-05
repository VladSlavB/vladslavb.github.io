import { useEffect, useRef } from "react"

export function useAutoScroll(active: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (active && ref.current != null) {
      const gap = 40
      var elementPosition = ref.current.getBoundingClientRect().top;
      var offsetPosition = elementPosition + window.scrollY - gap;
      window.scrollTo({top: offsetPosition, behavior: 'smooth'})
    }
  }, [active])
  return ref
}
