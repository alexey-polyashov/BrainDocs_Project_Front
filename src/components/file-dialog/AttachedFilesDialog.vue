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
  />
</template>

<script lang="ts" setup>
import { ref } from "vue";
import NewFileDialog from "./NewFileDialog.vue";
import axios from "axios";
import { ElMessage } from "element-plus";
import { FileType } from "./types";

const fileTableData = ref<FileType[]>([]);
const docId = ref(0);
const newFileDialog = ref();
const dialogVisible = ref(false);
const toggleVisible = () => {
  dialogVisible.value = !dialogVisible.value;
};

function updateView(id: number) {
  docId.value = id;
  fileTableData.value = [];
  axios
    .get<FileType[]>(`/documents/${docId.value}/files`)
    .then(res => {
      fileTableData.value = res.data;
    });
}

function editFileClick(fileInfo: FileType) {
	newFileDialog.value.dialogVisible = true;
	newFileDialog.value.editMode(fileInfo);
}

function removeFile(row: FileType, index: number) {
  axios
    .delete(`/documents/${docId.value}/files/${row.id}`)
    .then(() => {
      fileTableData.value.splice(index, 1);
      ElMessage.warning('Файл удален');
    });
}

function enableNewFilesDialog() {
  newFileDialog.value.dialogVisible = true;
}

defineExpose({
  toggleVisible,
  updateView
});
</script>

<style scoped>
</style>
