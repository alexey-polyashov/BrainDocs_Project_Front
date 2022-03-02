<template>
  <el-card style="max-width: fit-content; margin: 0 auto;">
    <div style="display: flex; justify-content: center;">
      <DocTypeGroup
        class="grouping-box content-box"
        :doc-types="() => selectableData['documentType']"
        @tag-checked="groupTagChange"
      />
      <div style="min-width: 0;">
        <div class="filter-box-item filter-fields-box">
          <el-form
            label-width="200px"
            label-position="left"
          >
            <h1>Фильтры</h1>
            <TransitionGroup
              tag="div"
              name="list"
              style="position: relative"
            >
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
                    <el-date-picker
                      v-else-if="field.type === 'Date'"
                      v-model="filterData[field.key]"
                      type="date"
                    />
                    <el-input
                      v-else
                      v-model="filterData[field.key]"
                    />
                    <el-tooltip
                      effect="dark"
                      content="Очистить поле"
                      placement="top-start"
                    >
                      <el-button
                        size="small"
                        style="margin-left: 16px"
                        @click="clearFilterField(filterFieldsArrIndex)"
                      >
                        <span
                          style="font-size: 1rem"
                          class="material-icons-round"
                        >clear</span>
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
                        @click="disableField(filterFieldsArrIndex)"
                      >
                        <span
                          style="font-size: 1rem"
                          class="material-icons-round"
                        >delete</span>
                      </el-button>
                    </el-tooltip>
                  </div>
                </el-form-item>
              </template>
              <div key="optionsSection">
                <LoadingButton
                  ref="applyFiltersButton"
                  button-text="Применить"
                  @click="applyFilters"
                />
                <el-select
                  placeholder="Добавить фильтр"
                  style="margin-left: 16px"
                  @change="addFilterSelected"
                >
                  <el-option
                    v-for="item in nonActiveFields"
                    :key="item.key"
                    :label="item.name"
                    :value="item.key"
                  />
                </el-select>
              </div>
              <SearchDocumentTable
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
import axios from "axios";
import { computed, onMounted, reactive, ref } from "vue";
import LoadingButton from "../helpers/LoadingButton.vue";
import {
  DocFilterRequestType,
  DocTypeView,
  FilterType,
  FilterDataType,
  FilterFieldsType,
  SelectableDataType,
  FilterFieldsViewType,
  DocFilterResponse,
} from "./types";
import { AxiosResponse } from "axios";
import { defineComponent } from "vue";
import SearchDocumentTable from "./SearchDocumentTable.vue";
import { getSelectableArray, selectableTypes, SelectableTypesAlias } from "../../net/common-requests";
import SelectableField from "../helpers/SelectableField.vue";
import DocTypeGroup from "./DocTypeGroup.vue";

export default defineComponent({
  components: {
    LoadingButton,
    SearchDocumentTable,
    SelectableField,
    DocTypeGroup
  },
  setup() {
    const applyFiltersButton = ref();
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
      let sessionFiltersResult: ReturnType<typeof retrieveSessionFilters> | undefined = undefined;
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
        if (!sessionFiltersResult?.activeFilterFieldsPersist) initActiveFields();
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
      return filterFields.value.filter(((value, index) => activeFilterFieldIndices.value.indexOf(index) === -1));
    });

    const activeFieldsObject = computed<FilterFieldsViewType>(() => {
      const res: FilterFieldsViewType = {};
      activeFilterFieldIndices.value.forEach(index => res[index] = filterFields.value[index]);
      return res;
    });

    async function initSelectableArraysAsync() {
      const promises: Promise<void>[] = [];
      for (const key in selectableTypes) {
        promises.push(getSelectableArray(key as SelectableTypesAlias).then(data => {
          selectableData.value[selectableKeysMapping[key as SelectableTypesAlias]] = data;
        }));
      }
      return Promise.all(promises);
    }

    function addFilterSelected(selectedKey: string) {
      const selectedFieldIndex = filterFields.value.findIndex(value => value.key === selectedKey);
      if (selectedFieldIndex !== -1) activeFilterFieldIndices.value.push(selectedFieldIndex);
    }

    function processDate(filterRequest: DocFilterRequestType) {
      const dateObjIndex = filterRequest.filter.findIndex(value => value.key === 'documentDate');
      if (dateObjIndex !== -1) {
        const dateFrom = filterRequest.filter[dateObjIndex].value[0] as unknown as Date;
        const dateTo = filterRequest.filter[dateObjIndex].value[1] as unknown as Date;
        filterRequest.filter.splice(dateObjIndex, 1);
        filterRequest.filter.push({
          key: 'documentDate',
          value: dateFrom.toISOString().split('T')[0],
          operation: '>'
        });
        filterRequest.filter.push({
          key: 'documentDate',
          value: dateTo.toISOString().split('T')[0],
          operation: '<'
        });
      }
    }

    function initFilters(filterTempData: FilterDataType) {
      const filters: FilterType[] = [];
      for (const dataKey in filterTempData) {
        if (filterTempData[dataKey]) {
          filters.push({
            key: dataKey,
            value: filterTempData[dataKey] as string,
            operation: ':'
          });
        }
      }
      const filterRequest: DocFilterRequestType = {
        ...filterPagingInfo,
        filter: filters
      };
      return filterRequest;
    }

    async function applyFilters(filterTempData: FilterDataType = filterData) {
      applyFiltersButton.value.loading = true;
      const filterRequest = initFilters(filterTempData);
      //processDate(filterRequest);
      await axios
        .post<DocFilterResponse>('/documents/search', filterRequest)
        .then(res => {
          updateDocuments(res);
          if (saveFiltersInSession) {
            doSaveFiltersInSession();
          }
        })
        .catch(err => {
          console.log(err)
        });
      applyFiltersButton.value.loading = false;
    }

    function onPageChange(num: number) {
      filterPagingInfo.page = (num - 1).toString();
      applyFilters();
    }

    function disableField(fieldIndex: number | string) {
      fieldIndex = Number(fieldIndex);
      const activeFieldIndex = activeFilterFieldIndices.value.indexOf(fieldIndex);
      activeFilterFieldIndices.value.splice(activeFieldIndex, 1);
      clearFilterField(fieldIndex);
    }

    function isInSelectableKeys(fieldKey: string) {
      return Object.values(selectableKeysMapping).indexOf(fieldKey) !== -1;
    }

    async function getFieldsRequest() {
      await axios
        .get<FilterFieldsType[]>('/documents/fields')
        .then((res) => {
          filterFields.value = res.data;
          const dateIndex = filterFields.value.findIndex(val => val.key === 'documentDate');
          if (dateIndex !== -1) {
            const dateItem = filterFields.value[dateIndex];
            filterFields.value.splice(dateIndex, 1);
            filterFields.value.push({
              key: dateItem.key,
              name: 'Дата с',
              source: '',
              validOperations: ['>'],
              type: 'Date',
              defaultOn: dateItem.defaultOn,
            });
            filterFields.value.push({
              key: dateItem.key,
              name: 'Дата до',
              source: '',
              validOperations: ['<'],
              type: 'Date',
              defaultOn: dateItem.defaultOn,
            });
          }
        });
    }

    function updateDocuments(res: AxiosResponse<DocFilterResponse>) {
      documentsResponseData.value = res.data;
      shownDocuments.value = [];
      res.data.content.forEach(doc => {
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

    function clearFilterField(fieldIndex: number) {
      delete filterData[filterFields.value[fieldIndex].key];
    }

    function getDocumentsInitialRequest() {
      axios
        .get('/documents/')
        .then(updateDocuments);
    }

    function doSaveFiltersInSession() {
      sessionStorage.setItem('filterData', JSON.stringify(filterData));
      sessionStorage.setItem('filterFields', JSON.stringify(filterFields.value));
      sessionStorage.setItem('filterActiveFields', JSON.stringify(activeFilterFieldIndices.value));
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
      const activeFilterFieldsPersist = parseData('filterActiveFields', activeFilterFieldIndices.value);
      return {
        dataPersist,
        filterFieldsPersist,
        activeFilterFieldsPersist
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
      applyFilters,
      groupTagChange,
      addFilterSelected,
      disableField,
      isInSelectableKeys,
      clearFilterField,
      onPageChange
    };
  }
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
