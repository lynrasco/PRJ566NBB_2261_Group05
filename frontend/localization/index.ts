import { I18n } from "i18n-js";
import { getLocales } from "expo-localization";

import en from "./en";
import fr from "./fr";
import es from "./es";
import de from "./de";

const i18n = new I18n({
  en,
  fr,
  es,
  de,
});

const deviceLocale = getLocales()[0]?.languageCode ?? "en";

i18n.locale = deviceLocale;
i18n.enableFallback = true;

export default i18n;