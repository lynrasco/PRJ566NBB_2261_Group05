/*
import { useLanguage } from "@/context/language-context";
import i18n from "@/localization";

export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: string) => i18n.t(key, { locale: language });

  return { t, language };
}
*/
import { useLanguage } from "@/context/language-context";
import i18n from "@/localization";

export function useTranslation() {
  const { language } = useLanguage();

  const t = (
    key: string,
    options?: Record<string, any>
  ) => i18n.t(key, { locale: language, ...options });

  return { t, language };
}