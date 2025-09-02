<template>
  <BasicLayout />
</template>

<script setup lang="ts">
import BasicLayout from './layouts/BasicLayout.vue'
import { useLoginUserStore } from '@/stores/loginUser.ts'
import { useEnumStore } from '@/stores/enum.ts'

useLoginUserStore().fetchLoginUserInfo()
const enumStore = useEnumStore()
enumStore.loadCodeGenTypeList()
enumStore.loadUserRoleList()
enumStore.loadUserStatusList()
</script>

<style></style>
