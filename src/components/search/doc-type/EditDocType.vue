<template>
  <edit-element-page
    ref="editElemPageRef"
    :form-data="formData"
    :use-files-dialog="true"
    :apply-request-data="applyRequestData"
    :apply-form-data="applyFormData"
    elem-type="docTypes"
    @on-close-click="$router.push({ name: 'directories', hash: '#docTypes' })"
  >
    <template #header>
      <h2>Редактирование вида документа</h2>
    </template>
    <template #form-items>
      <el-form-item required label="Название" prop="name">
        <el-input v-model="formData.name" />
      </el-form-item>
    </template>
  </edit-element-page>
</template>

<script lang="ts">
export function updateEntry(data: DocTypeView) {
  return {
    id: data.id,
    name: data.name,
  };
}
</script>

<script setup lang="ts">
import { ElInput } from 'element-plus';
import { reactive, ref, watch } from 'vue';
import EditElementPage from '../EditElementPage.vue';
import { DocTypeView } from '../types';

const editElemPageRef = ref<InstanceType<typeof EditElementPage>>();
const formData = reactive({
  id: -1,
  name: '',
});

function applyFormData(source: DocTypeView) {
  Object.assign(formData, updateEntry(source));
}

function applyRequestData() {
  return formData;
}
</script>

<style scoped></style>
