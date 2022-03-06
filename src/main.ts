import { createApp } from 'vue';
import { createPinia, PiniaPluginContext } from 'pinia';
import App from './App.vue';
import router from './router';
import ElementPlus, { ElMessage } from 'element-plus';
import ru from 'element-plus/es/locale/lang/ru';
import './assets/my-styles.scss';
import axios from 'axios';
import { useStore } from './store';

const url = 'https://brain-docs.herokuapp.com/api/v1';
const urlLocal = 'http://localhost:8181/braindocs/api/v1';

axios.defaults.baseURL = url;
axios.defaults.timeout = 10000;

function piniaLocalStoragePlugin(context: PiniaPluginContext) {
  const persistedState = localStorage.getItem(context.store.$id);
  if (persistedState) {
    context.store.$state = JSON.parse(persistedState);
  }
  context.store.$subscribe((mutation, state) => {
    localStorage.setItem(context.store.$id, JSON.stringify(state));
  });
}

const pinia = createPinia();
pinia.use(piniaLocalStoragePlugin);

createApp(App)
  .use(ElementPlus, {
    locale: ru,
  })
  .use(pinia)
  .use(router)
  .mount('#app');
