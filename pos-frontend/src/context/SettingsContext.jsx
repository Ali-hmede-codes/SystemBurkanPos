import { createContext, useContext, useState, useEffect } from 'react';
import en from '../i18n/en';
import ar from '../i18n/ar';

const langs = { en, ar };
const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('lang') || 'ar');
  const [paperSize, setPaperSize] = useState(() => localStorage.getItem('paperSize') || 'a4');

  const t = langs[language] || langs.en;
  const isRTL = language === 'ar';

  useEffect(() => {
    localStorage.setItem('lang', language);
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);
  }, [language, isRTL]);

  useEffect(() => {
    localStorage.setItem('paperSize', paperSize);
  }, [paperSize]);

  const changeLanguage = (lang) => setLanguage(lang);
  const changePaperSize = (size) => setPaperSize(size);

  return (
    <SettingsContext.Provider value={{ language, paperSize, t, isRTL, changeLanguage, changePaperSize }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
