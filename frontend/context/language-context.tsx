import React, { createContext, useContext, useState } from 'react';
import i18n from '@/localization';

type LanguageContextType = {
  language: string;
  setLanguage: (locale: string) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
});

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguageState] = useState(i18n.locale);

  const setLanguage = (locale: string) => {
    console.log("Before:", i18n.locale);
    i18n.locale = locale;
    console.log("After:", i18n.locale);
    setLanguageState(locale);
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}