export type ReactionResult = {
  reactionTimeMs: number
  falseStarts: number
}

export type AccuracyResult = {
  attempts: number
  hits: number
  misses: number
  durationMs: number
}

export type StabilityResult = {
  samples: number
  averageDeviation: number
  durationMs: number
  usedSensor: boolean
}

export type RhythmResult = {
  taps: number
  averageOffsetMs: number
  durationMs: number
}

export type CognitionResult = {
  rounds: number
  correct: number
  averageResponseMs: number
}

export type RawTestResults = {
  reaction: ReactionResult
  accuracy: AccuracyResult
  rhythm: RhythmResult
  cognition: CognitionResult
  stability: StabilityResult
}

export type ScoreBreakdown = {
  reactionScore: number
  accuracyScore: number
  rhythmScore: number
  cognitionScore: number
  stabilityScore: number
}

export type DrunkCategory = {
  label:
  | 'Stone Cold Sober 🧊'
  | 'Sober 😇'
  | 'Tipsy 🙂'
  | 'Buzzed 😏'
  | 'Wobbly 🤪'
  | 'Drunk 💀'
  | 'Very Drunk 🚨'
  | 'Wasted 🚗❌'
  colorClass: string
  description: string
}
