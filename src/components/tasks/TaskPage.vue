<template>
  <el-card>
    <SearchFiltersWrapper
      :update-entry="updateEntry"
      filter-type="taskExecutors"
      :row-class-name="rowClassNames"
      @create-click="$router.push({ name: 'edit-task' })"
      @row-click="(idObj) => rowClick(idObj)"
    >
      <template #columns>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="task.heading" label="Заголовок" />
        <el-table-column label="Автор">
          <template #default="scope">
            <span style="color: var(--el-color-primary)">{{
              scope.row.task.author.shortname
            }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Срок выполнения">
          <template #default="scope">
            <DateTimeColored :date="scope.row.planedDate"></DateTimeColored>
          </template>
        </el-table-column>
        <el-table-column label="Дата получения">
          <template #default="scope">
            <DateTimeColored :date="scope.row.createdAt"></DateTimeColored>
          </template>
        </el-table-column>
        <el-table-column label="Исполнитель">
          <template #default="scope">
            <span style="color: var(--el-color-primary)">
              {{ scope.row.executor.shortname }}</span
            >
          </template>
        </el-table-column>
        <el-table-column label="Результат">
          <template #default="scope">
            <el-tag
              :type="(executorResultColors[scope.row.result.resultType].type as any)"
              style="font-size: 0.9rem"
              >{{ scope.row.result.resultName }}</el-tag
            >
          </template></el-table-column
        >
      </template>
    </SearchFiltersWrapper>
  </el-card>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import SearchFiltersWrapper from '../search/filter/SearchFiltersWrapper.vue';
import { executorResultColors } from './common';
import { convertDate, convertDateTime, getDate, getTime } from '@/common';
import DateTimeColored from '../helpers/DateTimeColored.vue';

const router = useRouter();

function updateEntry(data: any) {
  return data;
}

function rowClick(obj: any) {
  router.push({
    name: 'exec-task',
    params: { id: obj.task.id, executorId: obj.id },
  });
}

function rowClassNames(row: any) {
  if (row.result.resultType !== 2) {
    return 'row-inactive';
  }
  return '';
}
</script>

<style scoped></style>
