import 'material-design-icons-iconfont/dist/material-design-icons.css';
import Vue from 'vue';
import axios from 'axios';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.css';

import App from './App';
import router from './router';
import store from './store';
import underscore from '../plugins/underscore'

// Vue i18n
import VueI18n from 'vue-i18n'
import { i18n } from '@/setup/i18n-setup'
Vue.use(VueI18n)

Vue.use(Vuetify);
if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;

Vue.use(underscore)

/* Add finally to promise */
Promise.prototype.finally = function (cb) {  // eslint-disable-line no-extend-native
  const res = () => this
  const fin = () => Promise.resolve(cb()).then(res)
  return this.then(fin, fin)
}

/* eslint-disable no-new */
new Vue({
  components: { App },
  i18n,
  router,
  store,
  template: '<App/>',
}).$mount('#app');
