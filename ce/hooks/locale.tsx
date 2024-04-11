import { send } from 'process';
import React, { createContext, useContext } from 'react';
import { sendToBackground } from "@plasmohq/messaging"

// Define the shape of your context value
interface LocaleContextValue {
  locale: string;
  setLocale: (locale: string) => void;
  localeData: Record<string, string>;
}

// Create the context
const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

// Create a custom hook to access the context value
export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}

// Create a provider component to wrap your app
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = React.useState('en'); // Set the initial locale here
  const [localeData, setLocaleData] = React.useState({});

  // Define any other functions or state variables related to locale
  React.useEffect(() => {
    const fetchLocaleData = async () => {
      try {
        const path = chrome.runtime.getURL(`/assets/locales/${locale}/messages.json`)
        console.log({ path })
        const response = await fetch(chrome.runtime.getURL(`/assets/locales/${locale}/messages.json`));
        const data = await response.json();
        console.log({ data })
        setLocaleData(data);
      } catch (error) {
        console.error('Error fetching locale data:', error);
      }
    };

    const fetchUserSetLocale = async () => {
      const defaultLang = navigator.language.split('-')[0]
      const lang = await sendToBackground({
        name: "getLang"
      })

      setLocale(lang || defaultLang)
      return lang || defaultLang
    }

    fetchUserSetLocale()
    fetchLocaleData();
  }, []);

  const value: LocaleContextValue = {
    locale,
    setLocale,
    localeData
  };

  console.log({ localeData })
  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}