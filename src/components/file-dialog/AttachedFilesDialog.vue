<template>
  <el-dialog
    v-model="dialogVisible"
    title="Files"
    width="600px"
  >
    <el-table
      :data="fileTableData"
      style="width: 100%"
      max-height="300"
    >
      <el-table-column
        prop="name"
        label="Имя"
      />
      <el-table-column
        prop="author.shortname"
        label="Автор"
      />
      <el-table-column
        prop="fileType"
        label="Тип файла"
      />
      <el-table-column
        fixed="right"
        label="Операции"
        width="150"
      >
        <template #default="scope">
          <el-button
            type="text"
            size="small"
            @click="editFileClick(scope.row)"
          >
            Изменить
          </el-button>
          <el-popconfirm
            title="Уверены, что хотите удалить?"
            @confirm="removeFile(scope.row, scope.$index)"
          >
            <template #reference>
              <el-button
                type="text"
                size="small"
              >
                Удалить
              </el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <span class="dialog-footer">
        <el-button
          type="primary"
          @click="dialogVisible = false"
        >Закрыть</el-button>
      </span>
    </template>
    <div style="margin-top: 16px; text-align: center">
      <el-button
        type="primary"
        @click="enableNewFilesDialog"
      >
        Новый файл
      </el-button>
    </div>
  </el-dialog>
  <NewFileDialog
    ref="newFileDialog"
    :doc-id="docId"
    :update-view="updateView"
    :should-send-requests-on-change="shouldSendRequestsOnChange"
    @file-saved="updateTableEntry"
  />
</template>

<script lang="ts" setup>
import { ref } from "vue";
import NewFileDialog from "./NewFileDialog.vue";
import axios from "axios";
import { ElMessage } from "element-plus";
import { FileDescriptionType, FullFileType } from "./types";
import { uploadFileToExistingDocument } from "../../net/common-requests";
import _ from "lodash";

const props = withDefaults(defineProps<{
  shouldSendRequestsOnChange?: boolean
}>(), {
  shouldSendRequestsOnChange: false
});

const fileTableData = ref<FileDescriptionType[]>([]);
const docId = ref(0);
const newFileDialog = ref();
const dialogVisible = ref(false);
const toggleVisible = () => dialogVisible.value = !dialogVisible.value;
let localEntryId = 0;

function updateTableEntry(fileInfo: FileDescriptionType) {
  const clonedInfo = _.clone(fileInfo);
  clonedInfo.author = { id: fileInfo.author.id };
  if (clonedInfo.id) {
    const index = fileTableData.value.findIndex(val => val.id === clonedInfo.id);
    fileTableData.value[index] = clonedInfo;
  } else {
    clonedInfo.id = localEntryId;
    localEntryId++;
    fileTableData.value.push(clonedInfo);
  }
}

function updateView(id: number) {
  if (props.shouldSendRequestsOnChange) {
    docId.value = id;
    fileTableData.value = [];
    axios
      .get<FullFileType[]>(`/documents/${docId.value}/files`)
      .then(res => {
        fileTableData.value = res.data;
      });
  }
}

function editFileClick(fileInfo: FileDescriptionType) {
	newFileDialog.value.dialogVisible = true;
	newFileDialog.value.editMode(fileInfo);
}

function removeFile(row: FileDescriptionType, index: number) {
  if (props.shouldSendRequestsOnChange) {
    axios
      .delete(`/documents/${docId.value}/files/${row.id}`)
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

async function sendStoredFilesToDocument(docId: number) {
  if (props.shouldSendRequestsOnChange) return;
  if (fileTableData.value.length === 0) return;
  let promises: Promise<FullFileType>[] = [];
  fileTableData.value.forEach(element => {
    delete element.id;
    promises.push(uploadFileToExistingDocument(docId, element));
  });
  Promise.all(promises).then(() => {
    ElMessage.success('Загрузка файлов прошла успешно!');
  })
}

defineExpose({
  toggleVisible,
  updateView,
  sendStoredFilesToDocument,
  resetState
});
</script>

<style scoped>
</style>
