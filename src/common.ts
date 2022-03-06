import axios from 'axios';
import { useStore } from './store';

export function convertDate(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function installAuthHeader() {
  const store = useStore();
  if (store.getUserInfo.token) {
    axios.defaults.headers.common['Authorization'] =
      'Bearer ' + store.getUserInfo.token;
  }
}
