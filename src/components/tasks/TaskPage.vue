<template>
  <el-card>
    <SearchFiltersWrapper
      :update-entry="updateEntry"
      filter-type="tasks"
      @row-click="
        (idObj) => $router.push({ name: 'edit-task', params: { id: idObj.id } })
      "
    >
      <template #columns>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="heading" label="Заголовок" />
        <el-table-column prop="author.shortname" label="Автор" />
        <el-table-column prop="" label="Предмет" />
        <el-table-column label="Срок выполнения" />
        <el-table-column prop="createTime" label="Дата получения" />
        <el-table-column label="Исполнитель" />
        <el-table-column label="Результат" />
      </template>
    </SearchFiltersWrapper>
  </el-card>
</template>

<script setup lang="ts">
import SearchFiltersWrapper from '../search/filter/SearchFiltersWrapper.vue';

function updateEntry(data: any) {
  return data;
}
</script>

<style scoped></style>
