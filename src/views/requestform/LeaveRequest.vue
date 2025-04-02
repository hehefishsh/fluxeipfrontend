<template>
  <div class="card card-default" id="leave-request">
    <div class="card-header">
      <h2>請假申請</h2>
      <button type="button" @click="fillDemoData" class="badge badge-pill badge-info">Demo</button>
    </div>
    <div class="card-body py-0" data-simplebar>
      <form @submit.prevent="submitLeaveRequest" class="form-group">
        <!-- 申請人 -->
        <div class="form-group">
          <label for="employee">申請人</label>
          <input type="text" id="employee" class="form-control rounded-0" v-model="currentEmployeeName" readonly />
        </div>

        <!-- 請假類型 -->
        <div class="form-group">
          <label for="leaveType">
            <font color="red">*</font>請假類型
          </label>
          <select id="leaveType" class="form-control rounded-0" v-model="leaveRequest.leaveTypeId" required>
            <option v-for="type in leaveTypes" :key="type.id" :value="type.id">
              {{ type.typeName }}
            </option>
          </select>
        </div>

        <!-- 開始時間 -->
        <div class="form-group">
          <label for="startTime">
            <font color="red">*</font>開始時間
          </label>
          <input type="datetime-local" id="startTime" class="form-control rounded-0" v-model="leaveRequest.startTime"
            required @change="validateDateRange" />
        </div>

        <!-- 結束時間 -->
        <div class="form-group">
          <label for="endTime">
            <font color="red">*</font>結束時間
          </label>
          <input type="datetime-local" id="endTime" class="form-control rounded-0" v-model="leaveRequest.endTime"
            required @change="validateDateRange" />
        </div>

        <!-- 請假時數 -->
        <div class="form-group">
          <label for="leaveHours">
            <font color="red">*</font>請假時數
          </label>
          <div class="input-group">
            <input type="number" id="leaveHours" class="form-control rounded-0" v-model="leaveRequest.leaveHours"
              placeholder="小時" />
            <span class="input-group-text">小時</span>
          </div>
        </div>

        <!-- 請假原因 -->
        <div class="form-group">
          <label for="reason">
            <font color="red">*</font>請假原因
          </label>
          <textarea id="reason" class="form-control rounded-0" v-model="leaveRequest.reason" required
            maxlength="200"></textarea>
          <small class="form-text text-muted">最多可輸入 200 字。</small>
        </div>

        <!-- 附件 -->
        <div class="form-group">
          <label for="attachments">附件</label>
          <input type="file" id="attachments" class="form-control rounded-0" @change="handleFileUpload" />
        </div>

        <!-- 按鈕區 -->
        <div class="form-footer">
          <button type="submit" class="mr-1 btn btn-secondary btn-pill">提交</button>
          <button type="button" @click="goBack" class="mr-1 btn btn-light btn-pill">
            取消
          </button>

        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from "vue";
import axiosapi from "@/plugins/axios.js";
import useUserStore from "@/stores/user.js";

// 取得使用者資訊
const userStore = useUserStore();
const currentEmployeeName = computed(() => userStore.empName);
const currentEmployeeId = computed(() => userStore.empId); // 假設有 empId

// 表單資料
const leaveRequest = reactive({
  employee_id: currentEmployeeId.value, // 自動填入使用者 ID
  leaveTypeId: null,
  startTime: "",
  endTime: "",
  leaveHours: 0,
  reason: "",
  attachments: null,
});

// 取得請假類型
const leaveTypes = ref([]);

onMounted(async () => {
  try {
    // 取得請假類型清單
    const typeResponse = await axiosapi.get("/api/types/category/leave_type");
    leaveTypes.value = typeResponse.data;
  } catch (error) {
    console.error("Error fetching leave types:", error);
  }
});
// 驗證選擇的日期範圍（不能跨月）
function validateDateRange() {
  if (!leaveRequest.startTime || !leaveRequest.endTime) return;

  const start = new Date(leaveRequest.startTime);
  const end = new Date(leaveRequest.endTime);

  if (start.getMonth() !== end.getMonth()) {
    Swal.fire({
      title: "錯誤!",
      text: "請假期間不能跨月，請重新選擇日期。",
      icon: "error",
      confirmButtonText: "確定",
    });
    leaveRequest.endTime = "";
    return;
  }

  updateLeaveHours();
}

function updateLeaveHours() {
  if (!leaveRequest.startTime || !leaveRequest.endTime) return;

  const start = new Date(leaveRequest.startTime);
  const end = new Date(leaveRequest.endTime);

  let totalMinutes = 0; // 將所有分鐘數累加
  let current = new Date(start);

  while (current < end) {
    let workStart = new Date(current);
    workStart.setHours(8, 0, 0, 0); // 工作日開始時間 08:00
    let workEnd = new Date(current);
    workEnd.setHours(17, 0, 0, 0); // 工作日結束時間 17:00

    let lunchStart = new Date(current);
    lunchStart.setHours(12, 0, 0, 0); // 午休開始時間 12:00
    let lunchEnd = new Date(current);
    lunchEnd.setHours(13, 0, 0, 0); // 午休結束時間 13:00

    let actualStart = current < workStart ? workStart : current; // 確定實際開始時間
    let actualEnd = end < workEnd ? end : workEnd; // 確定實際結束時間

    if (actualStart < actualEnd) {
      let minutes = (actualEnd - actualStart) / (1000 * 60); // 計算總分鐘數

      // 扣除午休時間
      if (actualStart < lunchEnd && actualEnd > lunchStart) {
        let overlapStart = actualStart < lunchStart ? lunchStart : actualStart;
        let overlapEnd = actualEnd > lunchEnd ? lunchEnd : actualEnd;
        let lunchMinutes = (overlapEnd - overlapStart) / (1000 * 60); // 計算午休重疊的分鐘數
        minutes -= Math.max(0, lunchMinutes); // 扣除午休時間
      }

      totalMinutes += Math.max(0, Math.min(minutes, 8 * 60)); // 每日最多 8 小時 (480 分鐘)
    }

    current.setDate(current.getDate() + 1); // 跳到下一個工作日
    current.setHours(8, 0, 0, 0); // 下一工作日從 08:00 開始
  }

  console.log(totalMinutes);
  // 將分鐘數轉換為小時，並無條件進位
  leaveRequest.leaveHours = Math.ceil(totalMinutes / 60);
}

// 處理附件上傳
function handleFileUpload(event) {
  leaveRequest.attachments = event.target.files[0];
}

// 提交請假申請
import Swal from "sweetalert2";

async function submitLeaveRequest() {
  if (leaveRequest.leaveHours === 0) {
    Swal.fire({
      title: "錯誤!",
      text: "請假時數不能為 0 小時，請重新選擇時間。",
      icon: "error",
      confirmButtonText: "確定",
    });
    return; // 阻止表單提交
  }
  const formData = new FormData();

  // 添加其他表單欄位資料
  formData.append("employeeId", leaveRequest.employee_id);
  formData.append("leaveTypeId", leaveRequest.leaveTypeId);
  formData.append("startDatetime", leaveRequest.startTime);
  formData.append("endDatetime", leaveRequest.endTime);
  formData.append("leaveHours", leaveRequest.leaveHours);
  formData.append("statusId", 4); // 假設 4 是申請中的狀態 ID
  formData.append("reason", leaveRequest.reason);

  // 添加附件檔案
  if (leaveRequest.attachments) {
    formData.append("attachments", leaveRequest.attachments);
  }

  try {
    // 使用 FormData 發送請求
    await axiosapi.post("/api/leave-requests", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // 成功後顯示提示
    Swal.fire({
      title: "成功!",
      text: "請假申請提交成功！",
      icon: "success",
      confirmButtonText: "OK",
    }).then(() => {
      // 跳轉到首頁
      window.location.href = "/";
    });
  } catch (error) {
    // 錯誤處理
    if (error.response && error.response.data) {
      const errorMessage = error.response.data || "提交失敗";
      Swal.fire({
        title: "錯誤!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "重新提交",
      });
    } else {
      Swal.fire({
        title: "錯誤!",
        text: "提交請假申請時發生未知錯誤",
        icon: "error",
        confirmButtonText: "重新提交",
      });
    }
  }
}

// Demo 鈕
function fillDemoData() {
  const businessLeave = leaveTypes.value.find(type => type.typeName === "事假");
  if (businessLeave) {
    leaveRequest.leaveTypeId = businessLeave.id;
  }

  leaveRequest.startTime = "2025-04-15T08:00";
  leaveRequest.endTime = "2025-04-15T17:00";
  leaveRequest.reason = "私事待處理";

  updateLeaveHours(); // 計算請假時數
}

// 返回上一頁
function goBack() {
  window.history.back();
}
</script>
