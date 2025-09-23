"use client"

import { useEffect, useState } from "react"
import type { TemplatesApiResponse, TemplatesData } from "@/lib"
import { defaultTemplatesResponse } from "@/lib"

interface UseTemplatesDataResult {
  data: TemplatesData
  loading: boolean
  error: string | null
}

export function useTemplatesData(): UseTemplatesDataResult {
  const [data, setData] = useState<TemplatesData>(defaultTemplatesResponse.data)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const controller = new AbortController()

    async function load() {
      try {
        const response = await fetch("/api/templates", { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Failed to load templates data: ${response.status}`)
        }
        const payload = (await response.json()) as TemplatesApiResponse
        if (mounted && payload?.data) {
          setData(payload.data)
        }
      } catch (err) {
        if (!mounted || (err as Error).name === "AbortError") {
          return
        }
        setError((err as Error).message)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      mounted = false
      controller.abort()
    }
  }, [])

  return { data, loading, error }
}
