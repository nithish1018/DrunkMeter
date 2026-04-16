import { useMemo, useState, type MouseEvent } from 'react'
import { Button } from '../components/Button'
import { TestCard } from '../components/TestCard'
import type { CognitionResult } from '../utils/types'

type StroopChaosTestProps = {
    onComplete: (result: CognitionResult) => void
}

type ColorName = 'Red' | 'Green' | 'Blue' | 'Yellow'

const colorClassMap: Record<ColorName, string> = {
    Red: 'text-red-400',
    Green: 'text-neon-green',
    Blue: 'text-sky-400',
    Yellow: 'text-neon-yellow',
}

const optionColors: ColorName[] = ['Red', 'Green', 'Blue', 'Yellow']
const TOTAL_ROUNDS = 8

const randomColor = (): ColorName =>
    optionColors[Math.floor(Math.random() * optionColors.length)]

const createPrompt = () => {
    const word = randomColor()
    let ink = randomColor()

    while (ink === word) {
        ink = randomColor()
    }

    return { word, ink }
}

export function StroopChaosTest({ onComplete }: StroopChaosTestProps) {
    const [isStarted, setIsStarted] = useState(false)
    const [round, setRound] = useState(0)
    const [correct, setCorrect] = useState(0)
    const [prompt, setPrompt] = useState(createPrompt)
    const [responseTimes, setResponseTimes] = useState<number[]>([])
    const [shownAt, setShownAt] = useState(0)

    const progressText = useMemo(
        () => `Round ${Math.min(round + 1, TOTAL_ROUNDS)} / ${TOTAL_ROUNDS}`,
        [round],
    )

    const optionLabelColorMap = useMemo<Record<ColorName, ColorName>>(() => {
        const seed = `${round}-${prompt.word}-${prompt.ink}-${isStarted ? '1' : '0'}`

        const charSum = seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
        const pickDifferent = (option: ColorName, offset: number): ColorName => {
            const forbiddenIndex = optionColors.indexOf(option)
            const start = (charSum + offset) % optionColors.length

            for (let indexShift = 0; indexShift < optionColors.length; indexShift += 1) {
                const candidateIndex = (start + indexShift) % optionColors.length
                if (candidateIndex !== forbiddenIndex) {
                    return optionColors[candidateIndex]
                }
            }

            return option
        }

        return {
            Red: pickDifferent('Red', 1),
            Green: pickDifferent('Green', 3),
            Blue: pickDifferent('Blue', 5),
            Yellow: pickDifferent('Yellow', 7),
        }
    }, [isStarted, prompt.ink, prompt.word, round])

    const startTest = (event: MouseEvent<HTMLButtonElement>) => {
        setIsStarted(true)
        setRound(0)
        setCorrect(0)
        setResponseTimes([])
        const firstPrompt = createPrompt()
        setPrompt(firstPrompt)
        setShownAt(event.timeStamp)
    }

    const handlePick = (picked: ColorName, event: MouseEvent<HTMLButtonElement>) => {
        if (!isStarted) return

        const nextRound = round + 1
        const responseMs = Math.max(0, event.timeStamp - shownAt)
        setResponseTimes((prev) => [...prev, responseMs])

        if (picked === prompt.word) {
            setCorrect((prev) => prev + 1)
        }

        if (nextRound >= TOTAL_ROUNDS) {
            const averageResponseMs =
                responseTimes.length > 0
                    ? [...responseTimes, responseMs].reduce((sum, value) => sum + value, 0) /
                    (responseTimes.length + 1)
                    : responseMs

            onComplete({
                rounds: TOTAL_ROUNDS,
                correct: picked === prompt.word ? correct + 1 : correct,
                averageResponseMs,
            })
            setIsStarted(false)
            return
        }

        setRound(nextRound)
        setPrompt(createPrompt())
        setShownAt(event.timeStamp)
    }

    return (
        <TestCard
            title="Color Chaos Test"
            subtitle="Tap the WORD meaning, not the text color. Fast and correct wins."
        >
            <div className="space-y-4">
                {isStarted ? (
                    <div className="rounded-2xl border border-white/20 bg-white/5 p-5 text-center">
                        <p className="text-xs uppercase tracking-[0.12em] text-white/55">{progressText}</p>
                        <p className={['mt-3 text-4xl font-bold', colorClassMap[prompt.ink]].join(' ')}>
                            {prompt.word}
                        </p>
                        <p className="mt-2 text-xs text-white/60">Ignore the ink color. Pick the word meaning.</p>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-white/20 bg-white/5 p-5 text-sm text-white/70">
                        8 quick rounds of brain chaos. Your score uses accuracy and response speed.
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    {optionColors.map((option) => (
                        <Button
                            key={option}
                            variant="secondary"
                            fullWidth
                            onClick={(event) => handlePick(option, event)}
                            disabled={!isStarted}
                        >
                            <span className={colorClassMap[optionLabelColorMap[option]]}>{option}</span>
                        </Button>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs uppercase tracking-[0.1em] text-white/60">
                    <div className="rounded-xl border border-white/15 bg-white/5 p-2">Correct: {correct}</div>
                    <div className="rounded-xl border border-white/15 bg-white/5 p-2">Round: {round}</div>
                </div>

                <Button onClick={startTest} fullWidth>
                    {isStarted ? 'Restart Chaos Test' : 'Start Chaos Test'}
                </Button>
            </div>
        </TestCard>
    )
}
