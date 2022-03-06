<template>
  <el-card class="form-box">
    <el-form ref="formRef" :model="form" label-width="auto">
      <h2>Вход</h2>
      <el-form-item label="Логин" prop="username">
        <el-input v-model="form.username" />
      </el-form-item>
      <el-form-item label="Пароль" prop="password">
        <el-input v-model="form.password" type="password" />
      </el-form-item>
      <el-form-item>
        <LoadingButton
          ref="loadingButton"
          button-text="Войти"
          @click="loginRequest"
        />
        <el-button @click="resetForm(formRef)"> Сброс </el-button>
      </el-form-item>
      <el-button type="text" @click="switchToRegister"> Регистрация </el-button>
    </el-form>
  </el-card>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { ElForm, ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import LoadingButton from './helpers/LoadingButton.vue';
import axios from 'axios';
import { useStore } from '../store';
import { NamedSelectionType, UserInfoType } from '../types';
import { updateUserData } from '../net/common-requests';
import { installAuthHeader } from '../common';

type FormInstance = InstanceType<typeof ElForm>;
const loadingButton = ref();
const router = useRouter();
const store = useStore();
const form = reactive({
  username: 'user',
  password: '100',
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
    .then((res) => {
      store.$patch((state) => {
        state.userInfo.token = res.data.token;
        state.userInfo.authorized = true;
      });
      installAuthHeader();
      updateUserData().then(() => {
        ElMessage.success('Вы вошли в систему!');
        router.push({ name: 'search-doc' });
      });
    })
    .catch((err) => {
      ElMessage.warning(err.response.data);
    });
  loadingButton.value.loading = false;
}
</script>

<style scoped>
.form-box {
  max-width: 500px;
  margin: 10% auto;
}
</style>
