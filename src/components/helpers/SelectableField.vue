<template>
  <el-select placeholder="Выберите" value-key="id">
    <el-option
      v-for="option in options ? options() : selectableOptions"
      :key="option.id"
      :label="option.name"
      :value="valueIsObject ? option : option.id"
    />
  </el-select>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  getSelectableArray,
  SelectableTypesAlias,
} from '../../net/common-requests';
import { NamedSelectionType } from '../../types';

const props = defineProps<{
  selectType?: SelectableTypesAlias;
  options?: () => NamedSelectionType[];
  valueIsObject?: boolean;
}>();

const selectableOptions = ref<NamedSelectionType[]>([]);

onMounted(() => {
  if (props.options && props.selectType)
    throw new Error('only 1 option should be set');
  else if (props.selectType)
    getSelectableArray(props.selectType).then(
      (data) => (selectableOptions.value = data)
    );
  else if (!(props.options || props.selectType))
    throw new Error('no selection type specified');
});
</script>

<style scoped></style>
