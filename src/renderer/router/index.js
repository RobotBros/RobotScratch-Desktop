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
      path: '/servo-debugger',
      name: 'servoDebugger',
      component: require('@/renderer/components/ServoDebuggerView').default,
    },
    {
      path: '/designer',
      name: 'designer',
      component: require('@/renderer/components/DesignerView').default,
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
