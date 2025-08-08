<script setup lang="ts">
import { isOk } from './api/jiankangjiancha';
import BasicLayout from './layouts/BasicLayout.vue'

isOk().then(res => {
  console.log(res)
})
</script>

<template>
  <BasicLayout />
</template>

<style></style>
