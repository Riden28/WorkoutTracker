import { useState, useMemo } from 'react';
import type { MuscleId, PersonalRecord } from '@/types';
import { EXERCISES, MUSCLE_GROUPS, DAY_FOCUS } from '@/data/exercises';
import { BodyVisualization } from './BodyVisualization';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Dumbbell, Flame, Target, ChevronRight, RotateCcw, Search, Star, Trophy, Zap } from 'lucide-react';

interface WorkoutLoggerProps {
  musclePoints: Partial<Record<MuscleId, number>>;
  onLogWorkout: (exerciseId: string, sets: number, reps: number, weight: number, notes: string) => void;
  personalRecords?: Record<string, PersonalRecord>;
  frequentExercises?: { id: string; count: number; name: string }[];
}

export function WorkoutLogger({ musclePoints, onLogWorkout, personalRecords = {}, frequentExercises = [] }: WorkoutLoggerProps) {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(0);
  const [notes, setNotes] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedExerciseData = selectedExercise ? EXERCISES[selectedExercise] : null;

  // Calculate preview points
  const previewData = useMemo(() => {
    if (!selectedExerciseData) return null;
    
    const previewPoints: Partial<Record<MuscleId, number>> = {};
    const newTotals: Partial<Record<MuscleId, number>> = {};
    
    Object.entries(selectedExerciseData.muscles).forEach(([muscle, basePoints]) => {
      const earned = Math.min((basePoints || 0) * sets, 10);
      previewPoints[muscle as MuscleId] = earned;
      newTotals[muscle as MuscleId] = (musclePoints[muscle as MuscleId] || 0) + earned;
    });
    
    return { previewPoints, newTotals };
  }, [selectedExerciseData, sets, musclePoints]);

  // Get highlighted muscles
  const highlightedMuscles = useMemo(() => {
    if (!selectedExerciseData) return [];
    return Object.keys(selectedExerciseData.muscles) as MuscleId[];
  }, [selectedExerciseData]);

  // All available filter categories
  const filterOptions = useMemo(() => {
    const options: { key: string; label: string }[] = [
      { key: 'all', label: 'All' },
      { key: 'compound', label: 'Compound' },
      { key: 'isolation', label: 'Isolation' },
      { key: 'v-taper', label: 'V-Taper Focus' },
      { key: 'frequent', label: 'Favourites' },
    ];
    // Add day-based categories
    Object.keys(DAY_FOCUS).forEach(day => {
      if (day !== 'Day 7 - Rest') {
        options.push({ key: `day:${day}`, label: day.replace('Day ', 'D') });
      }
    });
    return options;
  }, []);

  // Filter exercises
  const filteredExercises = useMemo(() => {
    let exercises = Object.entries(EXERCISES);
    
    // Apply search filter first
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      exercises = exercises.filter(([, ex]) =>
        ex.name.toLowerCase().includes(q) ||
        Object.keys(ex.muscles).some(m => MUSCLE_GROUPS[m as MuscleId]?.name.toLowerCase().includes(q))
      );
    }
    
    // Apply category filter
    if (filter === 'compound') {
      exercises = exercises.filter(([, ex]) => ex.type === 'compound');
    } else if (filter === 'isolation') {
      exercises = exercises.filter(([, ex]) => ex.type === 'isolation');
    } else if (filter === 'v-taper') {
      const vTaperMuscles = ['lats', 'deltoids', 'obliques', 'traps', 'rhomboids'];
      exercises = exercises.filter(([, ex]) =>
        Object.keys(ex.muscles).some(m => vTaperMuscles.includes(m))
      );
    } else if (filter === 'frequent') {
      const freqIds = new Set(frequentExercises.map(f => f.id));
      exercises = exercises.filter(([id]) => freqIds.has(id));
    } else if (filter.startsWith('day:')) {
      const dayKey = filter.slice(4);
      const dayExercises: string[] = (DAY_FOCUS as Record<string, string[]>)[dayKey] || [];
      exercises = exercises.filter(([id]) => dayExercises.includes(id));
    }

    return exercises;
  }, [filter, searchQuery, frequentExercises]);

  const handleSubmit = () => {
    if (!selectedExercise) return;
    onLogWorkout(selectedExercise, sets, reps, weight, notes);
    
    // Reset form
    setSelectedExercise(null);
    setSets(3);
    setReps(10);
    setWeight(0);
    setNotes('');
  };

  const handleReset = () => {
    setSelectedExercise(null);
    setSets(3);
    setReps(10);
    setWeight(0);
    setNotes('');
  };

  // Quick-log helper: pre-fill with last PR data when selecting an exercise
  const handleSelectExercise = (id: string) => {
    setSelectedExercise(id);
    const pr = personalRecords[id];
    if (pr) {
      if (pr.maxWeight > 0) setWeight(pr.maxWeight);
    }
  };

  const currentPR = selectedExercise ? personalRecords[selectedExercise] : null;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left: Exercise Selection */}
      <div className="space-y-4">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises or muscles..."
            className="bg-gray-800 border-gray-700 pl-10"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-1.5">
          {filterOptions.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors",
                filter === f.key
                  ? f.key === 'frequent' ? "bg-yellow-600 text-white" :
                    f.key === 'v-taper' ? "bg-orange-600 text-white" :
                    f.key.startsWith('day:') ? "bg-purple-600 text-white" :
                    "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              )}
            >
              {f.key === 'frequent' && <Star className="w-3 h-3 inline mr-0.5" />}
              {f.label}
            </button>
          ))}
        </div>

        {/* Quick log row for frequent exercises */}
        {frequentExercises.length > 0 && filter !== 'frequent' && !searchQuery && (
          <div className="flex gap-1.5 flex-wrap">
            <span className="text-[10px] text-gray-500 self-center mr-1">Quick:</span>
            {frequentExercises.slice(0, 3).map(ex => (
              <button
                key={ex.id}
                onClick={() => handleSelectExercise(ex.id)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors",
                  selectedExercise === ex.id
                    ? "border-yellow-500 bg-yellow-500/10 text-yellow-400"
                    : "border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600"
                )}
              >
                <Zap className="w-3 h-3 inline mr-0.5 text-yellow-500" />
                {ex.name.length > 20 ? ex.name.slice(0, 18) + '…' : ex.name}
              </button>
            ))}
          </div>
        )}

        {/* Exercise list */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {filteredExercises.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No exercises found</p>
              <p className="text-xs mt-1">Try a different search or filter</p>
            </div>
          ) : (
            filteredExercises.map(([id, exercise]) => {
              const isSelected = selectedExercise === id;
              const vTaperMuscles = ['lats', 'deltoids', 'obliques'];
              const targetsVTaper = Object.keys(exercise.muscles).some(m =>
                vTaperMuscles.includes(m)
              );
              const hasPR = !!personalRecords[id];

              return (
                <button
                  key={id}
                  onClick={() => handleSelectExercise(id)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl border transition-all",
                    isSelected
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-gray-800 bg-gray-900/50 hover:border-gray-700 hover:bg-gray-800"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{exercise.name}</span>
                      {targetsVTaper && (
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                      )}
                      {hasPR && (
                        <Trophy className="w-3 h-3 text-yellow-500" />
                      )}
                    </div>
                    <Badge
                      variant={exercise.type === 'compound' ? 'default' : 'secondary'}
                      className="text-[10px]"
                    >
                      {exercise.type}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Object.entries(exercise.muscles).map(([muscle, points]) => {
                      const isPriority = vTaperMuscles.includes(muscle);
                      return (
                        <span
                          key={muscle}
                          className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded",
                            isPriority
                              ? "bg-orange-500/20 text-orange-400"
                              : "bg-gray-800 text-gray-500"
                          )}
                        >
                          {MUSCLE_GROUPS[muscle as MuscleId].name.split(' ')[0]} +{points}
                        </span>
                      );
                    })}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Workout Form */}
        {selectedExerciseData && (
          <Card className="border-gray-800 bg-gray-900/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Dumbbell className="w-4 h-4" />
                Log Workout
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* PR indicator */}
              {currentPR && (
                <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20 text-xs">
                  <div className="flex items-center gap-1.5 text-yellow-400 font-medium mb-1">
                    <Trophy className="w-3 h-3" />
                    Personal Record
                  </div>
                  <div className="text-gray-400 flex gap-3">
                    {currentPR.maxWeight > 0 && <span>Best: {currentPR.maxWeight}kg</span>}
                    <span>Max reps: {currentPR.maxReps}</span>
                    <span>Max sets: {currentPR.maxSets}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">Sets</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={sets}
                    onChange={(e) => setSets(parseInt(e.target.value) || 1)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">Reps</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={reps}
                    onChange={(e) => setReps(parseInt(e.target.value) || 1)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">Weight (kg)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={weight}
                    onChange={(e) => setWeight(parseInt(e.target.value) || 0)}
                    className="bg-gray-800 border-gray-700"
                    placeholder="kg"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Notes (optional)</Label>
                <Input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                  placeholder="How did it feel?"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleSubmit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Log Workout
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleReset}
                  className="border-gray-700"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right: Body Preview */}
      <div className="space-y-4">
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4" />
              {selectedExerciseData ? 'Workout Preview' : 'Current Progress'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BodyVisualization
              musclePoints={previewData?.newTotals || musclePoints}
              highlightedMuscles={highlightedMuscles}
              previewPoints={previewData?.previewPoints}
              showBothViews={true}
              interactive={true}
            />
            
            {/* Legend */}
            <div className="flex justify-center gap-4 mt-4 text-[10px]">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gray-300" />
                <span className="text-gray-500">0%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-gray-500">25%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-500">50%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-gray-500">75%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-gray-500">100%</span>
              </div>
            </div>
            
            {/* Preview info */}
            {selectedExerciseData && previewData && (
              <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <div className="text-sm font-medium text-blue-400 mb-2">
                  Points to earn:
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(previewData.previewPoints).map(([muscle, points]) => (
                    <Badge key={muscle} variant="outline" className="text-xs border-blue-500/50">
                      {MUSCLE_GROUPS[muscle as MuscleId].name.split(' ')[0]}: +{points}
                    </Badge>
                  ))}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Total: +{Object.values(previewData.previewPoints).reduce((a, b) => a + (b || 0), 0)} points
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exercise info */}
        {selectedExerciseData && (
          <Card className="border-gray-800 bg-gray-900/50">
            <CardContent className="pt-4">
              <div className="text-sm font-medium mb-2">{selectedExerciseData.name}</div>
              <div className="text-xs text-gray-500 mb-3">
                {selectedExerciseData.type === 'compound' 
                  ? 'Compound exercise targeting multiple muscle groups'
                  : 'Isolation exercise for targeted muscle development'
                }
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={selectedExerciseData.difficulty === 'hard' ? 'destructive' : 'secondary'}
                  className="text-[10px]"
                >
                  {selectedExerciseData.difficulty}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
