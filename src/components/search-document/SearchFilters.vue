<template>
  <el-form label-width="200px" label-position="left">
    <h3>Фильтры</h3>
    <TransitionGroup tag="div" name="list">
      <template
        v-for="(field, filterFieldsArrIndex) in activeFieldsObject"
        :key="field.key"
      >
        <el-form-item :label="field.name">
          <div class="filter-form-item">
            <SelectableField
              v-if="isInSelectableKeys(field.key)"
              v-model="filterData[field.key]"
              :options="() => selectableDataLocal[field.key]"
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
                  clearFilterField(filterFieldsArrIndex, field.type === 'Date')
                "
              >
                <span style="font-size: 1rem" class="material-icons-round"
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
                  disableField(filterFieldsArrIndex, field.type === 'Date')
                "
              >
                <span style="font-size: 1rem" class="material-icons-round"
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
          v-if="filterFields.length > 1"
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
        <el-button type="primary" class="m8" @click="$emit('createClick')">
          Создать
        </el-button>
        <el-button
          type="danger"
          class="m8"
          @click="$emit('deleteSelectedClick')"
        >
          Удалить выбранные
        </el-button>
      </div>
      <div key="docTable">
        <slot name="table"></slot>
      </div>
    </TransitionGroup>
  </el-form>
</template>

<script setup lang="ts">
import axios from 'axios';
import { computed, reactive, ref, toRef } from 'vue';
import { convertDate } from '../../common';
import {
  DirectoryTypesAlias,
  getUrlByDirectoryType,
  SelectableTypesAlias,
} from '../../net/common-requests';
import LoadingButton from '../helpers/LoadingButton.vue';
import SelectableField from '../helpers/SelectableField.vue';
import {
  DocFilterRequestType,
  DocFilterResponse,
  FilterDataType,
  FilterFieldsType,
  FilterFieldsViewType,
  FilterType,
  SelectableDataType,
} from './types';

const props = withDefaults(
  defineProps<{
    saveFiltersInSession?: boolean;
    filterType: DirectoryTypesAlias;
    selectableData?: SelectableDataType;
  }>(),
  {
    saveFiltersInSession: true,
  }
);

const emit = defineEmits<{
  (event: 'filtersApplied', data: any): void;
  (event: 'createClick'): void;
  (event: 'deleteSelectedClick'): void;
  (event: 'initReady'): void;
}>();

const applyFiltersButton = ref<InstanceType<typeof LoadingButton> | null>(null);
const filterData = reactive<FilterDataType>({});
const filterFields = ref<FilterFieldsType[]>([]);
const activeFilterFieldIndices = ref<number[]>([]);
const selectableDataLocal = toRef(props, 'selectableData', {});
const filterTypeLocal = ref(getUrlByDirectoryType(props.filterType));
const filterPagingInfo = {
  page: '0',
  recordsOnPage: '10',
};
const selectableKeysMapping = {
  users: 'author',
  docTypes: 'documentType',
  orgs: 'organisation',
};

initFilterFieldsAsync().then(() => {
  emit('initReady');
});

function groupTagChange(id: number, isOn: boolean) {
  if (isOn) {
    filterData.documentType = `${id}`;
    applyFilters();
  } else {
    delete filterData.documentType;
    applyFilters();
  }
}

async function initFilterFieldsAsync() {
  let sessionFiltersResult:
    | ReturnType<typeof retrieveSessionFilters>
    | undefined = undefined;
  if (props.saveFiltersInSession) {
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

  return new Promise<void>((resolve) => {
    if (!sessionFiltersResult?.filterFieldsPersist) {
      getFieldsRequest().then(() => {
        initActiveFieldsIfNeeded();
        resolve();
      });
    } else {
      initActiveFieldsIfNeeded();
      resolve();
    }
  });
}

function isInSelectableKeys(fieldKey: string) {
  return Object.values(selectableKeysMapping).indexOf(fieldKey) !== -1;
}

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

function clearFilterField(fieldIndex: number, isDate: boolean) {
  if (isDate) {
    delete filterData[filterFields.value[fieldIndex].key + 'Start'];
    delete filterData[filterFields.value[fieldIndex].key + 'End'];
  } else {
    delete filterData[filterFields.value[fieldIndex].key];
  }
}

function disableField(fieldIndex: number | string, isDate: boolean) {
  fieldIndex = Number(fieldIndex);
  const activeFieldIndex = activeFilterFieldIndices.value.indexOf(fieldIndex);
  activeFilterFieldIndices.value.splice(activeFieldIndex, 1);
  clearFilterField(fieldIndex, isDate);
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
        value: convertDate(date),
        operation: operation,
      });
    }
  }

  addDateToFilterList('documentDateStart', '>');
  addDateToFilterList('documentDateEnd', '<');
}

async function getFieldsRequest() {
  await axios
    .get<FilterFieldsType[]>(`/${filterTypeLocal.value}/fields`)
    .then((res) => {
      filterFields.value = res.data;
    });
}

async function applyFilters(filterTempData: FilterDataType = filterData) {
  applyFiltersButton.value?.setLoading(true);
  const filterRequest = initFilters(filterTempData);
  processDate(filterRequest);
  await axios
    .post<any>(`/${filterTypeLocal.value}/search`, filterRequest)
    .then((res) => {
      emit('filtersApplied', res.data);
      // updateDocuments(res);
      if (props.saveFiltersInSession) {
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

function addFilterSelected(selectedKey: string) {
  const selectedFieldIndex = filterFields.value.findIndex(
    (value) => value.key === selectedKey
  );
  if (selectedFieldIndex !== -1)
    activeFilterFieldIndices.value.push(selectedFieldIndex);
}

function doSaveFiltersInSession() {
  sessionStorage.setItem('filterData', JSON.stringify(filterData));
  sessionStorage.setItem('filterFields', JSON.stringify(filterFields.value));
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

defineExpose({
  applyFilters,
  groupTagChange,
  onPageChange,
});
</script>

<style scoped>
.filter-form-item {
  display: flex;
  align-items: center;
}

.m8 {
  margin: 8px;
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
