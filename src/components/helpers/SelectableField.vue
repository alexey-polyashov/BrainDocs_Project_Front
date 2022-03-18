<template>
  <el-select placeholder="Выберите" value-key="id">
    <el-option
      v-for="option in options
        ? options()
        : useSelectableArray(selectType as any).value"
      :key="option.id"
      :label="option.name"
      :value="valueIsObject ? option : option.id"
    />
  </el-select>
</template>

<script setup lang="ts">
import useSelectableArray from '@/net/selectables';
import { SelectableTypesAlias } from '../../net/common-requests';
import { NamedSelectionType } from '../../types';

const props = defineProps<{
  selectType?: SelectableTypesAlias;
  options?: () => NamedSelectionType[];
  valueIsObject?: boolean;
}>();

verifyProps();

function verifyProps() {
  if (props.options && props.selectType) {
    throw new Error('only 1 option should be set');
  } else if (!(props.options || props.selectType)) {
    throw new Error('no selection type specified');
  }
}
</script>

<style scoped></style>
