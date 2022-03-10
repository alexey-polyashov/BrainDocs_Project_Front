<template>
  <SearchFiltersWrapper
    filter-type="orgs"
    :update-entry="updateEntry"
    @create-click="$router.push({ name: 'new-org' })"
    @row-click="
      (idObj) => $router.push({ name: 'new-org', params: { id: idObj.id } })
    "
  >
    <template #columns>
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="Название" sortable />
      <el-table-column prop="inn" label="ИНН" sortable />
      <el-table-column prop="kpp" label="КПП" sortable />
    </template>
  </SearchFiltersWrapper>
</template>

<script setup lang="ts">
import SearchFiltersWrapper from '../filter/SearchFiltersWrapper.vue';
import { updateEntry } from './EditOrg.vue';
</script>

<style scoped></style>
