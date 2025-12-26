import React, { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Dialog } from '../components/Dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Plus, Calendar, Scale, Activity, Target } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { createClient } from '../utils/supabase/client';
import { toast } from 'sonner';

interface ProgressScreenProps {
  refreshDashboard?: () => void;
}

interface WeightLog {
  logId: string;
  weight: number;
  date: string;
}

interface WorkoutLog {
  logId: string;
  workoutName: string;
  duration: number;
  calories: number;
  completedAt: string;
}

export function ProgressScreen({ refreshDashboard }: ProgressScreenProps = {}) {
  const [tab, setTab] = useState<'weight' | 'workouts'>('weight');
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClient();
  
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        loadProfile(),
        loadWeightHistory(),
        loadWorkoutHistory()
      ]);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load progress data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const loadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d4a017ee/profile`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load profile');
      }
      
      const data = await response.json();
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      // Don't throw, let other functions complete
    }
  };
  
  const loadWeightHistory = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d4a017ee/weight/history`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load weight history');
      }
      
      const data = await response.json();
      if (data.logs) {
        setWeightLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to load weight history:', error);
      toast.error('Failed to load weight history');
    }
  };
  
  const loadWorkoutHistory = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d4a017ee/workouts/history`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load workout history');
      }
      
      const data = await response.json();
      if (data.logs) {
        setWorkoutLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to load workout history:', error);
      toast.error('Failed to load workout history');
    }
  };
  
  const addWeightEntry = async () => {
    if (!newWeight) {
      toast.error('Please enter a weight');
      return;
    }
    
    const weight = parseFloat(newWeight);
    if (weight < 30 || weight > 300) {
      toast.error('Please enter a valid weight between 30-300 kg');
      return;
    }
    
    setSaving(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to log weight');
        return;
      }
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d4a017ee/weight/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          weight,
          date: newDate
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Weight logged successfully!');
        setShowAddWeight(false);
        setNewWeight('');
        await Promise.all([
          loadWeightHistory(),
          loadProfile()
        ]);
        refreshDashboard?.();
      } else {
        toast.error('Failed to log weight');
      }
    } catch (error) {
      console.error('Failed to log weight:', error);
      toast.error('Failed to log weight');
    } finally {
      setSaving(false);
    }
  };
  
  const calculateBMI = () => {
    if (!profile || !profile.height || !profile.weight) return 0;
    const heightInMeters = profile.height / 100;
    return (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
  };
  
  const getWeightChange = () => {
    if (weightLogs.length < 2) return { value: 0, trend: 'stable' };
    
    const latest = weightLogs[weightLogs.length - 1].weight;
    const previous = weightLogs[weightLogs.length - 2].weight;
    const change = latest - previous;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (change > 0.5) trend = 'up';
    else if (change < -0.5) trend = 'down';
    
    return { value: Math.abs(change).toFixed(1), trend };
  };
  
  const getWeeklyWorkouts = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return workoutLogs.filter(log => 
      new Date(log.completedAt) >= oneWeekAgo
    ).length;
  };
  
  const getMostFrequentWorkout = () => {
    if (workoutLogs.length === 0) return 'None yet';
    
    const counts: { [key: string]: number } = {};
    workoutLogs.forEach(log => {
      counts[log.workoutName] = (counts[log.workoutName] || 0) + 1;
    });
    
    const sortedWorkouts = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sortedWorkouts[0][0];
  };
  
  const chartData = weightLogs.map(log => ({
    date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: log.weight
  }));
  
  const weightChange = getWeightChange();
  const bmi = calculateBMI();
  const weeklyWorkouts = getWeeklyWorkouts();
  const mostFrequentWorkout = getMostFrequentWorkout();
  
  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#0F172A' }}>Progress</h1>
        <p className="text-lg" style={{ color: '#64748B' }}>Track your fitness journey</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p style={{ color: '#64748B' }}>Loading progress data...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 rounded-2xl p-6 shadow-lg border-2 border-red-200">
          <div className="text-center">
            <p className="text-red-700 font-medium mb-4">{error}</p>
            <Button 
              variant="primary" 
              onClick={loadAllData}
              className="bg-red-600 hover:bg-red-700"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Tabs */}
      {!loading && !error && (
        <>
          <div className="flex gap-3 mb-8">
            <button
              type="button"
              onClick={() => setTab('weight')}
              className="flex-1 py-4 px-6 rounded-xl transition-all font-medium border-2 shadow-lg"
              style={tab === 'weight' ? {
                backgroundColor: '#0EA5E9',
                color: '#FFFFFF',
                borderColor: '#0EA5E9'
              } : {
                backgroundColor: '#FFFFFF',
                color: '#64748B',
                borderColor: '#E2E8F0'
              }}
            >
              Weight Tracking
            </button>
            <button
              type="button"
              onClick={() => setTab('workouts')}
              className="flex-1 py-4 px-6 rounded-xl transition-all font-medium border-2 shadow-lg"
              style={tab === 'workouts' ? {
                backgroundColor: '#0EA5E9',
                color: '#FFFFFF',
                borderColor: '#0EA5E9'
              } : {
                backgroundColor: '#FFFFFF',
                color: '#64748B',
                borderColor: '#E2E8F0'
              }}
            >
              Workout Stats
            </button>
          </div>
          
          {/* Weight Tab */}
          {tab === 'weight' && (
            <div className="space-y-8">
              {/* Current Weight Card */}
              {profile?.weight ? (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="mb-2 font-medium" style={{ color: '#64748B' }}>Current Weight</p>
                      <p className="text-3xl font-bold mb-1" style={{ color: '#0F172A' }}>{profile.weight}</p>
                      <p style={{ color: '#64748B' }}>kg</p>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-2 mb-3 px-4 py-2 rounded-xl border ${
                        weightChange.trend === 'down' ? 'bg-green-50 text-green-700 border-green-200' :
                        weightChange.trend === 'up' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {weightChange.trend === 'down' && <TrendingDown className="w-5 h-5" />}
                        {weightChange.trend === 'up' && <TrendingUp className="w-5 h-5" />}
                        {weightChange.trend === 'stable' && <Minus className="w-5 h-5" />}
                        <span className="font-medium">{weightChange.value} kg</span>
                      </div>
                      <p className="text-sm" style={{ color: '#64748B' }}>vs last entry</p>
                    </div>
                  </div>
                  
                  <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: '#0F172A' }}>
                    <p className="mb-2 font-medium" style={{ color: '#FFFFFF' }}>Body Mass Index (BMI)</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold" style={{ color: '#0EA5E9' }}>{bmi}</p>
                      <p style={{ color: '#FFFFFF' }}>kg/m²</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-8 text-center border-2 border-dashed shadow-lg" style={{ borderColor: '#E2E8F0' }}>
                  <div className="w-20 h-20 rounded-[1.5rem] mx-auto mb-4 flex items-center justify-center shadow-md" style={{ backgroundColor: '#F8FAFC' }}>
                    <Scale className="w-10 h-10" style={{ color: '#94A3B8' }} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: '#0F172A' }}>No weight data yet</h3>
                  <p className="mb-6" style={{ color: '#64748B' }}>Start tracking your weight to see your progress over time.</p>
                  <Button variant="primary" onClick={() => setShowAddWeight(true)}>
                    <Plus className="w-5 h-5 mr-2" />
                    Add First Entry
                  </Button>
                </div>
              )}
              
              {/* Weight Chart */}
              {chartData.length > 0 ? (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-8 rounded-full" style={{ backgroundColor: '#0EA5E9' }} />
                    <h3 className="text-xl font-semibold" style={{ color: '#0F172A' }}>Weight History</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="date"
                        stroke="#64748b"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis
                        stroke="#64748b"
                        style={{ fontSize: '12px' }}
                        domain={['dataMin - 2', 'dataMax + 2']}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '2px solid #0EA5E9',
                          borderRadius: '12px',
                          padding: '8px 12px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#0EA5E9"
                        strokeWidth={3}
                        dot={{ fill: '#0EA5E9', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                weightLogs.length === 0 && (
                  <div className="bg-white rounded-3xl p-8 text-center border-2 border-dashed shadow-lg" style={{ borderColor: '#E2E8F0' }}>
                    <div className="w-20 h-20 rounded-[1.5rem] mx-auto mb-4 flex items-center justify-center shadow-md" style={{ backgroundColor: '#F8FAFC' }}>
                      <TrendingUp className="w-10 h-10" style={{ color: '#94A3B8' }} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: '#0F172A' }}>Track your progress</h3>
                    <p className="mb-6" style={{ color: '#64748B' }}>Add multiple weight entries to see your progress chart.</p>
                    <Button variant="primary" onClick={() => setShowAddWeight(true)}>
                      <Plus className="w-5 h-5 mr-2" />
                      Add Weight Entry
                    </Button>
                  </div>
                )
              )}
              
              {/* Add Weight Button */}
              <Button
                variant="primary"
                className="w-full"
                onClick={() => setShowAddWeight(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Weight Entry
              </Button>
            </div>
          )}
          
          {/* Workouts Tab */}
          {tab === 'workouts' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="rounded-2xl p-6 shadow-lg" style={{ backgroundColor: '#0F172A' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ backgroundColor: '#0EA5E9' }}>
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="mb-1 font-medium" style={{ color: '#94A3B8' }}>Total Workouts</p>
                      <p className="text-3xl font-bold" style={{ color: '#FFFFFF' }}>{workoutLogs.length}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl p-6 shadow-lg" style={{ backgroundColor: '#0F172A' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ backgroundColor: '#10B981' }}>
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="mb-1 font-medium" style={{ color: '#94A3B8' }}>This Week</p>
                      <p className="text-3xl font-bold" style={{ color: '#FFFFFF' }}>{weeklyWorkouts}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Most Frequent Workout */}
              <div className="rounded-2xl p-6 shadow-lg" style={{ backgroundColor: '#0F172A' }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ backgroundColor: '#D946EF' }}>
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="mb-1 font-medium" style={{ color: '#94A3B8' }}>Most Frequent Workout</p>
                    <p className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>{mostFrequentWorkout}</p>
                  </div>
                </div>
              </div>
              
              {/* Workout History */}
              <div>
                <h3 className="mb-4 text-2xl font-bold" style={{ color: '#0F172A' }}>Recent Workouts</h3>
                <div className="space-y-3">
                  {workoutLogs.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center border-2 border-dashed shadow-lg">
                      <p style={{ color: '#64748B' }}>No workouts completed yet</p>
                    </div>
                  ) : (
                    workoutLogs.slice(0, 10).map(log => (
                      <div
                        key={log.logId}
                        className="bg-white rounded-2xl p-4 shadow-lg"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 style={{ color: '#0F172A' }}>{log.workoutName}</h4>
                          <span style={{ color: '#64748B' }}>
                            {log.calories} cal
                          </span>
                        </div>
                        <div className="flex items-center gap-4" style={{ color: '#64748B' }}>
                          <span>{log.duration} min</span>
                          <span>•</span>
                          <span>
                            {new Date(log.completedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Add Weight Dialog */}
      <Dialog
        open={showAddWeight}
        onClose={() => setShowAddWeight(false)}
        title="Add Weight Entry"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Weight (kg)"
            type="number"
            placeholder="70"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
          />
          
          <div>
            <label className="block text-sm mb-2" style={{ color: '#0F172A' }}>
              Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#64748B' }} />
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 focus:outline-none transition-colors"
                style={{
                  borderColor: '#E2E8F0',
                  color: '#0F172A'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0EA5E9'}
                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
              />
            </div>
          </div>
          
          <Button
            variant="primary"
            className="w-full"
            onClick={addWeightEntry}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Weight'}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
