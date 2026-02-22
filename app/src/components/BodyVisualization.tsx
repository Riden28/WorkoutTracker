import { useState, useMemo } from 'react';
import type { MuscleId } from '@/types';
import { MUSCLE_GROUPS } from '@/data/exercises';
import { cn } from '@/lib/utils';

interface BodyVisualizationProps {
  musclePoints: Partial<Record<MuscleId, number>>;
  highlightedMuscles?: MuscleId[];
  previewPoints?: Partial<Record<MuscleId, number>>;
  showBothViews?: boolean;
  className?: string;
  interactive?: boolean;
  onMuscleClick?: (muscleId: MuscleId) => void;
}

// ---------------------------------------------------------------------------
// Each highlight asset maps to one or more MuscleIds.
// We compute the max progress % across the mapped muscles to decide opacity.
// ---------------------------------------------------------------------------

interface HighlightLayer {
  /** Image path under /assets/ */
  src: string;
  /** MuscleIds this highlight image represents */
  muscles: MuscleId[];
  /** Descriptive label shown in tooltip */
  label: string;
}

const FRONT_HIGHLIGHTS: HighlightLayer[] = [
  { src: '/assets/frontChestHighlighted.png',    muscles: ['chest'],             label: 'Chest' },
  { src: '/assets/frontShoulderHighlighted.png',  muscles: ['deltoids'],          label: 'Shoulders' },
  { src: '/assets/frontAbsHighlighted.png',       muscles: ['abs', 'obliques'],   label: 'Abs / Obliques' },
  { src: '/assets/frontBicepHighlighted.png',     muscles: ['biceps', 'forearms'],label: 'Biceps' },
  { src: '/assets/frontThighHighlighted.png',     muscles: ['quads'],             label: 'Quads' },
  { src: '/assets/frontCalfHighlighted.png',      muscles: ['calves'],            label: 'Calves' },
];

const BACK_HIGHLIGHTS: HighlightLayer[] = [
  { src: '/assets/backBackHighlighted.png',   muscles: ['lats', 'traps', 'rhomboids', 'teres_major', 'lower_back'], label: 'Back' },
  { src: '/assets/backTricepHighlighted.png', muscles: ['triceps'],    label: 'Triceps' },
  { src: '/assets/backGlutHighlighted.png',   muscles: ['glutes'],     label: 'Glutes' },
  { src: '/assets/backThighHighlighted.png',  muscles: ['hamstrings'], label: 'Hamstrings' },
];

// Compute the highest progress percentage across a set of muscles
function maxProgress(
  muscles: MuscleId[],
  musclePoints: Partial<Record<MuscleId, number>>,
  extraPoints?: Partial<Record<MuscleId, number>>,
): number {
  let best = 0;
  for (const m of muscles) {
    const pts = (musclePoints[m] || 0) + (extraPoints?.[m] || 0);
    const goal = MUSCLE_GROUPS[m]?.goal || 1;
    best = Math.max(best, (pts / goal) * 100);
  }
  return Math.min(best, 100);
}

// Check if any muscle in a layer is highlighted
function hasHighlightedMuscle(muscles: MuscleId[], highlighted: MuscleId[]): boolean {
  return muscles.some(m => highlighted.includes(m));
}

export function BodyVisualization({
  musclePoints,
  highlightedMuscles = [],
  previewPoints = {},
  showBothViews = true,
  className,
  interactive = false,
  onMuscleClick,
}: BodyVisualizationProps) {
  const [activeView, setActiveView] = useState<'front' | 'back'>('front');
  const [hoveredLayer, setHoveredLayer] = useState<HighlightLayer | null>(null);

  // For each layer compute its display opacity (0 = hidden, up to 1 = full)
  const layerOpacities = useMemo(() => {
    const map = new Map<string, number>();
    const allLayers = [...FRONT_HIGHLIGHTS, ...BACK_HIGHLIGHTS];
    for (const layer of allLayers) {
      const pct = maxProgress(layer.muscles, musclePoints, previewPoints);
      // Start showing at 1% with min opacity 0.25, max 1.0
      const opacity = pct > 0 ? 0.25 + (pct / 100) * 0.75 : 0;
      map.set(layer.src, opacity);
    }
    return map;
  }, [musclePoints, previewPoints]);

  const renderBodyView = (view: 'front' | 'back', sizeClass: string = 'w-full') => {
    const baseSrc = view === 'front'
      ? '/assets/frontViewUnhighlighted.png'
      : '/assets/backViewUnhighlighted.png';
    const layers = view === 'front' ? FRONT_HIGHLIGHTS : BACK_HIGHLIGHTS;

    return (
      <div className={cn('relative select-none', sizeClass)}>
        {/* Base unhighlighted body */}
        <img
          src={baseSrc}
          alt={`${view} view`}
          className="w-full h-auto block"
          draggable={false}
        />

        {/* Highlight layers stacked on top */}
        {layers.map((layer) => {
          const opacity = layerOpacities.get(layer.src) || 0;
          const isHighlighted = hasHighlightedMuscle(layer.muscles, highlightedMuscles);
          const isHovered = hoveredLayer?.src === layer.src;

          // Don't render if fully transparent and not highlighted / hovered
          if (opacity === 0 && !isHighlighted && !isHovered) return null;

          const displayOpacity = isHighlighted
            ? Math.max(opacity, 0.7)
            : isHovered
              ? Math.max(opacity, 0.5)
              : opacity;

          return (
            <img
              key={layer.src}
              src={layer.src}
              alt={layer.label}
              draggable={false}
              className={cn(
                'absolute inset-0 w-full h-full transition-opacity duration-300',
                (interactive || isHighlighted) && 'cursor-pointer',
                isHighlighted && 'animate-pulse',
              )}
              style={{
                opacity: displayOpacity,
                filter: isHighlighted
                  ? 'drop-shadow(0 0 8px rgba(59,130,246,0.6))'
                  : isHovered
                    ? 'drop-shadow(0 0 6px rgba(255,255,255,0.3))'
                    : 'none',
                pointerEvents: interactive ? 'auto' : 'none',
              }}
              onMouseEnter={() => interactive && setHoveredLayer(layer)}
              onMouseLeave={() => interactive && setHoveredLayer(null)}
              onClick={() => {
                if (interactive && onMuscleClick && layer.muscles.length > 0) {
                  onMuscleClick(layer.muscles[0]);
                }
              }}
            />
          );
        })}

        {/* Hover tooltip */}
        {interactive && hoveredLayer && hoveredLayer.muscles.some(_m =>
          (view === 'front' ? FRONT_HIGHLIGHTS : BACK_HIGHLIGHTS).some(l => l.src === hoveredLayer.src)
        ) && (() => {
          // Only show tooltip for the view the layer belongs to
          const belongsToView = (view === 'front' ? FRONT_HIGHLIGHTS : BACK_HIGHLIGHTS)
            .some(l => l.src === hoveredLayer.src);
          if (!belongsToView) return null;

          const tooltipLines = hoveredLayer.muscles.map(m => {
            const pts = musclePoints[m] || 0;
            const goal = MUSCLE_GROUPS[m]?.goal || 1;
            const pct = Math.min(100, Math.round((pts / goal) * 100));
            return { name: MUSCLE_GROUPS[m]?.name || m, pts, goal, pct };
          });

          return (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-black/90 border border-gray-700 rounded-lg px-3 py-2 pointer-events-none shadow-lg">
              <div className="text-xs font-semibold text-white mb-1">{hoveredLayer.label}</div>
              {tooltipLines.map(t => (
                <div key={t.name} className="text-[10px] text-gray-400 whitespace-nowrap">
                  {t.name}: {t.pts}/{t.goal} ({t.pct}%)
                </div>
              ))}
            </div>
          );
        })()}

        {/* View label */}
        <div className="text-center mt-1 text-[10px] text-gray-500 uppercase tracking-wider">
          {view}
        </div>
      </div>
    );
  };

  if (showBothViews) {
    return (
      <div className={cn('flex gap-6 justify-center items-start', className)}>
        {renderBodyView('front', 'w-[45%] max-w-[220px]')}
        {renderBodyView('back', 'w-[45%] max-w-[220px]')}
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* View toggle */}
      <div className="flex justify-center gap-2 mb-4">
        <button
          onClick={() => setActiveView('front')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeView === 'front'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700',
          )}
        >
          Front
        </button>
        <button
          onClick={() => setActiveView('back')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeView === 'back'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700',
          )}
        >
          Back
        </button>
      </div>

      {renderBodyView(activeView, 'max-w-[280px] mx-auto')}
    </div>
  );
}

// Compact version for small displays
export function BodyVisualizationCompact({
  musclePoints,
  highlightedMuscles = [],
  className,
}: Omit<BodyVisualizationProps, 'showBothViews' | 'previewPoints'>) {
  return (
    <BodyVisualization
      musclePoints={musclePoints}
      highlightedMuscles={highlightedMuscles}
      showBothViews={true}
      className={cn('scale-75', className)}
    />
  );
}
