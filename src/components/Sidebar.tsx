import React from 'react';
import { Home, Dumbbell, Utensils, TrendingUp, User } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface SidebarProps {
  currentScreen: string;
  // Accept a generic screen type to avoid tight coupling with App type definitions
  onNavigate: (screen: any) => void;
}

export function Sidebar({ currentScreen, onNavigate }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'food', label: 'Food Log', icon: Utensils },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User }
  ];
  
  return (
    <aside 
      role="navigation" 
      aria-label="Main Sidebar" 
      className="hidden md:flex md:flex-col w-64 shadow-lg md:fixed md:top-0 md:left-0 md:h-screen md:overflow-y-auto bg-white border-r border-gray-200"
      style={{ 
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        color: '#0F172A'
      }}
    >
      {/* Logo */}
      <div className="p-6 border-b" style={{ borderColor: '#E2E8F0' }}>
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" 
            style={{ backgroundColor: '#0EA5E9' }}
            aria-label="Fit Kro Home"
          >
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: '#0F172A' }}>Fit Kro</h2>
            <p className="text-sm" style={{ color: '#64748B' }}>Train Smart</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav aria-label="Primary" className="flex-1 p-6 space-y-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all focus-visible:ring-2 ${
                isActive
                  ? 'shadow-lg'
                  : 'hover:bg-gray-50'
              }`}
              style={{
                backgroundColor: isActive ? '#0EA5E9' : 'transparent',
                color: isActive ? '#FFFFFF' : '#0F172A'
              }}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav> 
      
      {/* Footer */}
      <div className="p-6 border-t" style={{ borderColor: '#E2E8F0' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium" style={{ color: '#64748B' }}>Fit Kro</p>
            <p className="text-xs mt-1" style={{ color: '#64748B' }}>Train Smart. Eat Smart.</p>
          </div>
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </aside>
  );
}
