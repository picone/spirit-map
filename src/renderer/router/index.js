import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'map',
      component: require('../components/MapPage').default
    },
    {
      path: '/setting',
      name: 'setting',
      component: () => import('../components/SettingPage')
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
