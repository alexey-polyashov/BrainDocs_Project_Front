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

<script lang="ts">
// this is shared state between all components of this type
const cached = reactive<{
  [p in SelectableTypesAlias]?: {
    pending?: boolean;
    data?: NamedSelectionType[];
  };
}>({});
</script>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
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

initArrays();

function initArrays() {
  if (props.options && props.selectType) {
    throw new Error('only 1 option should be set');
  } else if (props.selectType) {
    setupSelectArrays();
  } else if (!(props.options || props.selectType)) {
    throw new Error('no selection type specified');
  }
}

function setupSelectArrays() {
  const selectType = props.selectType as SelectableTypesAlias;
  if (!cached[selectType]?.pending) {
    cached[selectType] = {
      pending: true,
    };
    getSelectableArray(selectType).then((data) => {
      selectableOptions.value = data;
      if (props.selectType) {
        cached[props.selectType] = {
          data,
          pending: false,
        };
      }
    });
  } else {
    const watchStopHandle = watch(
      () => cached[selectType],
      (newVal, oldVal) => {
        if (newVal?.pending === false && newVal.data) {
          selectableOptions.value = newVal.data;
          watchStopHandle();
        }
      }
    );
  }
}
</script>

<style scoped></style>
