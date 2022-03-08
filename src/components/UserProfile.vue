<template>
  <el-card class="content-box">
    <template #header>
      <div class="card-header">
        <span style="font-size: xx-large">Profile</span>
      </div>
    </template>
    <el-descriptions title="User Info" border :column="1">
      <template #extra>
        <el-button type="primary" @click="fieldsEditable = !fieldsEditable">
          Изменения {{ fieldsEditable ? 'включены' : 'выключены' }}
        </el-button>
      </template>
      <el-descriptions-item label="Avatar">
        <el-avatar :size="80" :src="userInfoForm.avatarSrc">
          <img
            src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"
          />
        </el-avatar>
      </el-descriptions-item>
      <el-descriptions-item label="Полное имя">
        <el-input v-model="userInfoForm.fullname" :readonly="!fieldsEditable" />
      </el-descriptions-item>
      <el-descriptions-item label="Короткое имя">
        <el-input
          v-model="userInfoForm.shortname"
          :readonly="!fieldsEditable"
        />
      </el-descriptions-item>
      <el-descriptions-item label="Логин">
        <el-input v-model="userInfoForm.login" :readonly="!fieldsEditable" />
      </el-descriptions-item>
      <el-descriptions-item label="Почта">
        <el-input v-model="userInfoForm.email" :readonly="!fieldsEditable" />
      </el-descriptions-item>
      <el-descriptions-item label="Организация">
        <selectable-field
          v-model="userInfoForm.organisation"
          :value-is-object="true"
          select-type="orgs"
          :disabled="!fieldsEditable"
        />
      </el-descriptions-item>
      <el-descriptions-item label="Адрес">
        <el-input v-model="userInfoForm.address" :readonly="!fieldsEditable" />
      </el-descriptions-item>
      <el-descriptions-item label="Телефон">
        <el-input v-model="userInfoForm.phone" :readonly="!fieldsEditable" />
      </el-descriptions-item>
    </el-descriptions>
    <el-button
      type="primary"
      :disabled="!fieldsModified"
      style="margin-top: 16px"
      @click="saveChanges"
    >
      Save changes
    </el-button>
    <el-button style="margin-top: 16px" @click="passwordChangePrompt">
      Change password
    </el-button>
  </el-card>
  <el-dialog
    v-model="passChangeDialogVisible"
    title="Change password"
    width="30%"
  >
    <el-form
      ref="passChangeFormRef"
      :model="passChangeForm"
      label-width="150px"
      :rules="passChangeRules"
    >
      <el-form-item required label="Old password" prop="oldPass">
        <el-input v-model="passChangeForm.oldPass" type="password" />
      </el-form-item>
      <el-form-item required label="New password" prop="newPass">
        <el-input v-model="passChangeForm.newPass" type="password" />
      </el-form-item>
      <el-form-item required label="Repeat" prop="newPassRepeated">
        <el-input v-model="passChangeForm.newPassRepeated" type="password" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="passChangeDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="passwordChangeSubmit"
          >Submit</el-button
        >
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { ElForm, ElMessage, ElMessageBox } from 'element-plus';
import { useStore } from '../store';
import SelectableField from './helpers/SelectableField.vue';
import _ from 'lodash-es';
import axios from 'axios';
import { UserInfoType } from '../types';
import { updateUserData } from '../net/common-requests';

const store = useStore();
const userInfoForm = reactive({
  avatarSrc: '',
  fullname: '',
  shortname: '',
  organisation: {
    id: -1,
    name: '',
  },
  login: '',
  password: '',
  email: '',
  address:
    'No.1188, Wuzhong Avenue, Wuzhong District, Suzhou, Jiangsu Province',
  phone: '3456457433',
});
const passChangeFormRef = ref<InstanceType<typeof ElForm>>();
const fieldsEditable = ref(false);
const fieldsModified = ref(false);
const passChangeDialogVisible = ref(false);
const passChangeForm = reactive({
  oldPass: '',
  newPass: '',
  newPassRepeated: '',
});

updateUserData().then(() => {
  const user = store.getUserInfo.userExtra;
  if (!user) {
    throw new Error('user is undefined');
  }
  userInfoForm.fullname = user.fullname;
  userInfoForm.login = user.login;
  userInfoForm.email = user.email;
  userInfoForm.shortname = user.shortname;
  userInfoForm.organisation = user.organisation;
  watch(userInfoForm, () => {
    fieldsModified.value = true;
  });
});

const passwordChangePrompt = () => {
  passChangeDialogVisible.value = true;
};

const passwordChangeSubmit = () => {
  passChangeFormRef.value?.validate((isValid, invalidFields) => {
    console.log(isValid);
    if (isValid) {
      passChangeDialogVisible.value = false;
    } else {
      ElMessage.error('Some inputs are invalid');
    }
  });
};

const passwordMatchValidator = (
  rule: unknown,
  value: unknown,
  callback: (er?: Error) => void
) => {
  if (passChangeForm.newPass === passChangeForm.newPassRepeated) {
    callback();
  } else {
    callback(new Error("Two inputs don't match!"));
  }
};

const passChangeRules = reactive({
  newPassRepeated: [
    {
      validator: passwordMatchValidator,
    },
  ],
});

function saveChanges() {
  const clonedUserInfo = _.clone(store.getUserInfo.userExtra);
  if (!clonedUserInfo) {
    throw new Error('user is undefined');
  }
  clonedUserInfo.email = userInfoForm.email;
  clonedUserInfo.shortname = userInfoForm.shortname;
  clonedUserInfo.fullname = userInfoForm.fullname;
  clonedUserInfo.login = userInfoForm.login;
  clonedUserInfo.organisation = userInfoForm.organisation;
  axios
    .put<UserInfoType>(`/users/${clonedUserInfo.id}`, clonedUserInfo)
    .then((res) => {
      ElMessageBox.alert('Данные обновлены!', {
        type: 'success',
      });
      store.getUserInfo.userExtra = res.data;
    });
}
</script>

<style scoped>
.content-box {
  margin-top: 0;
}
</style>
