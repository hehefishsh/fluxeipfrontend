<template>
    <div class="card card-default" id="page-views">
      <div class="card-header">
        <h2>相關資源</h2>
      </div>
      <div class="card-body py-0" data-simplebar>
        <div v-if="allGuideline && allGuideline.length">
          <table class="table table-borderless table-thead-border">
            <thead>
              <tr>
                <th class="text">ID</th>
                <th class="text">標題</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(guideline, index) in allGuideline" :key="guideline.guideId">
                <td class="text">{{ index + 1 }}</td>
                <td class="text">
                  <a
                    :href="`/guideline/detail/${guideline.guideId}`"
                    class="badge badge-square badge-outline-primary"
                  >
                    {{ guideline.guideTitle }}
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      <div class="bg-white py-4"></div>
    </div>
    <div class="action-text" v-if="[...adminRoles, ...userRoles].includes(userStore.roleName)">
      <RouterLink class="insert-text" :to="{name:'guideline-update-link'}">新增</RouterLink>
        </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import useUserStore from "@/stores/user";

const path = import.meta.env.VITE_API_URL;
const userStore = useUserStore();
const adminRoles = ["最高管理員", "次等管理員"]; // 管理員角色
const userRoles = ["行政主管", "人資主管", "業務主管", "技術主管"]; // 普通角色

const allGuideline = ref([])

onMounted(async () => {
  try {
    const response = await axios.get(`${path}/api/guidelines`)
    allGuideline.value = response.data
  } catch (error) {
    console.error('Error fetching guidelines:', error)
  }
})



</script>

<style>

.action-text {
    position: absolute;
    bottom: 20px; /* 距離底部 20px */
    right: 20px; /* 距離右邊 20px */
    display: flex;
    justify-content: space-between; /* 讓文字左右排列 */
    gap: 10px; /* 文字之間的間距 */
}

/* 編輯文字 */
.insert-text {
    color: #007bff; /* 編輯文字藍色 */
    text-decoration: underline; /* 底線 */
    cursor: pointer;
}


/* 懸停時顏色變化 */
.insert-text:hover {
    color: #0056b3; /* 編輯懸停藍色 */
}
</style>
