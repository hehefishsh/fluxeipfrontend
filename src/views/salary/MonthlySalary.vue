<template>
      <div class="container">

  <form @submit.prevent="submitForm">
    <div>
        <label class="form-label">選擇部門：</label>
      <select v-model="selectedDepartment" @change="fetchEmployees">
        <option value="">請選擇部門</option>
        <option v-for="dep in departments" :key="dep.departmentId" :value="dep.departmentId">
          {{ dep.departmentName }}
        </option>
      </select>
      <label>員工：</label>
      <select v-model="selectedEmployee" @change="fetchEmployeeSalary">
        <option v-for="employee in employees" :key="employee.employeeId" :value="employee.employeeId">
          {{ employee.employeeName }}
        </option>
      </select>
    </div>
    
    <div>
      <label>日期：</label>
      <input type="month" v-model="selectedMonth" @change="fetchWorkData" required />
    </div>

    <div>
      <label>總工時：(小時)</label>
      <input type="number" v-model="totalHours" required disabled/>
    </div>

    <div>
      <label>加班時數：(小時)</label>
      <input type="number" v-model="overtimeHours" required disabled/>
    </div>

    <div>
      <label>遲到時數：(小時)</label>
      <input type="number" v-model="displayLateHours" required disabled/>
    </div>

    <div>
      <label>早退時數：(小時)</label>
      <input type="number" v-model="displayEarlyLeaveHours" required disabled/>
    </div>

    <div>
      <label>請假時數：(小時)</label>
      <input type="number" v-model="leaveHours" required disabled/>
    </div>

    <div>
      <label>勞保：</label>
      <input type="number" v-model="laborInsurance" required disabled/>
    </div>

    <div>
      <label>健保：</label>
      <input type="number" v-model="healthInsurance" required disabled/>
    </div>
    
    <div>
      <label>獎金/津貼：</label>
      <div v-for="(bonus, index) in selectedBonuses" :key="index">
        <select v-model="selectedBonuses[index]" @change="updateAvailableBonuses">
          <option v-for="bonusOption in availableBonusOptions(index)" 
                  :key="bonusOption.salaryBonusId" 
                  :value="bonusOption">
            {{ bonusOption.bonusType }}:{{ bonusOption.amount }}元
          </option>
        </select>
        <button type="button" @click="(removeBonus(index),fetchEarnedSalary())">移除</button>
      </div>
      <button type="button" @click="addBonus" class="px-4 py-2 border border-black text-sm text-gray-700 rounded-md hover:bg-gray-100 transition">新增獎金/津貼</button>
    </div>

    <!-- 年終獎金的輸入框只顯示一次，v-model 為 yearEndBonus -->
    <div v-if="selectedBonuses.some(bonus => bonus?.bonusType === '年終獎金')">
      <label>年終獎金：</label>
      <input type="number" v-model="yearEndBonus" placeholder="請輸入年終獎金" @input="updateAvailableBonuses"/>
    </div>
    <div>
      <label>實得薪資：</label>
      <input type="number" v-model="earnedSalary" required disabled/>
    </div>
    <button type="submit">提交</button>
  </form>
      </div>
</template>
    
<script setup>
import { ref, onMounted,computed } from 'vue';
import axios from 'axios';
const path = import.meta.env.VITE_API_URL;
import Swal from 'sweetalert2';

const employees = ref([]);
const selectedEmployee = ref(null);
const selectedMonth = ref("");
const totalHours = ref(0);
const overtimeHours = ref(0);
const lateHours = ref(0);
const earlyLeaveHours = ref(0);
const leaveHours = ref(0);
const laborInsurance = ref(0);
const healthInsurance = ref(0);
const bonusOptions = ref([]);
const selectedBonuses = ref([]);
const yearEndBonus = ref(0);  // 年終獎金的變數，預設為 0
const earnedSalary=ref(0)
const departments = ref([]); // 部門列表
const selectedDepartment = ref(""); // 已選擇的部門
const employeeSalaryData = ref(null); // 存儲員工薪資數據
const workData = ref({
  totalWorkHours: 0,
  leaveDays: 0,
  lateEarlyHours: { lateHour: 0, earlyLeaveHour: 0 },
  overtimeHours:0,
  earnedSalary:0
});

// 顯示的數值為後端數據除以 2
const displayLateHours = computed(() => lateHours.value / 2);
const displayEarlyLeaveHours = computed(() => earlyLeaveHours.value / 2);

const fetchBonusOptions = async () => {
  try {
    const response = await axios.get(`${path}/api/salary/bonus`);
    bonusOptions.value = response.data;
    // 添加年終獎金選項
    bonusOptions.value = [...response.data, { bonusType: '年終獎金', salaryBonusId: 'year-end-bonus' }];
  } catch (error) {
    console.error("無法獲取獎金/津貼選項", error);
  }
};

onMounted(async () => {
  try {
    const res = await axios.get(`${path}/department/find`);
    departments.value = res.data;
  } catch (error) {
    console.error("取得部門資料失敗:", error);
  }
})

const fetchEmployees = async () => {
  if (!selectedDepartment.value) return;

  try {
    const res = await axios.get(
      `${path}/api/schedule/dep/${selectedDepartment.value}`
    );
    employees.value = res.data; // 根據部門取得員工資料
  } catch (error) {
    console.error("取得員工資料失敗:", error);
  }
};

const fetchEmployeeSalary = async () => {
  if (!selectedEmployee.value) return;
  try {
    const response = await axios.get(`${path}/api/salary/${selectedEmployee.value}`);
    employeeSalaryData.value = response.data; // 存儲返回的數據
    const salaryToUse = response.data.monthlySalary === 0 
      ? response.data.hourlyWage * 240 // 若月薪為 0，使用時薪 * 240
      : response.data.monthlySalary; // 否則使用月薪
    fetchInsurance(salaryToUse); // 根據選擇的薪資請求勞健保資料
    fetchWorkData();
    // 根據需要處理返回的數據
  } catch (error) {
    console.error("獲取員工薪資數據失敗", error);
  }
};

// 獲取勞健保資料
const fetchInsurance = async (salary) => {
  try {
    const response = await axios.get(`${path}/api/salary/insurance?salary=${salary}`);
    laborInsurance.value = response.data.laborInsurance; // 假設後端返回的是勞保金額
    healthInsurance.value = response.data.healthInsurance; // 假設後端返回的是健保金額
  } catch (error) {
    console.error("獲取勞健保資料失敗", error);
  }
};

const fetchWorkData = async () => {
  if (!selectedEmployee.value || !selectedMonth.value) return;
  
  try {
    const yearMonth = selectedMonth.value;
    const empId = selectedEmployee.value;

    // 呼叫總工時 API
    const totalWorkHoursResponse = await axios.get(`${path}/api/salary/monthlyWorkHours?yearMonth=${yearMonth}&empId=${empId}`);
    workData.value.totalWorkHours = totalWorkHoursResponse.data;

    // 呼叫請假時數 API
    const leaveDaysResponse = await axios.get(`${path}/api/salary/leaveDays?yearMonth=${yearMonth}&empId=${empId}`);
    workData.value.leaveDays = leaveDaysResponse.data;

    // 呼叫遲到早退時數 API
    const lateEarlyResponse = await axios.get(`${path}/api/salary/lateEarly?yearMonth=${yearMonth}&empId=${empId}`);
    // 假設回傳的 `lateEarlyResponse.data` 是一個 map 包含 `lateHour` 和 `earlyLeaveHour`
    workData.value.lateEarlyHours.lateHour = lateEarlyResponse.data.lateHour;
    workData.value.lateEarlyHours.earlyLeaveHour = lateEarlyResponse.data.earlyLeaveHour;
    // 呼叫加班減班時數 API
    const overtimeResponse=await axios.get(`${path}/api/salary/overtimeMinus?yearMonth=${yearMonth}&empId=${empId}`);
    workData.value.overtimeHours=overtimeResponse.data.overtimeHours;

    // 將結果顯示在表單中
    totalHours.value = workData.value.totalWorkHours;
    leaveHours.value = workData.value.leaveDays;
    lateHours.value = workData.value.lateEarlyHours.lateHour;
    earlyLeaveHours.value = workData.value.lateEarlyHours.earlyLeaveHour;
    overtimeHours.value=workData.value.overtimeHours;
    fetchEarnedSalary();
  } catch (error) {
    console.error("獲取工作資料失敗", error);
  }
};
const updateAvailableBonuses=async()=>{
  fetchEarnedSalary();
}
const fetchEarnedSalary=async()=>{
  const bonuses = selectedBonuses.value
    .filter(bonus => bonus?.salaryBonusId !== 'year-end-bonus')  // 假設年終獎金的 ID 是 'yearEnd'
    .map(bonus => bonus?.salaryBonusId);
  try{
    const payload = {
    employeeId: selectedEmployee.value,
    yearMonth: selectedMonth.value,
    monthlyRegularHours: totalHours.value,  // 薪資中的總工時
    overtimeHours: overtimeHours.value,
    lateHours: lateHours.value,
    earlyLeaveHours: earlyLeaveHours.value,
    leaveDays: leaveHours.value,  // 請假時數
    healthInsurance: healthInsurance.value,
    laborInsurance: laborInsurance.value,
    bonuses: bonuses ,  // 獎金ID列表
    yearEnd: yearEndBonus.value  // 年終獎金
  };
    // 呼叫加班減班時數 API
    const earnedSalaryResponse=await axios.post(`${path}/api/salary/earnedSalary`,payload);
    workData.value.earnedSalary=earnedSalaryResponse.data;
    earnedSalary.value=workData.value.earnedSalary
    console.log(earnedSalaryResponse.data)
  }
  catch (error) {
    console.error("獲取earnedSalary失敗", error);
  }
}
const availableBonusOptions = (index) => {
  return bonusOptions.value.filter(option => 
    !selectedBonuses.value.some((b, i) => b?.salaryBonusId === option.salaryBonusId && i !== index)
  );
};

const addBonus = () => {
  if (bonusOptions.value.length > selectedBonuses.value.length) {
    selectedBonuses.value.push(null);
  }
};

const removeBonus = (index) => {
  selectedBonuses.value.splice(index, 1);
};

const submitForm = async () => {
      // 檢查是否有年終獎金，並將非年終獎金的 ID 收集進 bonuses 陣列

    const bonuses = selectedBonuses.value
    .filter(bonus => bonus?.salaryBonusId !== 'year-end-bonus')  // 假設年終獎金的 ID 是 'yearEnd'
    .map(bonus => bonus?.salaryBonusId);

  const payload = {
    employeeId: selectedEmployee.value,
    yearMonth: selectedMonth.value,
    monthlyRegularHours: totalHours.value,  // 薪資中的總工時
    overtimeHours: overtimeHours.value,
    lateHours: lateHours.value,
    earlyLeaveHours: earlyLeaveHours.value,
    leaveDays: leaveHours.value,  // 請假時數
    healthInsurance: healthInsurance.value,
    laborInsurance: laborInsurance.value,
    bonuses: bonuses ,  // 獎金ID列表
    yearEnd: yearEndBonus.value  // 年終獎金
  };
  try {
    const response = await axios.post(`${path}/api/salary/detail`, payload);
await Swal.fire({
    title: response.data.message,
    icon: "success",
    confirmButtonText: "確定",
  });
        location.reload(); // 重新整理頁面
  } catch (error) {
    console.error("提交失敗：", error);
    Swal.fire({
    title: error.response.data,
    icon: "error",
  });
}
};

onMounted(fetchBonusOptions);
</script>
    
<style scoped>
    /* 通用容器設置 */
.container {
  width: fit-content; /* 容器寬度自適應 */
margin: 20px auto;
padding: 20px;
background-color: #f9f9f9;
border-radius: 8px;
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
text-align: center;
}

</style>