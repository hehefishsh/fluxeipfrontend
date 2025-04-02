<template>
    <div class="card card-default" id="page-views">
      <div class="card-header">
        <h2>班別一覽</h2>
      </div>
      <div class="card-body py-0" data-simplebar>
        <div v-if="allShiftType && allShiftType.length">
          <table class="table table-borderless table-thead-border">
            <thead>
              <tr>
                <th class="text">班別名稱</th>
                <th class="text">班別種類</th>
                <th class="text">部門</th>
                <th class="text">上班時間</th>
                <th class="text">下班時間</th>
                <th class="text">編輯</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="shiftType in allShiftType" :key="shiftType.shiftTypeId">
                <td class="text">{{ shiftType.shiftName }}</td>
                <td class="text">{{ shiftType.shiftCategory }}</td>
                <td class="text">{{ shiftType.departmentName }}</td>
                <td class="text">{{ shiftType.startTime }}</td>
                <td class="text">{{ shiftType.finishTime }}</td>
                <td v-show="department.departmentName==shiftType.departmentName">
                    <!-- 編輯按鈕 -->
                <RouterLink :to="`/schedule/shiftType/edit/${shiftType.shiftTypeId}`" class="btn btn-primary btn-sm">編輯</RouterLink>
                <!-- 刪除按鈕 -->
                <button class="btn btn-danger btn-sm ms-2" @click="deleteShiftType(shiftType.shiftTypeId)">
                  刪除
                </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      <div class="bg-white py-4"></div>
    </div>
    <div>
      <RouterLink :to="{name:'schedule-shiftType-edit-link'}" class="btn btn-secondary btn-sm insertBtn">新增班別類型</RouterLink>
        </div>
  </div>
</template>
    
<script setup>
import { ref, onMounted,watch } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
const path = import.meta.env.VITE_API_URL;
import useUserStore from "@/stores/user";
const userStore=useUserStore()
const departments = ref([]); // 部門列表
const department = ref(""); // 部門列表
const contacts=ref([])


const allShiftType = ref([])

onMounted(async () => {
  try {
    const response = await axios.get(`${path}/api/shiftType`)
    allShiftType.value = response.data
  } catch (error) {
    console.error('Error fetching ShiftType:', error)
  }
})


async function deleteShiftType(id){
    if(id){
        const result=await Swal.fire({
            title:"確定?",
            icon:"question",
            showCancelButton:true,
        });
        if(result.isConfirmed){
            try{
                const response=await axios.delete(`${path}/api/shiftType/${id}`);
                console.log(response)
                if(response.data.success){
                    await Swal.fire({
                        title:response.data.message,
                        icon:"success"
                    });
                    // router.push({ name: "schedule-shiftType-link" });
                    // router.replace({ name: "schedule-shiftType-link" });
                    window.location.reload();
                }else{
                    Swal.fire({
                        title:response.data.message,
                        icon:"warning"
                    })
                }
            }catch(error){
                console.log("error",error);
                Swal.fire({
                    title:"失敗"+error.message,
                    icon:"error"
                })
            }

        }
    }

}


onMounted(async () => {
  try {
    const res = await axios.get(`${path}/department/find`);
    departments.value = res.data;
  } catch (error) {
    console.error("取得部門資料失敗:", error);
  }

    
  try {
    const res = await axios.get(`${path}/api/contacts`);
    contacts.value = res.data; // 取得班別資料    
  } catch (error) {
    console.error("取得員工資料失敗:", error);
  }
})


watch(contacts, (newContacts) => {
const contact = newContacts.find((emp) => emp.empId === userStore.empId);
department.value = departments.value.find(dep => dep.departmentName === contact.department);
})
</script>
    
<style scoped>
    .insertBtn{
        position: absolute;
    bottom: 20px; /* 距離底部 20px */
    right: 20px; /* 距離右邊 20px */
    display: flex;
    justify-content: space-between; /* 讓文字左右排列 */
    gap: 10px; /* 文字之間的間距 */
    }

    .table-thead-border tr td a {
        color: white;
    }
</style>