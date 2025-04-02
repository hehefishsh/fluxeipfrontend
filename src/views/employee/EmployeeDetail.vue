<template>
  <div class="card card-default">
    <div class="container">
      <div class="card-header">
        <h3>個人資料</h3>
        <img :src="employee.employeePhoto" alt="User Image" />
      </div>
      <div class="card-body">
        <table >
          <tbody>
          <tr>
            <td>ID</td>
            <td>{{ employee.employeeId }}</td>
          </tr>
          <tr>
            <td>姓名</td>
            <td>{{ employee.employeeName }}</td>
          </tr>
          <tr>
            <td>部門</td>
            <td>{{ employee.department }}</td>
          </tr>
          <tr>
            <td>職位</td>
            <td>{{ employee.position }}</td>
          </tr>
          <tr>
            <td>入職日</td>
            <td>{{ formatDate(employee.hireDate) }}</td>
          </tr>
          <tr>
            <td>性別</td>
            <td>{{ employee.gender }}</td>
          </tr>
          <tr>
            <td>生日</td>
            <td>{{ formatDate(employee.birthday) }}</td>
          </tr>
          <tr>
            <td>身分證</td>
            <td>{{ employee.identityCard }}</td>
          </tr>
          <tr>
            <td>信箱</td>
            <td>{{ employee.email }}</td>
          </tr>
          <tr>
            <td>電話</td>
            <td>{{ employee.phone }}</td>
          </tr>
          <tr>
            <td>住址</td>
            <td>{{ employee.address }}</td>
          </tr>
          <tr>
            <td>緊急連絡人</td>
            <td>{{ employee.emergencyContact }}</td>
          </tr>
          <tr>
            <td>緊急電話</td>
            <td>{{ employee.energencyPhone }}</td>
          </tr>
          
          <RouterLink class="btn btn-primary btn-pill" to="/employee/detail/update">
                      <span class="nav-text">修改個人資料</span>
            </RouterLink>
        </tbody>
        </table>
      </div>
      
      
    </div>
  </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import useUserStore from '@/stores/user';
  import axiosapi from "@/plugins/axios";
const user=useUserStore();
const employeeId=user.empId

const employee = ref({});

async function employeeFind(){
  try {
    const response = await axiosapi.get(`/employee/detail/${employeeId}`);
    employee.value = response.data;
  } catch (error) {
    console.error('獲取員工資料錯誤:', error);
  }
}

function formatDate(date) {
  const formattedDate = new Date(date);
  const year = formattedDate.getFullYear(); // 取得年份
  const month = (formattedDate.getMonth() + 1).toString().padStart(2, '0'); // 取得月份並補零
  const day = formattedDate.getDate().toString().padStart(2, '0'); // 取得日期並補零
  return `${year}/${month}/${day}`; // 返回格式化的日期字符串
    };

onMounted(function(){
  employeeFind()
});
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
}
th {
  background-color: #f4f4f4;
  text-align: left;
}
</style>