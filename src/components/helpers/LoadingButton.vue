<template>
  <el-button :type="(type as any)" :loading="loading" @click="$emit('click')">
    {{ buttonText }}
  </el-button>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const loading = ref(false);
const setLoading = (val: boolean) => (loading.value = val);

defineExpose({
  setLoading,
});

withDefaults(
  defineProps<{
    type?: string;
    buttonText: string;
  }>(),
  { type: 'primary' }
);

defineEmits<{
  (event: 'click'): void;
}>();
</script>

<style scoped></style>
