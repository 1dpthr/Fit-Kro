import React from 'react';
import { Home, Dumbbell, Utensils, TrendingUp, User } from 'lucide-react';

interface BottomNavProps {
  currentScreen: string;
  // allow generic screen value
  onNavigate: (screen: any) => void;
}

export function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'food', label: 'Food', icon: Utensils },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User }
  ];
  
  return (
    <div role="navigation" aria-label="Bottom Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t fixed-bottom-safe" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around px-2 py-3" style={{ minHeight: 56 }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isActive
                  ? 'text-white'
                  : 'text-slate-500'
              }`}
              style={{
                backgroundColor: isActive ? '#0EA5E9' : 'transparent'
              }}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
