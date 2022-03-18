<template>
  <el-card>
    <SearchFiltersWrapper :update-entry="updateEntry" filter-type="tasks">
      <template #columns>
        <el-table-column type="selection" width="55" />
        <el-table-column label="Заголовок" sortable width="100" />
        <el-table-column label="Автор" sortable width="120" />
        <el-table-column label="Предмет" sortable width="120" />
        <el-table-column label="Срок выполнения" sortable width="120" />
        <el-table-column label="Дата получения" sortable width="120" />
        <el-table-column label="Исполнитель" sortable width="120" />
        <el-table-column label="Результат" sortable width="120" />
      </template>
    </SearchFiltersWrapper>
  </el-card>
</template>

<script setup lang="ts">
import SearchFiltersWrapper from '../search/filter/SearchFiltersWrapper.vue';

function updateEntry(data: any) {
  return {};
}
</script>

<style scoped></style>
