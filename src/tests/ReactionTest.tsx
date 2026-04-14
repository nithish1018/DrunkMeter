import { useEffect, useRef, useState } from 'react'
import { Button } from '../components/Button'
import { TestCard } from '../components/TestCard'
import type { ReactionResult } from '../utils/types'

type ReactionTestProps = {
    onComplete: (result: ReactionResult) => void
}

type ReactionPhase = 'idle' | 'waiting' | 'ready' | 'done' | 'error'

export function ReactionTest({ onComplete }: ReactionTestProps) {
    const [phase, setPhase] = useState<ReactionPhase>('idle')
    const [falseStarts, setFalseStarts] = useState(0)
    const [reactionTime, setReactionTime] = useState<number | null>(null)
    const [message, setMessage] = useState('Tap start and wait for green.')

    const timeoutRef = useRef<number | null>(null)
    const startTimestampRef = useRef(0)

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    const startRound = () => {
        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current)
        }

        setPhase('waiting')
        setReactionTime(null)
        setMessage('Wait... wait... wait...')

        const delay = Math.round(2000 + Math.random() * 3000)
        timeoutRef.current = window.setTimeout(() => {
            startTimestampRef.current = Date.now()
            setPhase('ready')
            setMessage('TAP NOW!')
        }, delay)
    }

    const handleTap = () => {
        if (phase === 'waiting') {
            setFalseStarts((prev) => prev + 1)
            setPhase('error')
            setMessage('Too early! Focus and retry.')
            window.navigator.vibrate?.(180)
            return
        }

        if (phase !== 'ready') {
            return
        }

        const result = Date.now() - startTimestampRef.current
        setReactionTime(result)
        setPhase('done')
        setMessage('Clean tap captured.')

        onComplete({
            reactionTimeMs: result,
            falseStarts,
        })
    }

    return (
        <TestCard
            title="Reaction Time Test"
            subtitle="Tap only when the panel turns green. False starts count against you."
        >
            <div className="space-y-4">
                <button
                    onClick={handleTap}
                    className={[
                        'h-56 w-full rounded-3xl border text-center transition-all duration-300 active:scale-[0.99]',
                        phase === 'ready'
                            ? 'border-neon-green bg-neon-green/25 shadow-neonGreen'
                            : 'border-white/20 bg-white/5',
                    ].join(' ')}
                >
                    <p className="text-xl font-semibold text-white">{message}</p>
                    {reactionTime !== null ? (
                        <p className="mt-2 text-sm text-white/70">Reaction: {reactionTime} ms</p>
                    ) : null}
                </button>

                <div className="flex items-center justify-between text-xs uppercase tracking-[0.1em] text-white/50">
                    <span>False starts: {falseStarts}</span>
                    {reactionTime !== null ? <span>Completed</span> : null}
                </div>

                <div className="grid grid-cols-1 gap-3">
                    <Button onClick={startRound} fullWidth>
                        {phase === 'idle' ? 'Start' : 'Retry'}
                    </Button>
                </div>
            </div>
        </TestCard>
    )
}
