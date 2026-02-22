import { useState, useEffect, useCallback, useMemo } from 'react';
import type { AppData, Workout, MuscleId, ArchivedWeek, PersonalRecord } from '@/types';
import { MUSCLE_GROUPS, EXERCISES, V_TAPER_MUSCLES } from '@/data/exercises';

const STORAGE_KEY = 'vtaper-tracker-data';
const ARCHIVE_KEY = 'vtaper-tracker-archive';
const PR_KEY = 'vtaper-tracker-prs';

const initialData: AppData = {
  workouts: [],
  musclePoints: {},
  startDate: new Date().toISOString(),
  currentWeek: 1
};

export function useAppData() {
  const [data, setData] = useState<AppData>(initialData);
  const [archivedWeeks, setArchivedWeeks] = useState<ArchivedWeek[]>([]);
  const [personalRecords, setPersonalRecords] = useState<Record<string, PersonalRecord>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setData({ ...initialData, ...parsed });
      } catch (e) {
        console.error('Failed to parse stored data:', e);
      }
    }

    const storedArchive = localStorage.getItem(ARCHIVE_KEY);
    if (storedArchive) {
      try {
        setArchivedWeeks(JSON.parse(storedArchive));
      } catch (e) {
        console.error('Failed to parse archive:', e);
      }
    }

    const storedPRs = localStorage.getItem(PR_KEY);
    if (storedPRs) {
      try {
        setPersonalRecords(JSON.parse(storedPRs));
      } catch (e) {
        console.error('Failed to parse PRs:', e);
      }
    }

    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archivedWeeks));
    }
  }, [archivedWeeks, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(PR_KEY, JSON.stringify(personalRecords));
    }
  }, [personalRecords, isLoaded]);

  // Calculate muscle progress
  const muscleProgress = Object.entries(MUSCLE_GROUPS).map(([id, info]) => {
    const points = data.musclePoints[id as MuscleId] || 0;
    const goal = info.goal;
    const percentage = Math.min(100, (points / goal) * 100);
    return {
      id: id as MuscleId,
      name: info.name,
      points,
      goal,
      percentage,
      priority: info.priority
    };
  });

  // Calculate V-taper progress
  const vTaperProgress = {
    points: V_TAPER_MUSCLES.reduce((sum, m) => sum + (data.musclePoints[m] || 0), 0),
    goal: V_TAPER_MUSCLES.reduce((sum, m) => sum + MUSCLE_GROUPS[m].goal, 0),
    percentage: 0
  };
  vTaperProgress.percentage = Math.min(100, (vTaperProgress.points / vTaperProgress.goal) * 100);

  // Get total points
  const totalPoints = Object.values(data.musclePoints).reduce((sum, p) => sum + p, 0);

  // Get this week's workouts
  const getWeekWorkouts = useCallback(() => {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    weekStart.setHours(0, 0, 0, 0);
    return data.workouts.filter(w => new Date(w.date) >= weekStart);
  }, [data.workouts]);

  // Calculate workout streak (consecutive days with at least one workout)
  const workoutStreak = useMemo(() => {
    if (data.workouts.length === 0) return 0;
    
    const workoutDays = new Set(
      data.workouts.map(w => new Date(w.date).toISOString().split('T')[0])
    );
    const sortedDays = [...workoutDays].sort().reverse();
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // Streak must include today or yesterday
    if (sortedDays[0] !== today && sortedDays[0] !== yesterday) return 0;
    
    let streak = 1;
    for (let i = 1; i < sortedDays.length; i++) {
      const prevDate = new Date(sortedDays[i - 1]);
      const currDate = new Date(sortedDays[i]);
      const diffDays = (prevDate.getTime() - currDate.getTime()) / 86400000;
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [data.workouts]);

  // Update personal records
  const updatePR = useCallback((exerciseId: string, sets: number, reps: number, weight: number) => {
    setPersonalRecords(prev => {
      const existing = prev[exerciseId];
      const updated = { ...prev };
      
      if (!existing) {
        updated[exerciseId] = { exerciseId, maxWeight: weight, maxReps: reps, maxSets: sets, date: new Date().toISOString() };
      } else {
        let changed = false;
        if (weight > existing.maxWeight) { updated[exerciseId] = { ...existing, maxWeight: weight, date: new Date().toISOString() }; changed = true; }
        if (reps > existing.maxReps) { updated[exerciseId] = { ...(changed ? updated[exerciseId] : existing), maxReps: reps, date: new Date().toISOString() }; changed = true; }
        if (sets > existing.maxSets) { updated[exerciseId] = { ...(changed ? updated[exerciseId] : existing), maxSets: sets, date: new Date().toISOString() }; }
      }
      return updated;
    });
  }, []);

  // Log a new workout
  const logWorkout = useCallback((exerciseId: string, sets: number, reps: number, weight: number, notes: string) => {
    const exercise = EXERCISES[exerciseId];
    if (!exercise) return null;

    // Calculate points earned
    const pointsEarned: Partial<Record<MuscleId, number>> = {};
    Object.entries(exercise.muscles).forEach(([muscle, basePoints]) => {
      const earned = Math.min((basePoints || 0) * sets, 10);
      pointsEarned[muscle as MuscleId] = earned;
    });

    const workout: Workout = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      exerciseId,
      exerciseName: exercise.name,
      type: exercise.type,
      sets,
      reps,
      weight,
      notes,
      pointsEarned,
      totalPoints: Object.values(pointsEarned).reduce((sum, p) => sum + (p || 0), 0)
    };

    setData(prev => ({
      ...prev,
      workouts: [...prev.workouts, workout],
      musclePoints: Object.entries(pointsEarned).reduce((acc, [muscle, points]) => {
        acc[muscle as MuscleId] = (acc[muscle as MuscleId] || 0) + (points || 0);
        return acc;
      }, { ...prev.musclePoints })
    }));

    // Update personal records
    updatePR(exerciseId, sets, reps, weight);

    return workout;
  }, [updatePR]);

  // Preview points for a workout (without saving)
  const previewWorkout = useCallback((exerciseId: string, sets: number) => {
    const exercise = EXERCISES[exerciseId];
    if (!exercise) return null;

    const previewPoints: Partial<Record<MuscleId, number>> = {};
    const newTotals: Partial<Record<MuscleId, number>> = {};
    
    Object.entries(exercise.muscles).forEach(([muscle, basePoints]) => {
      const earned = Math.min((basePoints || 0) * sets, 10);
      previewPoints[muscle as MuscleId] = earned;
      newTotals[muscle as MuscleId] = (data.musclePoints[muscle as MuscleId] || 0) + earned;
    });

    return { previewPoints, newTotals };
  }, [data.musclePoints]);

  // Archive current week and reset
  const resetProgress = useCallback(() => {
    // Archive current week if there are workouts
    if (data.workouts.length > 0) {
      const archiveEntry: ArchivedWeek = {
        id: `week-${data.currentWeek}-${Date.now()}`,
        weekNumber: data.currentWeek,
        startDate: data.startDate,
        endDate: new Date().toISOString(),
        workouts: data.workouts,
        musclePoints: data.musclePoints,
        totalPoints: Object.values(data.musclePoints).reduce((s, p) => s + p, 0),
        vTaperPercentage: vTaperProgress.percentage,
      };
      setArchivedWeeks(prev => [archiveEntry, ...prev]);
    }

    setData(prev => ({
      ...initialData,
      currentWeek: prev.currentWeek + 1,
      startDate: new Date().toISOString()
    }));
  }, [data, vTaperProgress.percentage]);

  // Delete a workout
  const deleteWorkout = useCallback((workoutId: string) => {
    setData(prev => {
      const workout = prev.workouts.find(w => w.id === workoutId);
      if (!workout) return prev;

      const newMusclePoints = { ...prev.musclePoints };
      Object.entries(workout.pointsEarned).forEach(([muscle, points]) => {
        newMusclePoints[muscle as MuscleId] = Math.max(0, (newMusclePoints[muscle as MuscleId] || 0) - (points || 0));
      });

      return {
        ...prev,
        workouts: prev.workouts.filter(w => w.id !== workoutId),
        musclePoints: newMusclePoints
      };
    });
  }, []);

  // Delete an archived week
  const deleteArchivedWeek = useCallback((archiveId: string) => {
    setArchivedWeeks(prev => prev.filter(w => w.id !== archiveId));
  }, []);

  // Export all data as JSON (for saving to a file)
  const exportData = useCallback(() => {
    const exportPayload = {
      version: 1,
      exportDate: new Date().toISOString(),
      currentData: data,
      archivedWeeks,
      personalRecords,
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `physique-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [data, archivedWeeks, personalRecords]);

  // Import data from a JSON file
  const importData = useCallback((jsonString: string): { success: boolean; message: string } => {
    try {
      const imported = JSON.parse(jsonString);
      
      if (imported.version !== 1) {
        return { success: false, message: 'Unsupported file format version' };
      }

      if (imported.currentData) {
        setData({ ...initialData, ...imported.currentData });
      }
      if (imported.archivedWeeks && Array.isArray(imported.archivedWeeks)) {
        setArchivedWeeks(imported.archivedWeeks);
      }
      if (imported.personalRecords) {
        setPersonalRecords(imported.personalRecords);
      }

      return { success: true, message: 'Data imported successfully' };
    } catch {
      return { success: false, message: 'Invalid JSON file' };
    }
  }, []);

  // Get workout history grouped by week
  const getHistoryByWeek = useCallback(() => {
    const weeks: Record<string, Workout[]> = {};
    data.workouts.forEach(workout => {
      const date = new Date(workout.date);
      const weekKey = `${date.getFullYear()}-W${Math.ceil((date.getDate() + date.getDay()) / 7)}`;
      if (!weeks[weekKey]) weeks[weekKey] = [];
      weeks[weekKey].push(workout);
    });
    return Object.entries(weeks).sort((a, b) => b[0].localeCompare(a[0]));
  }, [data.workouts]);

  // Get frequently used exercises (top 5)
  const frequentExercises = useMemo(() => {
    const counts: Record<string, number> = {};
    data.workouts.forEach(w => {
      counts[w.exerciseId] = (counts[w.exerciseId] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({ id, count, name: EXERCISES[id]?.name || id }));
  }, [data.workouts]);

  return {
    data,
    isLoaded,
    musclePoints: data.musclePoints,
    muscleProgress,
    vTaperProgress,
    totalPoints,
    weekWorkouts: getWeekWorkouts(),
    logWorkout,
    previewWorkout,
    resetProgress,
    deleteWorkout,
    getHistoryByWeek,
    // New features
    archivedWeeks,
    deleteArchivedWeek,
    exportData,
    importData,
    personalRecords,
    workoutStreak,
    frequentExercises,
  };
}
