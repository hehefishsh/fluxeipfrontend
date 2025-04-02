<template>
  <!-- <Navbar></Navbar> -->
  <div class="content-wrapper">
    <div class="content">
      <div class="row  min-vh-100">
        <div class="col-xl-4" >
          <div class="card card-default" id="leave-request-query" style="height: 94%;">
            <div class="card-header">
              <h2>打卡</h2>
            </div>
            <div class="card-body py-0" data-simplebar>
              <Clock></Clock>
            </div>
          </div>
        </div>
        <div class="col-xl-8" >
          <div class="card card-default" id="leave-request-query"style="height: 94%;">
            <div class="card-header">
              <h2>待辦事項</h2>
            </div>
            <div class="card-body py-0" data-simplebar>
              <Taskassign></Taskassign>
            </div>
          </div>
        </div>
        <div class="col-xl-12">
          <div class="card card-default" id="leave-request-query">
            <div class="card-header">
              <h2>公佈欄</h2>
            </div>
            <div class="card-body py-0" data-simplebar>
              <BulletinList></BulletinList>
            </div>
          </div>
        </div>
        <!-- 可以添加更多小頁面組件 -->
      </div>
    </div>
  </div>
</template>

<script setup>
import Clock from "@/views/attendance/Clock.vue";
import Taskassign from "./work/Taskassign.vue";
import BulletinList from "./bulletin/BulletinList.vue";
</script>

<style></style>
