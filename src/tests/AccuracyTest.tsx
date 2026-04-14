import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { Button } from '../components/Button'
import { TestCard } from '../components/TestCard'
import type { AccuracyResult } from '../utils/types'

type AccuracyTestProps = {
    onComplete: (result: AccuracyResult) => void
}

const DURATION_MS = 7000

const randomTargetPosition = () => ({
    x: 12 + Math.random() * 76,
    y: 16 + Math.random() * 68,
})

export function AccuracyTest({ onComplete }: AccuracyTestProps) {
    const [isRunning, setIsRunning] = useState(false)
    const [timeLeft, setTimeLeft] = useState(DURATION_MS)
    const [attempts, setAttempts] = useState(0)
    const [hits, setHits] = useState(0)
    const [position, setPosition] = useState(randomTargetPosition)
    const attemptsRef = useRef(0)
    const hitsRef = useRef(0)

    useEffect(() => {
        if (!isRunning) return

        const started = Date.now()
        const timer = window.setInterval(() => {
            const elapsed = Date.now() - started
            const remaining = Math.max(0, DURATION_MS - elapsed)
            setTimeLeft(remaining)

            if (remaining <= 0) {
                window.clearInterval(timer)
                setIsRunning(false)

                const finalAttempts = attemptsRef.current
                const finalHits = hitsRef.current
                const misses = Math.max(0, finalAttempts - finalHits)

                onComplete({
                    attempts: finalAttempts,
                    hits: finalHits,
                    misses,
                    durationMs: DURATION_MS,
                })
            }
        }, 100)

        return () => window.clearInterval(timer)
    }, [isRunning, onComplete])

    const accuracyPercent = useMemo(() => {
        if (attempts === 0) return 0
        return Math.round((hits / attempts) * 100)
    }, [attempts, hits])

    const startTest = () => {
        setAttempts(0)
        setHits(0)
        attemptsRef.current = 0
        hitsRef.current = 0
        setTimeLeft(DURATION_MS)
        setPosition(randomTargetPosition())
        setIsRunning(true)
    }

    const handleMiss = () => {
        if (!isRunning) return
        setAttempts((prev) => {
            const next = prev + 1
            attemptsRef.current = next
            return next
        })
        window.navigator.vibrate?.(40)
    }

    const handleHit = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation()
        if (!isRunning) return

        setAttempts((prev) => {
            const next = prev + 1
            attemptsRef.current = next
            return next
        })
        setHits((prev) => {
            const next = prev + 1
            hitsRef.current = next
            return next
        })
        setPosition(randomTargetPosition())
    }

    return (
        <TestCard
            title="Tap Accuracy Test"
            subtitle="Hit the moving target as many times as possible before time runs out."
        >
            <div className="space-y-4">
                <div
                    onClick={handleMiss}
                    className="relative h-64 w-full overflow-hidden rounded-3xl border border-white/20 bg-white/5"
                >
                    {isRunning ? (
                        <button
                            onClick={handleHit}
                            className="absolute h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-neon-yellow bg-neon-yellow/70 shadow-neonYellow transition-transform duration-150 active:scale-90"
                            style={{ left: `${position.x}%`, top: `${position.y}%` }}
                            aria-label="Moving target"
                        />
                    ) : (
                        <p className="px-6 text-sm text-white/60">Tap Start to begin the 7-second challenge.</p>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs uppercase tracking-[0.1em] text-white/60">
                    <div className="rounded-xl border border-white/15 bg-white/5 p-2">Attempts: {attempts}</div>
                    <div className="rounded-xl border border-white/15 bg-white/5 p-2">Hits: {hits}</div>
                    <div className="rounded-xl border border-white/15 bg-white/5 p-2">Acc: {accuracyPercent}%</div>
                </div>

                <p className="text-xs uppercase tracking-[0.12em] text-white/50">
                    Time left: {(timeLeft / 1000).toFixed(1)}s
                </p>

                <Button onClick={startTest} fullWidth>
                    {isRunning ? 'Restart Test' : 'Start Accuracy Test'}
                </Button>
            </div>
        </TestCard>
    )
}
