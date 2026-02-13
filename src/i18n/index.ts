import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import koTranslation from './locales/ko/translation.json';
import enTranslation from './locales/en/translation.json';

const resources = {
  ko: {
    translation: koTranslation,
  },
  en: {
    translation: enTranslation,
  },
};

i18n
  .use(LanguageDetector) // 브라우저 언어 자동 감지
  .use(initReactI18next) // React 바인딩
  .init({
    resources,
    fallbackLng: 'ko', // 기본 언어
    debug: false,
    
    interpolation: {
      escapeValue: false, // React already escapes
    },
    
    detection: {
      order: ['localStorage', 'navigator'], // localStorage 우선, 그 다음 브라우저 설정
      caches: ['localStorage'],
      lookupLocalStorage: 'titas_lang', // appStore와 동일한 키
    },
  });

export default i18n;
