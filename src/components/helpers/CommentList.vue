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
            <date-time-colored :date="comment.createTime"></date-time-colored>
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
          <loading-button
            ref="supplyCommentButtonRef"
            type=""
            button-text="Ответить"
            @click="sendComment"
          />
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
import { convertDate, convertDateTime, getDate, getTime } from '@/common';
import LoadingButton from './LoadingButton.vue';
import DateTimeColored from './DateTimeColored.vue';

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
const supplyCommentButtonRef = ref<InstanceType<typeof LoadingButton>>();
const elemTypeUrl = getUrlByDirectoryType(props.elemType);
const commentData = ref<CommentType[]>([]);

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
    supplyCommentButtonRef.value?.setLoading(true);
    axios
      .post(`${elemTypeUrl}/${props.id}/comments`, {
        author: { id: 1 },
        comment: addCommentField.value,
      })
      .then((res) => {
        supplyCommentButtonRef.value?.setLoading(false);
        addCommentField.value = '';
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
