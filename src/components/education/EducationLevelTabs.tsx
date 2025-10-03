import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { useEducationLevel, EducationLevel } from './EducationLevelProvider';
import { ClearBachelorData } from './ClearBachelorData';
import { GraduationCap, BookOpen, Microscope } from 'lucide-react';

interface EducationLevelTabsProps {
  className?: string;
  onDataCleared?: () => void;
}

export function EducationLevelTabs({ className, onDataCleared }: EducationLevelTabsProps) {
  const { currentLevel, setCurrentLevel, getLevelDisplay } = useEducationLevel();

  const levels: { value: EducationLevel; label: string; icon: React.ReactNode }[] = [
    { 
      value: 'bachelor', 
      label: 'Bachelor\'s', 
      icon: <GraduationCap className="h-4 w-4" /> 
    },
    { 
      value: 'master', 
      label: 'Master\'s', 
      icon: <BookOpen className="h-4 w-4" /> 
    },
    { 
      value: 'phd', 
      label: 'PhD', 
      icon: <Microscope className="h-4 w-4" /> 
    },
  ];

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-medium">Education Level</h3>
          <Badge variant="outline" className="text-xs">
            {getLevelDisplay(currentLevel)}
          </Badge>
        </div>
      </div>
      
      <div className="space-y-6">
        <Tabs 
          value={currentLevel} 
          onValueChange={(value) => {
            setCurrentLevel(value as EducationLevel);
            // Dispatch event to refresh dashboard stats when education level changes
            window.dispatchEvent(new CustomEvent('dashboardRefresh'));
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            {levels.map((level) => (
              <TabsTrigger 
                key={level.value} 
                value={level.value}
                className="flex items-center gap-2"
              >
                {level.icon}
                <span className="hidden sm:inline">{level.label}</span>
                <span className="sm:hidden">{level.value.toUpperCase()}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        {currentLevel === 'bachelor' && (
          <ClearBachelorData onDataCleared={onDataCleared} />
        )}
      </div>
    </div>
  );
}