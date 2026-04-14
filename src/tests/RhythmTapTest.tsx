import { useEffect, useRef, useState } from 'react'
import { Button } from '../components/Button'
import { TestCard } from '../components/TestCard'
import { useDeviceOrientation } from '../hooks/useDeviceOrientation'
import type { RhythmResult } from '../utils/types'

type RhythmTapTestProps = {
    onComplete: (result: RhythmResult) => void
}

const DURATION_MS = 11000
const TICK_MS = 80
const CLAMP_RANGE = 70
const SAFE_RADIUS = 22

const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value))

export function RhythmTapTest({ onComplete }: RhythmTapTestProps) {
    const [isRunning, setIsRunning] = useState(false)
    const [timeLeft, setTimeLeft] = useState(DURATION_MS)
    const [dot, setDot] = useState({ x: 0, y: 0 })
    const [steadyPercent, setSteadyPercent] = useState(0)
    const [avgDrift, setAvgDrift] = useState(0)
    const [error, setError] = useState<string | null>(null)

    const startedAtRef = useRef(0)
    const baselineRef = useRef({ gamma: 0, beta: 0 })
    const inZoneSamplesRef = useRef(0)
    const totalSamplesRef = useRef(0)
    const distanceSumRef = useRef(0)

    const { gamma, beta, isSupported, permissionState, requestPermission } =
        useDeviceOrientation(true)

    const updateFromSensor = (nextGamma: number, nextBeta: number) => {
        const x = clamp((nextGamma - baselineRef.current.gamma) * 3, -CLAMP_RANGE, CLAMP_RANGE)
        const y = clamp((nextBeta - baselineRef.current.beta) * 2.5, -CLAMP_RANGE, CLAMP_RANGE)
        setDot({ x, y })

        const distance = Math.sqrt(x * x + y * y)
        totalSamplesRef.current += 1
        distanceSumRef.current += distance

        if (distance <= SAFE_RADIUS) {
            inZoneSamplesRef.current += 1
        }

        const safeRatio = inZoneSamplesRef.current / Math.max(totalSamplesRef.current, 1)
        setSteadyPercent(Math.round(safeRatio * 100))
        setAvgDrift(distanceSumRef.current / Math.max(totalSamplesRef.current, 1))
    }

    useEffect(() => {
        if (!isRunning || gamma === null || beta === null) return
        updateFromSensor(gamma, beta)
    }, [beta, gamma, isRunning])

    useEffect(() => {
        if (!isRunning) return

        const countdownTimer = window.setInterval(() => {
            const elapsed = Date.now() - startedAtRef.current
            const remaining = Math.max(0, DURATION_MS - elapsed)
            setTimeLeft(remaining)

            if (remaining <= 0) {
                window.clearInterval(countdownTimer)
                setIsRunning(false)

                const steadySamples = inZoneSamplesRef.current
                const averageOffsetMs =
                    distanceSumRef.current / Math.max(totalSamplesRef.current, 1)

                onComplete({
                    taps: steadySamples,
                    averageOffsetMs,
                    durationMs: DURATION_MS,
                })
            }
        }, TICK_MS)

        return () => {
            window.clearInterval(countdownTimer)
        }
    }, [isRunning, onComplete])

    const startTest = async () => {
        setError(null)

        const granted = await requestPermission()
        if (!granted) {
            setError('Sensor permission denied. Please allow motion access and retry.')
            return
        }

        baselineRef.current = {
            gamma: gamma ?? 0,
            beta: beta ?? 0,
        }

        inZoneSamplesRef.current = 0
        totalSamplesRef.current = 0
        distanceSumRef.current = 0

        setDot({ x: 0, y: 0 })
        setSteadyPercent(0)
        setAvgDrift(0)
        setTimeLeft(DURATION_MS)
        startedAtRef.current = Date.now()
        setIsRunning(true)
    }

    return (
        <TestCard
            title="Hold Steady + Moving Dot"
            subtitle="Keep the glowing dot inside the center ring for 11 seconds by holding your phone steady."
        >
            <div className="space-y-4">
                <div className="rounded-3xl border border-white/20 bg-white/5 p-4">
                    <div className="relative mx-auto h-56 w-full max-w-[320px] overflow-hidden rounded-2xl bg-slate-950/50">
                        <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-neon-yellow/70" />
                        <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/50" />
                        <div
                            className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-green shadow-neonGreen transition-transform duration-50"
                            style={{ transform: `translate(-50%, -50%) translate(${dot.x}px, ${dot.y}px)` }}
                        />
                    </div>
                    <p className="mt-3 text-center text-xs uppercase tracking-[0.12em] text-white/60">
                        Time left: {(timeLeft / 1000).toFixed(1)}s
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs uppercase tracking-[0.1em] text-white/60">
                    <div className="rounded-xl border border-white/15 bg-white/5 p-2">Steady: {steadyPercent}%</div>
                    <div className="rounded-xl border border-white/15 bg-white/5 p-2">
                        Drift: {Math.round(avgDrift)}
                    </div>
                </div>

                <p className="text-xs uppercase tracking-[0.12em] text-white/50">
                    Support: {isSupported ? 'Available' : 'Not available'} | Permission: {permissionState}
                </p>

                {error ? <p className="text-sm text-neon-red">{error}</p> : null}

                <Button onClick={startTest} fullWidth>
                    {isRunning ? 'Restart Hold Steady Test' : 'Start Hold Steady Test'}
                </Button>
            </div>
        </TestCard>
    )
}
