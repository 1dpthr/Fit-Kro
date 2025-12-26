import React, { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Dialog } from '../components/Dialog';
import { Camera, Plus, Loader, Upload } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { createClient } from '../utils/supabase/client';
import { toast } from 'sonner';
import { Utensils } from 'lucide-react';

interface FoodLog {
  logId: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealType: string;
  loggedAt: string;
}

export function FoodScreen({ refreshDashboard }: { refreshDashboard?: () => void }) {
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [mealTab, setMealTab] = useState('Breakfast');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  
  // Manual entry form
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [mealType, setMealType] = useState('Breakfast');
  
  const supabase = createClient();
  
  useEffect(() => {
    loadFoodLogs();
  }, []);
  
  const loadFoodLogs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d4a017ee/food/history?date=${today}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to load food logs');
      }
      
      const data = await response.json();
      if (data.logs) {
        setFoodLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to load food logs:', error);
      setError('Failed to load food logs');
    } finally {
      setLoading(false);
    }
  };
  
  const handleManualEntry = async () => {
    if (!foodName || !calories) {
      toast.error('Please fill in required fields');
      return;
    }
    
    setSaving(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to log food');
        return;
      }
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d4a017ee/food/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          foodName,
          calories: parseInt(calories),
          protein: parseInt(protein) || 0,
          carbs: parseInt(carbs) || 0,
          fats: parseInt(fats) || 0,
          mealType
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Food logged successfully!');
        setShowManualEntry(false);
        resetForm();
        loadFoodLogs();
        
        // Refresh dashboard stats to update calories consumed
        if (refreshDashboard) {
          setTimeout(() => refreshDashboard(), 100);
        }
      } else {
        toast.error('Failed to log food');
      }
    } catch (error) {
      console.error('Failed to log food:', error);
      toast.error('Failed to log food');
    } finally {
      setSaving(false);
    }
  };
  
  const handleAIAnalysis = async () => {
    setAnalyzing(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to analyze food');
        return;
      }
      
      // Simulate AI analysis delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d4a017ee/food/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ image: 'mock' })
      });
      
      const data = await response.json();
      
      if (data.analysis) {
        setAiResult(data.analysis);
      }
    } catch (error) {
      console.error('Failed to analyze food:', error);
      toast.error('Failed to analyze food');
    } finally {
      setAnalyzing(false);
    }
  };
  
  const saveAIResult = async () => {
    if (!aiResult) return;
    
    setSaving(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d4a017ee/food/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          foodName: aiResult.name,
          calories: aiResult.calories,
          protein: aiResult.protein,
          carbs: aiResult.carbs,
          fats: aiResult.fats,
          mealType
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Food logged successfully!');
        setShowAIAnalysis(false);
        setAiResult(null);
        loadFoodLogs();
        
        // Refresh dashboard stats to update calories consumed
        if (refreshDashboard) {
          setTimeout(() => refreshDashboard(), 100);
        }
      }
    } catch (error) {
      console.error('Failed to save AI result:', error);
      toast.error('Failed to log food');
    } finally {
      setSaving(false);
    }
  };
  
  const resetForm = () => {
    setFoodName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFats('');
  };
  
  const getTodaysMacros = () => {
    const total = foodLogs.reduce(
      (acc, log) => ({
        calories: acc.calories + log.calories,
        protein: acc.protein + log.protein,
        carbs: acc.carbs + log.carbs,
        fats: acc.fats + log.fats
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
    return total;
  };
  
  const macros = getTodaysMacros();
  const calorieGoal = 2000;
  const calorieProgress = (macros.calories / calorieGoal) * 100;
  
  const mealTabs = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
  const filteredLogs = foodLogs.filter(log => log.mealType === mealTab);
  
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
          
          {/* Overview Skeleton */}
          <div className="bg-white rounded-2xl p-8 relative overflow-hidden shadow-lg animate-pulse">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="h-4 bg-gray-300 rounded w-32 mb-2" />
                <div className="h-10 bg-gray-300 rounded w-24 mb-1" />
                <div className="h-4 bg-gray-300 rounded w-16" />
              </div>
              <div className="h-16 w-16 bg-gray-300 rounded-2xl" />
            </div>
            <div className="h-4 bg-gray-300 rounded-full mb-6" />
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-300 rounded-2xl" />
              ))}
            </div>
          </div>
          
          {/* Buttons Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-6 bg-gray-300 rounded w-32 mb-2" />
                    <div className="h-4 bg-gray-300 rounded w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Content Skeleton */}
          <div className="bg-white rounded-2xl p-12 text-center animate-pulse">
            <div className="w-20 h-20 bg-gray-300 rounded-2xl mx-auto mb-4" />
            <div className="h-6 bg-gray-300 rounded w-48 mx-auto mb-2" />
            <div className="h-4 bg-gray-300 rounded w-32 mx-auto" />
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to load food logs</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadFoodLogs}
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
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#0F172A' }}>Food Log</h1>
            <p className="text-lg" style={{ color: '#64748B' }}>Track your daily nutrition</p>
          </div>
        </div>
        
        {/* Daily Overview */}
        <div className="bg-white rounded-2xl p-7 md:p-8 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="mb-1" style={{ color: '#64748B' }}>Calories Today</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl font-bold" style={{ color: '#0EA5E9' }}>{macros.calories}</h2>
                  <span style={{ color: '#64748B' }}>/ {calorieGoal} kcal</span>
                </div>
              </div>
              <div className="text-right rounded-2xl px-5 py-3 shadow-sm" style={{ backgroundColor: '#F8FAFC' }}>
                <p className="text-3xl font-bold" style={{ color: '#0EA5E9' }}>{Math.round(calorieProgress)}%</p>
                <p className="text-sm" style={{ color: '#64748B' }}>Progress</p>
              </div>
            </div>
            
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden mb-6 shadow-inner">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${Math.min(calorieProgress, 100)}%`,
                  backgroundColor: '#0EA5E9'
                }}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {/* Protein - Primary Blue */}
              <div className="bg-white rounded-2xl p-4 text-center border border-gray-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-md" style={{ backgroundColor: '#0EA5E9' }}>
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L10 17.77L1.82 21.02L3 14.14L-2 9.27L4.91 8.26L10 2Z"/>
                  </svg>
                </div>
                <p className="text-2xl font-bold mb-1" style={{ color: '#0EA5E9' }}>{macros.protein}g</p>
                <p className="text-sm font-medium" style={{ color: '#64748B' }}>Protein</p>
                <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>Build & Repair</p>
              </div>
              
              {/* Carbs - Purple/Magenta */}
              <div className="bg-white rounded-2xl p-4 text-center border border-gray-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-md" style={{ backgroundColor: '#D946EF' }}>
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                  </svg>
                </div>
                <p className="text-2xl font-bold mb-1" style={{ color: '#D946EF' }}>{macros.carbs}g</p>
                <p className="text-sm font-medium" style={{ color: '#64748B' }}>Carbs</p>
                <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>Energy Source</p>
              </div>
              
              {/* Fats - Cyan */}
              <div className="bg-white rounded-2xl p-4 text-center border border-gray-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-md" style={{ backgroundColor: '#06B6D4' }}>
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                  </svg>
                </div>
                <p className="text-2xl font-bold mb-1" style={{ color: '#06B6D4' }}>{macros.fats}g</p>
                <p className="text-sm font-medium" style={{ color: '#64748B' }}>Fats</p>
                <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>Essential Functions</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Add Food Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setShowAIAnalysis(true)}
            className="bg-white card-hover rounded-2xl p-5 text-left relative overflow-hidden shadow-lg border border-gray-100"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ backgroundColor: '#0EA5E9' }}>
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold mb-1" style={{ color: '#0F172A' }}>Scan Food</h4>
                <p className="text-sm" style={{ color: '#64748B' }}>Use AI to analyze your meal</p>
              </div>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => setShowManualEntry(true)}
            className="bg-white card-hover rounded-2xl p-5 text-left relative overflow-hidden shadow-lg border border-gray-100"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ backgroundColor: '#10B981' }}>
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold mb-1" style={{ color: '#0F172A' }}>Manual Entry</h4>
                <p className="text-sm" style={{ color: '#64748B' }}>Add food details manually</p>
              </div>
            </div>
          </button>
        </div>
        
        {/* Meal Tabs */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {mealTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setMealTab(tab)}
              className="px-6 py-3 rounded-xl whitespace-nowrap transition-all font-medium border-2 shadow-lg"
              style={mealTab === tab ? {
                backgroundColor: '#0EA5E9',
                color: '#FFFFFF',
                borderColor: '#0EA5E9'
              } : {
                backgroundColor: '#FFFFFF',
                color: '#64748B',
                borderColor: '#E2E8F0'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {/* Food Logs */}
        <div className="space-y-4">
          {filteredLogs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200 shadow-lg">
              <div className="w-20 h-20 bg-gray-50 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Utensils className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-lg" style={{ color: '#64748B' }}>No food logged for {mealTab} yet</p>
              <p className="mt-2" style={{ color: '#94A3B8' }}>Start tracking your nutrition!</p>
            </div>
          ) : (
            filteredLogs.map(log => (
              <div
                key={log.logId}
                className="bg-white card-hover rounded-2xl p-6 shadow-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="mb-1 text-xl font-semibold" style={{ color: '#0F172A' }}>{log.foodName}</h4>
                    <p style={{ color: '#94A3B8' }}>
                      {new Date(log.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-200">
                    <p className="text-2xl font-bold" style={{ color: '#0EA5E9' }}>{log.calories}</p>
                    <p className="text-sm" style={{ color: '#94A3B8' }}>kcal</p>
                  </div>
                </div>
                <div className="flex gap-6" style={{ color: '#64748B' }}>
                  {/* Protein - Primary Blue */}
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#0EA5E9' }} />
                    <span>P: {log.protein}g</span>
                  </div>
                  {/* Carbs - Purple/Magenta */}
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#D946EF' }} />
                    <span>C: {log.carbs}g</span>
                  </div>
                  {/* Fats - Cyan */}
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#06B6D4' }} />
                    <span>F: {log.fats}g</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Manual Entry Dialog */}
      <Dialog
        open={showManualEntry}
        onClose={() => {
          setShowManualEntry(false);
          resetForm();
        }}
        title="Add Food Manually"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Food Name *"
            placeholder="e.g., Grilled Chicken"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
          />
          
          <Input
            label="Calories *"
            type="number"
            placeholder="200"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
          />
          
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Protein (g)"
              type="number"
              placeholder="0"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
            />
            <Input
              label="Carbs (g)"
              type="number"
              placeholder="0"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
            />
            <Input
              label="Fats (g)"
              type="number"
              placeholder="0"
              value={fats}
              onChange={(e) => setFats(e.target.value)}
            />
          </div>
          
          <Select
            label="Meal Type"
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            options={mealTabs.map(tab => ({ value: tab, label: tab }))}
          />
          
          <Button
            variant="primary"
            className="w-full"
            onClick={handleManualEntry}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Food'}
          </Button>
        </div>
      </Dialog>
      
      {/* AI Analysis Dialog */}
      <Dialog
        open={showAIAnalysis}
        onClose={() => {
          setShowAIAnalysis(false);
          setAiResult(null);
        }}
        title="Scan Food with AI"
        size="md"
      >
        <div className="space-y-6">
          {!analyzing && !aiResult && (
            <>
              <div className="glass-dark rounded-[var(--radius-card)] p-12 text-center border-2 border-dashed border-default">
                <div className="w-20 h-20 bg-surface rounded-[1.5rem] mx-auto mb-4 flex items-center justify-center">
                  <Upload className="w-10 h-10 text-muted" />
                </div>
                <p className="text-muted mb-2">Upload or capture a photo of your food</p>
                <p className="text-sm text-muted">AI will identify and analyze it</p>
              </div>
              
              <Button
                variant="primary"
                className="w-full"
                onClick={handleAIAnalysis}
              >
                <Camera className="w-5 h-5 mr-2" />
                Capture Photo
              </Button>
              
              <p className="text-xs text-muted text-center">
                Note: This is a demo. Real implementation would use device camera.
              </p>
            </>
          )}
          
          {analyzing && (
            <div className="py-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 relative">
                <Loader className="w-20 h-20 text-primary animate-spin" />
              </div>
              <h3 className="text-primary mb-2">Analyzing your food...</h3>
              <p className="text-muted">This may take a few seconds</p>
            </div>
          )}
          
          {aiResult && (
            <div className="space-y-5">
              <div className="glass-dark rounded-[var(--radius-card)] p-7 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 orb-subtle orb-small bg-blue-200 rounded-full" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <h3 className="text-primary flex-1">{aiResult.name}</h3>
                    <span className="px-4 py-1.5 bg-surface/80 rounded-xl text-sm text-muted shadow-sm">
                      {Math.round(aiResult.confidence * 100)}% confident
                    </span>
                  </div>
                  
                  <div className="glass rounded-2xl p-5 mb-5 text-center">
                    <p className="text-4xl text-primary mb-1">{aiResult.calories}</p>
                    <p className="text-muted">calories</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="glass rounded-2xl p-4 text-center">
                      <p className="text-2xl text-primary">{aiResult.protein}g</p>
                      <p className="text-xs text-muted">Protein</p>
                    </div>
                    <div className="glass rounded-2xl p-4 text-center">
                      <p className="text-2xl text-primary">{aiResult.carbs}g</p>
                      <p className="text-xs text-muted">Carbs</p>
                    </div>
                    <div className="glass rounded-2xl p-4 text-center">
                      <p className="text-2xl text-primary">{aiResult.fats}g</p>
                      <p className="text-xs text-muted">Fats</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Select
                label="Meal Type"
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                options={mealTabs.map(tab => ({ value: tab, label: tab }))}
              />
              
              <div className="flex gap-4">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={handleAIAnalysis}
                >
                  Retry
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={saveAIResult}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Food'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}