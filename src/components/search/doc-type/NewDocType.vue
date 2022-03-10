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
      <h2>Новый тип документа</h2>
    </template>
    <template #form-items>
      <el-form-item required label="Название" prop="name">
        <el-input v-model="formData.name" />
      </el-form-item>
    </template>
  </edit-element-page>
</template>

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
  formData.id = source.id;
  formData.name = source.name;
  watch(formData, () => {
    if (editElemPageRef.value) editElemPageRef.value.modified = true;
  });
}

function applyRequestData() {
  return {
    id: formData.id,
    name: formData.name,
  };
}
</script>

<style scoped></style>
