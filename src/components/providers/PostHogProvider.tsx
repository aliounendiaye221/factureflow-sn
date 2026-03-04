'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
                api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
                capture_pageview: false, // On désactive pour gérer manuellement dans Next.js app router
                capture_pageleave: true,
            })
        }
    }, [])

    return <PHProvider client={posthog}>{children}</PHProvider>
}
