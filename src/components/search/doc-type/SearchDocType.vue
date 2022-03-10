<template>
  <SearchFiltersWrapper
    filter-type="docTypes"
    :update-entry="updateEntry"
    @create-click="$router.push({ name: 'new-doc-type' })"
    @row-click="
      (idObj) =>
        $router.push({ name: 'new-doc-type', params: { id: idObj.id } })
    "
  >
    <template #columns>
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="Название" sortable />
    </template>
  </SearchFiltersWrapper>
</template>

<script setup lang="ts">
import SearchFiltersWrapper from '../filter/SearchFiltersWrapper.vue';
import { updateEntry } from './EditDocType.vue';
</script>

<style scoped></style>
