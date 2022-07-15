import Vue from 'vue'
import DeviceDrag from "@/assets/device-drag";
import App from './App.vue'

Vue.config.productionTip = false

Vue.use(DeviceDrag)

new Vue({
  render: h => h(App),
}).$mount('#app')
