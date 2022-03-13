import axios from 'axios';
import { updateUserData } from './net/common-requests';
import { useStore } from './store';

export function convertDate(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function verifyAuth() {
  const store = useStore();
  if (store.getUserInfo.authorized) {
    updateUserData()
      .then(() => {
        installAuthHeader();
      })
      .catch((err) => {
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
