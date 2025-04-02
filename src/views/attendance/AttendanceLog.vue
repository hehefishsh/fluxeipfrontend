<template>
  <!-- 假設 header 與 leftside 已由全域組件或 App 組件處理 -->
  <div>
    <!-- 當日考勤區塊 -->
    <div class="card card-default" id="page-views">
      <div class="card-header">
        <h2>當日考勤</h2>
        <RouterLink
          class="btn btn-outline-primary btn-pill"
          to="/attendance/clock"
          >回到打卡頁面</RouterLink
        >
      </div>
      <div class="card-body py-0" data-simplebar>
        <!-- 顯示錯誤信息 -->
        <div v-show="error" class="alert alert-danger" role="alert">
          {{ error }}
        </div>
        <div v-show="atError" class="alert alert-danger" role="alert">
          {{ atError }}
        </div>
        <div v-if="todayAttendance">
          <!-- 當天考勤基本資料 -->
          <h4>
            <span class="badge badge-square badge-outline-primary"
              >今日考勤基本資料</span
            >
          </h4>
          <table class="table table-borderless table-thead-border">
            <thead>
              <tr>
                <th class="text">總工時</th>
                <th class="text">正常工時</th>
                <th class="text">加班工時</th>
                <th class="text">外勤工時</th>
                <th class="text">是否有異常</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text">{{ todayAttendance.totalHours }}</td>
                <td class="text">{{ todayAttendance.regularHours }}</td>
                <td class="text">{{ todayAttendance.overtimeHours }}</td>
                <td class="text">{{ todayAttendance.fieldWorkHours }}</td>
                <td class="text">
                  {{ todayAttendance.hasViolation ? "是" : "否" }}
                </td>
              </tr>
            </tbody>
          </table>
          <!-- 顯示打卡記錄 -->
          <h4>
            <span class="badge badge-square badge-outline-primary"
              >打卡記錄</span
            >
          </h4>
          <table class="table table-borderless table-thead-border">
            <thead>
              <tr>
                <th class="text">打卡時間</th>
                <th class="text">打卡類型</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(log, index) in todayAttendance.attendanceLogs"
                :key="index"
              >
                <td class="text">{{ formatDate(log.clockTime) }}</td>
                <td class="text">{{ log.clockType }}</td>
              </tr>
            </tbody>
          </table>
          <!-- 顯示異常記錄 -->
          <h4>
            <span class="badge badge-square badge-outline-primary"
              >異常記錄</span
            >
          </h4>
          <table class="table table-borderless table-thead-border">
            <thead>
              <tr>
                <th class="text">異常類型</th>
                <th class="text">異常分鐘數</th>
                <th class="text">異常時間</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(violation, index) in todayAttendance.attendanceViolations"
                :key="index"
              >
                <td class="text">{{ violation.violationType}}</td>
                <td class="text">{{ violation.violationMinutes }}</td>
                <td class="text">{{ formatDate(violation.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="bg-white py-4"></div>
    </div>

    <!-- 指定日期查詢 -->
    <div class="card card-default" id="page-views">
      <div class="card-header">
        <h2>指定日期查詢考勤</h2>
        <RouterLink
          class="btn btn-outline-primary btn-pill"
          to="/attendance/clock"
          >回到打卡頁面</RouterLink
        >
      </div>
      <div class="card-body py-0" data-simplebar>
        <form @submit.prevent="fetchAttendance">
          <label for="date">請輸入日期 (YYYY-MM-DD)： </label>
          <input
            class="custom-select my-1 mr-sm-2 w-auto"
            type="date"
            id="date"
            name="date"
            v-model="queryDate"
          />
          <button
            type="submit"
            class="ladda-button btn btn-primary btn-ladda"
            data-style="expand-left"
          >
            <span class="ladda-label">查詢</span>
            <span class="ladda-spinner"></span>
          </button>
        </form>
        <br />
        <!-- 顯示錯誤信息 -->
        <div v-show="aError" class="alert alert-danger" role="alert">
          {{ aError }}
        </div>
        <div v-if="attendance">
          <!-- 當天考勤基本資料 -->
          <h4>
            <span class="badge badge-square badge-outline-primary"
              >指定日期考勤資料</span
            >
          </h4>
          <table class="table table-borderless table-thead-border">
            <thead>
              <tr>
                <th class="text">總工時</th>
                <th class="text">正常工時</th>
                <th class="text">加班工時</th>
                <th class="text">外勤工時</th>
                <th class="text">是否有異常</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text">{{ attendance.totalHours }}</td>
                <td class="text">{{ attendance.regularHours }}</td>
                <td class="text">{{ attendance.overtimeHours }}</td>
                <td class="text">{{ attendance.fieldWorkHours }}</td>
                <td class="text">
                  {{ attendance.hasViolation ? "是" : "否" }}
                </td>
              </tr>
            </tbody>
          </table>
          <!-- 顯示打卡記錄 -->
          <h4>
            <span class="badge badge-square badge-outline-primary"
              >打卡記錄</span
            >
          </h4>
          <table class="table table-borderless table-thead-border">
            <thead>
              <tr>
                <th class="text">打卡時間</th>
                <th class="text">打卡類型</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(log, index) in attendance.attendanceLogs"
                :key="index"
              >
                <td class="text">{{ formatDate(log.clockTime) }}</td>
                <td class="text">{{ log.clockType }}</td>
              </tr>
            </tbody>
          </table>
          <!-- 顯示異常記錄 -->
          <h4>
            <span class="badge badge-square badge-outline-primary"
              >異常記錄</span
            >
          </h4>
          <table class="table table-borderless table-thead-border">
            <thead>
              <tr>
                <th class="text">異常類型</th>
                <th class="text">異常分鐘數</th>
                <th class="text">異常時間</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(violation, index) in attendance.attendanceViolations"
                :key="index"
              >
                <td class="text">{{ violation.violationType }}</td>
                <td class="text">{{ violation.violationMinutes }}</td>
                <td class="text">{{ formatDate(violation.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="bg-white py-4"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axiosapi from "@/plugins/axios";

const todayAttendance = ref(null);
const attendance = ref(null);
const error = ref("");
const atError = ref("");
const aError = ref("");
const queryDate = ref("");

// 當元件掛載時獲取當日考勤資料
onMounted(async () => {
  try {
    const response = await axiosapi.get("/api/attendancelogs/today");
    todayAttendance.value = response.data;
  } catch (err) {
    if (err.response && err.response.status === 400) {
      error.value = err.response.data; 
    } else {
      error.value = "無法獲取當日考勤記錄";
    }
  }
});

// 查詢指定日期考勤
const fetchAttendance = async () => {
  if (!queryDate.value) {
    aError.value = "請輸入有效的日期";
    return;
  }

  try {
    const response = await axiosapi.get(`/api/attendancelogs/history?date=${queryDate.value}`);
    attendance.value = response.data;
  } catch (err) {
    if (err.response && err.response.status === 400) {
      aError.value = err.response.data; 
    } else {
      aError.value = "無法獲取指定日期考勤記錄";
    }
  }
};

// 簡單日期格式化函式，依需求調整格式
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "long",
  };
  return new Intl.DateTimeFormat("zh-TW", options).format(date);
};
</script>

<!-- 保留你的樣式 -->
<style></style>
