<template>
  <el-card class="content-box">
    <slot name="header"></slot>
    <el-form ref="formRef" :model="formData" label-width="auto">
      <slot name="form-items"></slot>
      <div class="button-group">
        <el-button
          size="large"
          type="primary"
          class="button"
          @click="saveClick"
        >
          Сохранить
        </el-button>
        <el-button
          v-if="useFilesDialog"
          class="button"
          size="large"
          @click="toggleFileAttachDialog"
        >
          Файлы
        </el-button>
        <el-button class="button" size="large" @click="$emit('onCloseClick')">
          Закрыть
        </el-button>
        <AttachedFilesDialog
          v-if="useFilesDialog"
          ref="filesDialog"
          :elem-type="elemType"
          :should-send-requests-on-change="shouldSendRequestsOnChange"
        />
      </div>
      <slot name="extra"></slot>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import AttachedFilesDialog from '@/components/file-dialog/AttachedFilesDialog.vue';
import {
  DirectoryTypesAlias,
  getUrlByDirectoryType,
} from '@/net/common-requests';
import axios from 'axios';
import { ElForm, ElMessage, ElMessageBox } from 'element-plus';
import _ from 'lodash-es';
import { isReactive, onMounted, reactive, ref, toRef, watch } from 'vue';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import { ValidationRules } from './types';

const props = defineProps<{
  formData: any;
  useFilesDialog: boolean;
  elemType: DirectoryTypesAlias;
  applyFormData: (source: any) => void;
  applyRequestData: () => any;
  setId?: (id: number) => void;
  validate?: () => boolean;
  validationRules?: ValidationRules;
}>();

const emit = defineEmits<{
  (event: 'onCloseClick'): void;
}>();

const router = useRouter();
const shouldSendRequestsOnChange = ref(false);
const formRef = ref<InstanceType<typeof ElForm> | null>(null);
const filesDialog = ref<InstanceType<typeof AttachedFilesDialog> | null>(null);
const modified = ref(false);
const setModified = (mod: boolean) => {
  modified.value = mod;
};
const getModified = () => {
  return modified.value;
};
const filterTypeLocal = ref(getUrlByDirectoryType(props.elemType));
// eslint-disable-next-line @typescript-eslint/no-empty-function
let watchStopHandle = () => {};

const toggleFileAttachDialog = () => {
  filesDialog.value?.toggleVisible();
};

let id = router.currentRoute.value.params.id
  ? +(router.currentRoute.value.params.id as string)
  : -1;
if (id !== -1) editMode(id);

onBeforeRouteLeave(async (to, from) => {
  if (modified.value) {
    let result = false;
    await ElMessageBox.confirm(
      'Есть несохраненные изменения, закрыть без сохранения?',
      { type: 'warning' }
    ).then(() => (result = true));
    return result;
  } else {
    return true;
  }
});

function processValidation() {
  if (props.validationRules) {
    for (const rule of props.validationRules) {
      if (!rule.callback()) {
        ElMessage.warning(rule.message);
        return false;
      }
    }
  }
  if (!props.validate) {
    return true;
  } else return props.validate();
}

function saveClick() {
  if (processValidation()) {
    formRef.value?.validate((passed, failedFields) => {
      if (passed) {
        ElMessageBox.confirm('Сохранить?', {
          type: 'warning',
        }).then(() => {
          sendSaveRequest(props.applyRequestData());
        });
      } else {
        ElMessage.warning({
          message: 'Некоторые поля заполнены неверно',
          grouping: true,
        });
      }
    });
  }
}

async function sendSaveRequest(data: any) {
  let clonedData = _.cloneDeep(data);
  ElMessage.info('Идет сохранение...');
  if (id >= 0) {
    clonedData.id = id;
  }
  if (clonedData.id < 0) {
    delete clonedData.id;
  }
  return axios
    .post<number>(
      `/${filterTypeLocal.value}` + (clonedData.id ? `/${clonedData.id}` : ''),
      clonedData
    )
    .then((res) => {
      id = res.data;
      if (props.setId) props.setId(id);
      ElMessage.success('Сохранение успешно!');
      filesDialog.value?.sendStoredFilesToElement(res.data);
      editMode(res.data, false);
    })
    .catch((error) => {
      console.log(error);
      ElMessage.error('error');
    });
}

function clearForms() {
  formRef.value?.resetFields();
  filesDialog.value?.resetState();
}

function beginWatch() {
  watchStopHandle();
  modified.value = false;
  watchStopHandle = watch(props.formData, (newVal) => {
    modified.value = true;
    watchStopHandle();
  });
}

// if id is present and is not less than 0, edit mode is on
async function editMode(elemId: number, shouldFetch = true) {
  async function fetchElementById(elemId: number) {
    return axios.get<any>(`/${filterTypeLocal.value}/${elemId}`).then((res) => {
      props.applyFormData(res.data);
    });
  }

  if (shouldFetch) await fetchElementById(elemId);
  shouldSendRequestsOnChange.value = true;
  filesDialog.value?.updateView(elemId);
  beginWatch();
}

defineExpose({
  editMode,
  setModified,
  getModified,
});
</script>

<style scoped>
.button-group {
  display: flex;
  justify-content: end;
}

.button {
  margin-top: 16px;
  margin-right: 16px;
}

.content-box {
  margin-top: 0;
}

.card-header {
  font-size: x-large;
  font-weight: bold;
}
</style>
