import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '../components/Button'
import { TestCard } from '../components/TestCard'
import { useDeviceOrientation } from '../hooks/useDeviceOrientation'
import type { StabilityResult } from '../utils/types'

type StabilityTestProps = {
    onComplete: (result: StabilityResult) => void
}

const DURATION_MS = 10000
const SAMPLE_INTERVAL_MS = 80
const SAFE_TILT_GAMMA = 8
const SAFE_TILT_BETA = 10
const MAX_SPILL = 100

const mean = (values: number[]) =>
    values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1)

const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value))

export function StabilityTest({ onComplete }: StabilityTestProps) {
    const [isRunning, setIsRunning] = useState(false)
    const [timeLeft, setTimeLeft] = useState(DURATION_MS)
    const [samples, setSamples] = useState<number[]>([])
    const [error, setError] = useState<string | null>(null)
    const [startedAt, setStartedAt] = useState<number | null>(null)
    const [spillPercent, setSpillPercent] = useState(0)
    const [cupTiltDeg, setCupTiltDeg] = useState(0)

    const samplesRef = useRef<number[]>([])
    const baselineRef = useRef({ gamma: 0, beta: 0 })
    const spillRef = useRef(0)
    const baselineCapturedRef = useRef(false)

    const { gamma, beta, isSupported, permissionState, requestPermission } =
        useDeviceOrientation(isRunning)

    useEffect(() => {
        if (!isRunning || gamma === null || beta === null) return

        if (!baselineCapturedRef.current) {
            baselineRef.current = { gamma, beta }
            baselineCapturedRef.current = true
            window.setTimeout(() => {
                setStartedAt(Date.now())
            }, 0)
            return
        }

        const relativeGamma = gamma - baselineRef.current.gamma
        const relativeBeta = beta - baselineRef.current.beta

        const safeGammaExcess = Math.max(0, Math.abs(relativeGamma) - SAFE_TILT_GAMMA)
        const safeBetaExcess = Math.max(0, Math.abs(relativeBeta) - SAFE_TILT_BETA)
        const spillDelta = (safeGammaExcess * 0.5 + safeBetaExcess * 0.35) * 0.6

        spillRef.current = clamp(spillRef.current + spillDelta, 0, MAX_SPILL)
        setSpillPercent(spillRef.current)
        setCupTiltDeg(clamp(relativeGamma * 1.5, -28, 28))

        setSamples((prev) => {
            const compositeTilt = Math.sqrt(relativeGamma * relativeGamma + relativeBeta * relativeBeta)
            const next = [...prev, compositeTilt]
            samplesRef.current = next
            return next
        })
    }, [beta, gamma, isRunning])

    useEffect(() => {
        if (!isRunning || startedAt === null) return

        const timer = window.setInterval(() => {
            const elapsed = Date.now() - startedAt
            const remaining = Math.max(0, DURATION_MS - elapsed)
            setTimeLeft(remaining)

            if (remaining <= 0) {
                window.clearInterval(timer)
                setIsRunning(false)
                setStartedAt(null)

                const measured = samplesRef.current
                const center = mean(measured)
                const averageDeviation =
                    measured.reduce((sum, value) => sum + Math.abs(value - center), 0) /
                    Math.max(measured.length, 1)

                onComplete({
                    samples: measured.length,
                    averageDeviation,
                    durationMs: DURATION_MS,
                    usedSensor: true,
                })
            }
        }, SAMPLE_INTERVAL_MS)

        return () => window.clearInterval(timer)
    }, [isRunning, onComplete, startedAt])

    const liveDeviation = useMemo(() => {
        if (samples.length < 2) return 0
        const center = mean(samples)
        const drift = samples.reduce((sum, value) => sum + Math.abs(value - center), 0)
        return drift / samples.length
    }, [samples])

    const startSensorTest = async () => {
        setError(null)
        setSamples([])
        samplesRef.current = []
        setTimeLeft(DURATION_MS)
        setSpillPercent(0)
        spillRef.current = 0
        setCupTiltDeg(0)
        baselineCapturedRef.current = false
        setStartedAt(null)

        const granted = await requestPermission()
        if (!granted) {
            setError('Sensor permission denied. Use fallback mode.')
            return
        }

        setIsRunning(true)
    }

    const completeWithFallback = () => {
        const simulatedDeviation = 10 + Math.random() * 12
        onComplete({
            samples: 0,
            averageDeviation: simulatedDeviation,
            durationMs: DURATION_MS,
            usedSensor: false,
        })
    }

    const liquidHeight = clamp(100 - spillPercent, 0, 100)

    return (
        <TestCard
            title="One-Hand Pour Challenge"
            subtitle="Keep your virtual drink from spilling for 10 seconds while tilting gently."
        >
            <div className="space-y-4">
                <div className="rounded-2xl border border-white/20 bg-white/5 p-4">
                    <div className="mx-auto flex h-52 w-full max-w-[280px] items-end justify-center">
                        <div
                            className="relative h-44 w-28 overflow-hidden rounded-b-3xl border-2 border-white/60 bg-slate-900/60 transition-transform duration-100"
                            style={{ transform: `rotate(${cupTiltDeg}deg)` }}
                        >
                            <div
                                className="absolute bottom-0 left-0 w-full bg-neon-yellow/80 transition-all duration-100"
                                style={{ height: `${liquidHeight}%` }}
                            />
                        </div>
                    </div>

                    <p className="mt-3 text-sm text-white/70">
                        {isRunning && startedAt === null
                            ? 'Hold your phone naturally for a moment. Calibrating...'
                            : isRunning
                                ? 'Stay smooth. Too much tilt spills the drink.'
                                : 'Press start, allow sensors, then keep the drink steady.'}
                    </p>
                    <p className="mt-3 text-xs uppercase tracking-[0.12em] text-white/50">
                        Support: {isSupported ? 'Available' : 'Not available'} | Permission: {permissionState}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.12em] text-white/50">
                        Time left: {(timeLeft / 1000).toFixed(1)}s | Samples: {samples.length}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.12em] text-white/50">
                        Spill: {spillPercent.toFixed(1)}% | Drift: {liveDeviation.toFixed(2)}
                    </p>
                </div>

                {error ? <p className="text-sm text-neon-red">{error}</p> : null}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Button onClick={startSensorTest} fullWidth>
                        {isRunning ? 'Restart Pour Challenge' : 'Start Pour Challenge'}
                    </Button>
                    <Button variant="secondary" onClick={completeWithFallback} fullWidth>
                        Use Fallback
                    </Button>
                </div>
            </div>
        </TestCard>
    )
}
