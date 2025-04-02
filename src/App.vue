<template>
  <RouterView v-if="hideNavbar"></RouterView>
  <nav class="navbar-fixed sidebar-fixed" id="body" v-if="!hideNavbar" >
    <Navbar>
      <RouterView></RouterView>
    </Navbar>
  </nav>
  
  

</template>

<script setup>
import { RouterView,useRoute } from "vue-router";
import Navbar from "@/views/Navbar.vue";
import { computed } from 'vue';
import { watchEffect } from "vue";

import useUserStore from '@/stores/user';
const user=useUserStore();

// const isLogin = computed(() => user.empName != null && user.empName !== "");



// sessionStorage 被刪除時，同步清除 Pinia 狀態
watchEffect(() => {
  const storedData = sessionStorage.getItem("user");
  if (!storedData) {
    user.clear();
  }
});

// 以登入路徑決定要不要顯示navbar
const route = useRoute();
const hideNavbar = computed(() => route.meta.hideNavbar);

/* 插件們*/
import "@/plugins/material/css/materialdesignicons.min.css";
import "simplebar/dist/simplebar.min.js";
import "simplebar/dist/simplebar.min.css";
import "@/plugins/hotkeys/hotkeys.min.js";
import "moment/moment.js"
import "daterangepicker/daterangepicker.js"
import "@/js/mono.js";
import "@/js/chart.js";
import "@/css/style.css";
import "@/plugins/nprogress/nprogress.css";
import "@/plugins/quill/quill.snow.css";
/* 插件們結束*/

</script>

<style>
/* 字體*/
@import url("https://fonts.googleapis.com/css?family=Karla:400,700|Roboto");

</style>
