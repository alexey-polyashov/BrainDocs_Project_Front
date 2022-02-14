<template>
  <div class="content-box">
    Filter box
  </div>
  <div class="content-box">
    <el-table
        :data="tableData"
        :default-sort="{ prop: 'id', order: 'ascending' }"
        style="width: 100%"
    >
      <el-table-column prop="id" label="id" sortable width="90"/>
      <el-table-column prop="date" label="date" sortable width="180"/>
      <el-table-column prop="name" label="name" sortable width="180"/>
      <el-table-column prop="author" label="author" sortable width="180"/>
      <el-table-column prop="organization" label="organization" sortable width="180"/>
      <el-table-column prop="files" label="files" sortable width="180"/>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
type DocType = {
  date: string,
  id: number,
  name: string,
  author: string,
  organization: string,
  files: string,
}
const tableData: DocType[] = []
for (let i = 0; i < 15; i++) {
  const aCodePoint = 'a'.codePointAt(0)
  tableData.push({
    date: (new Date()).toDateString(),
    id: i,
    name: `${ String.fromCodePoint((aCodePoint == undefined ? 0 : aCodePoint) + i) }`,
    author: `author${ i }`,
    organization: `org${ i }`,
    files: `files${ i }`,
  })
}
</script>

<style scoped>
.content-box {
  margin-top: 0;
  margin-bottom: 8px;
}
</style>
