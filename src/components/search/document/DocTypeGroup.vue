<template>
  <div>
    <h3>Группировка по виду документа</h3>
    <el-scrollbar height="100%">
      <CheckTagWrapper
        v-for="docType in useSelectableArray('docTypes').value"
        :key="docType.id"
        :ref="(el: any) => groupTagInit(docType.id, el)"
        style="margin-bottom: 8px; display: block"
        @change="groupTagChange(docType.id)"
      >
        {{ docType.name }}
      </CheckTagWrapper>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import CheckTagWrapper from '@/components/helpers/CheckTagWrapper.vue';
import useSelectableArray from '@/net/selectables';
import { IndexedType, NamedSelectionType } from '@/types';

const emit = defineEmits<{
  (event: 'tagChecked', id: number, isOn: boolean): void;
}>();

const doctypeGroupTags = reactive<IndexedType<number, typeof CheckTagWrapper>>(
  {}
);
let doctypeGroupTagCheckedId = -1;

function groupTagInit(id: number, el: typeof CheckTagWrapper) {
  doctypeGroupTags[id] = el;
}

function groupTagChange(id: number) {
  if (doctypeGroupTagCheckedId >= 0 && doctypeGroupTagCheckedId !== id) {
    doctypeGroupTags[doctypeGroupTagCheckedId].checked = false;
  }
  doctypeGroupTags[id].checked = !doctypeGroupTags[id].checked;
  doctypeGroupTagCheckedId = id;
  emit('tagChecked', id, doctypeGroupTags[id].checked);
}
</script>

<style scoped></style>
