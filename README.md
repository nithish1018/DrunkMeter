# Drunk Test

Mobile-first web app that runs a playful set of motor and cognition checks and outputs a final "Drunk Score" from 0-100.

Built with React + TypeScript + Vite + Tailwind CSS.

## Highlights

- Neon dark theme with glassmorphism UI
- Mobile-first layout and interactions
- Device motion sensor support for tilt-based tests
- 5-step sequential test flow
- Weighted score breakdown and final category
- Best score persistence in localStorage (lowest score is best)
- Native share support with URL

## Test Flow

1. Reaction Time
   - Wait for green, then tap as fast as possible
   - False starts are penalized

2. Tap Accuracy
   - Tap moving target quickly before time runs out
   - Tracks attempts, hits, and misses

3. Hold Steady + Moving Dot
   - Dot follows device orientation
   - Keep dot inside center ring as much as possible
   - Uses gamma/beta orientation data

4. Color Chaos (Stroop-style)
   - Tap the word meaning, not the text color
   - Measures cognitive interference + speed

5. Tilt Stability
   - Hold phone steady while orientation drift is measured
   - Includes fallback path if sensors are unavailable

## Scoring

Each module is normalized to a 0-100 penalty-style score (higher means more impaired), then combined:

- Reaction: 25%
- Tap Accuracy: 20%
- Hold Steady Dot: 20%
- Color Chaos: 15%
- Tilt Stability: 20%

Final score adds a small random offset (+/- 5) for realism and maps to:

- 0-20: Sober
- 21-50: Buzzed
- 51-80: Drunk
- 81-100: Wasted

## Tech Stack

- React 19
- TypeScript
- Vite 8
- Tailwind CSS 3 + PostCSS + Autoprefixer

## Project Structure

```text
src/
  components/   reusable UI components
  hooks/        custom hooks (score + orientation)
  pages/        page-level screens
  tests/        individual game/test modules
  utils/        types + scoring logic
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Run in development

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Sensor Permissions

Some tests use `deviceorientation`.

- On iOS Safari, motion permission prompt may appear.
- If permission is denied, sensor-dependent tests show fallback behavior.

## Notes

- This app is for entertainment only, not a medical or legal sobriety test.
- Best score shown in UI is the lowest score achieved so far and is stored in localStorage.
