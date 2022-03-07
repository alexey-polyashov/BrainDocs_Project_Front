<template>
  <div style="display: flex; justify-content: center">
    <el-card style="margin-right: 16px; height: fit-content">
      <h3>Справочники</h3>
      <check-tag-wrapper class="menu-tag">Типы документа</check-tag-wrapper>
      <check-tag-wrapper class="menu-tag">Организации</check-tag-wrapper>
    </el-card>
    <el-card>
      <search-doc-type></search-doc-type>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import CheckTagWrapper from './helpers/CheckTagWrapper.vue';
import SearchDocType from './search-document/SearchDocType.vue';
</script>

<style scoped>
.menu-tag {
  margin-bottom: 8px;
  display: block;
}
</style>
