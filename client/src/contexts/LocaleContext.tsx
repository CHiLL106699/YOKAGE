import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Locale, defaultLocale, t as translate, formatDate as fmtDate, formatCurrency as fmtCurrency, formatNumber as fmtNumber } from "@/lib/i18n";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  formatDate: (date: Date | string) => string;
  formatCurrency: (amount: number) => string;
  formatNumber: (num: number) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = "yochill-locale";

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // 從 localStorage 讀取，如果沒有則使用預設值
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (stored && ["zh-TW", "zh-CN", "en"].includes(stored)) {
        return stored as Locale;
      }
    }
    return defaultLocale;
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    // 更新 HTML lang 屬性
    document.documentElement.lang = newLocale;
  };

  useEffect(() => {
    // 初始化時設定 HTML lang 屬性
    document.documentElement.lang = locale;
  }, [locale]);

  const value: LocaleContextType = {
    locale,
    setLocale,
    t: (key: string) => translate(key, locale),
    formatDate: (date: Date | string) => fmtDate(date, locale),
    formatCurrency: (amount: number) => fmtCurrency(amount, locale),
    formatNumber: (num: number) => fmtNumber(num, locale),
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}
