# WorkoutTracker

A gamified weekly workout tracker built with React and TypeScript. Log exercises, earn muscle points, track your V-taper progress, and visualize which muscle groups you've been hitting with an interactive body map.

![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Vite](https://img.shields.io/badge/Vite-7-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-teal)

## Features

- **Dashboard** — Overview of weekly muscle points, V-taper progress, workout streak, and personal records
- **Body Visualization** — Interactive front/back body map highlighting trained muscle groups with intensity overlays
- **Workout Logger** — Log exercises with sets, reps, weight, and notes; points are automatically distributed across targeted muscles
- **History** — Browse current and archived workout weeks, export/import data
- **Gamification** — Earn points per muscle group, track streaks, and hit weekly goals
- **Data Persistence** — All data stored in localStorage with export/import support

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 |
| Language | TypeScript 5.9 |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 3.4 |
| UI Components | shadcn/ui (Radix UI primitives) |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/Riden28/WorkoutTracker.git
cd WorkoutTracker/app

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |

## Project Structure

```
app/
├── public/assets/          # Static assets (body map images)
├── src/
│   ├── components/
│   │   ├── BodyVisualization.tsx   # Interactive muscle map
│   │   ├── Dashboard.tsx           # Main stats overview
│   │   ├── History.tsx             # Workout history & archives
│   │   ├── WorkoutLogger.tsx       # Exercise logging form
│   │   └── ui/                     # shadcn/ui components
│   ├── data/
│   │   └── exercises.ts            # Exercise definitions & muscle mappings
│   ├── hooks/
│   │   ├── useAppData.ts           # Core app state & localStorage logic
│   │   └── use-mobile.ts           # Mobile breakpoint hook
│   ├── types/
│   │   └── index.ts                # TypeScript type definitions
│   ├── lib/utils.ts                # Utility functions
│   ├── App.tsx                     # Root component with tab navigation
│   └── main.tsx                    # Entry point
├── index.html
├── tailwind.config.js
├── vite.config.ts
└── package.json
assets/                             # Body map source images
```

## How It Works

1. **Log a workout** — Pick an exercise, enter sets/reps/weight, and submit
2. **Earn points** — Each exercise distributes points across the muscles it targets (compound exercises hit more muscles)
3. **Track progress** — The dashboard and body map show which muscles are on track for the week
4. **Weekly reset** — Archive your week and start fresh to keep pushing

## License

This project is for personal use.
