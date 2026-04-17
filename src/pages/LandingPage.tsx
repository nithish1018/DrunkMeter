import { Button } from '../components/Button'

type LandingPageProps = {
    bestScore: number | null
    onStart: () => void
}

export function LandingPage({ bestScore, onStart }: LandingPageProps) {
    return (
        <main className="mx-auto flex min-h-svh w-full max-w-xl flex-col justify-center px-4 py-8 text-center sm:px-6">
            <h1 className="font-display text-5xl text-white sm:text-6xl">Drunk Test 🍺</h1>
            <p className="mx-auto mt-4 max-w-sm text-sm text-white/70">
                Five quick tests. One chaotic score. Best on mobile with motion sensors enabled.
            </p>

            <div className="mt-8 rounded-3xl border border-white/15 bg-white/5 p-4 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.12em] text-white/50">Best score (lowest)</p>
                <p className="mt-1 text-2xl font-semibold text-neon-yellow">
                    {bestScore !== null ? `${bestScore}%` : 'No runs yet'}
                </p>
            </div>

            <div className="mt-7">
                <Button className="px-8 py-4 text-base" onClick={onStart}>
                    Start Test
                </Button>
            </div>
        </main>
    )
}
