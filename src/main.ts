import { createApp } from 'vue'
import { createPinia } from "pinia";
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import ru from 'element-plus/es/locale/lang/ru';
import 'element-plus/dist/index.css';
import axios from 'axios';

const url = 'https://brain-docs.herokuapp.com/api/v1';
const urlLocal = 'http://localhost:8181/braindocs/api/v1';

axios.defaults.baseURL = url;
axios.defaults.timeout = 10000;

createApp(App)
  .use(ElementPlus, {
    locale: ru
  })
  .use(createPinia())
  .use(router)
  .mount('#app');
