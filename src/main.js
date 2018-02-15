import Vue from 'vue'
import App from './App'
import VueLazyload from 'vue-lazyload'
import './style.css'

const debug = process.env !== 'production'
Vue.config.productionTip = debug

Vue.use(VueLazyload)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App)
})
