<template>
  <div style="display: flex">
    <div class="grouping-box content-box">
      <h1>Group by doctype</h1>
      <el-scrollbar height="100%">
        <CheckTagWrapper
          v-for="type in selectableData['documentType']"
          :key="type.id"
          :ref="(el: any) => groupTagInit(type.id, el)"
          style="margin-bottom: 8px; display: block"
          @change="groupTagChange(type.id)"
        >
          {{ type.name }}
        </CheckTagWrapper>
      </el-scrollbar>
    </div>
    <div style="min-width: 0;">
      <div
        style="border-bottom-width: 1px;"
        class="filter-box-item filter-fields-box"
      >
        <el-form label-width="auto">
          <h1>Filters</h1>
          <template
            v-for="(field, index) in filterFields"
            :key="field.key"
          >
            <el-form-item
              v-if="field.defaultOn"
              :label="field.name"
            >
              <div class="filter-form-item">
                <el-select
                  v-if="isInSelectableKeys(field.key)"
                  v-model="filterData[field.key]"
                  placeholder="Select"
                >
                  <el-option
                    v-for="option in selectableData[field.key]"
                    :key="option.id"
                    :label="getSelectionTypeName(option)"
                    :value="option.id"
                  />
                </el-select>
                <el-date-picker
                  v-else-if="field.type === 'Date'"
                  v-model="filterData[field.key]"
                  type="daterange"
                  range-separator="-"
                  start-placeholder="Start date"
                  end-placeholder="End date"
                />
                <el-input
                  v-else
                  v-model="filterData[field.key]"
                />
                <el-tooltip
                  effect="dark"
                  content="Clear field"
                  placement="top-start"
                >
                  <el-button
                    size="small"
                    style="margin-left: 16px"
                    @click="clearFilterField(index)"
                  >
                    <span
                      style="font-size: 1rem"
                      class="material-icons-round"
                    >clear</span>
                  </el-button>
                </el-tooltip>
                <el-tooltip
                  effect="dark"
                  content="Delete field"
                  placement="top-start"
                >
                  <el-button
                    type="danger"
                    size="small"
                    style="margin-left: 16px"
                    @click="disableField(index)"
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
          <LoadingButton
            ref="applyFiltersButton"
            button-text="Apply filters"
            @click="applyFilters"
          />
          <el-select
            placeholder="Add filter"
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
        </el-form>
      </div>
      <div class="filter-box-item filter-box-table">
        <el-table
          :data="documents"
          :default-sort="{ prop: 'id', order: 'ascending' }"
          border
          table-layout="auto"
        >
          <el-table-column
            type="selection"
            width="55"
          />
          <el-table-column
            prop="id"
            label="id"
            sortable
            width="70"
          />
          <el-table-column
            prop="number"
            label="number"
            sortable
            width="100"
          />
          <el-table-column
            prop="documentDate"
            label="date"
            sortable
            width="120"
          />
          <el-table-column
            prop="heading"
            label="heading"
            sortable
            width="180"
          />
          <el-table-column
            prop="author"
            label="author"
            sortable
            width="180"
          />
          <el-table-column
            prop="organisation"
            label="organisation"
            sortable
            width="180"
          />
          <el-table-column
            prop="files"
            label="files"
            sortable
            width="100"
          >
            <template #default="scope">
              <el-button @click="openFilesDialog(scope.row)">
                Files
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
  <AttachedFilesDialog ref="filesDialog" />
</template>

<script lang="ts" setup>
import axiosInstance from "../../net/axios-instance";
import { computed, onMounted, provide, reactive, ref } from "vue";
import LoadingButton from "../LoadingButton.vue";
import CheckTagWrapper from "../CheckTagWrapper.vue";
import {
  DocFilterRequest,
  DocType,
  Filter,
  FilterDataType,
  FilterFieldsType,
  SelectableDataType,
  SelectionType
} from "./types";
import { AxiosResponse } from "axios";
import AttachedFilesDialog from '../file-dialog/AttachedFilesDialog.vue'

const filesDialog = ref();
const applyFiltersButton = ref();
const documents = ref<DocType[]>([]);
const filterData = reactive<FilterDataType>({});
const filterDataApplied = reactive<FilterDataType>({});
const filterFields = ref<FilterFieldsType[]>([]);
const selectableData = ref<SelectableDataType>({});
// url request map to key of a field
const selectableKeysMapping = {
  'users': 'author',
  'doc_types': 'documentType',
  'organisations': 'organisation',
};
const doctypeGroupTags = reactive<{
  [id: number]: typeof CheckTagWrapper
}>({});
let doctypeGroupTagCheckedId = -1;
const saveFiltersInSession = true;

function groupTagInit(id: number, el: typeof CheckTagWrapper) {
  doctypeGroupTags[id] = el;
}

function groupTagChange(id: number) {
  if (doctypeGroupTagCheckedId >= 0 && doctypeGroupTagCheckedId !== id) {
    doctypeGroupTags[doctypeGroupTagCheckedId].checked = false;
  }
  doctypeGroupTags[id].checked = !doctypeGroupTags[id].checked;
  doctypeGroupTagCheckedId = id;
}

type SelectableKeysMappingType = keyof (typeof selectableKeysMapping);

function initFilterFields() {
  let filterFieldsPersist = false;
  if (saveFiltersInSession) {
    const sessionFiltersResult = retrieveSessionFilters();
    filterFieldsPersist = sessionFiltersResult.filterFieldsPersist;
  }
  if (!filterFieldsPersist) {
    getFieldsRequest();
  }
}

onMounted(() => {
  getDocumentsInitialRequest();
  for (const key in selectableKeysMapping) {
    getSelectionListBy(key as SelectableKeysMappingType);
  }
  initFilterFields();
})

const nonActiveFields = computed<FilterFieldsType[]>(() => {
  return filterFields.value.filter((value => !value.defaultOn));
})

function addFilterSelected(selectedKey: string) {
  const selectedFieldIndex = filterFields.value.findIndex(value => value.key === selectedKey);
  if (selectedFieldIndex !== -1) filterFields.value[selectedFieldIndex].defaultOn = true;
}

function processDate(filterRequest: DocFilterRequest) {
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

function initFilters() {
  const filters: Filter[] = [];
  for (const dataKey in filterData) {
    if (filterData[dataKey]) {
      filters.push({
        key: dataKey,
        value: filterData[dataKey] as string,
        operation: ':'
      });
    }
  }
  const filterRequest: DocFilterRequest = {
    page: '0',
    recordsOnPage: '10',
    filter: filters
  };
  return filterRequest;
}

async function applyFilters() {
  applyFiltersButton.value.loading = true;
  const filterRequest = initFilters();
  console.log(filterRequest);
  processDate(filterRequest);

  await axiosInstance
    .post('/documents/search', filterRequest)
    .then(res => {
      console.log(res.data);
      updateDocuments(res);
      for (const resKey in filterData) {
        filterDataApplied[resKey] = filterData[resKey];
      }
      if (saveFiltersInSession) {
        doSaveFiltersInSession();
      }
    })
    .catch(err => {
      console.log(err)
    });
  applyFiltersButton.value.loading = false;
}

function getSelectionTypeName(value: SelectionType) {
  if (value.name) {
    return value.name;
  } else if (value.shortname) {
    return value.shortname;
  } else {
    throw Error('wrong type ' + value);
  }
}

function disableField(fieldIndex: number) {
  filterFields.value[fieldIndex].defaultOn = false;
  clearFilterField(fieldIndex);
}

function isInSelectableKeys(fieldKey: string) {
  return Object.values(selectableKeysMapping).indexOf(fieldKey) !== -1;
}

function getFieldsRequest() {
  axiosInstance
    .get<FilterFieldsType[]>('/documents/fields')
    .then((res) => {
      filterFields.value = res.data
    });
}

function updateDocuments(res: AxiosResponse) {
  documents.value = [];
  (res.data.content as Array<any>).forEach(doc => {
    documents.value.push({
      id: doc.id,
      documentType: doc.documentType.name,
      documentDate: doc.documentDate,
      number: doc.number,
      heading: doc.heading,
      responsible: doc.responsible.shortname,
      author: doc.author.shortname,
      organisation: doc.organisation.name,
      files: doc.files.length,
    });
  });
}

function openFilesDialog(row: DocType) {
  console.log(row);
  filesDialog.value.updateView(row.id);
  filesDialog.value.toggleVisible();
}

function clearFilterField(fieldIndex: number) {
  delete filterData[filterFields.value[fieldIndex].key];
}

function getDocumentsInitialRequest() {
  axiosInstance
    .get('/documents/')
    .then(updateDocuments);
}

function doSaveFiltersInSession() {
  sessionStorage.setItem('filterData', JSON.stringify(filterData));
  sessionStorage.setItem('filterFields', JSON.stringify(filterFields.value));
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
  return {
    dataPersist,
    filterFieldsPersist
  };
}

async function getSelectionListBy(type: SelectableKeysMappingType) {
  await axiosInstance
    .get<SelectionType[]>(`/${ type }/`)
    .then(res => {
      selectableData.value[selectableKeysMapping[type]] = res.data;
    });
}
</script>

<style scoped>
.filter-fields-box {
  border-bottom-right-radius: 0;
}

.filter-box-item {
  border: 2px solid var(--el-border-color-base);
  border-left: none;
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;
  padding: 16px;
}

.grouping-box {
  min-width: 150px;
  max-width: 150px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-right-width: 1px;
}

.filter-form-item {
  display: flex;
  align-items: center;
}

.filter-box-table {
  border-top: none;
  border-top-right-radius: 0;
  margin-top: 0;
}

.content-box {
  margin: 0;
  width: 95%;
}
</style>
