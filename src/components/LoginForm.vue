<template>
  <el-form ref="formRef" class="content-box" :model="form" label-width="auto">
    <el-form-item label="Login" prop="login">
      <el-input v-model="form.username"></el-input>
    </el-form-item>
    <el-form-item label="Password" prop="password">
      <el-input type="password" v-model="form.password"></el-input>
    </el-form-item>
    <el-form-item>
      <LoadingButton ref="loadingButton" @click="loginRequest" buttonText="Login"></LoadingButton>
      <el-button @click="resetForm(formRef)">Reset</el-button>
    </el-form-item>
    <el-button @click="switchToRegister" type="text">Don't have an account yet? Register instead</el-button>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { ElForm, ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import LoadingButton from './LoadingButton.vue'
import axiosInstance from "../net/axios-instance";
import { useStore } from "../store";

type FormInstance = InstanceType<typeof ElForm>;
const loadingButton = ref<InstanceType<typeof LoadingButton>>();
const router = useRouter();
const store = useStore();
const form = reactive({
  username: 'user',
  password: '100'
});
const formRef = ref<FormInstance>();
const resetForm = (formEl?: FormInstance) => {
  formEl?.resetFields();
};
const switchToRegister = () => {
  router.push({ name: 'register' });
};

async function loginRequest() {
  loadingButton.value.loading = true;
  await axiosInstance
      .post<{ token: string }>('/auth', form)
      .then(res => {
        store.$state.userInfo.token = res.data.token;
        store.$state.userInfo.authorized = true;
        ElMessage.success('Logged in!');
      })
      .catch(err => {
        ElMessage.error(err.response.data.message);
        console.log(err.response.data);
      });
  loadingButton.value.loading = false;
}
</script>
