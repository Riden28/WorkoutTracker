import { useState, useMemo, useRef } from 'react';
import type { Workout, ArchivedWeek, MuscleId } from '@/types';
import { MUSCLE_GROUPS } from '@/data/exercises';
import { BodyVisualization } from './BodyVisualization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Dumbbell, 
  Trash2,
  TrendingUp,
  Download,
  Upload,
  Archive,
  Eye,
  X,
  FolderOpen,
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

interface HistoryProps {
  workouts: Workout[];
  archivedWeeks?: ArchivedWeek[];
  onDeleteWorkout?: (id: string) => void;
  onDeleteArchivedWeek?: (id: string) => void;
  onExportData?: () => void;
  onImportData?: (json: string) => { success: boolean; message: string };
}

export function History({ 
  workouts, 
  archivedWeeks = [],
  onDeleteWorkout, 
  onDeleteArchivedWeek,
  onExportData,
  onImportData,
}: HistoryProps) {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());
  const [viewingArchive, setViewingArchive] = useState<ArchivedWeek | null>(null);
  const [activeSection, setActiveSection] = useState<'current' | 'archived'>('current');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Group workouts by week
  const weeks = useMemo(() => {
    const grouped: Record<string, Workout[]> = {};
    
    workouts.forEach(workout => {
      const date = new Date(workout.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!grouped[weekKey]) grouped[weekKey] = [];
      grouped[weekKey].push(workout);
    });

    return Object.entries(grouped)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([weekKey, weekWorkouts]) => {
        const totalPoints = weekWorkouts.reduce((sum, w) => sum + w.totalPoints, 0);
        const compoundCount = weekWorkouts.filter(w => w.type === 'compound').length;
        const isolationCount = weekWorkouts.filter(w => w.type === 'isolation').length;
        
        const musclePoints: Record<string, number> = {};
        weekWorkouts.forEach(w => {
          Object.entries(w.pointsEarned).forEach(([muscle, points]) => {
            musclePoints[muscle] = (musclePoints[muscle] || 0) + (points || 0);
          });
        });
        
        return {
          weekKey,
          weekStart: new Date(weekKey),
          workouts: weekWorkouts.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          ),
          totalPoints,
          compoundCount,
          isolationCount,
          musclePoints
        };
      });
  }, [workouts]);

  const toggleWeek = (weekKey: string) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      if (next.has(weekKey)) {
        next.delete(weekKey);
      } else {
        next.add(weekKey);
      }
      return next;
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImportData) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = onImportData(event.target?.result as string);
      if (!result.success) {
        alert(result.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Archive viewer modal
  const renderArchiveViewer = () => {
    if (!viewingArchive) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto">
          <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Archive className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Week {viewingArchive.weekNumber}</h3>
                <p className="text-xs text-gray-500">
                  {new Date(viewingArchive.startDate).toLocaleDateString()} — {new Date(viewingArchive.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setViewingArchive(null)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-4 space-y-6">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-gray-800/50 rounded-lg text-center">
                <div className="text-xs text-gray-500">Workouts</div>
                <div className="text-xl font-bold">{viewingArchive.workouts.length}</div>
              </div>
              <div className="p-3 bg-gray-800/50 rounded-lg text-center">
                <div className="text-xs text-gray-500">Total Points</div>
                <div className="text-xl font-bold text-blue-400">{viewingArchive.totalPoints}</div>
              </div>
              <div className="p-3 bg-gray-800/50 rounded-lg text-center">
                <div className="text-xs text-gray-500">V-Taper</div>
                <div className="text-xl font-bold text-green-400">{Math.round(viewingArchive.vTaperPercentage)}%</div>
              </div>
            </div>

            {/* Body vis snapshot */}
            <Card className="border-gray-800 bg-gray-800/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Muscle Progress Snapshot</CardTitle>
              </CardHeader>
              <CardContent>
                <BodyVisualization
                  musclePoints={viewingArchive.musclePoints}
                  showBothViews={true}
                  interactive={true}
                />
              </CardContent>
            </Card>

            {/* Muscle breakdown */}
            <div className="p-3 bg-gray-800/50 rounded-lg">
              <div className="text-xs text-gray-500 mb-2">Muscle Points</div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(viewingArchive.musclePoints)
                  .filter(([, pts]) => pts > 0)
                  .sort((a, b) => b[1] - a[1])
                  .map(([muscle, pts]) => (
                    <Badge key={muscle} variant="secondary" className="text-[10px]">
                      {MUSCLE_GROUPS[muscle as MuscleId]?.name.split(' ')[0] || muscle}: {pts}
                    </Badge>
                  ))}
              </div>
            </div>

            {/* Workout list */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-400">All Workouts</div>
              {viewingArchive.workouts
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(workout => (
                <div key={workout.id} className="p-3 rounded-lg border border-gray-800 bg-gray-800/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-sm">{workout.exerciseName}</span>
                      <Badge variant={workout.type === 'compound' ? 'default' : 'secondary'} className="text-[10px]">
                        {workout.type}
                      </Badge>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400 border-0 text-[10px]">
                      +{workout.totalPoints}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>{new Date(workout.date).toLocaleDateString()}</span>
                    <span>{workout.sets}×{workout.reps}</span>
                    {workout.weight > 0 && <span>{workout.weight}kg</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* Section tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSection('current')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeSection === 'current'
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            )}
          >
            <Calendar className="w-4 h-4 inline mr-1.5" />
            Current ({workouts.length})
          </button>
          <button
            onClick={() => setActiveSection('archived')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeSection === 'archived'
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            )}
          >
            <Archive className="w-4 h-4 inline mr-1.5" />
            Archived ({archivedWeeks.length})
          </button>
        </div>

        {/* Export/Import */}
        <div className="flex gap-2">
          {onExportData && (
            <Button variant="outline" size="sm" className="border-gray-700 text-gray-400" onClick={onExportData}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          )}
          {onImportData && (
            <Button variant="outline" size="sm" className="border-gray-700 text-gray-400" onClick={handleImportClick}>
              <Upload className="w-4 h-4 mr-1" />
              Import
            </Button>
          )}
        </div>
      </div>

      {/* Current workouts section */}
      {activeSection === 'current' && (
        <>
          {workouts.length === 0 ? (
            <Card className="border-gray-800 bg-gray-900/50">
              <CardContent className="py-12 text-center">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No Workouts Yet</h3>
                <p className="text-sm text-gray-600">
                  Start logging workouts to see your history here
                </p>
              </CardContent>
            </Card>
          ) : (
            weeks.map((week) => {
              const isExpanded = expandedWeeks.has(week.weekKey);
              
              return (
                <Card 
                  key={week.weekKey} 
                  className={cn(
                    "border-gray-800 bg-gray-900/50 transition-all",
                    isExpanded && "border-blue-500/50"
                  )}
                >
                  <CardHeader 
                    className="pb-3 cursor-pointer"
                    onClick={() => toggleWeek(week.weekKey)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            Week of {week.weekStart.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <span>{week.workouts.length} workouts</span>
                            <span>•</span>
                            <span className="text-blue-400">{week.totalPoints} points</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">
                          {week.compoundCount} compound
                        </Badge>
                        <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">
                          {week.isolationCount} isolation
                        </Badge>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  {isExpanded && (
                    <CardContent className="pt-0">
                      {Object.keys(week.musclePoints).length > 0 && (
                        <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Muscle Points This Week
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(week.musclePoints)
                              .sort((a, b) => b[1] - a[1])
                              .map(([muscle, points]) => (
                                <Badge 
                                  key={muscle} 
                                  variant="secondary" 
                                  className="text-[10px]"
                                >
                                  {muscle.replace('_', ' ')}: +{points}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        {week.workouts.map((workout) => (
                          <div 
                            key={workout.id}
                            className="p-3 rounded-lg border border-gray-800 bg-gray-800/30 hover:border-gray-700 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Dumbbell className="w-4 h-4 text-gray-500" />
                                  <span className="font-medium">{workout.exerciseName}</span>
                                  <Badge 
                                    variant={workout.type === 'compound' ? 'default' : 'secondary'}
                                    className="text-[10px]"
                                  >
                                    {workout.type}
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                  <span>{new Date(workout.date).toLocaleDateString()}</span>
                                  <span>{new Date(workout.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                
                                <div className="flex items-center gap-4 mt-2 text-sm">
                                  <span>{workout.sets} sets</span>
                                  <span>{workout.reps} reps</span>
                                  {workout.weight > 0 && (
                                    <span>{workout.weight} kg</span>
                                  )}
                                  <Badge className="bg-blue-500/20 text-blue-400 border-0">
                                    +{workout.totalPoints} pts
                                  </Badge>
                                </div>
                                
                                {workout.notes && (
                                  <p className="mt-2 text-xs text-gray-500 italic">
                                    "{workout.notes}"
                                  </p>
                                )}
                              </div>
                              
                              {onDeleteWorkout && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onDeleteWorkout(workout.id)}
                                  className="text-gray-500 hover:text-red-500"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </>
      )}

      {/* Archived weeks section */}
      {activeSection === 'archived' && (
        <>
          {archivedWeeks.length === 0 ? (
            <Card className="border-gray-800 bg-gray-900/50">
              <CardContent className="py-12 text-center">
                <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No Archived Weeks</h3>
                <p className="text-sm text-gray-600">
                  When you start a new week, the current week's data will be archived here automatically.
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  You can also import past data using the Import button above.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {archivedWeeks.map((archive) => (
                <Card 
                  key={archive.id} 
                  className="border-gray-800 bg-gray-900/50 hover:border-purple-500/30 transition-all cursor-pointer group"
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <Archive className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Week {archive.weekNumber}</div>
                          <div className="text-[10px] text-gray-500">
                            {new Date(archive.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {' — '}
                            {new Date(archive.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      
                      {onDeleteArchivedWeek && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 h-7 w-7 p-0">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-gray-900 border-gray-800">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Archived Week?</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-500">
                                This will permanently delete Week {archive.weekNumber}'s archived data. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-gray-800 border-gray-700">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDeleteArchivedWeek(archive.id)} className="bg-red-600 hover:bg-red-700">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center p-2 bg-gray-800/50 rounded">
                        <div className="text-[10px] text-gray-500">Workouts</div>
                        <div className="font-bold text-sm">{archive.workouts.length}</div>
                      </div>
                      <div className="text-center p-2 bg-gray-800/50 rounded">
                        <div className="text-[10px] text-gray-500">Points</div>
                        <div className="font-bold text-sm text-blue-400">{archive.totalPoints}</div>
                      </div>
                      <div className="text-center p-2 bg-gray-800/50 rounded">
                        <div className="text-[10px] text-gray-500">V-Taper</div>
                        <div className="font-bold text-sm text-green-400">{Math.round(archive.vTaperPercentage)}%</div>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-gray-700 text-gray-400 hover:text-purple-400 hover:border-purple-500/50"
                      onClick={() => setViewingArchive(archive)}
                    >
                      <Eye className="w-4 h-4 mr-1.5" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Archive viewer modal */}
      {renderArchiveViewer()}
    </div>
  );
}
