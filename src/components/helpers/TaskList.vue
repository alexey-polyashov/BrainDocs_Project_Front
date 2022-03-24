<template>
  <div>
    <h4>Задачи</h4>
    <el-scrollbar :height="200" class="task-box">
      <div
        v-for="task in taskList"
        :key="task.id"
        class="task-item"
        @click="
          $router.push({
            name: 'edit-task',
            params: {
              id: task.id,
              primarySubjectId: id,
              primarySubjectType: 'doc',
            },
          })
        "
      >
        <p
          style="
            font-weight: 700;
            font-size: 0.8rem;
            color: var(--m-date-color);
          "
        >
          {{ getDate(task.createTime) }}
        </p>
        <p>
          {{ task.heading }}, Автор -
          <span style="color: var(--el-color-primary)">{{
            task.author.shortname
          }}</span>
        </p>
        <p>
          Статус -
          <span
            :style="{
              color: executorStatusColors[task.status].color,
            }"
            >{{ taskExecutorStatuses[task.status] }}</span
          >
        </p>
      </div>
    </el-scrollbar>
    <el-button
      type="primary"
      @click="
        $router.push({
          name: 'edit-task',
          params: { primarySubjectId: id, primarySubjectType: 'doc' },
        })
      "
      >Добавить задачу</el-button
    >
  </div>
</template>

<script setup lang="ts">
import { getDate } from '@/common';
import { IndexedStrType } from '@/types';
import axios from 'axios';
import { ref } from 'vue';
import { TaskDataType } from '../tasks/types';
import {
  getTaskExecutorStatuses,
  taskExecutorStatuses,
} from '@/net/common-requests';
import { executorStatusColors } from '../tasks/common';

const props = defineProps<{
  id: number | string;
}>();

const taskList = ref<TaskDataType[]>([]);

axios.get<TaskDataType[]>(`documents/${props.id}/tasks`).then((res) => {
  taskList.value = res.data;
});
</script>

<style scoped>
h4 {
  margin-top: 32px;
  margin-bottom: 8px;
}
p {
  margin: 0;
}

.task-box {
  height: 200px;
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  margin-bottom: 8px;
  padding: 8px;
}

.task-item {
  margin: 4px 4px;
  padding: 4px;
  transition: all 0.1s;
  border-radius: 4px;
}

.task-item:hover {
  background-color: rgba(104, 76, 156, 0.2);
  cursor: pointer;
}
</style>
