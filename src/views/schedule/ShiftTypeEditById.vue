<template>
        <div class="container">
           <div class="card shadow-lg p-4">
             <h2 class="text-center mb-4">修改班別</h2>
       
             <form @submit.prevent="updateShiftType">
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
                   <option value="">選擇部門</option>
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
                 <button type="submit" class="btn btn-primary px-4">修改</button>
                 <button type="button" class="btn btn-secondary px-4" @click="goBack">取消</button>
               </div>
             </form>
           </div>
         </div>
       </template>
           
<script setup>
import axios from "axios";
import { ref,onMounted } from "vue";
import { useRouter,useRoute } from "vue-router";
import Swal from "sweetalert2";

const path = import.meta.env.VITE_API_URL;

       
const router = useRouter(); // 用來跳轉頁面
const route = useRoute();

const shiftName=ref("")
const shiftCategory=ref("")
const startTime=ref("")
const finishTime=ref("")
const departmentName = ref("");
const departments = ref([]);


onMounted(async () => {
        try {
                const response = await axios.get(`${path}/department/find`);
               departments.value = response.data || [];  // 假設回應是部門資料
        } catch (error) {
        console.error("取得部門資料失敗:", error);
        }
        });

onMounted(async () => {
  const shiftTypeId = route.params.id;
  try {
    // 根據 id 載入班別資料
    const response = await axios.get(`${path}/api/shiftType/${shiftTypeId}`);
    const shiftType = response.data;
    shiftName.value = shiftType.shiftName;
    shiftCategory.value = shiftType.shiftCategory;
    startTime.value = shiftType.startTime;
    finishTime.value = shiftType.finishTime;
    departmentName.value = shiftType.departmentName;

    // 載入部門列表
    const deptResponse = await axios.get(`${path}/department/find`);
    departments.value = deptResponse.data || [];
  } catch (error) {
    console.error("班別資料加載失敗:", error);
  }
});


const updateShiftType = async () => {
        const shiftTypeId = route.params.id;

        try {
        const shiftData = {
        shiftName: shiftName.value,
        shiftCategory: shiftCategory.value,
        startTime: startTime.value,
        finishTime: finishTime.value,
        departmentName: departmentName.value,
        };
       
        await axios.put(`${path}/api/shiftType/${shiftTypeId}`, shiftData);
        Swal.fire({
                title: "更新成功！",
                text: "班別已成功更新！",
                icon: "success",
                confirmButtonText: "確定",
        }).then(() => {
        router.push("/schedule/shiftType"); // 成功後跳轉回班別列表
        });
        } catch (error) {
        console.error("班別更新失敗:", error);
        Swal.fire({
                title: "錯誤",
                text: "班別更新失敗，請稍後再試。",
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