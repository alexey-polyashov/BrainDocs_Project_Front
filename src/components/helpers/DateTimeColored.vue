<template>
  <span>
    <span style="color: var(--m-date-color)">{{ getDate(date) }}</span
    >&nbsp;<span style="color: var(--m-time-color)">{{
      getTime(date)
    }}</span></span
  >
</template>

<script setup lang="ts">
import { getDate, getTime } from '@/common';

defineProps<{
  date: string;
}>();
</script>

<style scoped></style>
