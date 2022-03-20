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
          <SearchFiltersWrapper
            ref="searchWrapperRef"
            filter-type="docs"
            :update-entry="updateEntry"
            :apply-on-ready="false"
            :selectable-data="selectableData"
            @create-click="onCreateClick"
            @row-click="tableRowClick"
            @init-ready="onFiltersInit"
          >
            <template #columns>
              <el-table-column type="selection" width="55" />
              <el-table-column
                prop="number"
                label="Номер"
                sortable
                width="100"
              />
              <el-table-column
                prop="documentDate"
                label="Дата"
                sortable
                width="120"
              />
              <el-table-column
                prop="heading"
                label="Название"
                sortable
                width="180"
              />
              <el-table-column
                prop="author"
                label="Автор"
                sortable
                width="180"
              />
              <el-table-column
                prop="organisation"
                label="Организация"
                sortable
                width="180"
              />
              <el-table-column prop="files" label="Файлы" sortable width="110">
                <template #default="scope">
                  <el-button @click="(e) => openFilesDialog(e, scope.row)">
                    Файлы
                  </el-button>
                </template>
              </el-table-column>
            </template>
          </SearchFiltersWrapper>
          <AttachedFilesDialog
            ref="filesDialog"
            elem-type="docs"
            :should-send-requests-on-change="true"
          />
        </div>
      </div>
    </div>
  </el-card>
</template>

<script lang="ts" setup>
import { defineComponent, ref } from 'vue';
import {
  getSelectableArray,
  selectableTypes,
  SelectableTypesAlias,
} from '../../../net/common-requests';
import DocTypeGroup from './DocTypeGroup.vue';
import SearchFilters from '../filter/SearchFilters.vue';
import {
  DocFilterResponse,
  DocFilterResponseContent,
  DocumentView,
  SelectableDataType,
} from '../types';
import SearchTable from '../filter/SearchTable.vue';
import { useRouter } from 'vue-router';
import AttachedFilesDialog from '../../file-dialog/AttachedFilesDialog.vue';
import SearchFiltersWrapper from '../filter/SearchFiltersWrapper.vue';
import { Id } from '@/types';

const router = useRouter();
const filesDialog = ref<InstanceType<typeof AttachedFilesDialog> | null>(null);
const selectableData = ref<SelectableDataType>({});
// url request map to key of a field
const selectableKeysMapping = {
  users: 'author',
  docTypes: 'documentType',
  orgs: 'organisation',
};
const searchWrapperRef = ref<InstanceType<typeof SearchFiltersWrapper> | null>(
  null
);

function onCreateClick() {
  router.push({ name: 'edit-doc' });
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth',
  });
}

function updateEntry(data: DocFilterResponseContent) {
  return {
    id: data.id,
    documentType: data.documentType.name,
    documentDate: data.documentDate,
    number: data.number,
    heading: data.heading,
    responsible: data.responsible.shortname as string,
    author: data.author.shortname as string,
    organisation: data.organisation.name,
    files: data.files.length.toString(),
  };
}

function groupTagChange(id: number, isOn: boolean) {
  searchWrapperRef.value?.searchFiltersRef?.groupTagChange(id, isOn);
}

const initSelectablesPromise = initSelectableArraysAsync();

function onFiltersInit() {
  initSelectablesPromise.then(() => {
    searchWrapperRef.value?.searchFiltersRef?.applyFilters();
  });
}

function tableRowClick(row: Id) {
  router.push({ name: 'edit-doc', params: { id: row.id } });
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth',
  });
}

async function initSelectableArraysAsync() {
  const promises: Promise<void>[] = [];
  for (const key in selectableTypes) {
    promises.push(
      getSelectableArray(key as keyof typeof selectableKeysMapping).then(
        (data) => {
          selectableData.value[
            selectableKeysMapping[key as keyof typeof selectableKeysMapping]
          ] = data;
        }
      )
    );
  }
  return Promise.all(promises);
}

function openFilesDialog(event: Event, row: DocumentView) {
  event.stopPropagation();
  filesDialog.value?.updateView(row.id);
  filesDialog.value?.toggleVisible();
}
</script>

<style scoped>
.filter-box-item {
  border: 2px solid var(--el-border-color);
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

.content-box {
  margin: 0;
  width: 95%;
}
</style>
