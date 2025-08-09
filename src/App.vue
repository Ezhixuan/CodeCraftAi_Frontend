<script setup lang="ts">
import BasicLayout from './layouts/BasicLayout.vue'
import { useLoginUserStore } from './stores/loginUser';

const loginUserStore = useLoginUserStore();
loginUserStore.fetchLoginUserInfo();

</script>

<template>
  <BasicLayout />
</template>

<style></style>
