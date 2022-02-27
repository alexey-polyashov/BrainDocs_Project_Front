<template>
  <el-card class="content-box">
    <template #header>
      <div class="card-header">
        <span>Добавить новый документ</span>
      </div>
    </template>
    <el-form
      ref="formRef"
      :model="formData"
      label-width="auto"
    >
      <el-form-item
        required
        label="Номер"
        prop="number"
      >
        <el-input v-model="formData.number" />
      </el-form-item>
      <el-form-item
        required
        label="Название"
        prop="heading"
      >
        <el-input v-model="formData.heading" />
      </el-form-item>
      <el-form-item
        required
        label="Тип"
        prop="documentType"
      >
        <el-select
          v-model="formData.documentType"
          placeholder="Выберите"
        >
          <el-option
            v-for="option in docTypeSelectable"
            :key="option.id"
            :label="option.name"
            :value="option.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        required
        label="Организация"
        prop="organisation"
      >
        <el-select
          v-model="formData.organisation"
          placeholder="Выберите"
        >
          <el-option
            v-for="option in orgSelectable"
            :key="option.id"
            :label="option.name"
            :value="option.id"
          />
        </el-select>
      </el-form-item>
      <!-- <el-form-item
        required
        label="Дата"
      >
        <el-date-picker
          v-model="formData.documentDate"
          type="date"
          placeholder="Pick a date"
        />
      </el-form-item>-->
      <h2 style="text-align: center">
        Содержание
      </h2>
      <editor
        v-model="formData.content"
        api-key="r8zqd3nkvkfr7t0s0r4qo107guk38q9xpact4xap39t1p0pe"
      />
      <AttachedFilesDialog ref="filesDialog" />
      <div class="button-group">
        <el-button
          size="large"
          type="primary"
          class="button"
          @click="saveClick"
        >
          Сохранить
        </el-button>
        <el-button
          class="button"
          size="large"
          @click="toggleFileAttachDialog"
        >
          Файлы
        </el-button>
      </div>
    </el-form>
  </el-card>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import Editor from '@tinymce/tinymce-vue';
import AttachedFilesDialog from "./file-dialog/AttachedFilesDialog.vue";
import { ElForm, ElMessage, ElMessageBox } from "element-plus";
import axios from "axios";
import { NamedSelectionType } from "./search-document/types";
import { getSelectableArray } from "../net/common-requests";

type Id = { id: number };

type SaveDocRequest = {
  number: string,
  documentDate: string,
  heading: string,
  documentType: Id,
  author: Id,
  organisation: Id,
  content?: string,
  responsible?: Id,
};

const formRef = ref<InstanceType<typeof ElForm>>();
const filesDialog = ref();
const formData = reactive({
  number: '',
  documentType: '',
  organisation: '',
  documentDate: new Date(),
  heading: '',
  content: ''
});
const docTypeSelectable = ref<NamedSelectionType[]>([]);
const orgSelectable = ref<NamedSelectionType[]>([]);

function initSelectables() {
  getSelectableArray('docTypes').then(res => docTypeSelectable.value = res);
  getSelectableArray('orgs').then(res => orgSelectable.value = res);
}

onMounted(() => {
  initSelectables();
})

const toggleFileAttachDialog = () => {
  filesDialog.value?.toggleVisible()
};

function saveClick() {
  formRef.value?.validate((passed, failedFields) => {
    if (passed) {
      ElMessageBox.confirm(
        'Сохранить этот документ?',
        {
          type: 'warning',
        })
        .then(() => {
          ElMessage.info('Идет сохранение...');
          sendSaveRequest({
            number: formData.number,
            documentDate: new Date().toISOString(),
            heading: formData.heading,
            content: formData.content,
            documentType: { id: +formData.documentType },
            organisation: { id: +formData.organisation },
            author: { id: 1 },
            responsible: { id: 1 }
          });
        });
    } else {
      ElMessage.warning({
        message: 'Некоторые поля заполнены неверно',
        grouping: true,
      });
    }
  });
}

async function sendSaveRequest(data: SaveDocRequest) {
  ElMessage.info('Документ отправлен...');
  await axios.post<number>('/documents', data)
    .then((res) => {
      ElMessage.success('Сохранение успешно!');
      filesDialog.value?.sendStoredFilesToDocument(res.data);
      clearForms();
    })
    .catch((error) => {
      console.log(error);
      ElMessage.error('error');
    })
}

function clearForms() {
  formData.number = '';
  formData.heading = '';
  formData.content = '';
  formData.documentType = '';
  formData.organisation = '';
  filesDialog.value?.resetState();
}
</script>

<style scoped>
.button-group {
  display: flex;
  justify-content: end;
}

.button {
  margin-top: 16px;
  margin-right: 16px;
}

.content-box {
  margin-top: 0;
}

.card-header {
  font-size: x-large;
  font-weight: bold;
}
</style>
