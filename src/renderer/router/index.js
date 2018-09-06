import Vue from 'vue'
import Router from 'vue-router'

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
})

export default router
