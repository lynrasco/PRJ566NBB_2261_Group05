import { useLanguage } from "@/context/language-context";
import i18n from "@/localization";

export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: string) => i18n.t(key, { locale: language });

  return { t, language };
}