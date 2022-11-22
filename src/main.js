import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import DeviceDrag from "./lib/vue3-device-drag.js";

createApp(App).use(DeviceDrag).mount("#app");
