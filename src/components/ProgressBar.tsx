type ProgressBarProps = {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100)

  return (
    <div className="w-full max-w-xl">
      <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.12em] text-white/60">
        <span>Progress</span>
        <span>
          {current}/{total}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/15">
        <div
          className="h-full rounded-full bg-gradient-to-r from-neon-green via-neon-yellow to-neon-red transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
