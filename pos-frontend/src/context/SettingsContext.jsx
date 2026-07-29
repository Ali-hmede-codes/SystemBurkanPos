import { createContext, useContext, useState, useEffect } from 'react';
import en from '../i18n/en';
import ar from '../i18n/ar';

const langs = { en, ar };
const SettingsContext = createContext(null);

const DEFAULT_CUSTOM_SIZE = { width: '100', height: '150', unit: 'mm' };

export function SettingsProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('lang') || 'ar');
  const [paperSize, setPaperSize] = useState(() => localStorage.getItem('paperSize') || 'a4');
  const [customSize, setCustomSize] = useState(() => {
    const saved = localStorage.getItem('customPaperSize');
    return saved ? JSON.parse(saved) : DEFAULT_CUSTOM_SIZE;
  });

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

  useEffect(() => {
    localStorage.setItem('customPaperSize', JSON.stringify(customSize));
  }, [customSize]);

  const changeLanguage = (lang) => setLanguage(lang);
  const changePaperSize = (size) => setPaperSize(size);
  const changeCustomSize = (size) => setCustomSize(size);

  return (
    <SettingsContext.Provider value={{ language, paperSize, customSize, t, isRTL, changeLanguage, changePaperSize, changeCustomSize }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
