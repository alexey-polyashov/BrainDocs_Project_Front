<template>
  <EditElementPage
    ref="editElemPageRef"
    :form-data="formData"
    :use-files-dialog="true"
    elem-type="tasks"
    :apply-form-data="applyFormData"
    :apply-request-data="applyRequestData"
    @on-close-click="onClose"
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
            <el-scrollbar height="100px" class="exec-box">
              <div
                v-for="executor in executorsData"
                :key="executor.id"
                style="margin-bottom: 4px; display: flex; align-items: center"
              >
                <el-tooltip
                  v-if="couldBeDeleted(executor.status)"
                  content="Удалить"
                  placement="top"
                >
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
                <p>
                  <span style="color: var(--el-color-primary)">{{
                    executor.executor.shortname
                  }}</span
                  >, срок -&nbsp;
                  <span style="color: var(--m-date-color)">{{
                    getDate(executor.planedDate)
                  }}</span
                  >&nbsp;<span style="color: var(--m-time-color)">{{
                    getTime(executor.planedDate)
                  }}</span
                  >,&nbsp; <span>{{ executor.result.resultName }}</span>
                </p>
              </div>
            </el-scrollbar>
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
          <SubjectField
            v-if="primarySubjectId"
            :subject="(primarySubjectInfo as any)"
          >
          </SubjectField>
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
import { h, ref, watch } from 'vue';
import SelectableField from '../helpers/SelectableField.vue';
import EditElementPage from '../search/EditElementPage.vue';
import CommentList from '../helpers/CommentList.vue';
import { convertDate, convertDateTime, getDate, getTime } from '@/common';
import _ from 'lodash-es';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import { TaskDataType, ExecutorInfo } from './types';
import { DocFilterResponseContent } from '../search/types';
import SubjectField from './SubjectField.vue';
import { executorResultColors } from './common';

const readonly = ref(false);
const executorsDialogVisible = ref(false);
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

const router = useRouter();
const route = useRoute();

// don't wait for request to update the id value, so the page loades with no delay
formData.value.id = +(route.params.id as string);

const editElemPageRef = ref<InstanceType<typeof EditElementPage>>();
const executorsData = ref<ExecutorInfo[]>([]);
const addExecutorForm = ref({
  executor: {
    id: '',
  },
  planedDate: '',
});

const primarySubjectId: number = +route.params.primarySubjectId;
const primarySubjectType: string = route.params.primarySubjectType as string;
const primarySubjectInfo = ref<Partial<DocFilterResponseContent>>({
  id: primarySubjectId,
});

if (primarySubjectId) {
  axios.get(`documents/${primarySubjectId}`).then((res) => {
    primarySubjectInfo.value = res.data;
  });
}

function applyFormData(source: TaskDataType) {
  formData.value = source;
  fetchExecutorsList();
  watch(formData, () => {
    editElemPageRef.value?.setModified(true);
  });
}

function applyRequestData() {
  const clonedData: Partial<TaskDataType> = _.cloneDeep(formData.value);
  delete clonedData.createTime;
  clonedData.subjects?.push({ id: primarySubjectId } as any);
  return clonedData;
}

function couldBeDeleted(status: number) {
  return status != 3 && status != 4;
}

function addExecutor() {
  axios
    .post(`tasks/${formData.value.id}/executors`, addExecutorForm.value)
    .then((res) => {
      fetchExecutorsList();
      addExecutorForm.value = {
        executor: {
          id: '',
        },
        planedDate: '',
      };
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
      executorsData.value = res.data;
    });
}

function onClose() {
  if (primarySubjectId) {
    router.push({ name: 'edit-doc', params: { id: primarySubjectId } });
  } else {
    router.push({ name: 'tasks' });
  }
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
