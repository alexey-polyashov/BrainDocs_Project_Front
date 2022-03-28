<template>
  <el-card>
    <SearchFiltersWrapper
      :update-entry="updateEntry"
      filter-type="taskExecutors"
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
            <span style="color: var(--m-date-color)">{{
              getDate(scope.row.planedDate)
            }}</span
            >&nbsp;<span style="color: var(--m-time-color)">{{
              getTime(scope.row.planedDate)
            }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Дата получения">
          <template #default="scope">
            <span style="color: var(--m-date-color)">{{
              getDate(scope.row.createdAt)
            }}</span
            >&nbsp;<span style="color: var(--m-time-color)">{{
              getTime(scope.row.createdAt)
            }}</span>
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
</script>

<style scoped></style>
