// import * as Localization from 'expo-localization';
import { I18n } from "i18n-js";
import en from './en.json'
import ja from './ja.json'

export const i18n = new I18n({
  en: en,
  ja: ja,
});


i18n.locale = "ja"