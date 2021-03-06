/* eslint-disable @typescript-eslint/no-explicit-any */
<template>
  <el-dialog
    v-model="dialogVisible"
    title="Добавление файла"
    width="500px"
    @close="clearFormData"
  >
    <el-form label-width="auto" :model="fileForm">
      <el-form-item label="Имя файла" prop="name">
        <el-input v-model="fileForm.name" />
      </el-form-item>
      <el-form-item label="Описание" prop="description">
        <el-input v-model="fileForm.description" />
      </el-form-item>
      <el-form-item v-if="shouldSendRequestsOnChange" label="Просмотр файла">
        <el-link
          :href="`https://brain-docs.herokuapp.com/api/v1/${elemTypeUrl}/${$props.elemId}/files/${fileForm.id}/data`"
          type="primary"
          target="_blank"
        >
          preview
        </el-link>
      </el-form-item>
      <el-form-item v-if="shouldSendRequestsOnChange" label="Ссылка файла">
        <el-link
          :href="`https://brain-docs.herokuapp.com/api/v1/${elemTypeUrl}/${$props.elemId}/files/${fileForm.id}/download`"
          type="primary"
          target="_blank"
          :download="fileForm.name"
        >
          download
        </el-link>
      </el-form-item>
    </el-form>
    <el-upload
      ref="uploadRef"
      class="upload-box"
      drag
      action="blank"
      :auto-upload="false"
      :limit="1"
      :on-change="fileSelected"
      :on-exceed="handleLimit"
    >
      <span class="material-icons-round upload-icon">cloud_upload</span>
      <div class="el-upload__text">
        Положите файл сюда или
        <em>нажмите для загрузки</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">любое расширение, размер до 500kb</div>
      </template>
    </el-upload>
    <template #footer>
      <el-button type="primary" @click="save"> Сохранить </el-button>
      <el-button @click="dialogVisible = false"> Отмена </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { ElMessage, ElUpload, genFileId, UploadRawFile } from 'element-plus';
import { FileDescriptionType, FullFileType } from './types';
import {
  DirectoryTypesAlias,
  getUrlByDirectoryType,
  uploadFileToExistingElement,
} from '../../net/common-requests';
import { LocalFileDescriptionType } from './AttachedFilesDialog.vue';
import upload from 'element-plus/es/components/upload';

const props = defineProps<{
  shouldSendRequestsOnChange: boolean;
  elemId: number;
  elemType: DirectoryTypesAlias;
  updateView: (id: number) => void;
}>();

const emit = defineEmits<{
  (event: 'fileSaved', fileInfo: LocalFileDescriptionType): void;
}>();

const elemTypeUrl = getUrlByDirectoryType(props.elemType);
const uploadRef = ref<InstanceType<typeof ElUpload>>();
const dialogVisible = ref(false);
const fileForm = reactive<LocalFileDescriptionType>({
  name: '',
  description: '',
  fileType: '',
  author: { id: 1, name: '' },
});

function fileSelected(file: any) {
  if (file instanceof Event) return;

  fileForm.fileRaw = file.raw;
  fileForm.name = file.name;
  fileForm.fileType = fileForm.name.slice(fileForm.name.lastIndexOf('.') + 1);
}

function clearFormData() {
  delete fileForm.id;
  delete fileForm.localId;
  delete fileForm.fileRaw;
  fileForm.name = '';
  fileForm.description = '';
  fileForm.fileType = '';
  uploadRef.value?.clearFiles();
}

function save() {
  function uploadCleanUp() {
    dialogVisible.value = false;
    clearFormData();
  }

  if (fileForm.fileRaw || fileForm.id) {
    emit('fileSaved', fileForm);
    uploadCleanUp();
  } else {
    ElMessage.warning('Выберите файл');
  }
}

function editMode(fileInfo: FullFileType | LocalFileDescriptionType) {
  fileForm.name = fileInfo.name;
  fileForm.id = fileInfo.id;
  if ((fileInfo as any).localId) fileForm.localId = (fileInfo as any).localId;
  fileForm.description = fileInfo.description;
}

function handleLimit(files: any) {
  uploadRef.value?.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadRef.value?.handleStart(file);
}

defineExpose({
  dialogVisible,
  editMode,
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
