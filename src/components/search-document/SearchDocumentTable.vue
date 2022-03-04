<template>
  <div>
    <el-table
      :data="documentsView"
      :default-sort="{ prop: 'id', order: 'ascending' }"
      border
      table-layout="auto"
      @selection-change="selectionChange"
      @row-click="rowClick"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="number" label="Номер" sortable width="100" />
      <el-table-column prop="documentDate" label="Дата" sortable width="120" />
      <el-table-column prop="heading" label="Название" sortable width="180" />
      <el-table-column prop="author" label="Автор" sortable width="180" />
      <el-table-column
        prop="organisation"
        label="Организация"
        sortable
        width="180"
      />
      <el-table-column prop="files" label="Файлы" sortable width="110">
        <template #default="scope">
          <el-button @click="(e) => openFilesDialog(e, scope.row)">
            Файлы
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      class="table-paging"
      layout="prev, pager, next"
      :page-count="documentFilterData ? documentFilterData.totalPages : 0"
      :current-page="currentPage"
      @update:current-page="curPageUpdate"
    />
    <AttachedFilesDialog
      ref="filesDialog"
      :should-send-requests-on-change="true"
    />
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AttachedFilesDialog from '../file-dialog/AttachedFilesDialog.vue';
import { DocFilterResponse, DocTypeView } from './types';

const props = defineProps<{
  documentsView: DocTypeView[];
  documentFilterData?: DocFilterResponse;
}>();

const emit = defineEmits<{
  (event: 'currentPageChange', newNum: number): void;
}>();

const router = useRouter();
let selectedViews: DocTypeView[] = [];
const currentPage = ref(1);
const filesDialog = ref();

function curPageUpdate(newPageNum: number) {
  currentPage.value = newPageNum;
  emit('currentPageChange', newPageNum);
}

function openFilesDialog(event: Event, row: DocTypeView) {
  event.stopPropagation();
  filesDialog.value?.updateView(row.id);
  filesDialog.value?.toggleVisible();
}

function selectionChange(selection: DocTypeView[]) {
  selectedViews = selection;
}

function rowClick(row: DocTypeView) {
  router.push({ name: 'new-doc', params: { id: row.id } });
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth',
  });
}

function deleteSelected(onFinished: () => void) {
  if (selectedViews.length === 0) {
    ElMessage.info('Нет выбранных елементов');
  } else {
    ElMessageBox.confirm('Подтвердите удаление', {
      type: 'warning',
    }).then(() => {
      const promises: Promise<any>[] = [];
      selectedViews.forEach((val) => {
        promises.push(axios.delete(`/documents/${val.id}`));
      });
      selectedViews = [];
      Promise.all(promises)
        .then((res) => {
          ElMessage.info('Документы удалены');
        })
        .catch((err) => {
          ElMessage.info('Произошла ошибка');
        })
        .finally(() => onFinished());
    });
  }
}

defineExpose({
  deleteSelected,
});
</script>

<style scoped>
.table-paging {
  margin-top: 8px;
  justify-content: center;
}
</style>
