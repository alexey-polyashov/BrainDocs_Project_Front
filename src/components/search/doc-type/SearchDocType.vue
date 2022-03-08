<template>
  <SearchFiltersWrapper filter-type="docTypes" :update-entry="updateEntry">
    <template #columns>
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="Название" sortable />
    </template>
  </SearchFiltersWrapper>
</template>

<script setup lang="ts">
import SearchFiltersWrapper from '../filter/SearchFiltersWrapper.vue';
import { DocTypeView } from '../types';

function updateEntry(data: DocTypeView) {
  return {
    id: data.id,
    name: data.name,
  };
}
</script>

<style scoped></style>
