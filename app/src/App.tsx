import { useState } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Dashboard } from '@/components/Dashboard';
import { WorkoutLogger } from '@/components/WorkoutLogger';
import { History } from '@/components/History';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard, 
  History as HistoryIcon, 
  Plus,
  RotateCcw,
  Trophy,
  Flame,
  Dumbbell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Toaster, toast } from 'sonner';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { 
    isLoaded,
    musclePoints, 
    weekWorkouts, 
    vTaperProgress, 
    totalPoints,
    logWorkout,
    resetProgress,
    deleteWorkout,
    data,
    archivedWeeks,
    deleteArchivedWeek,
    exportData,
    importData,
    personalRecords,
    workoutStreak,
    frequentExercises
  } = useAppData();

  const handleLogWorkout = (exerciseId: string, sets: number, reps: number, weight: number, notes: string) => {
    const workout = logWorkout(exerciseId, sets, reps, weight, notes);
    if (workout) {
      toast.success('Workout logged!', {
        description: `Earned ${workout.totalPoints} points for ${workout.exerciseName}`,
        icon: <Trophy className="w-4 h-4 text-yellow-500" />
      });
      setActiveTab('dashboard');
    }
  };

  const handleReset = () => {
    resetProgress();
    toast.info('Progress reset for new week', {
      description: 'Current week archived! Starting fresh — good luck!'
    });
  };

  const handleDeleteWorkout = (id: string) => {
    deleteWorkout(id);
    toast.success('Workout deleted');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 flex items-center justify-center text-3xl font-bold mb-4 animate-pulse">
            <Dumbbell className="w-8 h-8" />
          </div>
          <p className="text-gray-500">Loading Physique Tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Toaster 
        position="top-right" 
        theme="dark"
        toastOptions={{
          style: {
            background: '#1a1a24',
            border: '1px solid #2a2a3a'
          }
        }}
      />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-500/20">
                <Dumbbell className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Physique Tracker
                </h1>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Week {data.currentWeek}</span>
                  <span>•</span>
                  <span className="text-blue-400">{totalPoints} pts</span>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-gray-500">This Week</div>
                <div className="font-bold">{weekWorkouts.length} workouts</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">V-Taper</div>
                <div className={cn(
                  "font-bold",
                  vTaperProgress.percentage >= 75 ? "text-red-400" :
                  vTaperProgress.percentage >= 50 ? "text-yellow-400" :
                  vTaperProgress.percentage >= 25 ? "text-green-400" :
                  "text-blue-400"
                )}>
                  {Math.round(vTaperProgress.percentage)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <TabsList className="bg-gray-900/50 border border-gray-800">
              <TabsTrigger 
                value="dashboard" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="log"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Log Workout
              </TabsTrigger>
              <TabsTrigger 
                value="history"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <HistoryIcon className="w-4 h-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>

            {/* Reset Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-gray-700 text-gray-500 hover:text-white"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  New Week
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gray-900 border-gray-800">
                <AlertDialogHeader>
                  <AlertDialogTitle>Start New Week?</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-500">
                    This will archive this week's data and reset all muscle points to zero. 
                    You can view archived weeks in the History tab.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-gray-800 border-gray-700">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleReset}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Reset Progress
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-0">
            <Dashboard
              musclePoints={musclePoints}
              weekWorkouts={weekWorkouts}
              vTaperProgress={vTaperProgress}
              totalPoints={totalPoints}
              workoutStreak={workoutStreak}
            />
          </TabsContent>

          {/* Log Workout Tab */}
          <TabsContent value="log" className="mt-0">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold mb-2">Log Your Workout</h2>
                <p className="text-gray-500">
                  Select an exercise to see which muscles you'll target and preview your progress
                </p>
              </div>
              <WorkoutLogger
                musclePoints={musclePoints}
                onLogWorkout={handleLogWorkout}
                personalRecords={personalRecords}
                frequentExercises={frequentExercises}
              />
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-0">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold mb-2">Workout History</h2>
                <p className="text-gray-500">
                  Review your past workouts and track your journey
                </p>
              </div>
              <History 
                workouts={data.workouts}
                onDeleteWorkout={handleDeleteWorkout}
                archivedWeeks={archivedWeeks}
                onDeleteArchivedWeek={deleteArchivedWeek}
                onExportData={exportData}
                onImportData={importData}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-600">
          <p className="flex items-center justify-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            Track your gains, build your physique
            <Flame className="w-4 h-4 text-orange-500" />
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
