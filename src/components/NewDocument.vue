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
        label="Reference number"
      >
        <el-input v-model="formData.number" />
      </el-form-item>
      <el-form-item
        required
        label="Document type"
      >
        <el-input v-model="formData.documentType" />
      </el-form-item>
      <el-form-item
        required
        label="Document name"
      >
        <el-input v-model="formData.heading" />
      </el-form-item>
      <el-form-item
        required
        label="Date"
      >
        <el-date-picker
          v-model="formData.documentDate"
          type="date"
          placeholder="Pick a date"
        />
      </el-form-item>
      <el-form-item
        required
        label="Organization"
      >
        <el-input v-model="formData.organisation" />
      </el-form-item>
      <h2 style="text-align: center">
        Content
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
          Save
        </el-button>
        <el-badge
          :value="15"
          class="button"
        >
          <el-button
            size="large"
            @click="toggleFileAttachDialog"
          >
            Attach files
          </el-button>
        </el-badge>
      </div>
    </el-form>
  </el-card>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue"
import Editor from '@tinymce/tinymce-vue'
import AttachedFilesDialog from "./file-dialog/AttachedFilesDialog.vue"
import { ElMessage, ElMessageBox } from "element-plus";
import axios from "axios";

const filesDialog = ref()
const formData = reactive({
  documentType: '',
  number: '',
  organisation: '',
  documentDate: new Date(),
  heading: '',
  author: 'this',
  content: ''
})

const toggleFileAttachDialog = () => {
  filesDialog.value?.toggleVisible()
}

function saveClick() {
  ElMessageBox.confirm(
      'Confirm saving this document',
      'Save',
      {
        type: 'warning',
      })
      .then(() => {
        pendingSaveMessage();
        setTimeout(completeMessage, 1000)
        //sendSaveRequest()
      })
}

function pendingSaveMessage() {
  ElMessage({
    type: 'info',
    message: 'Pending save...',
  })
}

function completeMessage() {
  ElMessage({
    type: 'success',
    message: 'Save completed successfully!',
  })
}

function errorMessage(error: string) {
  ElMessage({
    type: 'error',
    message: error,
  })
}

type Id = { id: number }

type SaveDocRequest = {
  number: string,
  documentDate: string,
  heading: string,
  content?: string,
  documentType: Id,
  author: Id,
  organisation: Id,
  responsible?: Id,
}

async function sendSaveRequest(data: SaveDocRequest) {
  await axios.post('/documents/save', { documentDTO: data })
      .then((res) => {
        console.log(res)
        completeMessage()
      })
      .catch((error) => {
        console.log(error);
        errorMessage('error')
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
