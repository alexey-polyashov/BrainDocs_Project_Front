import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { DirectoryTypesAlias, updateUserData } from './net/common-requests';
import { RouteNames } from './router';
import { useStore } from './store';

export function convertDate(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function verifyAuth() {
  const store = useStore();
  installAuthHeader();
  if (store.getUserInfo.authorized) {
    updateUserData().catch((err) => {
      console.log('not authorized, deleting stored user info');
      store.clearUserInfo();
    });
  }
}

export function installAuthHeader() {
  const store = useStore();
  if (store.getUserInfo.token) {
    axios.defaults.headers.common['Authorization'] =
      'Bearer ' + store.getUserInfo.token;
  }
}

export function useAuthGuard() {
  const router = useRouter();
  const store = useStore();
  router.beforeEach((to, from, next) => {
    if (
      routeAllowedForUnauthorized(to.name as RouteNames) ||
      store.getUserInfo.authorized
    ) {
      next();
    } else {
      ElMessage.info('Вы не авторизованы');
      next({ name: 'login' });
    }
  });
}

const allowedRoutes: RouteNames[] = ['login', 'register'];

export function routeAllowedForUnauthorized(name: RouteNames) {
  return allowedRoutes.indexOf(name) !== -1;
}
