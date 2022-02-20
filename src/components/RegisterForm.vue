<template>
  <el-form
    ref="formRef"
    class="content-box"
    :model="form"
    label-width="auto"
    :label-position="labelPosition"
  >
    <el-form-item
      required
      label="Full name"
      prop="fullName"
    >
      <el-input v-model="form.fullName" />
    </el-form-item>
    <el-form-item
      required
      label="Organization"
      prop="organization"
    >
      <el-select v-model="form.organization">
        <el-option
          v-for="item in organizationOptions"
          :key="item"
          :label="item"
          :value="item"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      required
      label="Login"
      prop="login"
    >
      <el-input v-model="form.login" />
    </el-form-item>
    <el-form-item
      required
      label="Email"
      prop="email"
    >
      <el-input v-model="form.email" />
    </el-form-item>
    <el-form-item
      required
      label="Password"
      prop="password"
    >
      <el-input
        v-model="form.password"
        type="password"
      />
    </el-form-item>
    <el-form-item
      required
      label="Repeat password"
      prop="passwordRepeated"
    >
      <el-input
        v-model="form.passwordRepeated"
        type="password"
      />
    </el-form-item>
    <el-form-item>
      <LoadingButton
        ref="loadingButton"
        button-text="Register"
        @click="onSubmit"
      />
      <el-button @click="resetForm(formRef)">
        Reset
      </el-button>
    </el-form-item>
    <el-button
      type="text"
      @click="switchToLogin"
    >
      Already have an account? Login instead
    </el-button>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref, watch } from 'vue';
import { ElForm } from "element-plus";
import { useRouter } from "vue-router";
import { useStore } from "../store";
import LoadingButton from './LoadingButton.vue';

const router = useRouter();
const store = useStore();
const organizationOptions = ['o1', 'o2', 'o3'];
const loadingButton = ref();

type FormInstance = InstanceType<typeof ElForm>;
const form = reactive({
  fullName: '',
  password: '',
  passwordRepeated: '',
  organization: '',
  email: '',
  login: ''
});
const labelPosition = ref(store.checkWidthTypeFits('md') ? 'right' : 'top');
const formRef = ref<FormInstance>();
const onSubmit = () => {
  loadingButton.value.loading = true;
  setTimeout(() => loadingButton.value.loading = false, 1000);
};
const resetForm = (formEl: FormInstance | undefined) => {
  formEl?.resetFields();
};
const switchToLogin = () => {
  router.push({ name: 'login' });
};
</script>
