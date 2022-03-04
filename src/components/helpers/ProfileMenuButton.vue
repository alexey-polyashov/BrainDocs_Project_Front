<template>
  <el-dropdown
    v-if="userInfo.authorized"
    split-button
    type="primary"
    @click="profileClick"
    @command="dropDownClick"
  >
    <span class="material-icons-round">account_circle</span>
    &nbsp;{{ userInfo.userExtra?.shortname }}
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="logOut">Выйти</el-dropdown-item>
        <el-dropdown-item>Action 3</el-dropdown-item>
        <el-dropdown-item>Action 4</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
  <el-button v-else type="primary" @click="signIn">
    <span class="material-icons-round">account_circle</span>&nbsp;Войти
  </el-button>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { computed, inject, Ref } from 'vue';
import { MenuBarValues, SetActiveMenuItemType } from '../../App.vue';
import router from '../../router';
import { useStore } from '../../store';

const store = useStore();
const userInfo = computed(() => store.getUserInfo);
const setActiveMenuItem = inject<SetActiveMenuItemType>(
  'setActiveMenuItem'
) as SetActiveMenuItemType;

const profileClick = () => {
  setActiveMenuItem('');
  router.push({ name: 'profile' });
};

const signIn = () => {
  setActiveMenuItem('');
  router.push({ name: 'login' });
};

function dropDownClick(command: string) {
  if (command === 'logOut') {
    store.$patch((state) => {
      state.userInfo.authorized = false;
      state.userInfo.token = '';
      delete state.userInfo.userExtra;
    });
    ElMessage.info('Вы вышли из системы');
  }
}
</script>

<style scoped></style>
