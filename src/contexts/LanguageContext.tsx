import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'mr' | 'kn' | 'te' | 'ta';

export const LANGUAGES = [
  { code: 'en' as Language, name: 'English', nativeName: 'English' },
  { code: 'hi' as Language, name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'mr' as Language, name: 'Marathi', nativeName: 'मराठी' },
  { code: 'kn' as Language, name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'te' as Language, name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta' as Language, name: 'Tamil', nativeName: 'தமிழ்' },
];

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<string, any>>({});

  useEffect(() => {
    // Load language from localStorage
    const savedLanguage = localStorage.getItem('selectedLanguage') as Language;
    if (savedLanguage && LANGUAGES.find(lang => lang.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    // Load translations for current language
    const loadTranslations = async () => {
      try {
        const translationModule = await import(`../translations/${currentLanguage}.json`);
        setTranslations(translationModule.default);
      } catch (error) {
        console.warn(`Failed to load translations for ${currentLanguage}, falling back to English`);
        if (currentLanguage !== 'en') {
          try {
            const fallbackModule = await import('../translations/en.json');
            setTranslations(fallbackModule.default);
          } catch (fallbackError) {
            console.error('Failed to load fallback translations');
            setTranslations({});
          }
        }
      }
    };

    loadTranslations();
  }, [currentLanguage]);

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('selectedLanguage', language);
  };

  const t = (key: string, fallback?: string): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    // Ensure we return a string
    if (typeof value === 'string') {
      return value;
    }
    
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};