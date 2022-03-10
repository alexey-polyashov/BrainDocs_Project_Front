<template>
  <el-check-tag :checked="checked">
    <slot></slot>
  </el-check-tag>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const checked = ref(false);

defineExpose({
  checked,
});
</script>

<style scoped></style>
