import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { DirectoryTypesAlias, updateUserData } from './net/common-requests';
import { RouteNames } from './router';
import { useStore } from './store';

export function convertDate(date: Date) {
  const monthString = date.getMonth().toString();
  const dayString = date.getDate().toString();
  const month = monthString.length === 1 ? '0' + monthString : monthString;
  const day = dayString.length === 1 ? '0' + dayString : dayString;
  return `${date.getFullYear()}-${month}-${day}`;
}

export function convertDateTime(date: Date) {
  const dateString = convertDate(date);
  const hoursString = date.getHours();
  const minutesString = date.getMinutes();
  return `${dateString} ${hoursString}:${minutesString}`;
}

export function verifyAuth() {
  const store = useStore();
  const router = useRouter();
  installAuthHeader();
  if (store.getUserInfo.authorized) {
    updateUserData().catch((err) => {
      ElMessage.info('Вы не авторизованы');
      console.log('not authorized, deleting stored user info');
      store.clearUserInfo();
      router.push({ name: 'login' });
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

export const getTime = (obj: string) => {
  return obj.split(' ')[1];
};

export const getDate = (obj: string) => {
  return obj.split(' ')[0];
};
