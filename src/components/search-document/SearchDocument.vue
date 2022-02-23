<template>
  <div style="display: flex">
    <div class="grouping-box content-box">
      <h1>Group by doctype</h1>
      <el-scrollbar height="100%">
        <CheckTagWrapper
          v-for="docType in selectableData['documentType']"
          :key="docType.id"
          :ref="(el: any) => groupTagInit(docType.id, el)"
          style="margin-bottom: 8px; display: block;"
          @change="groupTagChange(docType.id)"
        >
          {{ docType.name }}
        </CheckTagWrapper>
      </el-scrollbar>
    </div>
    <div style="min-width: 0;">
      <div class="filter-box-item filter-fields-box">
        <el-form
          label-width="200px"
          label-position="left"
        >
          <h1>Filters</h1>
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
                    content="Delete field"
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
                button-text="Apply filters"
                @click="applyFiltersClick"
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
            </div>
            <div
              key="docTable"
              class="filter-box-item filter-box-table"
            >
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
          </TransitionGroup>
        </el-form>
      </div>
    </div>
  </div>
  <AttachedFilesDialog ref="filesDialog" />
</template>

<script lang="ts">
import axios from "axios";
import { computed, onMounted, reactive, ref } from "vue";
import LoadingButton from "../LoadingButton.vue";
import CheckTagWrapper from "../CheckTagWrapper.vue";
import AttachedFilesDialog from '../file-dialog/AttachedFilesDialog.vue'
import {
  DocFilterRequestType,
  DocType,
  FilterType,
  FilterDataType,
  FilterFieldsType,
  SelectableDataType,
  SelectionType,
  FilterFieldsViewType,
IndexedType
} from "./types";
import { AxiosResponse } from "axios";
import { defineComponent } from "vue";

export default defineComponent({
  components: {
    AttachedFilesDialog,
    LoadingButton,
    CheckTagWrapper
  },
  setup() {
    const filesDialog = ref();
    const applyFiltersButton = ref();
    const documents = ref<DocType[]>([]);
    const filterData = reactive<FilterDataType>({});
    const filterFields = ref<FilterFieldsType[]>([]);
    const activeFilterFieldIndices = ref<number[]>([]);
    const selectableData = ref<SelectableDataType>({});
    // url request map to key of a field
    const selectableKeysMapping = {
      'users': 'author',
      'documents/types': 'documentType',
      'organisations': 'organisation',
    };
    const doctypeGroupTags = reactive<IndexedType<number, typeof CheckTagWrapper>>({});
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
      if (doctypeGroupTags[id].checked) {
        filterData.documentType = `${id}`;
        applyFilters();
      } else {
        delete filterData.documentType;
        applyFilters();
      }
    }

    type SelectableKeysMappingType = keyof (typeof selectableKeysMapping);

    function initFilterFields() {
      let sessionFiltersResult: ReturnType<typeof retrieveSessionFilters> | null = null;
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
      for (const key in selectableKeysMapping) {
        getSelectionListBy(key as SelectableKeysMappingType);
      }
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
        page: '0',
        recordsOnPage: '10',
        filter: filters
      };
      return filterRequest;
    }

    function applyFiltersClick() {
      applyFilters();
    }

    async function applyFilters(filterTempData: FilterDataType = filterData) {
      applyFiltersButton.value.loading = true;
      const filterRequest = initFilters(filterTempData);
      processDate(filterRequest);

      console.log(filterRequest);
      await axios
        .post('/documents/search', filterRequest)
        .then(res => {
          console.log(res.data);
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

    function getSelectionTypeName(value: SelectionType) {
      if (value.name) {
        return value.name;
      } else if (value.shortname) {
        return value.shortname;
      } else {
        throw Error('wrong type ' + value);
      }
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

    async function getSelectionListBy(type: SelectableKeysMappingType) {
      await axios
        .get<SelectionType[]>(`/${type}/`)
        .then(res => {
          selectableData.value[selectableKeysMapping[type]] = res.data;
        });
    }

    return {
      selectableData,
      activeFieldsObject,
      filesDialog,
      applyFiltersButton,
      documents,
      filterData,
      nonActiveFields,
      applyFiltersClick,
      openFilesDialog,
      groupTagInit,
      groupTagChange,
      addFilterSelected,
      applyFilters,
      getSelectionTypeName,
      disableField,
      isInSelectableKeys,
      clearFilterField
    };
  }
});
</script>

<style scoped>
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
