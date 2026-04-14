import type { PropsWithChildren } from 'react'

type TestCardProps = PropsWithChildren<{
  title: string
  subtitle: string
}>

export function TestCard({ title, subtitle, children }: TestCardProps) {
  return (
    <section className="glass-card mx-auto w-full max-w-xl rounded-3xl p-5 sm:p-7">
      <header className="mb-5 text-left">
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">Test Module</p>
        <h2 className="font-display text-2xl text-white sm:text-3xl">{title}</h2>
        <p className="mt-1 text-sm text-white/65">{subtitle}</p>
      </header>
      {children}
    </section>
  )
}
