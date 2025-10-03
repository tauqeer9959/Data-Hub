import React, { createContext, useContext, useState, ReactNode } from 'react';

export type EducationLevel = 'bachelor' | 'master' | 'phd';

interface EducationLevelContextType {
  currentLevel: EducationLevel;
  setCurrentLevel: (level: EducationLevel) => void;
  getLevelDisplay: (level: EducationLevel) => string;
  getLevelIcon: (level: EducationLevel) => string;
}

const EducationLevelContext = createContext<EducationLevelContextType | undefined>(undefined);

export function useEducationLevel() {
  const context = useContext(EducationLevelContext);
  if (!context) {
    throw new Error('useEducationLevel must be used within an EducationLevelProvider');
  }
  return context;
}

interface EducationLevelProviderProps {
  children: ReactNode;
}

export function EducationLevelProvider({ children }: EducationLevelProviderProps) {
  const [currentLevel, setCurrentLevel] = useState<EducationLevel>('bachelor');

  const getLevelDisplay = (level: EducationLevel): string => {
    switch (level) {
      case 'bachelor':
        return 'Bachelor\'s Degree';
      case 'master':
        return 'Master\'s Degree';
      case 'phd':
        return 'PhD/Doctorate';
      default:
        return '';
    }
  };

  const getLevelIcon = (level: EducationLevel): string => {
    switch (level) {
      case 'bachelor':
        return '🎓';
      case 'master':
        return '📚';
      case 'phd':
        return '🔬';
      default:
        return '🎓';
    }
  };

  return (
    <EducationLevelContext.Provider
      value={{
        currentLevel,
        setCurrentLevel,
        getLevelDisplay,
        getLevelIcon,
      }}
    >
      {children}
    </EducationLevelContext.Provider>
  );
}