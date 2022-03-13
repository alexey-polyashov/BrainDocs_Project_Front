<template>
  <div style="display: flex; align-items: center">
    <h3 style="margin-right: 16px">Контакты</h3>
    <el-button type="primary" circle size="small" @click="addContactRow"
      ><span style="font-size: 1.75em" class="material-icons-round">
        add
      </span></el-button
    >
  </div>
  <div
    v-for="(field, ind) in fields"
    :key="ind"
    style="display: flex; align-items: center; margin-bottom: 16px"
  >
    <SelectableField
      v-model="field.contactType"
      style="margin-right: 8px"
      select-type="contactTypes"
      :value-is-object="true"
    >
    </SelectableField>
    <el-input v-model="field.value"></el-input>
    <el-button
      type="danger"
      size="small"
      style="margin-left: 16px"
      @click="fields.splice(ind, 1)"
    >
      <span style="font-size: 1rem" class="material-icons-round">delete</span>
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { NamedSelectionType } from '@/types';
import { ref } from 'vue';
import SelectableField from './SelectableField.vue';

const fields = ref<
  {
    contactType?: NamedSelectionType;
    value: string;
    id?: number;
  }[]
>([]);

function addContactRow() {
  fields.value.push({ value: '' });
}

function getData(type: 'organisation' | 'user', id: number) {
  return fields.value.map((el) => {
    return {
      id: el.id,
      typeId: el.contactType?.id,
      present: el.value,
      [type + 'Id']: id,
    };
  });
}

addContactRow();

defineExpose({
  getData,
});
</script>

<style scoped></style>
