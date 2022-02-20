<template>
  <el-dialog
    v-model="dialogVisible"
    title="Files"
  >
    <el-table
      :data="fileTableData"
      style="width: 100%"
      max-height="300"
    >
      <el-table-column
        prop="id"
        label="id"
      />
      <el-table-column
        prop="name"
        label="Name"
      />
      <el-table-column
        prop="author.shortname"
        label="Uploaded by"
      />
      <el-table-column
        prop="fileType"
        label="File type"
      />
      <el-table-column
        fixed="right"
        label="Operations"
        width="120"
      >
        <template #default="scope">
          <el-popconfirm
            title="Are you sure to delete this?"
            @confirm="removeFile(scope.row, scope.$index)"
          >
            <template #reference>
              <el-button
                type="text"
                size="small"
              >
                Remove
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
        >Close</el-button>
      </span>
    </template>
    <div style="margin-top: 16px; text-align: center">
      <el-button
        type="primary"
        @click="enableNewFilesDialog"
      >
        New File
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
import axiosInstance from "../../net/axios-instance";
import { ElMessage } from "element-plus";

interface FileType {
  id: number;
  name: string;
  storageType: number;
  description: string;
  fileSize: number;
  author: {
    id: number,
    shortname: string
  };
  contentType: string;
  originalFilename: string;
  fileType: string;
  link: string;
}

const fileTableData = ref<FileType[]>([]);
const docId = ref(0);
const newFileDialog = ref();
const dialogVisible = ref(false);
const toggleVisible = () => {
  dialogVisible.value = !dialogVisible.value
};

function updateView(id: number) {
  docId.value = id;
  fileTableData.value = [];
  axiosInstance
    .get<FileType[]>(`/documents/${ id }/files`)
    .then(res => {
      fileTableData.value = res.data;
    });
}

function removeFile(row: FileType, index: number) {
  axiosInstance.delete(`/documents/${docId.value}/files/${row.id}`).then(res => {
    fileTableData.value.splice(index, 1);
    ElMessage.warning('file deleted');
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
