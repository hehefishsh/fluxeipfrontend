<template>
 <div class="container">
    <div class="card shadow-lg p-4">
      <h2 class="text-center mb-4">新增班別</h2>

      <form @submit.prevent="saveShiftType">
        <div class="mb-3">
          <label class="form-label">班別名稱：</label>
          <input type="text" v-model="shiftName" class="form-control" placeholder="輸入班別名稱" required />
        </div>

        <div class="mb-3">
          <label class="form-label">班別種類：</label>
          <input type="text" v-model="shiftCategory" class="form-control" placeholder="輸入班別種類" required />
        </div>

        <div class="mb-3">
          <label class="form-label">部門：</label>
          <select class="form-select" v-model="departmentName" disabled>
            <option v-for="dep in departments" :key="dep.departmentId" :value="dep.departmentName">
              {{ dep.departmentName }}
            </option>
          </select>
        </div>

        <div class="row">
          <div class="col-md-6">
            <label class="form-label">上班時間：</label>
            <input type="time" v-model="startTime" class="form-control" required />
          </div>
          <div class="col-md-6">
            <label class="form-label">下班時間：</label>
            <input type="time" v-model="finishTime" class="form-control" required />
          </div>
        </div>

        <div class="d-flex justify-content-between mt-4">
          <button type="submit" class="btn btn-primary px-4">新增</button>
          <button type="button" class="btn btn-secondary px-4" @click="goBack">取消</button>
        </div>
      </form>
    </div>
  </div>
</template>
    
<script setup>
import axios from "axios";
import { ref,onMounted,watch } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";

const router = useRouter(); // 用來跳轉頁面

const shiftName=ref("")
const shiftCategory=ref("")
const startTime=ref("")
const finishTime=ref("")
const departmentName = ref("");
const departments = ref([]);
const contacts = ref([]);
const path = import.meta.env.VITE_API_URL;
import useUserStore from "@/stores/user";
const userStore=useUserStore()

onMounted(async () => {
    try {
        const response = await axios.get(`${path}/department/find`);
        departments.value = response.data || [];  // 假設回應是部門資料
    } catch (error) {
    console.error("取得部門資料失敗:", error);
    }
    try {
    const res = await axios.get(`${path}/api/contacts`);
    contacts.value = res.data; // 取得班別資料    
  } catch (error) {
    console.error("取得員工資料失敗:", error);
  }
});
watch(contacts, (newContacts) => {
const contact = newContacts.find((emp) => emp.empId === userStore.empId);
const department= departments.value.find(dep => dep.departmentName === contact.department);
departmentName.value=department.departmentName
});
const saveShiftType = async () => {
  try {
    const shiftData = {
      shiftName: shiftName.value,
      shiftCategory: shiftCategory.value,
      startTime: startTime.value,
      finishTime: finishTime.value,
      departmentName: departmentName.value,
    };

    await axios.post(`${path}/api/shiftType`, shiftData);
    Swal.fire({
      title: "新增成功！",
      text: "班別已成功新增！",
      icon: "success",
      confirmButtonText: "確定",
    }).then(() => {
      router.push("/schedule/shiftType"); // 成功後跳轉回班別列表
    });
  } catch (error) {
    console.error("班別新增失敗:", error);
    Swal.fire({
      title: "錯誤",
      text: "班別新增失敗，請稍後再試。",
      icon: "error",
      confirmButtonText: "確定",
    });
  }
};
const goBack = () => {
  router.push("/schedule/shiftType");
};
</script>
    
<style scoped>
    .container {
  max-width: 500px;
  margin-top: 50px;
}
.card {
  border-radius: 10px;
  background: #ffffff;
}
h2 {
  color: #333;
}
.btn {
  border-radius: 5px;
}
</style>