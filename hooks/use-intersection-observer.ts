import { useEffect, useRef, useState, useCallback } from 'react'

export interface UseIntersectionObserverOptions {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
  freezeOnceVisible?: boolean
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
) {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0%',
    freezeOnceVisible = false
  } = options

  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
  const [node, setNode] = useState<Element | null>(null)
  const observer = useRef<IntersectionObserver | null>(null)

  const frozen = entry?.isIntersecting && freezeOnceVisible

  const updateEntry = useCallback(([entry]: IntersectionObserverEntry[]) => {
    setEntry(entry)
  }, [])

  useEffect(() => {
    const hasIOSupport = !!window.IntersectionObserver

    if (!hasIOSupport || frozen || !node) return

    const observerParams = { threshold, root, rootMargin }
    const currentObserver = new IntersectionObserver(updateEntry, observerParams)

    observer.current = currentObserver
    currentObserver.observe(node)

    return () => {
      currentObserver.disconnect()
    }
  }, [node, threshold, root, rootMargin, frozen, updateEntry])

  const prevNode = useRef<Element | null>(null)

  useEffect(() => {
    if (prevNode.current === node) return

    prevNode.current = node
    setEntry(null)
  }, [node])

  return [setNode, entry] as const
}

// Hook for lazy loading images
export function useLazyImage(src: string, options: UseIntersectionObserverOptions = {}) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [imageRef, entry] = useIntersectionObserver(options)

  useEffect(() => {
    if (entry?.isIntersecting && !imageSrc) {
      setImageSrc(src)
    }
  }, [entry, src, imageSrc])

  return [imageRef, imageSrc] as const
}

// Hook for infinite scrolling
export function useInfiniteScroll(
  callback: () => void,
  options: UseIntersectionObserverOptions = {}
) {
  const [isFetching, setIsFetching] = useState(false)
  const [node, entry] = useIntersectionObserver(options)

  useEffect(() => {
    if (entry?.isIntersecting && !isFetching) {
      setIsFetching(true)
      callback()
    }
  }, [entry, callback, isFetching])

  useEffect(() => {
    if (isFetching) {
      setIsFetching(false)
    }
  }, [isFetching])

  return [node, isFetching] as const
}
