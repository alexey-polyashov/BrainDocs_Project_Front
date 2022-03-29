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
      <contact-list ref="contactListRef"></contact-list>
    </template>
  </edit-element-page>
</template>

<script lang="ts">
export function updateEntry(data: OrganisationView) {
  return data;
}
</script>

<script setup lang="ts">
import { ElInput } from 'element-plus';
import { reactive, ref, watch } from 'vue';
import EditElementPage from '../EditElementPage.vue';
import { OrganisationView } from '../types';
import ContactList, { ContactType } from '@/components/helpers/ContactList.vue';
import _ from 'lodash-es';

const editElemPageRef = ref<InstanceType<typeof EditElementPage>>();
const contactListRef = ref<InstanceType<typeof ContactList>>();
const formData = reactive({
  contacts: [] as ContactType[],
  id: -1,
  name: '',
  inn: '',
  kpp: '',
});

function applyFormData(source: OrganisationView) {
  Object.assign(formData, updateEntry(source));
  contactListRef.value?.parseData(formData.contacts);
}

function applyRequestData() {
  const clonedData = _.cloneDeep(formData);
  clonedData.contacts = contactListRef.value?.getData() as ContactType[];
  return clonedData;
}
</script>

<style scoped></style>
