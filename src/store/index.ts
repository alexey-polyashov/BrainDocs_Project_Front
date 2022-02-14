import { defineStore } from "pinia"

const widthMinMapping = {
  sm: 425,
  md: 768,
  lg: 1024,
}

export const useStore = defineStore('main', {
  state: () => {
    return {
      windowWidth: 0
    }
  },
  actions: {
    windowResize(newWidth: number) {
      this.windowWidth = newWidth
    },
    checkWidthTypeFits(widthType: keyof (typeof widthMinMapping)): boolean {
      return this.windowWidth >= widthMinMapping[widthType]
    }
  }
})
