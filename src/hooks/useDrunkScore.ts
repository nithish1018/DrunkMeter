import { useMemo } from 'react'
import { computeFinalScore, getDrunkCategory } from '../utils/scoring'
import type { RawTestResults, ScoreBreakdown } from '../utils/types'

const emptyBreakdown: ScoreBreakdown = {
    reactionScore: 0,
    accuracyScore: 0,
    stabilityScore: 0,
    rhythmScore: 0,
    cognitionScore: 0
}

export const useDrunkScore = (results: RawTestResults | null) => {
    const scoreState = useMemo<{ finalScore: number; breakdown: ScoreBreakdown }>(() => {
        if (!results) {
            return { finalScore: 0, breakdown: emptyBreakdown }
        }

        return computeFinalScore(results)
    }, [results])

    return {
        ...scoreState,
        category: getDrunkCategory(scoreState.finalScore),
    }
}
