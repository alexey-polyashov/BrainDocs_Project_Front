<template>
  <el-dialog v-model="dialogVisible" title="Файлы" width="600px">
    <el-table :data="fileTableData" style="width: 100%" max-height="300">
      <el-table-column prop="name" label="Имя" />
      <el-table-column prop="author.shortname" label="Автор" />
      <el-table-column prop="fileType" label="Тип файла" />
      <el-table-column fixed="right" label="Операции" width="150">
        <template #default="scope">
          <el-button type="text" size="small" @click="editFileClick(scope.row)">
            Изменить
          </el-button>
          <el-popconfirm
            title="Уверены, что хотите удалить?"
            @confirm="removeFile(scope.row, scope.$index)"
          >
            <template #reference>
              <el-button type="text" size="small"> Удалить </el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false"
          >Закрыть</el-button
        >
      </span>
    </template>
    <div style="margin-top: 16px; text-align: center">
      <el-button type="primary" @click="enableNewFilesDialog">
        Новый файл
      </el-button>
    </div>
  </el-dialog>
  <NewFileDialog
    ref="newFileDialog"
    :elem-type="elemType"
    :elem-id="elemId"
    :update-view="updateView"
    :should-send-requests-on-change="shouldSendRequestsOnChange"
    @file-saved="fileSaved"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import NewFileDialog from './NewFileDialog.vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { FullFileType, FileDescriptionType } from './types';
import {
  DirectoryTypesAlias,
  getUrlByDirectoryType,
  uploadFileToExistingElement,
} from '../../net/common-requests';
import _ from 'lodash-es';

export interface LocalFileDescriptionType extends FileDescriptionType {
  localId?: number;
}

const props = withDefaults(
  defineProps<{
    elemType: DirectoryTypesAlias;
    shouldSendRequestsOnChange?: boolean;
  }>(),
  {
    shouldSendRequestsOnChange: false,
  }
);
const fileTableData = ref<LocalFileDescriptionType[]>([]);
const elemId = ref(0);
const newFileDialog = ref();
const dialogVisible = ref(false);
const toggleVisible = () => (dialogVisible.value = !dialogVisible.value);
const elemTypeLocal = getUrlByDirectoryType(props.elemType);
let localEntryId = 0;

function fileSaved(fileInfo: LocalFileDescriptionType) {
  if (props.shouldSendRequestsOnChange) {
    uploadFileToExistingElement(props.elemType, elemId.value, fileInfo).then(
      (res) => {
        ElMessage.success('Загрузка прошла успешно!');
        updateView(elemId.value);
      }
    );
  } else {
    updateTableEntry();
  }

  function updateTableEntry() {
    const clonedInfo = _.clone(fileInfo);
    if (clonedInfo.localId) {
      const index = fileTableData.value.findIndex(
        (val) => val.localId === clonedInfo.localId
      );
      fileTableData.value[index] = clonedInfo;
    } else {
      clonedInfo.localId = localEntryId;
      localEntryId++;
      fileTableData.value.push(clonedInfo);
    }
  }
}

function updateView(id: number) {
  elemId.value = id;
  fileTableData.value = [];
  axios
    .get<FullFileType[]>(`/${elemTypeLocal}/${elemId.value}/files`)
    .then((res) => {
      fileTableData.value = res.data;
      fileTableData.value.forEach((el) => {
        el.localId = localEntryId;
        localEntryId++;
      });
    });
}

function editFileClick(fileInfo: LocalFileDescriptionType) {
  newFileDialog.value.dialogVisible = true;
  newFileDialog.value.editMode(fileInfo);
}

function removeFile(row: LocalFileDescriptionType, index: number) {
  if (props.shouldSendRequestsOnChange) {
    axios
      .delete(`/${elemTypeLocal}/${elemId.value}/files/${row.id}`)
      .then(() => {
        fileTableData.value.splice(index, 1);
        ElMessage.warning('Файл удален');
      });
  } else {
    fileTableData.value.splice(index, 1);
  }
}

function enableNewFilesDialog() {
  newFileDialog.value.dialogVisible = true;
}

function resetState() {
  fileTableData.value = [];
  localEntryId = 0;
}

async function sendStoredFilesToElement(docId: number) {
  if (props.shouldSendRequestsOnChange) return;
  if (fileTableData.value.length === 0) return;
  let promises: Promise<FullFileType>[] = [];
  fileTableData.value.forEach((element) => {
    promises.push(uploadFileToExistingElement(props.elemType, docId, element));
  });
  await Promise.all(promises).then(() => {
    ElMessage.success('Загрузка файлов прошла успешно!');
  });
}

defineExpose({
  toggleVisible,
  updateView,
  sendStoredFilesToElement,
  resetState,
});
</script>

<style scoped></style>
