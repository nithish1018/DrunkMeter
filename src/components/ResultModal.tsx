import { Button } from './Button'
import type { DrunkCategory, ScoreBreakdown } from '../utils/types'

type ResultModalProps = {
    score: number
    category: DrunkCategory
    breakdown: ScoreBreakdown
    bestScore: number | null
    onRestart: () => void
    onShare: () => void
}

export function ResultModal({
    score,
    category,
    breakdown,
    bestScore,
    onRestart,
    onShare,
}: ResultModalProps) {
    const tapAccuracyPercent = Math.max(0, Math.min(100, 100 - breakdown.accuracyScore))

    return (
        <div className="glass-card mx-auto w-full max-w-xl rounded-3xl p-6 sm:p-8">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">Final Analysis</p>
            <h2 className="mt-1 font-display text-4xl text-white">{score}%</h2>
            <p className={`mt-1 text-lg font-semibold ${category.colorClass}`}>{category.label}</p>
            <p className="mt-3 text-sm text-white/70">{category.description}</p>

            <div className="mt-5 grid grid-cols-2 gap-3 text-center text-xs sm:grid-cols-5">
                <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
                    <p className="text-white/50">Reaction</p>
                    <p className="mt-1 text-sm font-semibold text-white">{breakdown.reactionScore}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
                    <p className="text-white/50">Tap Accuracy</p>
                    <p className="mt-1 text-sm font-semibold text-white">{tapAccuracyPercent}%</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
                    <p className="text-white/50">Rhythm</p>
                    <p className="mt-1 text-sm font-semibold text-white">{breakdown.rhythmScore}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
                    <p className="text-white/50">Chaos</p>
                    <p className="mt-1 text-sm font-semibold text-white">{breakdown.cognitionScore}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
                    <p className="text-white/50">Stability</p>
                    <p className="mt-1 text-sm font-semibold text-white">{breakdown.stabilityScore}</p>
                </div>
            </div>

            <p className="mt-4 text-xs text-white/50">
                Best score so far (lowest): {bestScore !== null ? `${bestScore}%` : 'No runs yet'}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Button variant="secondary" onClick={onRestart} fullWidth>
                    Restart Test
                </Button>
                <Button onClick={onShare} fullWidth>
                    Share Result
                </Button>
            </div>
        </div>
    )
}
