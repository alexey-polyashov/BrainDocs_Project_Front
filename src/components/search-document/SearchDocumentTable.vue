<template>
  <div>
    <el-table
      :data="documentsView"
      :default-sort="{ prop: 'id', order: 'ascending' }"
      border
      table-layout="auto"
    >
      <el-table-column
        type="selection"
        width="55"
      />
      <el-table-column
        prop="number"
        label="Номер"
        sortable
        width="100"
      />
      <el-table-column
        prop="documentDate"
        label="Дата"
        sortable
        width="120"
      />
      <el-table-column
        prop="heading"
        label="Название"
        sortable
        width="180"
      />
      <el-table-column
        prop="author"
        label="Автор"
        sortable
        width="180"
      />
      <el-table-column
        prop="organisation"
        label="Организация"
        sortable
        width="180"
      />
      <el-table-column
        prop="files"
        label="Файлы"
        sortable
        width="110"
      >
        <template #default="scope">
          <el-button @click="openFilesDialog(scope.row)">
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
import { ref } from 'vue';
import AttachedFilesDialog from '../file-dialog/AttachedFilesDialog.vue';
import { DocFilterResponse, DocTypeView } from './types';

const props = defineProps<{
  documentsView: DocTypeView[],
  documentFilterData?: DocFilterResponse,
}>();

const emit = defineEmits<{
  (event: 'currentPageChange', newNum: number): void,
}>();

const currentPage = ref(1);
const filesDialog = ref();

function curPageUpdate(newPageNum: number) {
  currentPage.value = newPageNum;
  emit('currentPageChange', newPageNum);
}

function openFilesDialog(row: DocTypeView) {
  console.log(row);
  filesDialog.value?.updateView(row.id);
  filesDialog.value?.toggleVisible();
}
</script>

<style scoped>
.table-paging {
  margin-top: 8px;
  justify-content: center;
}
</style>