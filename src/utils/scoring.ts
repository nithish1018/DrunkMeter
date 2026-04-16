import type { DrunkCategory, RawTestResults, ScoreBreakdown } from './types'

const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value))

export const normalizeReactionScore = (
    reactionTimeMs: number,
    falseStarts: number,
): number => {
    const adjusted = reactionTimeMs + falseStarts * 90
    const normalized = ((adjusted - 220) / (1200 - 220)) * 100
    return clamp(normalized, 0, 100)
}

export const normalizeAccuracyScore = (hits: number, attempts: number): number => {
    if (attempts <= 0) return 100
    const missRatio = 1 - hits / attempts
    // Lower miss ratios should not be overly punished.
    const softenedPenalty = Math.pow(clamp(missRatio, 0, 1), 1.35) * 100
    return clamp(softenedPenalty, 0, 100)
}

export const normalizeStabilityScore = (averageDeviation: number): number => {
    const normalized = (averageDeviation / 24) * 100
    return clamp(normalized, 0, 100)
}

export const normalizeRhythmScore = (
    averageOffsetMs: number,
    taps: number,
    durationMs: number,
): number => {
    const driftPenalty = clamp((averageOffsetMs / 95) * 65, 0, 65)
    const expectedSamples = Math.max(1, durationMs / 80)
    const stabilityRatio = clamp(taps / expectedSamples, 0, 1)
    const instabilityPenalty = (1 - stabilityRatio) * 25

    return clamp(driftPenalty + instabilityPenalty, 0, 100)
}

export const normalizeCognitionScore = (
    rounds: number,
    correct: number,
    averageResponseMs: number,
): number => {
    if (rounds <= 0) return 100

    const errorRatio = 1 - correct / rounds
    const errorScore = clamp(errorRatio * 100, 0, 100)
    const speedPenalty = clamp(((averageResponseMs - 450) / 1700) * 25, 0, 25)

    return clamp(errorScore * 0.65 + speedPenalty, 0, 100)
}

export const computeFinalScore = (
    results: RawTestResults,
    randomOffset = (Math.random() * 8) - 4,
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
        results.rhythm.durationMs,
    )
    const cognitionScore = normalizeCognitionScore(
        results.cognition.rounds,
        results.cognition.correct,
        results.cognition.averageResponseMs,
    )
    const stabilityScore = normalizeStabilityScore(results.stability.averageDeviation)

    const weighted =
        reactionScore * 0.2 +
        accuracyScore * 0.24 +
        rhythmScore * 0.14 +
        cognitionScore * 0.16 +
        stabilityScore * 0.26

    // Global calibration to keep sober baseline from clustering too high.
    const finalScore = clamp(Math.round(weighted - 8 + randomOffset), 0, 100)

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
    if (score <= 10) {
        return {
            label: 'Stone Cold Sober 🧊',
            colorClass: 'text-neon-green',
            description: 'Locked in. Reflexes are crisp and your balance is elite.',
        }
    }

    if (score <= 20) {
        return {
            label: 'Sober 😇',
            colorClass: 'text-neon-green',
            description: 'Steady hands, clear decisions. You are in full control.',
        }
    }

    if (score <= 35) {
        return {
            label: 'Tipsy 🙂',
            colorClass: 'text-lime-300',
            description: 'Tiny wobble, mostly fine. Hydration bonus round suggested.',
        }
    }

    if (score <= 50) {
        return {
            label: 'Buzzed 😏',
            colorClass: 'text-neon-yellow',
            description: 'A little floaty and chatty. Keep snacks and water nearby.',
        }
    }

    if (score <= 65) {
        return {
            label: 'Wobbly 🤪',
            colorClass: 'text-amber-300',
            description: 'Coordination is negotiating with gravity. Slow down and reset.',
        }
    }

    if (score <= 80) {
        return {
            label: 'Drunk 💀',
            colorClass: 'text-neon-red',
            description: 'Coordination has left the chat. Time to call it and hydrate.',
        }
    }

    if (score <= 92) {
        return {
            label: 'Very Drunk 🚨',
            colorClass: 'text-red-400',
            description: 'High wobble detected. No keys, no risky decisions, just rest.',
        }
    }

    return {
        label: 'Wasted 🚗❌',
        colorClass: 'text-neon-red',
        description: 'No driving, no debates, no “one last game.” Secure snacks and rest.',
    }
}
