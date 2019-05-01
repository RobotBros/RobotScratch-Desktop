import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'welcome-view',
      component: require('@/components/WelcomeView').default
    },
    {
      path: '/servo-debugger',
      name: 'servoDebugger',
      component: require('@/components/ServoDebuggerView').default
    },
    {
      path: '/designer',
      name: 'designer',
      component: require('@/components/DesignerView').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

export default router
