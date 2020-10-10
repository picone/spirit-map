import Vue from 'vue'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/zh-CN'
import BaiduMap from 'vue-baidu-map'

import App from './App'
import router from './router'
import store from './store'

if (!process.env.IS_WEB) {
  Vue.use(require('vue-electron'))
}
Vue.use(Element, { locale })
Vue.use(BaiduMap, { ak: 'qvnrfp8nMLjy15HBeXzuyxZ2A01rYB4q' })

Vue.config.productionTip = process.env.NODE_ENV === 'production'

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
