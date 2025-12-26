import React, { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { Dialog } from '../components/Dialog';
import { Clock, Flame, TrendingUp, Play, X, Check, Camera } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { createClient } from '../utils/supabase/client';
import { toast } from 'sonner';

interface Workout {
  id: string;
  name: string;
  category: string;
  duration: number;
  difficulty: string;
  calories: number;
  exerciseCount: number;
  exercises: Exercise[];
}

interface Exercise {
  name: string;
  reps?: number;
  sets?: number;
  duration?: number;
  tips: string;
}

interface WorkoutsScreenProps {
  // allow any screen id to avoid tight typing coupling
  onNavigate: (screen: any) => void;
  refreshDashboard?: () => void;
}

export function WorkoutsScreen({ onNavigate, refreshDashboard }: WorkoutsScreenProps) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [category, setCategory] = useState('All');
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();
  
  useEffect(() => {
    loadWorkouts();
  }, [category]);
  
  const loadWorkouts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = category === 'All' 
        ? `https://${projectId}.supabase.co/functions/v1/make-server-d4a017ee/workouts`
        : `https://${projectId}.supabase.co/functions/v1/make-server-d4a017ee/workouts?category=${category}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load workouts');
      }
      
      const data = await response.json();
      if (data.workouts) {
        setWorkouts(data.workouts);
      }
    } catch (error) {
      console.error('Failed to load workouts:', error);
      setError('Failed to load workouts');
      toast.error('Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };
  
  const startWorkout = (workout: Workout) => {
    setSelectedWorkout(workout);
    setCurrentExerciseIndex(0);
  };
  
  const nextExercise = () => {
    if (selectedWorkout && currentExerciseIndex < selectedWorkout.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      completeWorkout();
    }
  };
  
  const completeWorkout = async () => {
    if (!selectedWorkout) return;
    
    setSubmitting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to log workouts');
        return;
      }
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d4a017ee/workouts/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          workoutId: selectedWorkout.id,
          workoutName: selectedWorkout.name,
          duration: selectedWorkout.duration,
          calories: selectedWorkout.calories
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('🎉 Workout completed! Great job!');
        setSelectedWorkout(null);
        setCurrentExerciseIndex(0);
        
        // Refresh dashboard stats to update workout completion
        if (refreshDashboard) {
          setTimeout(() => refreshDashboard(), 100);
        }
      } else {
        toast.error('Failed to log workout');
      }
    } catch (error) {
      console.error('Failed to complete workout:', error);
      toast.error('Failed to log workout');
    } finally {
      setSubmitting(false);
    }
  };
  
  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === 'Beginner') return { backgroundColor: '#DCFCE7', color: '#15803D' };
    if (difficulty === 'Intermediate') return { backgroundColor: '#FEF3C7', color: '#D97706' };
    return { backgroundColor: '#FEE2E2', color: '#DC2626' };
  };
  
  const categories = ['All', 'Home', 'Gym', 'Cardio'];
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen p-6 md:p-10 pb-24 md:pb-10">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Skeleton */}
          <div className="bg-white rounded-2xl p-8 relative overflow-hidden shadow-lg animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-48 mb-4" />
            <div className="h-4 bg-gray-300 rounded w-32" />
          </div>
          
          {/* Category Tabs Skeleton */}
          <div className="flex gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 w-20 bg-gray-300 rounded-xl animate-pulse" />
            ))}
          </div>
          
          {/* Workout Cards Skeleton */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-7 animate-pulse">
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-4" />
                <div className="space-y-3 mb-6">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-300 rounded-xl" />
                      <div className="h-4 bg-gray-300 rounded w-24" />
                    </div>
                  ))}
                </div>
                <div className="h-10 bg-gray-300 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen p-6 md:p-10 pb-24 md:pb-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to load workouts</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadWorkouts}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-6 md:p-10 pb-24 md:pb-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl p-8 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#0F172A' }}>Workouts</h1>
            <p className="text-lg" style={{ color: '#64748B' }}>Choose a workout to get started</p>
          </div>
        </div>
        
        {/* Category Tabs */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={category === cat ? 'primary' : 'ghost'}
              size="md"
              className="whitespace-nowrap"
              onClick={() => setCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
        
        {/* Workout Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {workouts.map(workout => (
            <div
              key={workout.id}
              className="bg-white card-hover rounded-2xl p-7 group relative overflow-hidden shadow-lg"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full group-hover:scale-105 transition-transform duration-300" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-5">
                  <h3 className="flex-1 pr-3 text-xl font-semibold" style={{ color: '#0F172A' }}>{workout.name}</h3>
                  <span
                    className="px-4 py-1.5 rounded-xl text-sm shadow-sm"
                    style={getDifficultyColor(workout.difficulty)}
                  >
                    {workout.difficulty}
                  </span>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3" style={{ color: '#64748B' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md" style={{ backgroundColor: '#0EA5E9' }}>
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <span>{workout.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-3" style={{ color: '#64748B' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md" style={{ backgroundColor: '#0EA5E9' }}>
                      <Flame className="w-4 h-4 text-white" />
                    </div>
                    <span>{workout.calories} calories</span>
                  </div>
                  <div className="flex items-center gap-3" style={{ color: '#64748B' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md" style={{ backgroundColor: '#D946EF' }}>
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <span>{workout.exerciseCount} exercises</span>
                  </div>
                </div>
                
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  icon={<Play className="w-4 h-4" />}
                  onClick={() => startWorkout(workout)}
                >
                  Start Workout
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Workout Player Dialog */}
      {selectedWorkout && (
        <Dialog
          open={!!selectedWorkout}
          onClose={() => setSelectedWorkout(null)}
          size="lg"
        >
          <div className="space-y-6">
            {/* Progress */}
            <div>
              <div className="flex justify-between mb-3">
                <span className="text-sm" style={{ color: '#64748B' }}>
                  Exercise {currentExerciseIndex + 1} of {selectedWorkout.exercises.length}
                </span>
                <span className="text-sm font-medium" style={{ color: '#0F172A' }}>
                  {Math.round(((currentExerciseIndex + 1) / selectedWorkout.exercises.length) * 100)}% Complete
                </span>
              </div>
              <div className="h-3 rounded-full overflow-hidden shadow-inner" style={{ backgroundColor: '#F1F5F9' }}>
                <div
                  className="h-full transition-all duration-500 shadow-lg"
                  style={{ 
                    width: `${((currentExerciseIndex + 1) / selectedWorkout.exercises.length) * 100}%`,
                    backgroundColor: '#0EA5E9'
                  }}
                />
              </div>
            </div>
            
            {/* Current Exercise */}
            <div className="rounded-2xl p-10 text-center relative overflow-hidden shadow-lg" style={{ backgroundColor: '#F8FAFC' }}>
              <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundColor: 'rgba(248, 250, 252, 0.8)' }} />
              <div className="relative z-10">
                <h2 className="mb-6 text-2xl font-bold" style={{ color: '#0F172A' }}>
                  {selectedWorkout.exercises[currentExerciseIndex].name}
                </h2>
                
                <div className="flex items-center justify-center gap-8 mb-8">
                  {selectedWorkout.exercises[currentExerciseIndex].reps && (
                    <div className="rounded-2xl p-5 min-w-[100px] shadow-md" style={{ backgroundColor: '#FFFFFF' }}>
                      <p className="text-5xl mb-2 font-bold" style={{ color: '#0F172A' }}>
                        {selectedWorkout.exercises[currentExerciseIndex].reps}
                      </p>
                      <p style={{ color: '#64748B' }}>reps</p>
                    </div>
                  )}
                  {selectedWorkout.exercises[currentExerciseIndex].sets && (
                    <div className="rounded-2xl p-5 min-w-[100px] shadow-md" style={{ backgroundColor: '#FFFFFF' }}>
                      <p className="text-5xl mb-2 font-bold" style={{ color: '#0F172A' }}>
                        {selectedWorkout.exercises[currentExerciseIndex].sets}
                      </p>
                      <p style={{ color: '#64748B' }}>sets</p>
                    </div>
                  )}
                  {selectedWorkout.exercises[currentExerciseIndex].duration && (
                    <div className="rounded-2xl p-5 min-w-[100px] shadow-md" style={{ backgroundColor: '#FFFFFF' }}>
                      <p className="text-5xl mb-2 font-bold" style={{ color: '#0F172A' }}>
                        {selectedWorkout.exercises[currentExerciseIndex].duration}s
                      </p>
                      <p style={{ color: '#64748B' }}>duration</p>
                    </div>
                  )}
                </div>
                
                <div className="rounded-2xl p-5 text-left shadow-md" style={{ backgroundColor: '#FFFFFF' }}>
                  <p className="leading-relaxed" style={{ color: '#0F172A' }}>
                    💡 <strong>Pro Tip:</strong> {selectedWorkout.exercises[currentExerciseIndex].tips}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Check Posture Button */}
            <button
              className="w-full rounded-xl px-6 py-3 text-white font-medium transition-all duration-300 hover:shadow-2xl flex items-center justify-center gap-2"
              style={{ backgroundColor: '#D946EF' }}
              onClick={() => {
                setSelectedWorkout(null);
                onNavigate('posture');
              }}
            >
              <Camera className="w-5 h-5" />
              Check Your Posture
            </button>
            
            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setSelectedWorkout(null)}
              >
                <X className="w-5 h-5 mr-2" />
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={nextExercise}
                disabled={submitting}
              >
                {currentExerciseIndex < selectedWorkout.exercises.length - 1 ? (
                  submitting ? 'Processing...' : 'Next Exercise'
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    {submitting ? 'Completing...' : 'Complete'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}