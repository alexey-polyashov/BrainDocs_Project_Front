<template>
  <el-container class="page-container">
    <el-header class="page-header">
      <el-row justify="space-between" align="middle">
        <el-col :span="10" class="logo-menu">
          <div class="main-logo">
            <span class="material-icons-round main-logo-icon">
              filter_drama
            </span>
            <span class="logo-text"
              ><span style="color: #88deff">B</span>rain<span
                style="color: #88deff"
                >D</span
              >ocs</span
            >
          </div>
          <el-menu
            v-if="store.getUserInfo.authorized"
            :default-active="activeMenu"
            background-color="transparent"
            text-color="white"
            active-text-color="#DBB046"
            class="el-menu-demo"
            mode="horizontal"
            style="border-bottom: none"
            :ellipsis="false"
            router
            @select="menuClicked"
          >
            <el-menu-item index="/search-doc" class="menu-item">
              Поиск
            </el-menu-item>
            <el-menu-item index="/directories" class="menu-item">
              Справочники
            </el-menu-item>
            <el-menu-item index="/tasks" class="menu-item">
              Задачи
            </el-menu-item>
            <el-menu-item index="/history" class="menu-item">
              История
            </el-menu-item>
          </el-menu>
        </el-col>
        <el-col :span="7" style="text-align: end">
          <profile-menu-button />
        </el-col>
      </el-row>
    </el-header>
    <el-main class="page-main">
      <router-view />
    </el-main>
    <el-footer class="page-footer">
      <span>BrainDocs &copy;</span>
    </el-footer>
  </el-container>
</template>

<script lang="ts" setup>
import { provide, ref } from 'vue';
import { installAuthHeader, useAuthGuard, verifyAuth } from './common';
import ProfileMenuButton from './components/helpers/ProfileMenuButton.vue';
import {
  getTaskExecutorStatuses,
  getTaskStatuses,
} from './net/common-requests';
import useServerCheck from './net/server-check';
import { useStore } from './store';

export type MenuBarValues =
  | 'search-doc'
  | 'directories'
  | 'tasks'
  | 'history'
  | '';
export type SetActiveMenuItemType = (item: MenuBarValues) => void;

const store = useStore();

getTaskExecutorStatuses();
getTaskStatuses();
useServerCheck();
verifyAuth();
useAuthGuard();

const activeMenu = ref('');
const setActiveMenuItem = (item: MenuBarValues) => (activeMenu.value = item);

provide<SetActiveMenuItemType>('setActiveMenuItem', setActiveMenuItem);

const menuClicked = (index: string) => {
  activeMenu.value = index as MenuBarValues;
};
</script>

<style>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons+Round');
@import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@400&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400&display=swap');

body {
  min-width: 700px;
  margin: 0;
  background-color: #f4eeff;
}

* {
  font-family: 'Roboto', 'Ubuntu', sans-serif;
}

.content-box {
  border-radius: 4px;
  border: 2px solid var(--el-border-color);
  padding: 16px;
  width: 70%;
  margin: 10% auto;
}

:root {
  --m-date-color: #508d8d;
  --m-time-color: #787e3f;
}

@media only screen and (max-width: 1024px) {
  .content-box {
    width: 95%;
  }
}
</style>

<style scoped>
.logo-menu {
  display: flex;
}

.page-header {
  height: auto;
  background: #585ed6;
}

.main-logo {
  display: inline-flex;
  align-items: center;
  color: white;
}

.page-footer {
  height: 150px;
  padding: 32px;
  text-align: center;
  background: #bbbbbb3d;
}

.page-main {
  min-height: 100vh;
  overflow: initial;
}

.main-logo-icon {
  font-size: 3em;
  color: #ffd400;
  margin-right: 8px;
}

.page-container:before {
  content: '';
  display: block;
  position: fixed;
  width: 100%;
  height: 100%;
  opacity: 0.3;
  background-image: url('assets/bg-min.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  z-index: -10;
}

.menu-item {
  font-size: large;
}

.logo-text {
  font-size: x-large;
  margin-right: 1em;
}
</style>
