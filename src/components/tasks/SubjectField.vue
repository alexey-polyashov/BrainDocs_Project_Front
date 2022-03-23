<template>
  <h4>Предметы</h4>
  <div class="exec-box">
    <el-link
      type="primary"
      class="subject-text"
      @click="onFieldClick(subject.id)"
    >
      {{ subject.heading }}
      {{ subject.number }}, Автор - {{ subject.author?.shortname }}</el-link
    >
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { DocFilterResponseContent } from '../search/types';

const props = defineProps<{
  subject: DocFilterResponseContent;
}>();

function onFieldClick(id: number) {
  useRouter().push({ name: 'edit-doc', params: { id } });
}
</script>

<style scoped>
.exec-box {
  min-height: 100px;
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  margin-bottom: 8px;
  padding: 8px;
}
</style>
