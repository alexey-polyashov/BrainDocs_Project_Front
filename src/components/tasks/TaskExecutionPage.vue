<template>
  <el-card class="content-box" style="margin-top: 0">
    <h2>Выполнение задачи</h2>
    <div style="display: flex; align-items: center">
      <p style="margin-right: 32px">
        Номер:
        <span style="font-weight: 700">{{
          formData.id ? formData.id : 'нет'
        }}</span>
      </p>
      <p style="margin-right: 32px">
        Дата: <span style="font-weight: 700">{{ formData.createTime }}</span>
      </p>
      <p style="margin-right: 32px">
        Тип задачи:
        <span
          style="font-weight: 700"
          >{{ (formData.taskType as any).typeName }}</span
        >
      </p>
      <p style="margin-right: 32px">
        Автор:
        <span style="font-weight: 700">{{ formData.author.shortname }}</span>
      </p>
    </div>
    <div style="display: flex">
      <div style="width: 50%; margin-right: 16px">
        <h4>Заголовок</h4>
        <p>{{ formData.heading }}</p>
        <h4>Содержание</h4>
        <p type="textarea">{{ formData.content }}</p>
        <h4>Комментарий к выполнению</h4>
        <el-input v-model="resultComment" :rows="4" type="textarea"></el-input>
        <el-button
          v-for="result in executionResults"
          :key="result.resultType"
          :type="(executorResultColors[result.resultType] as any)"
          plain
          :style="{
            marginTop: '8px',
          }"
          @click="supplyResult(result.id)"
          >{{ result.resultName }}</el-button
        >
      </div>
      <div style="width: 50%"></div>
    </div>
    <el-divider></el-divider>
    <div style="text-align: end">
      <el-button @click="$router.push({ name: 'tasks' })">Закрыть</el-button>
    </div>
    <CommentList
      :id="(formData.id as number)"
      elem-type="tasks"
      style="margin-top: 16px"
    ></CommentList>
  </el-card>
</template>

<script setup lang="ts">
import { convertDate } from '@/common';
import { useStore } from '@/store';
import axios from 'axios';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import CommentList from '../helpers/CommentList.vue';
import { TaskDataType } from './types';
import SubjectField from './SubjectField.vue';
import { ElMessage } from 'element-plus';

interface ExecutionResultType {
  id: number;
  resultName: string;
  resultType: number;
}

const formData = ref<TaskDataType>({
  author: {
    id: 1,
    shortname: '',
  },
  status: -1,
  content: '',
  createTime: convertDate(new Date()),
  heading: '',
  subjects: [],
  taskType: {
    id: -1,
  },
});
const resultComment = ref('');
const executorResultColors: { [p: number]: string } = {
  1: 'success',
  2: 'warning',
  3: 'danger',
  4: 'primary',
};

// don't wait for request to update the id value, so the page loades with no delay
formData.value.id = +(useRoute().params.id as string);

const executionResults = ref<ExecutionResultType[]>([]);

axios.get(`tasks/${formData.value.id}`).then((res) => {
  applyFormData(res.data);
});

function applyFormData(source: TaskDataType) {
  formData.value = source;
  axios
    .get<ExecutionResultType[]>(
      `tasks/types/${formData.value.taskType.id}/results`
    )
    .then((res) => {
      executionResults.value = res.data;
    });
}

function supplyResult(resultId: number) {
  if (!resultComment.value) {
    ElMessage.warning('Напишите комментарий к выполнению');
    return;
  }
  const store = useStore();
  const userId = store.getUserInfo.authorized
    ? store.getUserInfo.userExtra?.id
    : 1;
  axios.post(`tasks/${formData.value.id}/executors/${userId}/result`, {
    resultId,
    resultComment: resultComment.value,
    executor: userId,
  });
}
</script>

<style scoped>
h4 {
  margin-top: 32px;
  margin-bottom: 4px;
}

p {
  margin: 0;
}

.exec-box {
  min-height: 100px;
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  margin-bottom: 8px;
  padding: 8px;
}
</style>
