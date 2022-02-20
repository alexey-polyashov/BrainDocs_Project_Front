<template>
  <el-dialog
    v-model="dialogVisible"
    title="Add file"
    width="500px"
  >
    <el-form
      label-width="auto"
      :model="fileForm"
    >
      <el-form-item
        label="File name"
        prop="name"
      >
        <el-input v-model="fileForm.name" />
      </el-form-item>
      <el-form-item
        label="Short description"
        prop="description"
      >
        <el-input v-model="fileForm.description" />
      </el-form-item>
    </el-form>
    <el-upload
      class="upload-box"
      drag
      action=""
      :auto-upload="false"
      :on-change="fileSelected"
      :on-exceed="onLimitExceed"
      :limit="1"
    >
      <span class="material-icons-round upload-icon">cloud_upload</span>
      <div class="el-upload__text">
        Drop file here or <em>click to upload</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          any file type with size less than 500kb
        </div>
      </template>
    </el-upload>
    <template #footer>
      <el-button
        type="primary"
        @click="upload"
      >
        Save
      </el-button>
      <el-button @click="dialogVisible = false">
        Cancel
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import axiosInstance from "../../net/axios-instance";
import { ElMessage } from "element-plus";

// eslint-disable-next-line no-undef
const props = defineProps<{
  docId: number,
  updateView: (id: number) => void,
}>();

export interface FileDescriptionType {
  name: string,
  description: string,
  originalFilename: string,
  fileType: string,
  author: { id: number },
}

const dialogVisible = ref(false);
const fileForm = reactive<FileDescriptionType>({
  name: '',
  description: '',
  originalFilename: '',
  fileType: '',
  author: { id: 1 },
});
let requestFile: File | null = null;

function fileSelected(file: any) {
  console.log(file)
  requestFile = file.raw;
  fileForm.originalFilename = file.name;
  const fileName = file.name as string;
  fileForm.fileType = fileName.slice(fileName.lastIndexOf('.') + 1);
}

function upload() {
  console.log(props.docId)
  if (!requestFile) ElMessage.warning('please select file');
  else {
    const formData = new FormData();
    formData.append('fileDescribe', JSON.stringify(fileForm));
    formData.append('file', requestFile);
    axiosInstance
      .post(`/documents/${ props.docId }/files/upload`, formData)
      .then(res => {
        ElMessage.success('Upload successful!');
        dialogVisible.value = false;
        props.updateView(props.docId);
      })
      .catch(err => {
        console.log(err);
      });
  }
}

function onLimitExceed(files: any, fileList: any) {
  fileList[0] = files[0];
}

// eslint-disable-next-line no-undef
defineExpose({
  dialogVisible
});
</script>

<style scoped>
.upload-icon {
  margin-top: 40px;
  font-size: 5em;
  color: rgba(0, 0, 0, 0.3);
}

.upload-box {
  margin-top: 16px;
  text-align: center;
}
</style>
