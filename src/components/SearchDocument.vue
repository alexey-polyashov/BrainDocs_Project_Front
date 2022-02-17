<template>
  <el-form class="content-box" label-width="auto">
    <h1>Filters</h1>
    <template v-for="(field, index) in filterFields" :key="field.key">
      <el-form-item
          v-if="field.defaultOn"
          :label="field.name"
      >
        <div class="filter-form-item">
          <el-select
              v-model="filterData[field.key]"
              v-if="isInSelectableKeys(field.key)"
              placeholder="Select">
            <el-option
                v-for="option in selectableData[field.key]"
                :key="option.id"
                :label="getSelectionTypeName(option)"
                :value="option.id"
            >
            </el-option>
          </el-select>
          <el-date-picker
              v-else-if="field.type === 'Date'"
              v-model="filterData[field.key]"
              type="daterange"
              range-separator="-"
              start-placeholder="Start date"
              end-placeholder="End date"
          />
          <el-input v-else v-model="filterData[field.key]"/>
          <el-button
              @click="disableField(index)"
              size="small"
              style="margin-left: 16px"
          >
            <span style="font-size: 1rem" class="material-icons-round">clear</span>
          </el-button>
        </div>
      </el-form-item>
    </template>
    <el-button type="primary" @click="applyFilters">Apply filters</el-button>
    <el-select @change="addFilterSelected" placeholder="Add filter" style="margin-left: 16px">
      <el-option
          v-for="item in nonActiveFields"
          :key="item.key"
          :label="item.name"
          :value="item.key"
      >
      </el-option>
    </el-select>
  </el-form>
  <div class="content-box">
    <el-table
        :data="documents"
        :default-sort="{ prop: 'id', order: 'ascending' }"
        style="width: 100%"
        border
        table-layout="auto"
    >
      <el-table-column type="selection" width="55"/>
      <el-table-column prop="id" label="id" sortable width="70"/>
      <el-table-column prop="number" label="number" sortable width="100"/>
      <el-table-column prop="documentDate" label="date" sortable width="120"/>
      <el-table-column prop="heading" label="heading" sortable width="180"/>
      <el-table-column prop="author" label="author" sortable width="180"/>
      <el-table-column prop="organisation" label="organisation" sortable width="180"/>
      <el-table-column prop="files" label="files" sortable width="90">
        <template #default="scope">
          <el-button @click="openFilesDialog(scope.row)">Files</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import axiosInstance from "../net/axios-instance";
import { computed, onMounted, reactive, ref } from "vue";

interface DocFilterRequest {
  page: string;
  recordsOnPage: string;
  filter: Filter[];
}

interface Filter {
  key: string;
  operation: string;
  value: string;
}

type DocType = {
  id: number,
  documentType: string,
  documentDate: string,
  number: string,
  heading: string,
  responsible: string,
  author: string,
  organisation: string,
  files: string,
}

type FilterFieldsType = {
  readonly key: string,
  name: string,
  source: string,
  validOperations: string[],
  type: string,
  defaultOn: boolean,
}

type SelectionType = {
  id: number,
  name?: string,
  shortname?: string
}

type SelectableDataType = {
  [key: string]: SelectionType[]
}

const documents = ref<DocType[]>([])
const filterData = reactive<any>({})
const filterFields = ref<FilterFieldsType[]>([])
const selectableData = ref<SelectableDataType>({})
// url request map to key of a field
const selectableKeysMapping = {
  'users': 'author',
  'doc_types': 'documentType',
  'organisations': 'organisation',
}

type SelectableKeysMappingType = keyof (typeof selectableKeysMapping)

onMounted(() => {
  getFieldsRequest()
  getDocumentsInitialRequest()
  for (const key in selectableKeysMapping) {
    getSelectionListBy(key as SelectableKeysMappingType)
  }
})

const nonActiveFields = computed<FilterFieldsType[]>(() => {
  return filterFields.value.filter((value => !value.defaultOn))
})

function addFilterSelected(selectedKey: string) {
  const selectedFieldIndex = filterFields.value.findIndex(value => value.key === selectedKey)
  if (selectedFieldIndex !== -1) filterFields.value[selectedFieldIndex].defaultOn = true
}

function processDate(filterRequest: DocFilterRequest) {
  const dateObjIndex = filterRequest.filter.findIndex(value => value.key === 'documentDate')
  if (dateObjIndex !== -1) {
    const dateFrom = filterRequest.filter[dateObjIndex].value[0] as unknown as Date
    const dateTo = filterRequest.filter[dateObjIndex].value[1] as unknown as Date
    filterRequest.filter.splice(dateObjIndex, 1)
    filterRequest.filter.push({
      key: 'documentDate',
      value: dateFrom.toISOString().split('T')[0],
      operation: '>'
    })
    filterRequest.filter.push({
      key: 'documentDate',
      value: dateTo.toISOString().split('T')[0],
      operation: '<'
    })
  }
}

function applyFilters() {
  const filters: Filter[] = []
  for (const dataKey in filterData) {
    if (filterData[dataKey]) {
      filters.push({
        key: dataKey,
        value: filterData[dataKey],
        operation: ':'
      })
    }
  }
  const filterRequest: DocFilterRequest = {
    page: '0',
    recordsOnPage: '10',
    filter: filters
  }
  console.log(filterRequest)
  processDate(filterRequest);

  axiosInstance.post('/documents/get_list', filterRequest)
      .then(res => {
        console.log(res.data)
        updateDocuments(res)
      })
      .catch(err => {
        console.log(err)
      })
}

function getSelectionTypeName(value: SelectionType) {
  if (value.name) {
    return value.name
  } else if (value.shortname) {
    return value.shortname
  } else {
    throw Error('wrong type ' + value)
  }
}

function disableField(fieldIndex: number) {
  filterFields.value[fieldIndex].defaultOn = false
  delete filterData[filterFields.value[fieldIndex].key]
}

function isInSelectableKeys(fieldKey: string) {
  return Object.values(selectableKeysMapping).indexOf(fieldKey) !== -1
}

function getFieldsRequest() {
  //TODO fix url typo
  axiosInstance
      .get<FilterFieldsType[]>('/documents/get_fileds')
      .then((res) => {
        for (const el of res.data) {
          filterData[el.key] = ''
        }
        filterFields.value = res.data
      })
}

function updateDocuments(res: any) {
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
    })
  })
}

function openFilesDialog(row: any) {
  console.log(row)
}

function getDocumentsInitialRequest() {
  axiosInstance
      .get('/documents/')
      .then(updateDocuments)
}

function getSelectionListBy(type: SelectableKeysMappingType) {
  axiosInstance
      .get<SelectionType[]>(`/${ type }/`)
      .then(res => {
        selectableData.value[selectableKeysMapping[type]] = res.data
      })
}
</script>

<style scoped>
.filter-form-item {
  display: flex;
  align-items: center;
}

.content-box {
  margin-top: 0;
  margin-bottom: 8px;
  width: 95%;
}
</style>
