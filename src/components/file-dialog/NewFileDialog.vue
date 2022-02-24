/* eslint-disable @typescript-eslint/no-explicit-any */
<template>
  <el-dialog
    v-model="dialogVisible"
    title="Добавление файла"
    width="500px"
    @close="clearFormData"
  >
    <el-form
      label-width="auto"
      :model="fileForm"
    >
      <el-form-item
        label="Имя файла"
        prop="name"
      >
        <el-input v-model="fileForm.name" />
      </el-form-item>
      <el-form-item
        label="Описание"
        prop="description"
      >
        <el-input v-model="fileForm.description" />
      </el-form-item>
      <el-form-item
        v-if="editFileInfo"
        label="Просмотр файла"
      >
        <el-link
          :href="`https://brain-docs.herokuapp.com/api/v1/documents/${$props.docId}/files/${editFileInfo.id}/data`"
          type="primary"
          target="_blank"
        >
          preview
        </el-link>
      </el-form-item>
      <el-form-item
        v-if="editFileInfo"
        label="Ссылка файла"
      >
        <el-link
          :href="`https://brain-docs.herokuapp.com/api/v1/documents/${$props.docId}/files/${editFileInfo.id}/download`"
          type="primary"
          target="_blank"
          :download="editFileInfo.name"
        >
          download
        </el-link>
      </el-form-item>
    </el-form>
    <el-upload
      ref="uploadRef"
      class="upload-box"
      drag
      action=""
      :auto-upload="false"
      :on-change="fileSelected"
      :on-exceed="onLimitExceed"
      :limit="1"
    >
      <span class="material-icons-round upload-icon">cloud_upload</span>
      <div class="el-upload__text">
        Положите файл сюда или
        <em>нажмите для загрузки</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          любое расширение, размер до 500kb
        </div>
      </template>
    </el-upload>
    <template #footer>
      <el-button
        type="primary"
        @click="upload"
      >
        Сохранить
      </el-button>
      <el-button @click="dialogVisible = false">
        Отмена
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { reactive, ref, watch } from "vue";
import axios from "axios";
import { ElMessage, ElUpload } from "element-plus";
import { FileDescriptionType, FileType } from "./types";

const props = defineProps<{
  docId: number,
  updateView: (id: number) => void,
}>();

const uploadRef = ref<InstanceType<typeof ElUpload>>();
const dialogVisible = ref(false);
const fileForm = reactive<FileDescriptionType>({
  name: '',
  description: '',
  fileType: '',
  author: { id: 1 },
});
let requestFile: File | null = null;
const editFileInfo = ref<FileType | null>(null);
let editModeEnabled = false;

watch(editFileInfo, (newVal) => {
  editModeEnabled = newVal != null;
});

function fileSelected(file: any) {
  console.log(file);
  requestFile = file.raw;
  fileForm.name = file.name;
  fileForm.fileType = fileForm.name.slice(fileForm.name.lastIndexOf('.') + 1);
}

function clearFormData() {
  for (const fileFormKey in fileForm) {
    if (typeof fileForm[fileFormKey] === 'string') fileForm[fileFormKey] = '';
  }
  requestFile = null;
  uploadRef.value?.clearFiles();
  editFileInfo.value = null;
}

function upload() {
  if (editModeEnabled || requestFile) {
    const formData = new FormData();
    formData.append('fileDescribe', JSON.stringify(fileForm));
    if (requestFile) formData.append('file', requestFile);
    axios
      .post(`/documents/${props.docId}/files/${editModeEnabled ? editFileInfo.value?.id : 'upload'}`, formData)
      .then(() => {
        ElMessage.success('Загрузка прошла успешно!');
        dialogVisible.value = false;
        props.updateView(props.docId);
        clearFormData();
      })
      .catch(err => {
        console.log(err);
      });
  } else {
    ElMessage.warning('Выберите файл');
  }
}

function editMode(fileInfo: FileType) {
  editFileInfo.value = fileInfo;
  fileForm.name = fileInfo.name;
  fileForm.description = fileInfo.description;
}

function onLimitExceed(files: any, fileList: any) {
  fileList[0] = files[0];
}

defineExpose({
  dialogVisible,
  editMode
});
</script>

<style scoped>
.upload-icon {
  margin-top: 40px;
  font-size: 5em;
  color: rgba(0, 0, 0, 0.3);
}

.upload-box {
  margin-top: 16px;
  text-align: center;
}
</style>
