import { useCallback, useState } from 'react'
import { LandingPage } from './pages/LandingPage'
import { LoadingPage } from './pages/LoadingPage'
import { ResultPage } from './pages/ResultPage'
import { TestFlowPage } from './pages/TestFlowPage'
import type { RawTestResults } from './utils/types'

type AppStage = 'landing' | 'tests' | 'loading' | 'result'

const BEST_SCORE_KEY = 'drunk-test-best-score'

function App() {
  const [stage, setStage] = useState<AppStage>('landing')
  const [results, setResults] = useState<RawTestResults | null>(null)
  const [bestScore, setBestScore] = useState<number | null>(() => {
    const saved = window.localStorage.getItem(BEST_SCORE_KEY)
    if (!saved) return null

    const parsed = Number(saved)
    if (!Number.isNaN(parsed)) {
      return parsed
    }

    return null
  })

  const persistBestScore = useCallback(
    (score: number) => {
      // Lower score means more sober, so lower is considered better.
      const shouldUpdate = bestScore === null || score < bestScore
      if (!shouldUpdate) return

      setBestScore(score)
      window.localStorage.setItem(BEST_SCORE_KEY, String(score))
    },
    [bestScore],
  )

  const restartFlow = () => {
    setResults(null)
    setStage('landing')
  }

  if (stage === 'landing') {
    return (
      <LandingPage
        bestScore={bestScore}
        onStart={() => {
          window.navigator.vibrate?.(30)
          setResults(null)
          setStage('tests')
        }}
      />
    )
  }

  if (stage === 'tests') {
    return (
      <TestFlowPage
        onComplete={(nextResults) => {
          setResults(nextResults)
          setStage('loading')
        }}
      />
    )
  }

  if (stage === 'loading') {
    return (
      <LoadingPage
        onDone={() => {
          window.navigator.vibrate?.([80, 50, 80])
          setStage('result')
        }}
      />
    )
  }

  if (!results) {
    return <LandingPage bestScore={bestScore} onStart={() => setStage('tests')} />
  }

  return (
    <ResultPage
      results={results}
      bestScore={bestScore}
      onScoreComputed={persistBestScore}
      onRestart={restartFlow}
    />
  )
}

export default App
