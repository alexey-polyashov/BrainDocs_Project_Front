import { defineStore } from "pinia"
import { UserInfoType } from "../types";

interface Store {
  userInfo: {
    token: string,
    authorized: boolean,
    userExtra: UserInfoType
  }
}

export const useStore = defineStore('main', {
  state: () => {
    return ({
      userInfo: {
        token: '',
        authorized: false,
        userExtra: {}
      }
    } as Store);
  },
  getters: {
    getUserInfo: (state) => state.userInfo,
  },
  actions: {
  }
})
