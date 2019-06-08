import Vue from 'vue'
import VueI18n from 'vue-i18n'
import axios from 'axios'
import { remote } from 'electron'

Vue.use(VueI18n)

// our default language that is prelaoded
const defaultLang = remote.app.getLocale()

// Default locale
export const i18n = new VueI18n({
  locale: defaultLang, // set locale
  fallbackLocale: 'zh-CN',
  silentFallbackWarn: true
})

export function setI18nLanguage (lang) {
  console.log(lang)
  i18n.locale = lang
  axios.defaults.headers.common['Accept-Language'] = lang
  document.querySelector('html').setAttribute('lang', lang)
  return lang
}
