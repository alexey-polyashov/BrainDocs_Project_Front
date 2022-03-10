<template>
  <div style="display: flex; justify-content: center">
    <el-card style="margin-right: 16px; height: fit-content">
      <h3>Справочники</h3>
      <check-tag-wrapper
        :ref="(el: any) => initTag('docTypes', el)"
        class="menu-tag"
        @change="() => setActiveComponent('docTypes')"
        >Типы документа</check-tag-wrapper
      >
      <check-tag-wrapper
        :ref="(el: any) => initTag('orgs', el)"
        class="menu-tag"
        @change="() => setActiveComponent('orgs')"
        >Организации</check-tag-wrapper
      >
      <h3>Запросы на</h3>
      <check-tag-wrapper
        :ref="(el: any) => initTag('deletion', el)"
        class="menu-tag"
        @change="() => setActiveComponent('deletion')"
        >Удаление</check-tag-wrapper
      >
      <check-tag-wrapper
        :ref="(el: any) => initTag('registration', el)"
        class="menu-tag"
        @change="() => setActiveComponent('registration')"
        >Регистрацию</check-tag-wrapper
      >
    </el-card>
    <el-card>
      <component :is="tabs[checkedKey]"></component>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { IndexedType } from '@/types';
import { markRaw, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import CheckTagWrapper from './helpers/CheckTagWrapper.vue';
import SearchDocType from './search/doc-type/SearchDocType.vue';
import SearchOrg from './search/org/SearchOrg.vue';
import TheHome from './TheHome.vue';

const tabs: { [p: string]: any } = {
  docTypes: SearchDocType,
  orgs: SearchOrg,
  deletion: TheHome,
  registration: TheHome,
};

const router = useRouter();
const checkedKey = ref('');
const tagRefs = reactive<IndexedType<string, typeof CheckTagWrapper>>({});

type KeyOfTabs = keyof typeof tabs;

onMounted(() => {
  let routeString: KeyOfTabs = 'docTypes';
  if (router.currentRoute.value.hash) {
    routeString = router.currentRoute.value.hash.slice(1);
  }
  setActiveComponent(routeString);
});

function initTag(type: KeyOfTabs, el: typeof CheckTagWrapper) {
  tagRefs[type] = el;
}

function setActiveComponent(key: KeyOfTabs) {
  if (key === checkedKey.value) return;
  if (checkedKey.value) tagRefs[checkedKey.value].checked = false;
  tagRefs[key].checked = true;
  checkedKey.value = key as string;
  router.push({
    name: router.currentRoute.value.name as string,
    hash: ('#' + key) as string,
  });
}
</script>

<style scoped>
.menu-tag {
  margin-bottom: 8px;
  display: block;
}
</style>
