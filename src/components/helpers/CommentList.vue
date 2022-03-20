<template>
  <div>
    <h3>Комментарии</h3>
    <div class="comment-block">
      <el-scrollbar height="300px">
        <div v-for="comment in commentData" :key="comment.id" class="comment">
          <p style="margin-bottom: 4px; font-size: 0.9rem">
            <span style="color: var(--el-color-primary)">{{
              comment.author.shortname
            }}</span>
            написал
            {{ comment.createTime }}
          </p>
          <p style="margin-left: 8px; font-size: 1.1rem">
            {{ comment.comment }}
          </p>
        </div>
      </el-scrollbar>
      <div style="padding: 16px; background-color: #efefef">
        Оставить комментарий
        <div style="display: flex">
          <el-input v-model="addCommentField" style="margin-right: 8px">
          </el-input>
          <el-button @click="sendComment">Ответить</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  DirectoryTypesAlias,
  getUrlByDirectoryType,
} from '@/net/common-requests';
import { UserShortname } from '@/types';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { ref } from 'vue';

interface CommentType {
  author: UserShortname;
  comment: string;
  createTime: string;
  id: number;
}

const props = defineProps<{
  id: number;
  elemType: DirectoryTypesAlias;
}>();

const addCommentField = ref('');
const elemTypeUrl = getUrlByDirectoryType(props.elemType);
const commentData = ref<CommentType[]>([
  {
    author: { id: 1, shortname: 'asd' },
    comment: 'asdasdasd',
    createTime: '2022-03-20',
    id: 1,
  },
  {
    author: { id: 1, shortname: 'asd' },
    comment: 'basd',
    createTime: '2022-03-20',
    id: 2,
  },
  {
    author: { id: 1, shortname: 'asd' },
    comment: 'zxc3wqrewt',
    createTime: '2022-03-19',
    id: 3,
  },
  {
    author: { id: 1, shortname: 'asd' },
    comment: 'tjhtdyjntdyjdtyj',
    createTime: '2022-03-18',
    id: 4,
  },
  {
    author: { id: 1, shortname: 'asd' },
    comment: 'tjhtdyjntdyjdtyj',
    createTime: '2022-03-18',
    id: 4,
  },
  {
    author: { id: 1, shortname: 'asd' },
    comment: 'tjhtdyjntdyjdtyj',
    createTime: '2022-03-18',
    id: 4,
  },
  {
    author: { id: 1, shortname: 'asd' },
    comment: 'tjhtdyjntdyjdtyj',
    createTime: '2022-03-18',
    id: 4,
  },
]);

fetchComments();

function fetchComments() {
  axios
    .get<CommentType[]>(`${elemTypeUrl}/${props.id}/comments`)
    .then((res) => {
      commentData.value = res.data;
    });
}

function sendComment() {
  if (!addCommentField.value) {
    ElMessage.warning('Комментарий не может быть пустым');
  } else {
    axios
      .post(`${elemTypeUrl}/${props.id}/comments`, {
        author: { id: 1 },
        comment: addCommentField.value,
      })
      .then((res) => {
        fetchComments();
      });
  }
}
</script>

<style scoped>
.comment {
  margin: 16px 0;
  margin-left: 16px;
}

p {
  margin: 0;
}
.comment-block {
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
}
</style>
