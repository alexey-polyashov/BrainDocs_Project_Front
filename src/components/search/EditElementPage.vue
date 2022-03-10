<template>
  <el-card class="content-box" @click="modified = false">
    <slot name="header"></slot>
    <el-form ref="formRef" :model="formData" label-width="auto">
      <slot name="form-items" :form-data="formData"></slot>
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
import { onMounted, reactive, ref, toRef, watch } from 'vue';
import { onBeforeRouteLeave, useRouter } from 'vue-router';

const props = defineProps<{
  formData: any;
  useFilesDialog: boolean;
  elemType: DirectoryTypesAlias;
  applyFormData: (source: any) => void;
  applyRequestData: () => any;
}>();

const emit = defineEmits<{
  (event: 'onCloseClick'): void;
}>();

const router = useRouter();
const shouldSendRequestsOnChange = ref(false);
const formRef = ref<InstanceType<typeof ElForm> | null>(null);
const filesDialog = ref<InstanceType<typeof AttachedFilesDialog> | null>(null);
const modified = ref(false);
const filterTypeLocal = ref(getUrlByDirectoryType(props.elemType));

const toggleFileAttachDialog = () => {
  filesDialog.value?.toggleVisible();
};

onMounted(() => {
  const id = router.currentRoute.value.params.id;
  if (id) editMode(+(id as string));
});

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

function saveClick() {
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

async function sendSaveRequest(data: any) {
  ElMessage.info('Идет сохранение...');
  if (data.id < 0) {
    delete data.id;
  }
  await axios
    .post<number>(
      `/${filterTypeLocal.value}` + (data.id ? `/${data.id}` : ''),
      data
    )
    .then((res) => {
      ElMessage.success('Сохранение успешно!');
      filesDialog.value?.sendStoredFilesToElement(res.data);
      editMode(res.data);
      modified.value = false;
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

// if formData.id is present, edit mode is on
function editMode(elemId: number) {
  function fetchElementById(elemId: number) {
    axios.get<any>(`/${filterTypeLocal.value}/${elemId}`).then((res) => {
      props.applyFormData(res.data);
    });
  }
  fetchElementById(elemId);
  shouldSendRequestsOnChange.value = true;
  filesDialog.value?.updateView(elemId);
}

defineExpose({
  editMode,
  modified,
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
