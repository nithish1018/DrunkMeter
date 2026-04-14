import { useEffect, useRef, useState } from 'react'
import { Button } from '../components/Button'
import { TestCard } from '../components/TestCard'
import type { RhythmResult } from '../utils/types'

type RhythmTapTestProps = {
    onComplete: (result: RhythmResult) => void
}

const DURATION_MS = 10000
const BEAT_INTERVAL_MS = 700

const findClosestBeatOffset = (
    elapsedMs: number,
    beatIntervalMs: number,
): number => {
    const beatIndex = Math.round(elapsedMs / beatIntervalMs)
    const nearestBeatMs = beatIndex * beatIntervalMs
    return Math.abs(elapsedMs - nearestBeatMs)
}

export function RhythmTapTest({ onComplete }: RhythmTapTestProps) {
    const [isRunning, setIsRunning] = useState(false)
    const [timeLeft, setTimeLeft] = useState(DURATION_MS)
    const [taps, setTaps] = useState(0)
    const [averageOffset, setAverageOffset] = useState(0)
    const [beatFlash, setBeatFlash] = useState(false)

    const startedAtRef = useRef(0)
    const tapOffsetsRef = useRef<number[]>([])

    useEffect(() => {
        if (!isRunning) return

        const beatTimer = window.setInterval(() => {
            setBeatFlash(true)
            window.setTimeout(() => setBeatFlash(false), 140)
        }, BEAT_INTERVAL_MS)

        const countdownTimer = window.setInterval(() => {
            const elapsed = Date.now() - startedAtRef.current
            const remaining = Math.max(0, DURATION_MS - elapsed)
            setTimeLeft(remaining)

            if (remaining <= 0) {
                window.clearInterval(countdownTimer)
                window.clearInterval(beatTimer)
                setIsRunning(false)

                const offsets = tapOffsetsRef.current
                const averageOffsetMs = offsets.length
                    ? offsets.reduce((sum, value) => sum + value, 0) / offsets.length
                    : 350

                onComplete({
                    taps: offsets.length,
                    averageOffsetMs,
                    durationMs: DURATION_MS,
                })
            }
        }, 80)

        return () => {
            window.clearInterval(countdownTimer)
            window.clearInterval(beatTimer)
        }
    }, [isRunning, onComplete])

    const startTest = () => {
        tapOffsetsRef.current = []
        setTaps(0)
        setAverageOffset(0)
        setTimeLeft(DURATION_MS)
        startedAtRef.current = Date.now()
        setIsRunning(true)
    }

    const handleTap = () => {
        if (!isRunning) return

        const elapsed = Date.now() - startedAtRef.current
        const offset = findClosestBeatOffset(elapsed, BEAT_INTERVAL_MS)
        tapOffsetsRef.current = [...tapOffsetsRef.current, offset]

        setTaps(tapOffsetsRef.current.length)
        const nextAverage =
            tapOffsetsRef.current.reduce((sum, value) => sum + value, 0) /
            tapOffsetsRef.current.length
        setAverageOffset(nextAverage)
    }

    return (
        <TestCard
            title="Rhythm Tap Test"
            subtitle="Tap to the beat for 10 seconds. Better timing means a better score."
        >
            <div className="space-y-4">
                <button
                    onClick={handleTap}
                    className={[
                        'h-52 w-full rounded-3xl border text-center transition-all duration-150 active:scale-[0.98]',
                        beatFlash
                            ? 'border-neon-green bg-neon-green/25 shadow-neonGreen'
                            : 'border-white/20 bg-white/5',
                    ].join(' ')}
                >
                    <p className="text-lg font-semibold text-white">{beatFlash ? 'NOW!' : 'Tap with the beat'}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.12em] text-white/60">
                        Time left: {(timeLeft / 1000).toFixed(1)}s
                    </p>
                </button>

                <div className="grid grid-cols-2 gap-3 text-xs uppercase tracking-[0.1em] text-white/60">
                    <div className="rounded-xl border border-white/15 bg-white/5 p-2">Taps: {taps}</div>
                    <div className="rounded-xl border border-white/15 bg-white/5 p-2">
                        Drift: {Math.round(averageOffset)}ms
                    </div>
                </div>

                <Button onClick={startTest} fullWidth>
                    {isRunning ? 'Restart Rhythm Test' : 'Start Rhythm Test'}
                </Button>
            </div>
        </TestCard>
    )
}
