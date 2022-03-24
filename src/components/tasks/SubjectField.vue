<template>
  <div>
    <h4>Предметы</h4>
    <el-scrollbar :height="200" class="exec-box">
      <el-link
        type="primary"
        class="subject-text"
        @click="onFieldClick(subject.id)"
      >
        {{ subject.heading }}
        {{ subject.number }}, Автор - {{ subject.author?.shortname }}</el-link
      >
      <el-link
        v-for="file in fileList"
        :key="file.id"
        type="primary"
        style="margin-left: 16px"
        :href="`https://brain-docs.herokuapp.com/api/v1/documents/${subject.id}/files/${file.id}/data`"
        target="_blank"
      >
        Файл: {{ file.name }}, Автор: {{ file.author.shortname }}
      </el-link>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { FileDescriptionType } from '../file-dialog/types';
import { DocFilterResponseContent } from '../search/types';

const props = defineProps<{
  subject: DocFilterResponseContent;
}>();

const router = useRouter();
const fileList = ref<FileDescriptionType[]>([]);

axios
  .get<FileDescriptionType[]>(`documents/${props.subject.id}/files`)
  .then((res) => {
    fileList.value = res.data;
  });

function onFieldClick(id: number) {
  router.push({ name: 'edit-doc', params: { id } });
}
</script>

<style scoped>
h4 {
  margin-top: 32px;
  margin-bottom: 4px;
}

.subject-text {
  margin: 0;
  font-size: 0.95rem;
}

.exec-box {
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  margin-bottom: 8px;
  padding: 8px;
}
</style>
