import React, { createContext, useContext, useState, useEffect } from 'react';
import { TemperatureUnit } from '../types/weather';

interface UnitContextType {
  unit: TemperatureUnit;
  toggleUnit: () => void;
  setUnit: (u: TemperatureUnit) => void;
  formatTemp: (celsius: number, includeDegree?: boolean) => string;
  toCurrentUnit: (celsius: number) => number;
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

const STORAGE_KEY = 'weathergpt_temp_unit';

export const UnitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unit, setUnitState] = useState<TemperatureUnit>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'C' || saved === 'F') {
      return saved;
    }
    return 'C';
  });

  const toggleUnit = () => {
    setUnitState((prev) => {
      const next = prev === 'C' ? 'F' : 'C';
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  };

  const setUnit = (u: TemperatureUnit) => {
    setUnitState(u);
    localStorage.setItem(STORAGE_KEY, u);
  };

  const toCurrentUnit = (celsius: number): number => {
    if (unit === 'F') {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return Math.round(celsius);
  };

  const formatTemp = (celsius: number, includeDegree: boolean = true): string => {
    const val = toCurrentUnit(celsius);
    if (!includeDegree) return `${val}`;
    return `${val}°${unit}`;
  };

  return (
    <UnitContext.Provider value={{ unit, toggleUnit, setUnit, formatTemp, toCurrentUnit }}>
      {children}
    </UnitContext.Provider>
  );
};

export const useUnit = (): UnitContextType => {
  const context = useContext(UnitContext);
  if (!context) {
    throw new Error('useUnit must be used within a UnitProvider');
  }
  return context;
};
