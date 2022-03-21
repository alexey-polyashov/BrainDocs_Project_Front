<template>
  <EditElementPage
    :form-data="formData"
    :use-files-dialog="false"
    elem-type="tasks"
    :apply-form-data="applyFormData"
    :apply-request-data="applyRequestData"
    @on-close-click="$router.push({ name: 'tasks' })"
  >
    <template #header>
      <h2>{{ formData.id ? 'Редактирование задачи' : 'Новая задача' }}</h2>
    </template>
    <template #form-items>
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
        <p style="margin-right: 8px">Тип задачи</p>
        <SelectableField
          v-if="!readonly"
          v-model="formData.taskType"
          :value-is-object="true"
          style="width: 200px; margin-right: 32px"
          select-type="taskTypes"
          label-name="typeName"
        >
        </SelectableField>
        <p v-else style="font-weight: 700">Type</p>
      </div>
      <div style="display: flex">
        <div style="width: 50%; margin-right: 16px">
          <h4>Заголовок</h4>
          <el-input v-model="formData.heading"></el-input>
          <h4>Содержание</h4>
          <el-input v-model="formData.content" type="textarea"></el-input>
          <div v-if="formData.id">
            <h4>Исполнители</h4>
            <div class="exec-box">
              <div
                v-for="executor in executorsData"
                :key="executor.id"
                style="margin-bottom: 4px; display: flex"
              >
                <el-tooltip content="Удалить" placement="top">
                  <span
                    style="
                      font-size: 1.3rem;
                      color: red;
                      cursor: pointer;
                      margin-right: 8px;
                    "
                    class="material-icons-round"
                    @click="removeExecutor(executor.id)"
                  >
                    close
                  </span>
                </el-tooltip>
                <span style="color: var(--el-color-primary)">{{
                  executor.executor.shortname
                }}</span
                >, срок - {{ executor.planedDate }},&nbsp;
                <span>{{ executor.result.resultName }}</span>
              </div>
            </div>
            <el-button @click="executorsDialogVisible = true">
              Добавить
            </el-button>
          </div>
          <el-alert
            v-else
            style="margin-top: 16px; border: 1px solid var(--el-border-color)"
            title="Создайте задачу, чтобы добавить исполнителей"
            type="warning"
            center
            :closable="false"
          />
        </div>
        <div style="width: 50%">
          <div>
            <h4>Предметы</h4>
            <div class="exec-box"></div>
          </div>
        </div>
      </div>
    </template>
    <template #extra>
      <CommentList
        v-if="formData.id"
        :id="formData.id"
        elem-type="tasks"
      ></CommentList>
      <el-alert
        v-else
        style="margin-top: 16px; border: 1px solid var(--el-border-color)"
        title="Создайте задачу, чтобы добавить комментарии"
        type="warning"
        center
        :closable="false"
      />
    </template>
  </EditElementPage>
  <el-dialog
    v-model="executorsDialogVisible"
    title="Добавить исполнителя"
    width="500px"
  >
    <el-form label-width="200px" label-position="left">
      <el-form-item label="Исполнитель">
        <SelectableField
          v-model="addExecutorForm.executor.id"
          select-type="users"
        >
        </SelectableField
      ></el-form-item>
      <el-form-item label="Дата выполнения">
        <el-date-picker
          v-model="addExecutorForm.planedDate"
          type="datetime"
        ></el-date-picker>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="addExecutor">Добавить</el-button>
        <el-button @click="executorsDialogVisible = false">Закрыть</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { Id, UserShortname } from '@/types';
import { ref } from 'vue';
import SelectableField from '../helpers/SelectableField.vue';
import EditElementPage from '../search/EditElementPage.vue';
import CommentList from '../helpers/CommentList.vue';
import { convertDate, convertDateTime } from '@/common';
import _ from 'lodash-es';
import axios from 'axios';
import { ElMessage } from 'element-plus';

export interface TaskDataType {
  author: UserShortname;
  content: string;
  createTime: string;
  heading: string;
  id?: number;
  subjects: Subject[];
  taskType: Id;
}

export interface Subject {
  date: string;
  id: number;
  name: string;
  number: string;
  subjectType: string;
}

interface ExecutorInfo {
  comment: string;
  createdAt: string;
  dateOfCompletion: string;
  executor: UserShortname;
  id: number;
  planedDate: string;
  result: {
    resultName: string;
  };
  status: number;
}

const readonly = ref(false);
const executorsDialogVisible = ref(false);
const formData = ref<TaskDataType>({
  author: {
    id: 1,
    shortname: '',
  },
  content: '',
  createTime: convertDate(new Date()),
  heading: '',
  subjects: [],
  taskType: {
    id: -1,
  },
});

const executorsData = ref<ExecutorInfo[]>([]);
const addExecutorForm = ref({
  executor: {
    id: '',
  },
  planedDate: '',
});

function applyFormData(source: TaskDataType) {
  formData.value = source;
  fetchExecutorsList();
}
function applyRequestData() {
  const clonedData: Partial<TaskDataType> = _.cloneDeep(formData.value);
  delete clonedData.createTime;
  return clonedData;
}

function addExecutor() {
  axios
    .post(`tasks/${formData.value.id}/executors`, addExecutorForm.value)
    .then((res) => {
      fetchExecutorsList();
    });
  executorsDialogVisible.value = false;
}

function removeExecutor(id: number) {
  axios
    .delete<ExecutorInfo[]>(`tasks/${formData.value.id}/executors/${id}`)
    .then((res) => {
      ElMessage.info('Исполнитель удален');
      fetchExecutorsList();
    });
}

function fetchExecutorsList() {
  axios
    .get<ExecutorInfo[]>(`tasks/${formData.value.id}/executors`)
    .then((res) => {
      console.log(res.data);
      executorsData.value = res.data;
    });
}
</script>

<style scoped>
h4 {
  margin-top: 16px;
  margin-bottom: 4px;
}

.exec-box {
  min-height: 100px;
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  margin-bottom: 8px;
  padding: 8px;
}
</style>
