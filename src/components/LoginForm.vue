<template>
  <el-card class="content-box">
    <el-form
      ref="formRef"
      :model="form"
      label-width="auto"
    >
      <el-form-item
        label="Логин"
        prop="login"
      >
        <el-input v-model="form.username" />
      </el-form-item>
      <el-form-item
        label="Пароль"
        prop="password"
      >
        <el-input
          v-model="form.password"
          type="password"
        />
      </el-form-item>
      <el-form-item>
        <LoadingButton
          ref="loadingButton"
          button-text="Войти"
          @click="loginRequest"
        />
        <el-button @click="resetForm(formRef)">
          Сброс
        </el-button>
      </el-form-item>
      <el-button
        type="text"
        @click="switchToRegister"
      >
        Регистрация
      </el-button>
    </el-form>
  </el-card>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { ElForm, ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import LoadingButton from './helpers/LoadingButton.vue'
import axios from "axios";
import { useStore } from "../store";

type FormInstance = InstanceType<typeof ElForm>;
const loadingButton = ref();
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
  await axios
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
