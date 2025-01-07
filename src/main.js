import { createApp } from 'vue';
import Antd from 'ant-design-vue';
import App from './App.vue';
import router from "./router/index.js";
import 'ant-design-vue/dist/reset.css';
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as Icons from '@ant-design/icons-vue';
import axios from "axios";
import { createPinia } from 'pinia'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '../src/assets/quill.css'
import 'qweather-icons/font/qweather-icons.css'

axios.defaults.baseURL = "http://localhost:8081"
// axios.defaults.baseURL = "http://129.204.155.72:8081" // 部署线上
const app = createApp(App)

app.use(router)
app.use(Antd)
app.use(ElementPlus)
app.use(createPinia())
const icons= Icons

app.mount('#app')
for(const  i in icons){
  app.component(i,icons[i])
}