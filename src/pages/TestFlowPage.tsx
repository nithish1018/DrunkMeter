import { useMemo, useState } from 'react'
import { ProgressBar } from '../components/ProgressBar'
import { AccuracyTest } from '../tests/AccuracyTest'
import { ReactionTest } from '../tests/ReactionTest'
import { RhythmTapTest } from '../tests/RhythmTapTest'
import { StabilityTest } from '../tests/StabilityTest'
import { StroopChaosTest } from '../tests/StroopChaosTest'
import type { RawTestResults } from '../utils/types'

type TestFlowPageProps = {
    onComplete: (results: RawTestResults) => void
}

export function TestFlowPage({ onComplete }: TestFlowPageProps) {
    const [step, setStep] = useState(0)
    const [reaction, setReaction] = useState<RawTestResults['reaction'] | null>(null)
    const [accuracy, setAccuracy] = useState<RawTestResults['accuracy'] | null>(null)
    const [rhythm, setRhythm] = useState<RawTestResults['rhythm'] | null>(null)
    const [cognition, setCognition] = useState<RawTestResults['cognition'] | null>(null)

    const totalSteps = 5

    const subtitle = useMemo(() => {
        if (step === 0) return 'Test 1 of 5: Reaction time'
        if (step === 1) return 'Test 2 of 5: Tap accuracy'
        if (step === 2) return 'Test 3 of 5: Hold steady + moving dot'
        if (step === 3) return 'Test 4 of 5: Color chaos'
        return 'Test 5 of 5: Tilt stability'
    }, [step])

    return (
        <main className="mx-auto flex min-h-svh w-full max-w-xl flex-col px-4 py-6 sm:px-6">
            <header className="mb-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/60">{subtitle}</p>
                <h1 className="mt-1 font-display text-3xl text-white">Drunk Test 🍺</h1>
            </header>

            <ProgressBar current={step + 1} total={totalSteps} />

            <div className="mt-5">
                {step === 0 ? (
                    <ReactionTest
                        onComplete={(result) => {
                            setReaction(result)
                            setStep(1)
                        }}
                    />
                ) : null}

                {step === 1 ? (
                    <AccuracyTest
                        onComplete={(result) => {
                            setAccuracy(result)
                            setStep(2)
                        }}
                    />
                ) : null}

                {step === 2 ? (
                    <RhythmTapTest
                        onComplete={(result) => {
                            setRhythm(result)
                            setStep(3)
                        }}
                    />
                ) : null}

                {step === 3 ? (
                    <StroopChaosTest
                        onComplete={(result) => {
                            setCognition(result)
                            setStep(4)
                        }}
                    />
                ) : null}

                {step === 4 ? (
                    <StabilityTest
                        onComplete={(stability) => {
                            if (!reaction || !accuracy || !rhythm || !cognition) return

                            onComplete({
                                reaction,
                                accuracy,
                                stability,
                                rhythm,
                                cognition,
                            })
                        }}
                    />
                ) : null}
            </div>
        </main>
    )
}
