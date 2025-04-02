<template>
  <div class="container">
    <h1>{{ isEdit ? "編輯公告" : "新增公告" }}</h1>
    <form @submit.prevent="submit">
      <div class="form-group">
        <label for="title">標題：</label>
        <input type="text" class="form-control rounded-0" id="title" placeholder="請輸入標題"
          v-model="bulletin.title" required />
      </div>

      <div class="form-group">
        <label for="creater">創建者：</label>
        <input type="text" class="form-control rounded-0" id="creater" placeholder="請輸入創建者"
          v-model="bulletin.creater" required />
      </div>

      <div class="form-group">
        <label for="content">內容：</label>
        <textarea class="form-control rounded-0" id="content" placeholder="請輸入內容"
          v-model="bulletin.content" required></textarea>
      </div>

      <div class="form-group">
        <label for="status">狀態：</label>
        <select class="form-control rounded-0" id="status" v-model="bulletin.statusId" required>
          <option value="1">草稿</option>
          <option value="2">已發布</option>
        </select>
      </div>

      <button type="submit" class="btn btn-primary">提交</button>
      <button type="button" class="btn btn-secondary" @click="cancel">取消</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import Swal from "sweetalert2";
import axiosapi from "@/plugins/axios-login";

const router = useRouter();
const route = useRoute();

const isEdit = ref(false);

const bulletin = ref({
  title: "",
  creater: "",
  content: "",
  statusId: 1
});

async function fetchBulletin() {
  if (route.params.id) {
    isEdit.value = true;
    try {
      const response = await axiosapi.get(`/bulletin/${route.params.id}`);
      bulletin.value = response.data;
    } catch (error) {
      console.error("取得公告失敗:", error);
    }
  }
}

async function submit() {
  try {
    let response;
    if (isEdit.value) {
      response = await axiosapi.put(`/bulletin/update/${route.params.id}`, bulletin.value);
    } else {
      response = await axiosapi.post("/bulletin/create", bulletin.value);
    }

    // 檢查 response 是否成功
    if (response.status === 200 || response.status === 201) {
      Swal.fire({
        title: "提交成功",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        router.push("/bulletin"); // 提交成功後跳轉
      });
    } else {
      Swal.fire({
        title: response.data.message || "提交失敗",
        icon: "warning"
      });
    }
  } catch (error) {
    console.error("提交公告失敗:", error);
    Swal.fire({
      title: "提交失敗: " + (error.response?.data?.message || error.message),
      icon: "error"
    });
  }
}

function cancel() {
  router.push("/bulletin");
}

onMounted(() => {
  fetchBulletin();
});
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: auto;
  text-align: center;
}
form div {
  margin-bottom: 15px;
}
button {
  margin: 5px;
}
</style>
