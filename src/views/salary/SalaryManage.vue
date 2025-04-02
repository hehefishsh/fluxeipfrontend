<template>
    <div class="container">

  <div class="filter-container">
    <label class="form-label">選擇部門：</label>
      <select v-model="selectedDepartment" @change="(fetchEmployees(), filterSalaryData(),clearEmp())">
        <option value="" disabled>請選擇部門</option>
        <option v-for="dep in departments" :key="dep.departmentId" :value="dep">
          {{ dep.departmentName }}
        </option>
      </select>
      <label>員工：</label>
      <select v-model="selectedEmployee" @change="filterSalaryData">
        <option value="" disabled>請選擇員工</option>
        <option v-for="employee in employees" :key="employee.employeeId" :value="employee.employeeName">
          {{ employee.employeeName }}
        </option>
      </select>
<label>年份：</label>
  <select v-model="selectedYear" @change="filterSalaryData">
    <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
  </select>

  <label>月份：</label>
  <select v-model="selectedMonth" @change="filterSalaryData">
    <option v-for="month in availableMonths" :key="month" :value="month">{{ month }}</option>
  </select>

      
  <!-- 新增重設按鈕 -->
  <button @click="resetFilters" class="btn btn-reset">顯示全部</button>
  </div>
  <div v-if="filteredSalaryDetails.length > 0">
  <table class="salary-table">
    <thead>
      <tr>
        <th>年月</th>
        <th>部門</th>
        <th>姓名</th>
        <th>總工時</th>
        <th>加班時數</th>
        <th>遲到時數</th>
        <th>早退時數</th>
        <th>請假時數</th>
        <th>健保</th>
        <th>勞保</th>
        <th>獎金/津貼</th>
        <th>年終獎金</th>
        <th>實得薪資</th>
        <th>編輯</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="detail in filteredSalaryDetails" :key="detail.salaryDetailId">
        <td>{{ detail.yearMonth }}</td>
        <td>{{ detail.department }}</td>
        <td>{{ detail.employeeName }}</td>
        <td>{{ detail.monthlyRegularHours }}</td>
        <td>{{ detail.overtimeHours }}</td>
        <td>{{ detail.lateHours / 2 }}</td>
        <td>{{ detail.earlyLeaveHours / 2 }}</td>
        <td>
          <div v-if="detail.leaveDaysHoursByType">

              <div v-for="(hours, type) in detail.leaveDaysHoursByType" :key="type">
                  {{ type }}：{{ hours }} 小時
              </div>
          </div>
          <div v-else>0</div> 
        </td>          
        <td>{{ detail.healthInsurance }}</td>
        <td>{{ detail.laborInsurance }}</td>
        <td>
          <div v-if="detail.bonuses">
          <ul>
            <li v-for="bonus in detail.bonuses" :key="bonus.salaryBonusId">
              {{ bonus.bonusType }}: {{ bonus.amount }}
            </li>
          </ul>
      </div>
      <div v-else>0</div> 
        </td>
        <td>{{ detail.yearEnd }}</td>
        <td>{{ detail.earnedSalary }}</td>
        <td>
  <button @click="deleteSalaryDetail(detail.salaryDetailId)" class="btn btn-delete">
    刪除
  </button>
</td>
      </tr>
    </tbody>
  </table>
</div>
  <p v-else class="no-data-message">無資料符合條件</p>
    </div>
</template>

<script setup>
import { ref, onMounted,computed,watch } from 'vue';
import axios, { all } from 'axios';
import axiosapi from "@/plugins/axios";
import Swal from "sweetalert2";
const path = import.meta.env.VITE_API_URL;
import useUserStore from "@/stores/user";
const userStore=useUserStore()
const departments = ref([]); // 部門列表
const employees=ref([]); 
const selectedDepartment = ref(""); // 已選擇的部門
const salaryDetails = ref([]);
const selectedYear = ref(new Date().getFullYear()); // 預設當前年
const selectedMonth = ref(new Date().getMonth() + 1); // 預設當前月
const selectedEmployee = ref("");
const allEmps=ref([])

// 產生年份範圍（例如 2020~2030）
const availableYears = computed(() => {
const currentYear = new Date().getFullYear();
return Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
});

// 產生月份選單 (1~12)
const availableMonths = computed(() => [null, ...Array.from({ length: 12 }, (_, i) => i + 1)]);

onMounted(async () => {
  try {
    const res = await axiosapi.get(`/department/find`);
    departments.value = res.data;
  } catch (error) {
    console.error("取得部門資料失敗:", error);
  }
  try {
    const res = await axiosapi.get(`/api/salary/allEmp`);
    allEmps.value = res.data;
    employees.value = res.data;
  } catch (error) {
    console.error("取得員工資料失敗:", error);
  }
})

const fetchEmployees = async () => {
  if (!selectedDepartment.value) return;

  try {
    const res = await axios.get(
      `${path}/api/schedule/dep/${selectedDepartment.value.departmentId}`
    );
    employees.value = res.data; // 根據部門取得員工資料
  } catch (error) {
    console.error("取得員工資料失敗:", error);
  }
};


const fetchAllSalaryData  = async () => {
  try {
    const response = await axios.get(`${path}/api/salary/detail`);
    salaryDetails.value = response.data;
  } catch (error) {
    console.error('獲取薪資明細失敗', error);
  }
};

// 計算過濾後的資料
const filteredSalaryDetails = computed(() => {
let filteredData = salaryDetails.value;

if(selectedDepartment.value){
  filteredData=filteredData.filter(detail => detail.department===selectedDepartment.value.departmentName)

}
if(selectedEmployee.value){
  filteredData=filteredData.filter(detail => detail.employeeName===selectedEmployee.value)
}
// 篩選年份
if (selectedYear.value) {
  filteredData = filteredData.filter(detail => detail.yearMonth.startsWith(selectedYear.value));
}

// 篩選月份
if (selectedMonth.value) {
  const formattedMonth = selectedMonth.value.toString().padStart(2, "0");
  filteredData = filteredData.filter(detail => detail.yearMonth.endsWith(`-${formattedMonth}`));
}

return filteredData;
});

const clearEmp=()=>{
  selectedEmployee.value=null;
}
// 每當 selectedYear 或 selectedMonth 改變時，過濾資料
const filterSalaryData = () => {
// 觸發 Vue 重新計算過濾的資料
};
onMounted(() => {
// 預設顯示全部資料
selectedYear.value = 0; // 可選擇預設顯示的年份
selectedMonth.value = 0; // 預設不篩選月份
});

const resetFilters = () => {
// 重設年份和月份
selectedDepartment.value=null
selectedEmployee.value=null
selectedYear.value = null;
selectedMonth.value = null;
filterSalaryData()
};

const deleteSalaryDetail = async (id) => {
  const result = await Swal.fire({
    title: "確定要刪除嗎？",
    text: "刪除後無法恢復！",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "確定刪除",
    cancelButtonText: "取消"
  });

  if (result.isConfirmed) {
    try {
      const response = await axios.delete(`${path}/api/salary/detail/${id}`);
      if (response.data.success === "true") {
        // 從 salaryDetails 陣列移除
        salaryDetails.value = salaryDetails.value.filter(detail => detail.salaryDetailId !== id);
        
        Swal.fire("刪除成功", "該筆薪資明細已刪除", "success");
      } else {
        throw new Error("刪除失敗");
      }
    } catch (error) {
      Swal.fire("刪除失敗", "請稍後再試", "error");
    }
  }
};


onMounted(fetchAllSalaryData);
</script>

<style scoped>
/* 通用容器設置 */
.container {
  width: 100%; /* 容器寬度自適應 */
  max-width: 100%; /* 讓容器最大寬度為 100% */
margin: 20px auto;
padding: 20px;
background-color: #f9f9f9;
border-radius: 8px;
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 標題設置 */
h1 {
text-align: center;
color: #333;
margin-bottom: 20px;
}

/* 選擇框容器 */
.filter-container {
display: flex;
align-items: center; /* 讓項目垂直對齊 */
justify-content: flex-start;
gap: 10px; /* 設定間距，讓各個項目之間不會太擁擠 */
}

/* 年份和月份選擇框 */
.filter-container select {
padding: 5px 10px; /* 調整選擇框的內邊距 */
font-size: 14px; /* 調整字體大小 */
border-radius: 4px; /* 調整邊角圓度 */
border: 1px solid #ddd; /* 邊框顏色 */
width: 120px; /* 設定選擇框的寬度 */
margin: 0; /* 去除選擇框的間距，緊貼文字 */
}

/* 按鈕樣式 */
.btn {
padding: 10px 20px;
border: none;
border-radius: 5px;
background-color: #4CAF50;
color: white;
cursor: pointer;
transition: background-color 0.3s;
margin-left: 10px; /* 按鈕和選擇框之間的間距 */
}

.btn:hover {
background-color: #45a049;
}

/* 重設按鈕樣式 */
.btn-reset {
background-color: #2705e7;
}

.btn-reset:hover {
background-color: #4f32f1;
}

/* 標籤文字樣式 */
.filter-container label {
font-size: 14px; /* 標籤文字大小 */
margin-right: 10px; /* 增加標籤和選擇框的間距 */
}

/* 表格設置 */
.salary-table {
width: 100%;
border-collapse: collapse;
margin-top: 20px;
table-layout: auto; /* 讓欄位隨內容調整寬度 */
}

.salary-table th,
.salary-table td {
padding: 12px;
text-align: center;
border: 1px solid #ddd;
white-space: nowrap; /* 防止文字換行 */
}

.salary-table th {
background-color: #4CAF50;
color: white;
}

.salary-table tr:nth-child(even) {
background-color: #f2f2f2;
}

.salary-table tr:hover {
background-color: #ddd;
}

.btn-delete {
  background-color: #f44336;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-delete:hover {
  background-color: #d32f2f;
}

/* 無資料時顯示消息 */
.no-data-message {
text-align: center;
color: #f44336;
font-size: 18px;
}
</style>
