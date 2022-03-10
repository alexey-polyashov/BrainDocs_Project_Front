<template>
  <SearchFilters
    ref="searchFiltersRef"
    :filter-type="filterTypeLocal"
    :apply-on-ready="true"
    :selectable-data="selectableData"
    @filters-applied="onFiltersApplied"
    @delete-selected-click="onDeleteSelectedClick"
    @create-click="$emit('createClick')"
    @init-ready="$emit('initReady')"
  >
    <template #table>
      <SearchTable
        ref="searchTableRef"
        :filter-type="filterTypeLocal"
        :filter-data="entryResponseData"
        :table-data-view="shownEntries"
        class="filter-box-item filter-box-table"
        @row-click="(id) => $emit('rowClick', id)"
        @current-page-change="onPageChange"
      >
        <template #columns>
          <slot name="columns"></slot>
        </template>
      </SearchTable>
    </template>
  </SearchFilters>
</template>

<script setup lang="ts">
import SearchFilters from './SearchFilters.vue';
import SearchTable from './SearchTable.vue';
import { ref } from 'vue';
import {
  DocTypeFilterResponse,
  DocTypeView,
  SearchDefaultResponse,
  SelectableDataType,
} from '../types';
import {
  DirectoryTypesAlias,
  getUrlByDirectoryType,
} from '@/net/common-requests';
import { Id } from '@/types';

const props = withDefaults(
  defineProps<{
    filterType: DirectoryTypesAlias;
    applyOnReady?: boolean;
    updateEntry: (data: any) => any;
    selectableData?: SelectableDataType;
  }>(),
  {
    applyOnReady: true,
  }
);

const emit = defineEmits<{
  (event: 'createClick'): void;
  (event: 'initReady'): void;
  (event: 'rowClick', id: Id): void;
}>();

const shownEntries = ref<any[]>([]);
const entryResponseData = ref<SearchDefaultResponse>();
const searchFiltersRef = ref<InstanceType<typeof SearchFilters> | null>(null);
const searchTableRef = ref<InstanceType<typeof SearchTable> | null>(null);
const filterTypeLocal = ref(getUrlByDirectoryType(props.filterType));

function onPageChange(num: number) {
  searchFiltersRef.value?.onPageChange(num);
}

function onFiltersApplied(data: SearchDefaultResponse) {
  updateEntries(data);
}

function onDeleteSelectedClick() {
  searchTableRef.value?.deleteSelected(() =>
    searchFiltersRef.value?.applyFilters()
  );
}

function updateEntries(data: any) {
  entryResponseData.value = data;
  shownEntries.value = [];
  data.content.forEach((val: any) => {
    shownEntries.value.push(props.updateEntry(val));
  });
}

defineExpose({
  searchFiltersRef,
  searchTableRef,
});
</script>

<style scoped>
.filter-box-item {
  border: 2px solid var(--el-border-color-base);
  border-radius: 8px;
  border-left: none;
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;
  padding: 16px;
}

.filter-box-table {
  border: none;
  margin-top: 8px;
}
</style>
