<template>
  <div>
    <el-table
      :data="tableDataView"
      :default-sort="{ prop: 'id', order: 'ascending' }"
      border
      table-layout="auto"
      @selection-change="selectionChange"
      @row-click="(id) => $emit('rowClick', id)"
    >
      <slot name="columns"></slot>
    </el-table>
    <el-pagination
      background
      class="table-paging"
      layout="prev, pager, next"
      :page-count="filterData ? filterData.totalPages : 0"
      :current-page="currentPage"
      @update:current-page="curPageUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { Id } from '@/types';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { SearchDefaultResponse } from '../types';

const props = defineProps<{
  tableDataView: unknown[];
  filterData?: SearchDefaultResponse;
  filterType: string;
}>();

const emit = defineEmits<{
  (event: 'currentPageChange', newNum: number): void;
  (event: 'rowClick', id: Id): void;
}>();

const router = useRouter();
let selectedViews: Id[] = [];
const currentPage = ref(1);

function curPageUpdate(newPageNum: number) {
  currentPage.value = newPageNum;
  emit('currentPageChange', newPageNum);
}

function selectionChange(selection: Id[]) {
  selectedViews = selection;
}

function deleteSelected(onFinished?: () => void) {
  if (selectedViews.length === 0) {
    ElMessage.info('Нет выбранных елементов');
  } else {
    ElMessageBox.confirm('Подтвердите удаление', {
      type: 'warning',
    }).then(() => {
      const promises: Promise<any>[] = [];
      selectedViews.forEach((val) => {
        promises.push(axios.delete(`/${props.filterType}/${val.id}`));
      });
      selectedViews = [];
      Promise.all(promises)
        .then((res) => {
          ElMessage.info('Элементы удалены');
        })
        .catch((err) => {
          ElMessage.info('Произошла ошибка');
        })
        .finally(() => {
          if (onFinished) onFinished();
        });
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
