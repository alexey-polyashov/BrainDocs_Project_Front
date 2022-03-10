<template>
  <edit-element-page
    ref="editElemPageRef"
    :form-data="formData"
    :use-files-dialog="false"
    :apply-request-data="applyRequestData"
    :apply-form-data="applyFormData"
    elem-type="orgs"
    @on-close-click="$router.push({ name: 'directories', hash: '#orgs' })"
  >
    <template #header>
      <h2>Редактирование организации</h2>
    </template>
    <template #form-items>
      <el-form-item required label="Название" prop="name">
        <el-input v-model="formData.name" />
      </el-form-item>
      <el-form-item required label="ИНН" prop="inn">
        <el-input v-model="formData.inn" />
      </el-form-item>
      <el-form-item required label="КПП" prop="kpp">
        <el-input v-model="formData.kpp" />
      </el-form-item>
    </template>
  </edit-element-page>
</template>

<script lang="ts">
export function updateEntry(data: OrganisationView) {
  return {
    id: data.id,
    name: data.name,
    inn: data.inn,
    kpp: data.kpp,
    contacts: data.contacts,
  };
}
</script>

<script setup lang="ts">
import { ElInput } from 'element-plus';
import { da } from 'element-plus/lib/locale';
import { reactive, ref, watch } from 'vue';
import EditElementPage from '../EditElementPage.vue';
import { OrganisationView } from '../types';

const editElemPageRef = ref<InstanceType<typeof EditElementPage>>();
const formData = reactive({
  contacts: [],
  id: -1,
  name: '',
  inn: '',
  kpp: '',
});

function applyFormData(source: OrganisationView) {
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
