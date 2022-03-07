<template>
  <el-card style="max-width: fit-content; margin: 0 auto">
    <div style="display: flex; justify-content: center">
      <DocTypeGroup
        class="grouping-box content-box"
        :doc-types="() => selectableData['documentType']"
        @tag-checked="groupTagChange"
      />
      <div style="min-width: 0">
        <div class="filter-box-item filter-fields-box">
          <SearchFilters
            ref="searchFiltersRef"
            filter-type="docs"
            :selectable-data="selectableData"
            @init-ready="onFiltersInit"
            @filters-applied="onFiltersApplied"
            @create-click="onCreateClick"
            @delete-selected-click="onDeleteSelectedClick"
          >
            <template #table>
              <SearchDocumentTable
                ref="docTableRef"
                :document-filter-data="documentsResponseData"
                :documents-view="shownDocuments"
                class="filter-box-item filter-box-table"
                @current-page-change="onPageChange"
              />
            </template>
          </SearchFilters>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import {
  getSelectableArray,
  selectableTypes,
  SelectableTypesAlias,
} from '../../net/common-requests';
import DocTypeGroup from './DocTypeGroup.vue';
import SearchFilters from './SearchFilters.vue';
import { DocFilterResponse, DocTypeView, SelectableDataType } from './types';
import SearchDocumentTable from './SearchDocumentTable.vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  components: {
    SearchFilters,
    DocTypeGroup,
    SearchDocumentTable,
  },
  setup() {
    const router = useRouter();
    const shownDocuments = ref<DocTypeView[]>([]);
    const documentsResponseData = ref<DocFilterResponse>();
    const selectableData = ref<SelectableDataType>({});
    // url request map to key of a field
    const selectableKeysMapping = {
      users: 'author',
      docTypes: 'documentType',
      orgs: 'organisation',
    };
    const searchFiltersRef = ref<InstanceType<typeof SearchFilters> | null>(
      null
    );
    const docTableRef = ref<InstanceType<typeof SearchDocumentTable> | null>(
      null
    );

    function onCreateClick() {
      router.push({ name: 'new-doc' });
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    }

    function onDeleteSelectedClick() {
      docTableRef.value?.deleteSelected(() =>
        searchFiltersRef.value?.applyFilters()
      );
    }

    function groupTagChange(id: number, isOn: boolean) {
      searchFiltersRef.value?.groupTagChange(id, isOn);
    }

    const initSelectablesPromise = initSelectableArraysAsync();

    function onFiltersInit() {
      initSelectablesPromise.then(() => {
        searchFiltersRef.value?.applyFilters();
      });
    }

    function onFiltersApplied(data: DocFilterResponse) {
      updateDocuments(data);
    }

    async function initSelectableArraysAsync() {
      const promises: Promise<void>[] = [];
      for (const key in selectableTypes) {
        promises.push(
          getSelectableArray(key as SelectableTypesAlias).then((data) => {
            selectableData.value[
              selectableKeysMapping[key as SelectableTypesAlias]
            ] = data;
          })
        );
      }
      return Promise.all(promises);
    }

    function onPageChange(num: number) {
      searchFiltersRef.value?.onPageChange(num);
    }

    function updateDocuments(data: DocFilterResponse) {
      documentsResponseData.value = data;
      shownDocuments.value = [];
      data.content.forEach((doc) => {
        shownDocuments.value.push({
          id: doc.id,
          documentType: doc.documentType.name,
          documentDate: doc.documentDate,
          number: doc.number,
          heading: doc.heading,
          responsible: doc.responsible.shortname as string,
          author: doc.author.shortname as string,
          organisation: doc.organisation.name,
          files: doc.files.length.toString(),
        });
      });
    }

    return {
      selectableData,
      searchFiltersRef,
      documentsResponseData,
      shownDocuments,
      docTableRef,
      groupTagChange,
      onFiltersInit,
      onFiltersApplied,
      onPageChange,
      onCreateClick,
      onDeleteSelectedClick,
    };
  },
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

.grouping-box {
  min-width: 150px;
  max-width: 150px;
  border-radius: 8px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-right-width: 1px;
}

.filter-form-item {
  display: flex;
  align-items: center;
}

.filter-box-table {
  border: none;
  margin-top: 8px;
}

.content-box {
  margin: 0;
  width: 95%;
}
</style>
