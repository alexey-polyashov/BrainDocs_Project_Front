<template>
  <el-check-tag :checked="checked">
    <slot />
  </el-check-tag>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const checked = ref(false);

// eslint-disable-next-line no-undef
defineExpose({
  checked
});
</script>

<style scoped>
</style>
