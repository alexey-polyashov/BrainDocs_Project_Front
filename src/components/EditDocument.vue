<template>
  <edit-element-page
    ref="editElemPageRef"
    :form-data="formData"
    :use-files-dialog="true"
    :apply-request-data="applyRequestData"
    :apply-form-data="applyFormData"
    elem-type="docs"
    @on-close-click="$router.push({ name: 'search-doc' })"
  >
    <template #header>
      <h2>Редактирование документа</h2>
    </template>
    <template #form-items>
      <el-form-item required label="Номер" prop="number">
        <el-input v-model="formData.number" />
      </el-form-item>
      <el-form-item required label="Название" prop="heading">
        <el-input v-model="formData.heading" />
      </el-form-item>
      <el-form-item required label="Тип" prop="documentType">
        <SelectableField
          v-model="formData.documentType"
          :value-is-object="true"
          select-type="docTypes"
        />
      </el-form-item>
      <el-form-item required label="Организация" prop="organisation">
        <SelectableField
          v-model="formData.organisation"
          :value-is-object="true"
          select-type="orgs"
        />
      </el-form-item>
      <h2 style="text-align: center">Содержание</h2>
      <editor
        v-model="formData.content"
        api-key="r8zqd3nkvkfr7t0s0r4qo107guk38q9xpact4xap39t1p0pe"
      />
    </template>
  </edit-element-page>
</template>

<script lang="ts">
export function updateEntry(data: DocFilterResponseContent) {
  return {
    id: data.id.toString(),
    content: data.content,
    heading: data.heading,
    documentDate: data.documentDate,
    number: data.number,
    organisation: data.organisation,
    documentType: data.documentType,
  };
}
</script>

<script setup lang="ts">
import { ElInput } from 'element-plus';
import { reactive, ref, watch } from 'vue';
import EditElementPage from '@/components/search/EditElementPage.vue';
import { DocFilterResponseContent } from './search/types';
import Editor from '@tinymce/tinymce-vue';
import SelectableField from './helpers/SelectableField.vue';

const editElemPageRef = ref<InstanceType<typeof EditElementPage>>();
const formData = reactive({
  id: '',
  number: '',
  documentType: {
    id: -1,
    name: '',
  },
  organisation: {
    id: -1,
    name: '',
  },
  documentDate: new Date().toISOString(),
  heading: '',
  content: '',
});

function applyFormData(source: DocFilterResponseContent) {
  Object.assign(formData, updateEntry(source));
  watch(formData, () => {
    if (editElemPageRef.value) editElemPageRef.value.modified = true;
  });
}

function applyRequestData() {
  return formData;
}
</script>

<style scoped></style>
