import Vue from 'vue';
import Router from 'vue-router';
import { loadLanguageAsync } from '@/setup/i18n-setup';

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'welcome-view',
      component: require('@/renderer/components/WelcomeView').default,
    },
    {
      path: '/inspire',
      name: 'inspire',
      component: require('@/renderer/components/InspireView').default,
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
});

router.beforeEach((to, from, next) => {
  const lang = to.params.lang || 'zh-CN';
  loadLanguageAsync(lang).then(() => next());
})

export default router;
