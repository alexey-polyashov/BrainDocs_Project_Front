<template>
  <el-card class="content-box">
    <template #header>
      <div class="card-header">
        <span>Add new document</span>
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
      >
        <el-input v-model="formData.number" />
      </el-form-item>
      <el-form-item
        required
        label="Тип"
      >
        <el-input v-model="formData.documentType" />
      </el-form-item>
      <el-form-item
        required
        label="Название"
      >
        <el-input v-model="formData.heading" />
      </el-form-item>
      <el-form-item
        required
        label="Дата"
      >
        <el-date-picker
          v-model="formData.documentDate"
          type="date"
          placeholder="Pick a date"
        />
      </el-form-item>
      <el-form-item
        required
        label="Организация"
      >
        <el-input v-model="formData.organisation" />
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
        <el-badge
          :value="15"
          class="button"
        >
          <el-button
            size="large"
            @click="toggleFileAttachDialog"
          >
            Файлы
          </el-button>
        </el-badge>
      </div>
    </el-form>
  </el-card>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import Editor from '@tinymce/tinymce-vue';
import AttachedFilesDialog from "./file-dialog/AttachedFilesDialog.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import axios from "axios";

const filesDialog = ref();
const formData = reactive({
	documentType: '',
	number: '',
	organisation: '',
	documentDate: new Date(),
	heading: '',
	author: 'this',
	content: ''
});

const toggleFileAttachDialog = () => {
	filesDialog.value?.toggleVisible()
};

function saveClick() {
	ElMessageBox.confirm(
		'Сохранить этот документ?',
		{
			type: 'warning',
		})
		.then(() => {
			ElMessage.info('Идет сохранение...');
			setTimeout(() => ElMessage.success('Сохранение успешно!'), 1000);
			//sendSaveRequest()
		})
}

type Id = { id: number };

type SaveDocRequest = {
	number: string,
	documentDate: string,
	heading: string,
	content?: string,
	documentType: Id,
	author: Id,
	organisation: Id,
	responsible?: Id,
};

async function sendSaveRequest(data: SaveDocRequest) {
	await axios.post('/documents/save', { documentDTO: data })
		.then((res) => {
			ElMessage.success('Сохранение успешно!');
		})
		.catch((error) => {
			console.log(error);
			ElMessage.error('error');
		})
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
