import Vue from 'vue'
import VueI18n from 'vue-i18n'
import axios from 'axios'
import { remote } from 'electron'

Vue.use(VueI18n)

// Default locale
export const i18n = new VueI18n({
  locale: 'zh-CN', // set locale
  fallbackLocale: 'zh-CN'
})

// our default language that is prelaoded
const defaultLang = remote.app.getLocale()
const loadedLanguages = []
loadLanguageAsync(defaultLang)

export function setI18nLanguage (lang) {
  i18n.locale = lang
  axios.defaults.headers.common['Accept-Language'] = lang
  document.querySelector('html').setAttribute('lang', lang)
  return lang
}

export function loadLanguageAsync (lang) {
  if (i18n.locale !== lang) {
    if (!loadedLanguages.includes(lang)) {
      return import(/* webpackChunkName: "lang-[request]" */ `@/lang/${lang}`).then(msgs => {
        i18n.setLocaleMessage(lang, msgs.default)
        loadedLanguages.push(lang)
        return setI18nLanguage(lang)
      })
    }
    return Promise.resolve(setI18nLanguage(lang))
  }
  return Promise.resolve(lang)
}
