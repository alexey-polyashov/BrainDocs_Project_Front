<template>
  <el-card>
    <h2>Общая история операций</h2>
    <el-timeline>
      <el-timeline-item
        v-for="stamp in historyData"
        :key="stamp.id"
        :timestamp="getDate(stamp.createTime)"
        placement="top"
      >
        <el-card>
          <h4>Update Github template</h4>
          <p>
            {{ stamp.author.shortname }} изменил в
            {{ getTime(stamp.createTime) }}
          </p>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </el-card>
</template>

<script setup lang="ts">
import axios from 'axios';
import { ref } from 'vue';
import { getDate, getTime } from '@/common';

interface HistoryStampType {
  id: number;
  createTime: string;
  author: {
    id: number;
    shortname: string;
  };
  changeType: string;
}

const historyData = ref<HistoryStampType[]>([]);

axios
  .get<HistoryStampType[]>('history')
  .then((res) => (historyData.value = res.data));
</script>

<style scoped></style>
