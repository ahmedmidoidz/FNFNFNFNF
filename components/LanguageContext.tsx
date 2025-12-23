
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { translations } from '../translations';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ar');

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang === 'ar' ? 'ar-DZ' : lang === 'fr' ? 'fr-DZ' : 'en-US';
  };

  React.useEffect(() => {
    // Initialize default direction
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar-DZ';
  }, []);

  const t = (path: string): string => {
    const keys = path.split('.');
    let result: any = translations[language] || translations['ar'];

    for (const key of keys) {
      if (result && result[key]) {
        result = result[key];
      } else {
        return keys[keys.length - 1];
      }
    }
    return typeof result === 'string' ? result : keys[keys.length - 1];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
