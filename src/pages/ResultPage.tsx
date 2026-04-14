import { useEffect, useMemo } from 'react'
import { ResultModal } from '../components/ResultModal'
import { useDrunkScore } from '../hooks/useDrunkScore'
import type { RawTestResults } from '../utils/types'

type ResultPageProps = {
    results: RawTestResults
    bestScore: number | null
    onScoreComputed: (score: number) => void
    onRestart: () => void
}

const buildShareText = (score: number, category: string) =>
    `I scored ${score}% on Drunk Test (${category}). Try it yourself.`

export function ResultPage({
    results,
    bestScore,
    onScoreComputed,
    onRestart,
}: ResultPageProps) {
    const { finalScore, breakdown, category } = useDrunkScore(results)

    useEffect(() => {
        onScoreComputed(finalScore)
    }, [finalScore, onScoreComputed])

    const wobbleClass = useMemo(
        () => (finalScore > 60 ? 'animate-drunk-wobble' : ''),
        [finalScore],
    )

    const handleShare = async () => {
        const url = window.location.href
        const text = buildShareText(finalScore, category.label)

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Drunk Test 🍺',
                    text,
                    url,
                })
                return
            } catch {
                // User canceled share. Fallback below.
            }
        }

        // Keep URL on its own line for better link detection in pasted messages.
        await navigator.clipboard.writeText(`${text}\n${url}`)
        window.navigator.vibrate?.(80)
    }

    return (
        <main
            className={`mx-auto flex min-h-svh w-full max-w-xl flex-col justify-center px-4 py-8 sm:px-6 ${wobbleClass}`}
        >
            <ResultModal
                score={finalScore}
                category={category}
                breakdown={breakdown}
                bestScore={bestScore}
                onRestart={onRestart}
                onShare={handleShare}
            />
        </main>
    )
}
