import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '@/services/api';

export interface SchoolSettings {
  schoolName: string;
  tagline: string;
  shortName: string;
  schoolEmail: string;
  schoolPhone: string;
  address: string;
  city: string;
  principalName: string;
  currentAcademicYear: string;
  currencySymbol: string;
  website: string;
  campuses: string[];
  systems: string[];
  currentCampus: string;
  currentSession: string;
}

export const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  schoolName: "My School Management System",
  tagline: "Next-Generation Campus & School ERP",
  shortName: "IVEM",
  schoolEmail: "info@schoolsystem.edu",
  schoolPhone: "+92 300 1234567",
  address: "Main Education Boulevard",
  city: "Islamabad, Pakistan",
  principalName: "Prof. Sarah Johnson",
  currentAcademicYear: "2024-2025",
  currencySymbol: "Rs.",
  website: "www.schoolsystem.edu",
  campuses: ["Main Campus", "City Campus", "North Campus", "Junior Wing"],
  systems: ["Matric", "Cambridge (O/A Levels)", "Federal Board", "Oxford Syllabus"],
  currentCampus: "Main Campus",
  currentSession: "2024-2025",
};

interface SchoolContextType {
  settings: SchoolSettings;
  updateSettings: (newSettings: Partial<SchoolSettings>) => Promise<void>;
  setCampus: (campus: string) => void;
  setSession: (session: string) => void;
  isLoading: boolean;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SchoolSettings>(() => {
    try {
      const saved = localStorage.getItem('school_settings');
      if (saved) {
        return { ...DEFAULT_SCHOOL_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_SCHOOL_SETTINGS;
  });

  const [isLoading] = useState(false);

  // Sync with backend on mount
  useEffect(() => {
    let mounted = true;
    const fetchRemoteSettings = async () => {
      try {
        const res = await api.get<Partial<SchoolSettings>>('/settings');
        if (mounted && res) {
          setSettings((prev) => {
            const merged = { ...prev, ...res };
            localStorage.setItem('school_settings', JSON.stringify(merged));
            return merged;
          });
        }
      } catch {
        // Backend might be offline, keep local settings
      }
    };
    fetchRemoteSettings();
    return () => {
      mounted = false;
    };
  }, []);

  const updateSettings = useCallback(async (newFields: Partial<SchoolSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newFields };
      localStorage.setItem('school_settings', JSON.stringify(merged));
      return merged;
    });

    // Try saving to backend
    try {
      await api.put('/settings', newFields);
    } catch {
      // Saved in localStorage successfully
    }
  }, []);

  const setCampus = useCallback((campus: string) => {
    setSettings((prev) => {
      const updated = { ...prev, currentCampus: campus };
      localStorage.setItem('school_settings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const setSession = useCallback((session: string) => {
    setSettings((prev) => {
      const updated = { ...prev, currentSession: session, currentAcademicYear: session };
      localStorage.setItem('school_settings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <SchoolContext.Provider
      value={{
        settings,
        updateSettings,
        setCampus,
        setSession,
        isLoading,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = (): SchoolContextType => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
