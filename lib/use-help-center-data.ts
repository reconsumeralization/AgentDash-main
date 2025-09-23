"use client"

import { useEffect, useState } from "react"
import type { HelpCenterData, HelpCenterResponse } from "@/lib"
import { defaultHelpCenterResponse } from "@/lib"

interface UseHelpCenterResult {
  data: HelpCenterData
  loading: boolean
  error: string | null
}

export function useHelpCenterData(path = "/api/help/fileflex"): UseHelpCenterResult {
  const [data, setData] = useState<HelpCenterData>(defaultHelpCenterResponse.data)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const controller = new AbortController()

    async function load() {
      try {
        const res = await fetch(path, { signal: controller.signal })
        if (!res.ok) {
          throw new Error(`Failed to load help center data: ${res.status}`)
        }
        const payload = (await res.json()) as HelpCenterResponse
        if (mounted) {
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
  }, [path])

  return { data, loading, error }
}
