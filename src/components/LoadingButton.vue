<template>
  <transition
    name="el-fade-in-linear"
    mode="out-in"
  >
    <el-button
      v-if="!loading"
      type="primary"
      @click="$emit('click')"
    >
      {{ buttonText }}
    </el-button>
    <el-button
      v-else
      type="primary"
      loading
    >
      {{ buttonText }}
    </el-button>
  </transition>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const loading = ref(false)

// eslint-disable-next-line no-undef
defineExpose({
  loading
})

// eslint-disable-next-line no-undef
defineProps<{
  buttonText: string
}>()

// eslint-disable-next-line no-undef
defineEmits<{
  (event: 'click'): void
}>()
</script>

<style scoped>
</style>
