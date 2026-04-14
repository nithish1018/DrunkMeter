import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '../components/Button'
import { TestCard } from '../components/TestCard'
import { useDeviceOrientation } from '../hooks/useDeviceOrientation'
import type { StabilityResult } from '../utils/types'

type StabilityTestProps = {
    onComplete: (result: StabilityResult) => void
}

const DURATION_MS = 5000

const mean = (values: number[]) =>
    values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1)

export function StabilityTest({ onComplete }: StabilityTestProps) {
    const [isRunning, setIsRunning] = useState(false)
    const [timeLeft, setTimeLeft] = useState(DURATION_MS)
    const [samples, setSamples] = useState<number[]>([])
    const [error, setError] = useState<string | null>(null)
    const [startedAt, setStartedAt] = useState<number | null>(null)

    const samplesRef = useRef<number[]>([])

    const { gamma, isSupported, permissionState, requestPermission } =
        useDeviceOrientation(isRunning)

    useEffect(() => {
        if (!isRunning || gamma === null) return

        setSamples((prev) => {
            const next = [...prev, gamma]
            samplesRef.current = next
            return next
        })
    }, [gamma, isRunning])

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
        }, 100)

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

        const granted = await requestPermission()
        if (!granted) {
            setError('Sensor permission denied. Use fallback mode.')
            return
        }

        setIsRunning(true)
        setStartedAt(Date.now())
    }

    const completeWithFallback = () => {
        const simulatedDeviation = 7 + Math.random() * 8
        onComplete({
            samples: 0,
            averageDeviation: simulatedDeviation,
            durationMs: DURATION_MS,
            usedSensor: false,
        })
    }

    return (
        <TestCard
            title="Tilt Stability Test"
            subtitle="Hold your phone steady for 5 seconds. We track orientation drift."
        >
            <div className="space-y-4">
                <div className="rounded-2xl border border-white/20 bg-white/5 p-4">
                    <p className="text-sm text-white/70">
                        {isRunning
                            ? 'Keep your phone steady...'
                            : 'Press start, grant sensor permission, and hold still.'}
                    </p>
                    <p className="mt-3 text-xs uppercase tracking-[0.12em] text-white/50">
                        Support: {isSupported ? 'Available' : 'Not available'} | Permission: {permissionState}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.12em] text-white/50">
                        Time left: {(timeLeft / 1000).toFixed(1)}s | Samples: {samples.length}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.12em] text-white/50">
                        Live drift: {liveDeviation.toFixed(2)}
                    </p>
                </div>

                {error ? <p className="text-sm text-neon-red">{error}</p> : null}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Button onClick={startSensorTest} fullWidth>
                        {isRunning ? 'Restart Sensor Test' : 'Start Sensor Test'}
                    </Button>
                    <Button variant="secondary" onClick={completeWithFallback} fullWidth>
                        Use Fallback
                    </Button>
                </div>
            </div>
        </TestCard>
    )
}
