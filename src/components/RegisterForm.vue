<template>
  <el-card class="form-box">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="auto"
      label-position="right"
    >
      <h2>Регистрация</h2>
      <el-form-item
        required
        label="Полное имя"
        prop="fullName"
        :error="errors.fullName"
      >
        <el-input v-model="formData.fullName" />
      </el-form-item>
      <el-form-item
        required
        label="Короткое имя"
        prop="shortName"
        :error="errors.shortName"
      >
        <el-input v-model="formData.shortName" />
      </el-form-item>
      <el-form-item
        required
        label="Организация"
        prop="organisationId"
        :error="errors.organisationId"
      >
        <SelectableField v-model="formData.organisationId" select-type="orgs" />
      </el-form-item>
      <el-form-item required label="Логин" prop="login" :error="errors.login">
        <el-input v-model="formData.login" />
      </el-form-item>
      <el-form-item required label="Почта" prop="email" :error="errors.email">
        <el-input v-model="formData.email" />
      </el-form-item>
      <el-form-item
        required
        label="Пароль"
        prop="password"
        :error="errors.password"
      >
        <el-input v-model="formData.password" type="password" />
      </el-form-item>
      <el-form-item required label="Повтор пароля" prop="passwordRepeated">
        <el-input v-model="formData.passwordRepeated" type="password" />
      </el-form-item>
      <el-form-item>
        <LoadingButton
          ref="loadingButton"
          button-text="Регистрация"
          @click="onSubmit"
        />
        <el-button @click="resetForm"> Сброс </el-button>
      </el-form-item>
      <el-button type="text" @click="switchToLogin"> Войти </el-button>
    </el-form>
  </el-card>
</template>

<script lang="ts" setup>
import { reactive, ref, watch } from 'vue';
import { ElForm, ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { useStore } from '../store';
import LoadingButton from './helpers/LoadingButton.vue';
import axios from 'axios';
import SelectableField from './helpers/SelectableField.vue';
import _ from 'lodash-es';
import { IndexedStrType } from '@/types';

export interface UserRegistrationRequest {
  email: string;
  login: string;
  password: string;
  shortname: string;
  birthday?: string;
  fullname?: string;
  male?: string;
  organisationId: number;
}

const router = useRouter();
const store = useStore();
const loadingButton = ref();
const errors = reactive<IndexedStrType<string>>({
  fullName: '',
  shortName: '',
  password: '',
  organisationId: '',
  email: '',
  login: '',
});

type FormInstance = InstanceType<typeof ElForm>;
const formData = reactive({
  fullName: '',
  shortName: '',
  password: '',
  passwordRepeated: '',
  organisationId: {
    id: 1,
  },
  email: '',
  login: '',
});
const formRules = reactive({
  passwordRepeated: [
    {
      validator: validatePasswordRepeated,
    },
  ],
});
const formRef = ref<FormInstance>();
const onSubmit = () => {
  formRef.value?.validate((passed) => {
    if (passed) {
      loadingButton.value.loading = true;
      sendRegistrationRequest({
        email: formData.email,
        login: formData.login,
        password: formData.password,
        shortname: formData.shortName,
        organisationId: +formData.organisationId,
        fullname: formData.fullName,
        //male: 'm',
        //birthday: new Date().toISOString()
      })
        .then(() => {
          loadingButton.value.loading = false;
          resetForm();
        })
        .catch((err) => {
          if (err.response.data) {
            err.response.data.forEach(
              (el: { fieldName: string; message: string }) => {
                errors[el.fieldName] = el.message;
              }
            );
          }
        });
    } else {
      ElMessage.warning({
        message: 'Некоторые поля заполнены неверно',
        grouping: true,
      });
    }
  });
};
const resetForm = () => {
  formRef.value?.resetFields();
};
const switchToLogin = () => {
  router.push({ name: 'login' });
};

function validatePasswordRepeated(rule: any, value: any, callback: any) {
  if (formData.password !== formData.passwordRepeated) {
    callback(new Error('Пароли не совпадают'));
  } else {
    callback();
  }
}

function sendRegistrationRequest(data: UserRegistrationRequest) {
  return axios.post<number>('users', data).then((res) => {
    ElMessageBox.alert(
      'Запрос на регистрацию успешно отправлен! Ожидайте подтверждения.',
      {
        type: 'success',
      }
    );
  });
}
</script>

<style scoped>
.form-box {
  max-width: 500px;
  margin: 10% auto;
}
</style>
