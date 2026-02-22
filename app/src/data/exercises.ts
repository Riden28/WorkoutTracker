import type { MuscleGroup, Exercise, MuscleId } from '@/types';

// Muscle groups with overlay positioning (percentage-based for the body image)
export const MUSCLE_GROUPS: Record<MuscleId, MuscleGroup> = {
  lats: {
    id: 'lats',
    name: 'Latissimus Dorsi',
    goal: 100,
    priority: 'high',
    overlayBox: { back: [55, 25, 35, 35] }
  },
  deltoids: {
    id: 'deltoids',
    name: 'Deltoids (Shoulders)',
    goal: 100,
    priority: 'high',
    overlayBox: { front: [15, 18, 20, 15], back: [15, 18, 20, 15] }
  },
  traps: {
    id: 'traps',
    name: 'Trapezius',
    goal: 80,
    priority: 'medium',
    overlayBox: { back: [40, 12, 25, 12] }
  },
  rhomboids: {
    id: 'rhomboids',
    name: 'Rhomboids',
    goal: 80,
    priority: 'medium',
    overlayBox: { back: [42, 20, 20, 10] }
  },
  teres_major: {
    id: 'teres_major',
    name: 'Teres Major',
    goal: 60,
    priority: 'medium',
    overlayBox: { back: [55, 28, 15, 12] }
  },
  obliques: {
    id: 'obliques',
    name: 'Obliques',
    goal: 60,
    priority: 'medium',
    overlayBox: { front: [22, 35, 12, 25] }
  },
  abs: {
    id: 'abs',
    name: 'Abdominals',
    goal: 80,
    priority: 'medium',
    overlayBox: { front: [35, 35, 18, 25] }
  },
  lower_back: {
    id: 'lower_back',
    name: 'Lower Back',
    goal: 60,
    priority: 'low',
    overlayBox: { back: [42, 38, 20, 15] }
  },
  chest: {
    id: 'chest',
    name: 'Pectorals',
    goal: 80,
    priority: 'low',
    overlayBox: { front: [30, 22, 28, 18] }
  },
  triceps: {
    id: 'triceps',
    name: 'Triceps',
    goal: 60,
    priority: 'low',
    overlayBox: { back: [12, 32, 10, 20] }
  },
  biceps: {
    id: 'biceps',
    name: 'Biceps',
    goal: 60,
    priority: 'low',
    overlayBox: { front: [28, 32, 10, 20] }
  },
  forearms: {
    id: 'forearms',
    name: 'Forearms',
    goal: 40,
    priority: 'low',
    overlayBox: { front: [10, 52, 12, 22], back: [10, 52, 12, 22] }
  },
  quads: {
    id: 'quads',
    name: 'Quadriceps',
    goal: 100,
    priority: 'low',
    overlayBox: { front: [28, 62, 16, 30] }
  },
  hamstrings: {
    id: 'hamstrings',
    name: 'Hamstrings',
    goal: 80,
    priority: 'low',
    overlayBox: { back: [28, 62, 16, 30] }
  },
  calves: {
    id: 'calves',
    name: 'Calves',
    goal: 40,
    priority: 'low',
    overlayBox: { front: [28, 92, 14, 20], back: [28, 92, 14, 20] }
  },
  glutes: {
    id: 'glutes',
    name: 'Glutes',
    goal: 80,
    priority: 'low',
    overlayBox: { back: [35, 52, 32, 15] }
  }
};

// Exercise database with V-Taper focused point system
// Points are scaled down by factor of 5 from the original (30 -> 6, etc.)
export const EXERCISES: Record<string, Exercise> = {
  // Day 1 - Back & Core exercises
  pull_ups: {
    id: 'pull_ups',
    name: 'Pull-ups / Chin-ups',
    type: 'compound',
    muscles: { lats: 6, traps: 4, rhomboids: 4, abs: 2, biceps: 2, teres_major: 2, forearms: 1 },
    difficulty: 'hard'
  },
  lat_pulldown: {
    id: 'lat_pulldown',
    name: 'Lat Pulldown',
    type: 'compound',
    muscles: { lats: 5, traps: 2, rhomboids: 2, abs: 1, biceps: 1, teres_major: 1 },
    difficulty: 'medium'
  },
  barbell_rows: {
    id: 'barbell_rows',
    name: 'Barbell / Dumbbell Rows',
    type: 'compound',
    muscles: { lats: 4, traps: 5, rhomboids: 5, abs: 2, biceps: 1, lower_back: 2, teres_major: 1 },
    difficulty: 'hard'
  },
  inverted_rows: {
    id: 'inverted_rows',
    name: 'Inverted Rows',
    type: 'compound',
    muscles: { lats: 4, traps: 4, rhomboids: 4, abs: 2, biceps: 1, teres_major: 1 },
    difficulty: 'medium'
  },
  one_arm_rows: {
    id: 'one_arm_rows',
    name: 'One-Arm Dumbbell Rows',
    type: 'compound',
    muscles: { lats: 4, traps: 3, rhomboids: 3, abs: 2, biceps: 1, lower_back: 1, teres_major: 1 },
    difficulty: 'medium'
  },
  incline_rows: {
    id: 'incline_rows',
    name: 'Incline Bench Rows',
    type: 'compound',
    muscles: { lats: 4, traps: 3, rhomboids: 3, abs: 1, biceps: 1, teres_major: 1 },
    difficulty: 'medium'
  },

  // Day 2 - Shoulders & Arms exercises
  lateral_raise: {
    id: 'lateral_raise',
    name: 'Dumbbell Lateral Raise',
    type: 'isolation',
    muscles: { deltoids: 6, traps: 1, rhomboids: 1, abs: 1 },
    difficulty: 'easy'
  },
  shoulder_press: {
    id: 'shoulder_press',
    name: 'Shoulder Press',
    type: 'compound',
    muscles: { deltoids: 5, traps: 2, rhomboids: 2, abs: 2, triceps: 2 },
    difficulty: 'medium'
  },
  rear_delt_raise: {
    id: 'rear_delt_raise',
    name: 'Rear Delt Raise',
    type: 'isolation',
    muscles: { deltoids: 4, traps: 4, rhomboids: 4, abs: 1 },
    difficulty: 'easy'
  },
  face_pulls: {
    id: 'face_pulls',
    name: 'Face Pulls',
    type: 'isolation',
    muscles: { deltoids: 4, traps: 4, rhomboids: 4, abs: 1 },
    difficulty: 'easy'
  },
  bicep_curl: {
    id: 'bicep_curl',
    name: 'Bicep Curls',
    type: 'isolation',
    muscles: { biceps: 5, forearms: 1 },
    difficulty: 'easy'
  },
  tricep_dips: {
    id: 'tricep_dips',
    name: 'Triceps Dips',
    type: 'compound',
    muscles: { triceps: 5, chest: 2, deltoids: 2, abs: 1 },
    difficulty: 'medium'
  },
  tricep_extensions: {
    id: 'tricep_extensions',
    name: 'Triceps Extensions',
    type: 'isolation',
    muscles: { triceps: 5, deltoids: 1 },
    difficulty: 'easy'
  },
  upright_row: {
    id: 'upright_row',
    name: 'Upright Row',
    type: 'compound',
    muscles: { deltoids: 4, traps: 4, biceps: 2, forearms: 1 },
    difficulty: 'medium'
  },

  // Day 3 - Legs & Core exercises
  squat: {
    id: 'squat',
    name: 'Squats',
    type: 'compound',
    muscles: { quads: 6, glutes: 4, hamstrings: 2, abs: 2, traps: 1, lower_back: 1 },
    difficulty: 'hard'
  },
  deadlift: {
    id: 'deadlift',
    name: 'Deadlift',
    type: 'compound',
    muscles: { traps: 3, rhomboids: 3, lats: 1, lower_back: 2, abs: 2, biceps: 1, quads: 2, hamstrings: 4, glutes: 4, forearms: 1 },
    difficulty: 'hard'
  },
  walking_lunges: {
    id: 'walking_lunges',
    name: 'Walking Lunges',
    type: 'compound',
    muscles: { quads: 4, glutes: 3, hamstrings: 2, abs: 2, calves: 1 },
    difficulty: 'medium'
  },
  calf_raises: {
    id: 'calf_raises',
    name: 'Calf Raises',
    type: 'isolation',
    muscles: { calves: 5 },
    difficulty: 'easy'
  },
  goblet_squat: {
    id: 'goblet_squat',
    name: 'Goblet Squat',
    type: 'compound',
    muscles: { quads: 5, glutes: 3, hamstrings: 2, abs: 2, biceps: 1 },
    difficulty: 'easy'
  },
  hip_hinge: {
    id: 'hip_hinge',
    name: 'Single-Leg Hip Hinge',
    type: 'compound',
    muscles: { hamstrings: 4, glutes: 3, lower_back: 2, abs: 2 },
    difficulty: 'easy'
  },

  // Day 4 - Pull exercises
  assisted_pullups: {
    id: 'assisted_pullups',
    name: 'Assisted Pull-ups',
    type: 'compound',
    muscles: { lats: 5, traps: 3, rhomboids: 3, abs: 2, biceps: 2, teres_major: 1 },
    difficulty: 'easy'
  },
  band_lat_pulldown: {
    id: 'band_lat_pulldown',
    name: 'Band Lat Pulldown',
    type: 'isolation',
    muscles: { lats: 4, traps: 2, rhomboids: 2, biceps: 1 },
    difficulty: 'easy'
  },
  band_rows: {
    id: 'band_rows',
    name: 'Band Rows',
    type: 'compound',
    muscles: { lats: 3, traps: 3, rhomboids: 3, abs: 1, biceps: 1 },
    difficulty: 'easy'
  },

  // Day 5 - Push exercises
  pushups: {
    id: 'pushups',
    name: 'Push-ups',
    type: 'compound',
    muscles: { chest: 4, deltoids: 2, triceps: 2, traps: 1, rhomboids: 1, abs: 1 },
    difficulty: 'easy'
  },
  bench_press: {
    id: 'bench_press',
    name: 'Bench Press',
    type: 'compound',
    muscles: { chest: 4, deltoids: 2, triceps: 2, traps: 1, rhomboids: 1, abs: 1 },
    difficulty: 'medium'
  },
  chest_fly: {
    id: 'chest_fly',
    name: 'Chest Fly',
    type: 'isolation',
    muscles: { chest: 5, deltoids: 2, biceps: 1 },
    difficulty: 'easy'
  },

  // Day 6 - Core & Conditioning exercises
  planks: {
    id: 'planks',
    name: 'Planks',
    type: 'isolation',
    muscles: { abs: 6, traps: 1, rhomboids: 1, lower_back: 2, deltoids: 1 },
    difficulty: 'easy'
  },
  hanging_leg_raise: {
    id: 'hanging_leg_raise',
    name: 'Hanging Leg Raise',
    type: 'isolation',
    muscles: { abs: 4, lats: 1, biceps: 1, forearms: 1 },
    difficulty: 'medium'
  },
  russian_twist: {
    id: 'russian_twist',
    name: 'Russian Twist',
    type: 'isolation',
    muscles: { obliques: 5, abs: 3 },
    difficulty: 'easy'
  },
  side_plank: {
    id: 'side_plank',
    name: 'Side Plank',
    type: 'isolation',
    muscles: { obliques: 5, abs: 2, deltoids: 1 },
    difficulty: 'medium'
  },
  cable_woodchopper: {
    id: 'cable_woodchopper',
    name: 'Cable Woodchopper',
    type: 'isolation',
    muscles: { obliques: 5, abs: 2, deltoids: 1 },
    difficulty: 'medium'
  },
  rowing: {
    id: 'rowing',
    name: 'Rowing Machine',
    type: 'compound',
    muscles: { lats: 3, traps: 2, rhomboids: 2, quads: 2, hamstrings: 2, abs: 2, biceps: 2 },
    difficulty: 'medium'
  },
  cycling: {
    id: 'cycling',
    name: 'Cycling',
    type: 'compound',
    muscles: { quads: 4, hamstrings: 2, glutes: 2, calves: 2 },
    difficulty: 'easy'
  },

  // Additional exercises
  dumbbell_pullover: {
    id: 'dumbbell_pullover',
    name: 'Dumbbell Pullover',
    type: 'isolation',
    muscles: { lats: 4, chest: 2, triceps: 1, abs: 1 },
    difficulty: 'medium'
  },
  straight_arm_pulldown: {
    id: 'straight_arm_pulldown',
    name: 'Straight-Arm Pulldown',
    type: 'isolation',
    muscles: { lats: 5, teres_major: 2, abs: 1 },
    difficulty: 'easy'
  },
  front_raise: {
    id: 'front_raise',
    name: 'Front Raise',
    type: 'isolation',
    muscles: { deltoids: 4, abs: 1 },
    difficulty: 'easy'
  },
  shrugs: {
    id: 'shrugs',
    name: 'Barbell Shrugs',
    type: 'isolation',
    muscles: { traps: 5, rhomboids: 2, forearms: 1 },
    difficulty: 'easy'
  },
  leg_extension: {
    id: 'leg_extension',
    name: 'Leg Extension',
    type: 'isolation',
    muscles: { quads: 5 },
    difficulty: 'easy'
  },
  leg_curl: {
    id: 'leg_curl',
    name: 'Leg Curl',
    type: 'isolation',
    muscles: { hamstrings: 5 },
    difficulty: 'easy'
  },
  hip_thrust: {
    id: 'hip_thrust',
    name: 'Hip Thrust',
    type: 'isolation',
    muscles: { glutes: 5, hamstrings: 2, abs: 1 },
    difficulty: 'medium'
  },
  cable_crunch: {
    id: 'cable_crunch',
    name: 'Cable Crunch',
    type: 'isolation',
    muscles: { abs: 5, obliques: 2 },
    difficulty: 'easy'
  }
};

// Get color based on progress percentage
export function getProgressColor(percentage: number): string {
  if (percentage >= 100) return '#ef4444'; // Red - goal reached!
  if (percentage >= 75) return '#f59e0b';  // Yellow - getting hot
  if (percentage >= 50) return '#10b981';  // Green - making progress
  if (percentage >= 25) return '#3b82f6';  // Blue - started
  return '#e5e7eb'; // Gray/White - not started
}

// Get intensity level for animations
export function getIntensityLevel(percentage: number): 'none' | 'low' | 'medium' | 'high' | 'intense' {
  if (percentage >= 100) return 'intense';
  if (percentage >= 75) return 'high';
  if (percentage >= 50) return 'medium';
  if (percentage >= 25) return 'low';
  return 'none';
}

// Get V-taper specific muscles
export const V_TAPER_MUSCLES: MuscleId[] = ['lats', 'deltoids', 'traps', 'rhomboids'];

// Get exercises targeting a specific muscle
export function getExercisesForMuscle(muscleId: MuscleId): Exercise[] {
  return Object.values(EXERCISES).filter(ex => muscleId in ex.muscles);
}

// Get exercises by day focus
export const DAY_FOCUS = {
  'Day 1 - Back & Core': ['pull_ups', 'lat_pulldown', 'barbell_rows', 'inverted_rows', 'one_arm_rows', 'incline_rows', 'face_pulls', 'hanging_leg_raise'],
  'Day 2 - Shoulders & Arms': ['lateral_raise', 'shoulder_press', 'rear_delt_raise', 'face_pulls', 'bicep_curl', 'tricep_dips', 'tricep_extensions', 'upright_row'],
  'Day 3 - Legs & Core': ['squat', 'deadlift', 'walking_lunges', 'calf_raises', 'goblet_squat', 'hip_hinge', 'planks'],
  'Day 4 - Pull': ['assisted_pullups', 'inverted_rows', 'one_arm_rows', 'band_lat_pulldown', 'band_rows', 'lat_pulldown', 'face_pulls'],
  'Day 5 - Push': ['pushups', 'bench_press', 'shoulder_press', 'lateral_raise', 'chest_fly', 'tricep_dips'],
  'Day 6 - Core & Conditioning': ['planks', 'hanging_leg_raise', 'russian_twist', 'side_plank', 'rowing', 'cycling'],
  'Day 7 - Rest': []
};
