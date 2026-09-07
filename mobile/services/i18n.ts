import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

import en from '../locales/en.json';
import hi from '../locales/hi.json';
import bn from '../locales/bn.json';

const translations = {
  en,
  hi,
  bn,
};

const i18n = new I18n(translations);

// Set the locale once at the beginning of your app.
i18n.locale = Localization.getLocales()[0]?.languageCode ?? 'en';
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export default i18n;
