import { useMemo } from 'react';
import type { MuscleId, Workout } from '@/types';
import { MUSCLE_GROUPS, getProgressColor, getIntensityLevel } from '@/data/exercises';
import { BodyVisualization } from './BodyVisualization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Trophy, 
  Flame, 
  Target, 
  Calendar, 
  Dumbbell, 
  TrendingUp,
  Award,
  Zap,
  Activity,
} from 'lucide-react';

interface DashboardProps {
  musclePoints: Partial<Record<MuscleId, number>>;
  weekWorkouts: Workout[];
  vTaperProgress: { points: number; goal: number; percentage: number };
  totalPoints: number;
  workoutStreak?: number;
}

export function Dashboard({ 
  musclePoints, 
  weekWorkouts, 
  vTaperProgress, 
  totalPoints,
  workoutStreak = 0,
}: DashboardProps) {
  // Calculate muscle progress
  const muscleProgress = useMemo(() => {
    return (Object.entries(MUSCLE_GROUPS) as [MuscleId, typeof MUSCLE_GROUPS[MuscleId]][]).map(([id, info]) => {
      const points = musclePoints[id] || 0;
      const percentage = Math.min(100, (points / info.goal) * 100);
      return {
        id,
        name: info.name,
        points,
        goal: info.goal,
        percentage,
        priority: info.priority,
        color: getProgressColor(percentage),
        intensity: getIntensityLevel(percentage)
      };
    }).sort((a, b) => {
      // Sort by priority first, then by percentage
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.percentage - a.percentage;
    });
  }, [musclePoints]);

  // Get muscles close to goal (>= 75%)
  const nearGoalMuscles = muscleProgress.filter(m => m.percentage >= 75 && m.percentage < 100);
  
  // Get completed muscles
  const completedMuscles = muscleProgress.filter(m => m.percentage >= 100);

  // Calculate weekly stats
  const weeklyStats = useMemo(() => {
    const totalWorkouts = weekWorkouts.length;
    const compoundCount = weekWorkouts.filter(w => w.type === 'compound').length;
    const isolationCount = weekWorkouts.filter(w => w.type === 'isolation').length;
    const weekPoints = weekWorkouts.reduce((sum, w) => sum + w.totalPoints, 0);
    
    return { totalWorkouts, compoundCount, isolationCount, weekPoints };
  }, [weekWorkouts]);

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-gray-800 bg-gradient-to-br from-gray-900 to-gray-900/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-gray-500 uppercase">Total Points</span>
            </div>
            <div className="text-2xl font-bold">{totalPoints}</div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-800 bg-gradient-to-br from-gray-900 to-gray-900/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-500 uppercase">This Week</span>
            </div>
            <div className="text-2xl font-bold">{weeklyStats.totalWorkouts}</div>
            <div className="text-xs text-gray-500">workouts</div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-800 bg-gradient-to-br from-gray-900 to-gray-900/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-gray-500 uppercase">Week Points</span>
            </div>
            <div className="text-2xl font-bold">{weeklyStats.weekPoints}</div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-800 bg-gradient-to-br from-gray-900 to-gray-900/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-red-500" />
              <span className="text-xs text-gray-500 uppercase">V-Taper</span>
            </div>
            <div className="text-2xl font-bold">{Math.round(vTaperProgress.percentage)}%</div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gradient-to-br from-gray-900 to-gray-900/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-500 uppercase">Streak</span>
            </div>
            <div className="text-2xl font-bold">{workoutStreak}</div>
            <div className="text-xs text-gray-500">{workoutStreak === 1 ? 'day' : 'days'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Body Visualization */}
        <Card className="lg:col-span-2 border-gray-800 bg-gray-900/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Body Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BodyVisualization
              musclePoints={musclePoints}
              showBothViews={true}
              interactive={true}
            />
            
            {/* V-Taper Progress Bar */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 via-green-500/10 to-red-500/10 rounded-xl border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">V-Taper Progress</span>
                <span className="text-sm text-gray-500">
                  {vTaperProgress.points} / {vTaperProgress.goal} pts
                </span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 to-red-500 transition-all duration-500"
                  style={{ width: `${vTaperProgress.percentage}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-gray-500">
                <span>Lats: {(musclePoints.lats || 0)}/{MUSCLE_GROUPS.lats.goal}</span>
                <span>Deltoids: {(musclePoints.deltoids || 0)}/{MUSCLE_GROUPS.deltoids.goal}</span>
                <span>Obliques: {(musclePoints.obliques || 0)}/{MUSCLE_GROUPS.obliques.goal}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Muscle Progress List */}
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Muscle Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {muscleProgress.map((muscle) => (
                <div 
                  key={muscle.id}
                  className={cn(
                    "p-3 rounded-lg border transition-all",
                    muscle.percentage >= 100 
                      ? "border-red-500/50 bg-red-500/10" 
                      : "border-gray-800 bg-gray-800/30"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{muscle.name}</span>
                      {muscle.priority === 'high' && (
                        <Flame className="w-3 h-3 text-orange-500" />
                      )}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[10px]",
                        muscle.percentage >= 100 && "border-red-500 text-red-400"
                      )}
                    >
                      {muscle.percentage >= 100 ? 'COMPLETE!' : `${Math.round(muscle.percentage)}%`}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min(100, muscle.percentage)}%`,
                          backgroundColor: muscle.color
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-16 text-right">
                      {muscle.points}/{muscle.goal}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements & Recent Workouts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Achievements */}
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedMuscles.length > 0 && (
                <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-400">
                      Goals Reached!
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {completedMuscles.map(m => m.name).join(', ')}
                  </div>
                </div>
              )}
              
              {nearGoalMuscles.length > 0 && (
                <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-400">
                      Almost There!
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {nearGoalMuscles.map(m => `${m.name} (${Math.round(m.percentage)}%)`).join(', ')}
                  </div>
                </div>
              )}
              
              {weeklyStats.totalWorkouts >= 3 && (
                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Dumbbell className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-400">
                      Weekly Warrior
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {weeklyStats.totalWorkouts} workouts this week
                  </div>
                </div>
              )}
              
              {vTaperProgress.percentage >= 50 && (
                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-400">
                      V-Taper Building
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.round(vTaperProgress.percentage)}% of V-taper goal
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Workouts */}
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-blue-500" />
              Recent Workouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weekWorkouts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No workouts this week yet</p>
                <p className="text-xs mt-1">Start logging to track your progress!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                {[...weekWorkouts].reverse().slice(0, 10).map((workout) => (
                  <div 
                    key={workout.id}
                    className="p-3 rounded-lg border border-gray-800 bg-gray-800/30"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{workout.exerciseName}</span>
                      <Badge 
                        variant={workout.type === 'compound' ? 'default' : 'secondary'}
                        className="text-[10px]"
                      >
                        +{workout.totalPoints}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>{new Date(workout.date).toLocaleDateString()}</span>
                      <span>{workout.sets} sets × {workout.reps} reps</span>
                      {workout.weight > 0 && <span>{workout.weight}kg</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
