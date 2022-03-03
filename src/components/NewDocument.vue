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
        <SelectableField
          v-model="formData.documentType"
          :value-is-object="true"
          select-type="docTypes"
        />
      </el-form-item>
      <el-form-item
        required
        label="Организация"
        prop="organisation"
      >
        <SelectableField
          v-model="formData.organisation"
          :value-is-object="true"
          select-type="orgs"
        />
      </el-form-item>
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
        <el-button
          class="button"
          size="large"
          @click="onCloseClick"
        >
          Закрыть
        </el-button>
      </div>
    </el-form>
  </el-card>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, watch } from "vue";
import Editor from '@tinymce/tinymce-vue';
import AttachedFilesDialog from "./file-dialog/AttachedFilesDialog.vue";
import { ElForm, ElMessage, ElMessageBox } from "element-plus";
import axios from "axios";
import { getSelectableArray } from "../net/common-requests";
import SelectableField from "./helpers/SelectableField.vue";
import { NamedSelectionType } from "../types";
import { useRouter } from "vue-router";
import { DocFilterResponseContent } from "./search-document/types";

type Id = { id: number };

type SaveDocRequest = {
  id?: string,
  number: string,
  documentDate: string,
  heading: string,
  documentType: Id,
  author: Id,
  organisation: Id,
  content?: string,
  responsible?: Id,
};

const router = useRouter();

const formRef = ref<InstanceType<typeof ElForm>>();
const filesDialog = ref();
const formData = reactive({
  id: '',
  number: '',
  documentType: {
    id: -1,
    name: ''
  },
  organisation: {
    id: -1,
    name: ''
  },
  documentDate: new Date().toISOString(),
  heading: '',
  content: ''
});
const modified = ref(false);

onMounted(() => {
  const id = router.currentRoute.value.params.id;
  if (id) editMode(+(id as string));
});

const toggleFileAttachDialog = () => {
  filesDialog.value?.toggleVisible()
};

function onCloseClick() {
  if (modified.value) {
    ElMessageBox.confirm('Есть несохраненные изменения, закрыть без сохранения?').then(() => {
      router.push({ name: 'search-doc' });
    });
  } else {
    router.push({ name: 'search-doc' });
  }
}

function saveClick() {
  formRef.value?.validate((passed, failedFields) => {
    if (passed) {
      ElMessageBox.confirm(
        'Сохранить этот документ?',
        {
          type: 'warning',
        })
        .then(() => {
          sendSaveRequest({
            id: formData.id,
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
  ElMessage.info('Идет сохранение...');
  await axios
    .post<number>('/documents' + (data.id ? `/${data.id}` : ''), data)
    .then((res) => {
      ElMessage.success('Сохранение успешно!');
      filesDialog.value?.sendStoredFilesToDocument(res.data);
      clearForms();
    })
    .catch((error) => {
      console.log(error);
      ElMessage.error('error');
    });
}

function clearForms() {
  formRef.value?.resetFields();
  filesDialog.value?.resetState();
}

// if formData.id is present, edit mode is on
function editMode(docId: number) {
  function fetchDocById(docId: number) {
    axios
      .get<DocFilterResponseContent>(`/documents/${docId}`)
      .then(res => {
        formData.id = res.data.id.toString();
        formData.content = res.data.content;
        formData.heading = res.data.heading;
        formData.documentDate = res.data.documentDate;
        formData.number = res.data.number;
        formData.organisation = res.data.organisation;
        formData.documentType = res.data.documentType;
        watch(formData, () => {
          modified.value = true;
        });
      });
  }
  fetchDocById(docId);
}

defineExpose({
  editMode
});
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
