import { useEffect, useMemo, useState } from 'react'

type LoadingPageProps = {
    onDone: () => void
}

const messages = [
    'Analyzing motor skills…',
    'Measuring neural delay…',
    'Calibrating balance…',
    'Cooking pseudo-science…',
]

export function LoadingPage({ onDone }: LoadingPageProps) {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        const stepInterval = window.setInterval(() => {
            setIndex((prev) => (prev + 1) % messages.length)
        }, 900)

        const doneTimer = window.setTimeout(() => {
            onDone()
        }, 3600)

        return () => {
            window.clearInterval(stepInterval)
            window.clearTimeout(doneTimer)
        }
    }, [onDone])

    const progress = useMemo(() => Math.round(((index + 1) / messages.length) * 100), [index])

    return (
        <main className="mx-auto flex min-h-svh w-full max-w-xl flex-col items-center justify-center px-5 text-center">
            <div className="glass-card w-full rounded-3xl p-7">
                <div className="mx-auto h-16 w-16 animate-spin rounded-full border-2 border-neon-yellow/30 border-t-neon-yellow" />
                <p className="mt-6 text-sm uppercase tracking-[0.15em] text-white/55">Running analysis</p>
                <h2 className="mt-2 font-display text-2xl text-white">{messages[index]}</h2>
                <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/15">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-neon-green via-neon-yellow to-neon-red transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </main>
    )
}
