<template>
    <div class="bulletin-detail" v-if="bulletin.title">
      <h1>{{ bulletin.title }}</h1>
      <p>創建者：{{ bulletin.creater }}</p>
      <p>內容：</p>
      <div class="content">{{ bulletin.content }}</div>
      <p>狀態： {{ bulletin.statusId === 1 ? "草稿" : "已發布" }}</p>
      <button @click="goBack" class="btn">返回</button>
    </div>
    <!-- 加上未加載數據時的占位提示 -->
    <div v-else>
      <p>正在加載公告詳情...</p>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import axiosapi from "@/plugins/axios-login";
  
  export default {
    setup() {
      const route = useRoute();
      const router = useRouter();
      const bulletin = ref({});
  
      const fetchBulletinDetail = async () => {
        try {
          // 修正這行：使用反引號 ``
          const response = await axiosapi.get(`/bulletin/${route.params.id}`);
          bulletin.value = response.data;
        } catch (error) {
          console.error("獲取公告詳情失敗:", error);
        }
      };
  
      const goBack = () => {
        router.push("/bulletin");
      };
  
      onMounted(fetchBulletinDetail);
  
      return { bulletin, goBack };
    },
  };
  </script>
  
  <style scoped>
  .bulletin-detail {
  max-width: 100%;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
}

.bulletin-detail h1 {
  margin-bottom: 5px; /* 減少標題下方的間距 */
}

.bulletin-detail p {
  margin: 5px 0; /* 控制標題、創建者、狀態之間的間距 */
}

.content {
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  max-height: 600px;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-top: 5px; /* 控制內容與上方的間距 */
  display: flex;
  align-items: flex-start; /* 讓內容靠上對齊 */
  min-height: 100px; /* 確保不會因為內容少而變得太小 */
}

.btn {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

.btn:hover {
  background-color: #0056b3;
}
  </style>