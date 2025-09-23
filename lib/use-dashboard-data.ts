"use client"

import { useEffect, useState } from "react"
import type { DashboardApiResponse, DashboardData } from "@/lib"
import { defaultDashboardResponse } from "@/lib"

interface UseDashboardDataResult {
  data: DashboardData
  loading: boolean
  error: string | null
}

export function useDashboardData(): UseDashboardDataResult {
  const [data, setData] = useState<DashboardData>(defaultDashboardResponse.data)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const controller = new AbortController()

    async function load() {
      try {
        const response = await fetch("/api/dashboard", { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Failed to load dashboard data: ${response.status}`)
        }
        const payload = (await response.json()) as DashboardApiResponse
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
