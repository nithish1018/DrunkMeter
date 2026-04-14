import type { DrunkCategory, RawTestResults, ScoreBreakdown } from './types'

const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value))

export const normalizeReactionScore = (
    reactionTimeMs: number,
    falseStarts: number,
): number => {
    const adjusted = reactionTimeMs + falseStarts * 120
    const normalized = ((adjusted - 180) / (900 - 180)) * 100
    return clamp(normalized, 0, 100)
}

export const normalizeAccuracyScore = (hits: number, attempts: number): number => {
    if (attempts <= 0) return 100
    const missRatio = 1 - hits / attempts
    return clamp(missRatio * 100, 0, 100)
}

export const normalizeStabilityScore = (averageDeviation: number): number => {
    const normalized = (averageDeviation / 18) * 100
    return clamp(normalized, 0, 100)
}

export const normalizeRhythmScore = (
    averageOffsetMs: number,
    taps: number,
): number => {
    const offsetScore = ((averageOffsetMs - 20) / (340 - 20)) * 100
    const lowTapPenalty = Math.max(0, 8 - taps) * 5
    return clamp(offsetScore + lowTapPenalty, 0, 100)
}

export const normalizeCognitionScore = (
    rounds: number,
    correct: number,
    averageResponseMs: number,
): number => {
    if (rounds <= 0) return 100

    const errorRatio = 1 - correct / rounds
    const errorScore = clamp(errorRatio * 100, 0, 100)
    const speedPenalty = clamp(((averageResponseMs - 350) / 1400) * 35, 0, 35)

    return clamp(errorScore * 0.75 + speedPenalty, 0, 100)
}

export const computeFinalScore = (
    results: RawTestResults,
    randomOffset = (Math.random() * 10) - 5,
): { finalScore: number; breakdown: ScoreBreakdown } => {
    const reactionScore = normalizeReactionScore(
        results.reaction.reactionTimeMs,
        results.reaction.falseStarts,
    )
    const accuracyScore = normalizeAccuracyScore(
        results.accuracy.hits,
        results.accuracy.attempts,
    )
    const rhythmScore = normalizeRhythmScore(
        results.rhythm.averageOffsetMs,
        results.rhythm.taps,
    )
    const cognitionScore = normalizeCognitionScore(
        results.cognition.rounds,
        results.cognition.correct,
        results.cognition.averageResponseMs,
    )
    const stabilityScore = normalizeStabilityScore(results.stability.averageDeviation)

    const weighted =
        reactionScore * 0.25 +
        accuracyScore * 0.2 +
        rhythmScore * 0.2 +
        cognitionScore * 0.15 +
        stabilityScore * 0.2
    const finalScore = clamp(Math.round(weighted + randomOffset), 0, 100)

    return {
        finalScore,
        breakdown: {
            reactionScore: Math.round(reactionScore),
            accuracyScore: Math.round(accuracyScore),
            stabilityScore: Math.round(stabilityScore),
            rhythmScore: Math.round(rhythmScore),
            cognitionScore: Math.round(cognitionScore),
        },
    }
}

export const getDrunkCategory = (score: number): DrunkCategory => {
    if (score <= 20) {
        return {
            label: 'Sober 😇',
            colorClass: 'text-neon-green',
            description: 'Steady hands. Clear mind. Probably safe to text your ex, but maybe do not.',
        }
    }

    if (score <= 50) {
        return {
            label: 'Buzzed 😏',
            colorClass: 'text-neon-yellow',
            description: 'A little floaty, a little spicy. Maybe switch to water for a bit.',
        }
    }

    if (score <= 80) {
        return {
            label: 'Drunk 💀',
            colorClass: 'text-neon-red',
            description: 'Coordination has left the chat. Time to call it and hydrate.',
        }
    }

    return {
        label: 'Wasted 🚗❌',
        colorClass: 'text-neon-red',
        description: 'No driving, no debates, no “one last game.” Secure snacks and rest.',
    }
}
