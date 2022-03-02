import { defineStore } from "pinia"
import { UserInfoType } from "../types";

const widthMinMapping = {
  sm: 425,
  md: 768,
  lg: 1024,
}

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
