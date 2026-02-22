// Muscle groups for V-taper tracking
export type MuscleId = 
  | 'lats' | 'deltoids' | 'traps' | 'rhomboids' | 'teres_major'
  | 'obliques' | 'abs' | 'lower_back' | 'chest' | 'triceps'
  | 'biceps' | 'forearms' | 'quads' | 'hamstrings' | 'calves' | 'glutes';

export interface MuscleGroup {
  id: MuscleId;
  name: string;
  goal: number;
  priority: 'high' | 'medium' | 'low';
  // Bounding box for overlay positioning [x, y, width, height] in percentages
  overlayBox: { front?: [number, number, number, number]; back?: [number, number, number, number] };
}

export interface Exercise {
  id: string;
  name: string;
  type: 'compound' | 'isolation';
  muscles: Partial<Record<MuscleId, number>>;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Workout {
  id: string;
  date: string;
  exerciseId: string;
  exerciseName: string;
  type: 'compound' | 'isolation';
  sets: number;
  reps: number;
  weight: number;
  notes: string;
  pointsEarned: Partial<Record<MuscleId, number>>;
  totalPoints: number;
}

export interface MuscleProgress {
  points: number;
  goal: number;
  percentage: number;
}

export interface AppData {
  workouts: Workout[];
  musclePoints: Partial<Record<MuscleId, number>>;
  startDate: string;
  currentWeek: number;
}

// Archived week snapshot
export interface ArchivedWeek {
  id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  workouts: Workout[];
  musclePoints: Partial<Record<MuscleId, number>>;
  totalPoints: number;
  vTaperPercentage: number;
}

// Personal record for an exercise
export interface PersonalRecord {
  exerciseId: string;
  maxWeight: number;
  maxReps: number;
  maxSets: number;
  date: string;
}

export type ViewMode = 'dashboard' | 'log' | 'history';
