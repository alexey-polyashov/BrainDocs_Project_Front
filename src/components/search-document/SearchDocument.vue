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
          <el-form label-width="200px" label-position="left">
            <h1>Фильтры</h1>
            <TransitionGroup tag="div" name="list" style="position: relative">
              <template
                v-for="(field, filterFieldsArrIndex) in activeFieldsObject"
                :key="field.key"
              >
                <el-form-item :label="field.name">
                  <div class="filter-form-item">
                    <SelectableField
                      v-if="isInSelectableKeys(field.key)"
                      v-model="filterData[field.key]"
                      :options="() => selectableData[field.key]"
                    />
                    <div v-else-if="field.type === 'Date'">
                      <el-date-picker
                        v-model="filterData[field.key + 'Start']"
                        type="date"
                        style="display: block; width: 150px"
                        placeholder="Дата начала"
                      />
                      <el-date-picker
                        v-model="filterData[field.key + 'End']"
                        type="date"
                        style="display: block; margin-top: 8px; width: 150px"
                        placeholder="Дата конца"
                      />
                    </div>
                    <el-input v-else v-model="filterData[field.key]" />
                    <el-tooltip
                      effect="dark"
                      content="Очистить поле"
                      placement="top-start"
                    >
                      <el-button
                        size="small"
                        style="margin-left: 16px"
                        @click="
                          clearFilterField(
                            filterFieldsArrIndex,
                            field.type === 'Date'
                          )
                        "
                      >
                        <span
                          style="font-size: 1rem"
                          class="material-icons-round"
                          >clear</span
                        >
                      </el-button>
                    </el-tooltip>
                    <el-tooltip
                      effect="dark"
                      content="Удалить поле"
                      placement="top-start"
                    >
                      <el-button
                        type="danger"
                        size="small"
                        style="margin-left: 16px"
                        @click="
                          disableField(
                            filterFieldsArrIndex,
                            field.type === 'Date'
                          )
                        "
                      >
                        <span
                          style="font-size: 1rem"
                          class="material-icons-round"
                          >delete</span
                        >
                      </el-button>
                    </el-tooltip>
                  </div>
                </el-form-item>
              </template>
              <div key="optionsSection">
                <LoadingButton
                  ref="applyFiltersButton"
                  class="m8"
                  button-text="Применить"
                  @click="applyFilters"
                />
                <el-select
                  class="m8"
                  placeholder="Добавить фильтр"
                  @change="addFilterSelected"
                >
                  <el-option
                    v-for="item in nonActiveFields"
                    :key="item.key"
                    :label="item.name"
                    :value="item.key"
                  />
                </el-select>
                <el-button type="primary" class="m8" @click="createNewDocPage">
                  Создать документ
                </el-button>
                <el-button type="danger" class="m8" @click="deleteSelectedDocs">
                  Удалить выбранные
                </el-button>
              </div>
              <SearchDocumentTable
                ref="docTableRef"
                key="docTable"
                :document-filter-data="documentsResponseData"
                :documents-view="shownDocuments"
                class="filter-box-item filter-box-table"
                @current-page-change="onPageChange"
              />
            </TransitionGroup>
          </el-form>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script lang="ts">
import axios from 'axios';
import { computed, onMounted, reactive, ref } from 'vue';
import LoadingButton from '../helpers/LoadingButton.vue';
import {
  DocFilterRequestType,
  DocTypeView,
  FilterType,
  FilterDataType,
  FilterFieldsType,
  SelectableDataType,
  FilterFieldsViewType,
  DocFilterResponse,
} from './types';
import { AxiosResponse } from 'axios';
import { defineComponent } from 'vue';
import SearchDocumentTable from './SearchDocumentTable.vue';
import {
  getSelectableArray,
  selectableTypes,
  SelectableTypesAlias,
} from '../../net/common-requests';
import SelectableField from '../helpers/SelectableField.vue';
import DocTypeGroup from './DocTypeGroup.vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  components: {
    LoadingButton,
    SearchDocumentTable,
    SelectableField,
    DocTypeGroup,
  },
  setup() {
    const router = useRouter();

    const applyFiltersButton = ref<InstanceType<typeof LoadingButton> | null>(
      null
    );
    const shownDocuments = ref<DocTypeView[]>([]);
    const documentsResponseData = ref<DocFilterResponse>();
    const filterData = reactive<FilterDataType>({});
    const filterFields = ref<FilterFieldsType[]>([]);
    const activeFilterFieldIndices = ref<number[]>([]);
    const selectableData = ref<SelectableDataType>({});
    // url request map to key of a field
    const selectableKeysMapping = {
      users: 'author',
      docTypes: 'documentType',
      orgs: 'organisation',
    };
    const saveFiltersInSession = true;
    const filterPagingInfo = {
      page: '0',
      recordsOnPage: '10',
    };
    const docTableRef = ref();

    function groupTagChange(id: number, isOn: boolean) {
      if (isOn) {
        filterData.documentType = `${id}`;
        applyFilters();
      } else {
        delete filterData.documentType;
        applyFilters();
      }
    }

    function initFilterFields() {
      let sessionFiltersResult:
        | ReturnType<typeof retrieveSessionFilters>
        | undefined = undefined;
      if (saveFiltersInSession) {
        sessionFiltersResult = retrieveSessionFilters();
      }

      function initActiveFields() {
        filterFields.value.forEach((value, index) => {
          if (value.defaultOn) {
            activeFilterFieldIndices.value.push(index);
          }
        });
      }

      function initActiveFieldsIfNeeded() {
        if (!sessionFiltersResult?.activeFilterFieldsPersist)
          initActiveFields();
      }

      if (!sessionFiltersResult?.filterFieldsPersist) {
        getFieldsRequest().then(() => {
          initActiveFieldsIfNeeded();
        });
      } else {
        initActiveFieldsIfNeeded();
      }
    }

    onMounted(() => {
      getDocumentsInitialRequest();
      initSelectableArraysAsync();
      initFilterFields();
    });

    const nonActiveFields = computed<FilterFieldsType[]>(() => {
      return filterFields.value.filter(
        (value, index) => activeFilterFieldIndices.value.indexOf(index) === -1
      );
    });

    const activeFieldsObject = computed<FilterFieldsViewType>(() => {
      const res: FilterFieldsViewType = {};
      activeFilterFieldIndices.value.forEach(
        (index) => (res[index] = filterFields.value[index])
      );
      return res;
    });

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

    function addFilterSelected(selectedKey: string) {
      const selectedFieldIndex = filterFields.value.findIndex(
        (value) => value.key === selectedKey
      );
      if (selectedFieldIndex !== -1)
        activeFilterFieldIndices.value.push(selectedFieldIndex);
    }

    function processDate(filterRequest: DocFilterRequestType) {
      function addDateToFilterList(fieldKey: string, operation: string) {
        const index = filterRequest.filter.findIndex(
          (value) => value.key === fieldKey
        );
        if (index !== -1) {
          const date = new Date(filterRequest.filter[index].value);
          filterRequest.filter.splice(index, 1);
          filterRequest.filter.push({
            key: 'documentDate',
            value: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
            operation: operation,
          });
        }
      }

      addDateToFilterList('documentDateStart', '>');
      addDateToFilterList('documentDateEnd', '<');
    }

    function initFilters(filterTempData: FilterDataType) {
      const filters: FilterType[] = [];
      for (const dataKey in filterTempData) {
        if (filterTempData[dataKey]) {
          filters.push({
            key: dataKey,
            value: filterTempData[dataKey] as string,
            operation: ':',
          });
        }
      }
      const filterRequest: DocFilterRequestType = {
        ...filterPagingInfo,
        filter: filters,
      };
      return filterRequest;
    }

    async function applyFilters(filterTempData: FilterDataType = filterData) {
      applyFiltersButton.value?.setLoading(true);
      const filterRequest = initFilters(filterTempData);
      processDate(filterRequest);
      await axios
        .post<DocFilterResponse>('/documents/search', filterRequest)
        .then((res) => {
          updateDocuments(res);
          if (saveFiltersInSession) {
            doSaveFiltersInSession();
          }
        })
        .catch((err) => {
          console.log(err);
        });
      applyFiltersButton.value?.setLoading(false);
    }

    function onPageChange(num: number) {
      filterPagingInfo.page = (num - 1).toString();
      applyFilters();
    }

    function disableField(fieldIndex: number | string, isDate: boolean) {
      fieldIndex = Number(fieldIndex);
      const activeFieldIndex =
        activeFilterFieldIndices.value.indexOf(fieldIndex);
      activeFilterFieldIndices.value.splice(activeFieldIndex, 1);
      clearFilterField(fieldIndex, isDate);
    }

    function isInSelectableKeys(fieldKey: string) {
      return Object.values(selectableKeysMapping).indexOf(fieldKey) !== -1;
    }

    async function getFieldsRequest() {
      await axios.get<FilterFieldsType[]>('/documents/fields').then((res) => {
        filterFields.value = res.data;
      });
    }

    function updateDocuments(res: AxiosResponse<DocFilterResponse>) {
      documentsResponseData.value = res.data;
      shownDocuments.value = [];
      res.data.content.forEach((doc) => {
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

    function clearFilterField(fieldIndex: number, isDate: boolean) {
      if (isDate) {
        delete filterData[filterFields.value[fieldIndex].key + 'Start'];
        delete filterData[filterFields.value[fieldIndex].key + 'End'];
      } else {
        delete filterData[filterFields.value[fieldIndex].key];
      }
    }

    function deleteSelectedDocs() {
      docTableRef.value?.deleteSelected(() => applyFilters());
    }

    function getDocumentsInitialRequest() {
      axios.get('/documents/').then(updateDocuments);
    }

    function createNewDocPage() {
      router.push({ name: 'new-doc' });
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    }

    function doSaveFiltersInSession() {
      sessionStorage.setItem('filterData', JSON.stringify(filterData));
      sessionStorage.setItem(
        'filterFields',
        JSON.stringify(filterFields.value)
      );
      sessionStorage.setItem(
        'filterActiveFields',
        JSON.stringify(activeFilterFieldIndices.value)
      );
    }

    function retrieveSessionFilters() {
      function parseData(item: string, data: unknown): boolean {
        const storedData = sessionStorage.getItem(item);
        if (storedData && storedData !== 'undefined') {
          Object.assign(data, JSON.parse(storedData));
          return true;
        }
        return false;
      }

      const dataPersist = parseData('filterData', filterData);
      const filterFieldsPersist = parseData('filterFields', filterFields.value);
      const activeFilterFieldsPersist = parseData(
        'filterActiveFields',
        activeFilterFieldIndices.value
      );
      return {
        dataPersist,
        filterFieldsPersist,
        activeFilterFieldsPersist,
      };
    }

    return {
      selectableData,
      activeFieldsObject,
      applyFiltersButton,
      filterData,
      nonActiveFields,
      shownDocuments,
      documentsResponseData,
      docTableRef,
      deleteSelectedDocs,
      applyFilters,
      groupTagChange,
      addFilterSelected,
      disableField,
      isInSelectableKeys,
      clearFilterField,
      onPageChange,
      createNewDocPage,
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

.m8 {
  margin: 8px;
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

.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.2s cubic-bezier(0.55, 0, 0.1, 1);
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scaleY(0.01) translate(30px, 0);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}
</style>
