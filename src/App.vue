<template>
  <BasicLayout />
</template>

<script setup lang="ts">
import BasicLayout from './layouts/BasicLayout.vue'
import { useLoginUserStore } from '@/stores/loginUser.ts'

useLoginUserStore().fetchLoginUserInfo()
</script>

<style></style>
