<template>
  <div class="card card-default" id="work-adjustment-request">
    <div class="card-header">
      <h2>加減班申請</h2>
      <button type="button" @click="fillDemoData" class="badge badge-pill badge-info">Demo</button>
    </div>
    <div class="card-body py-0">
      <form @submit.prevent="submitWorkAdjustment" class="form-group">
        <!-- 申請人 -->
        <div class="form-group">
          <label for="employee">申請人</label>
          <input type="text" id="employee" class="form-control rounded-0" v-model="currentEmployeeName" readonly />
        </div>

        <!-- 加減班類型 -->
        <div class="form-group">
          <label for="adjustmentType">
            <font color="red">*</font>加減班類型
          </label>
          <select id="adjustmentType" class="form-control rounded-0" v-model="adjustmentRequest.adjustmentTypeId"
            required>
            <option v-for="type in adjustmentTypes" :key="type.id" :value="type.id">
              {{ type.typeName }}
            </option>
          </select>
        </div>

        <!-- 加減班日期 -->
        <div class="form-group">
          <label for="adjustmentDate">
            <font color="red">*</font>加減班日期
          </label>
          <input type="date" id="adjustmentDate" class="form-control rounded-0"
            v-model="adjustmentRequest.adjustmentDate" required />
        </div>

        <!-- 時數 -->
        <div class="form-group">
          <label for="hours">
            <font color="red">*</font>加減班時數
          </label>
          <input type="number" id="hours" class="form-control rounded-0" v-model="adjustmentRequest.hours" step="1"
            min="1" max="24" @input="validateHours" required />
          <small v-if="isHoursInvalid" class="text-danger">加減班時數不能超過 24 小時</small>
        </div>

        <!-- 申請原因 -->
        <div class="form-group">
          <label for="reason">
            <font color="red">*</font>申請原因
          </label>
          <textarea id="reason" class="form-control rounded-0" v-model="adjustmentRequest.reason" required
            maxlength="200"></textarea>
          <small class="form-text text-muted">最多可輸入 200 字。</small>
        </div>

        <!-- 按鈕區 -->
        <div class="form-footer">
          <button type="submit" class="btn btn-secondary btn-pill" :disabled="isHoursInvalid">
            提交
          </button>
          <button type="button" @click="goBack" class="btn btn-light btn-pill">
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
import Swal from "sweetalert2";

// 取得使用者資訊
const userStore = useUserStore();
const currentEmployeeName = computed(() => userStore.empName);
const currentEmployeeId = computed(() => userStore.empId);

// 表單資料
const adjustmentRequest = reactive({
  employeeId: currentEmployeeId.value, // 自動填入使用者 ID
  adjustmentTypeId: null,
  adjustmentDate: "",
  hours: 1,
  reason: "",
  statusId: 4, // 預設狀態為申請中
});

// 取得加減班類型
const adjustmentTypes = ref([]);

onMounted(async () => {
  try {
    const typeResponse = await axiosapi.get(
      "/api/types/category/work_adjustment_type"
    );
    adjustmentTypes.value = typeResponse.data;
  } catch (error) {
    console.error("Error fetching adjustment types:", error);
  }
});

// 是否時數無效
const isHoursInvalid = computed(() => adjustmentRequest.hours > 24);

// 檢查時數是否超過 24 小時
function validateHours() {
  if (adjustmentRequest.hours > 24) {
    adjustmentRequest.hours = 24; // 自動調整為最大值
    Swal.fire({
      title: "警告!",
      text: "加減班時數不能超過 24 小時。",
      icon: "warning",
      confirmButtonText: "確定",
    });
  }
}

// 提交加減班申請
async function submitWorkAdjustment() {
  if (isHoursInvalid.value) {
    Swal.fire({
      title: "錯誤!",
      text: "加減班時數不能超過 24 小時。",
      icon: "error",
      confirmButtonText: "確定",
    });
    return;
  }

  try {
    await axiosapi.post("/api/work-adjustments", adjustmentRequest, {
      headers: { "Content-Type": "application/json" },
    });

    Swal.fire({
      title: "成功!",
      text: "加減班申請提交成功！",
      icon: "success",
      confirmButtonText: "OK",
    }).then(() => {
      window.location.href = "/";
    });
  } catch (error) {
    console.error("Error submitting work adjustment request:", error);
    Swal.fire({
      title: "錯誤!",
      text: error.response?.data || "提交失敗，請稍後再試。",
      icon: "error",
      confirmButtonText: "重新提交",
    });
  }
}

// Demo 鈕
function fillDemoData() {
  const businessAdjustment = adjustmentTypes.value.find(type => type.typeName === "加班");
  if (businessAdjustment) {
    adjustmentRequest.adjustmentTypeId = businessAdjustment.id;
  }
  adjustmentRequest.hours = 1;
  adjustmentRequest.adjustmentDate = "2025-04-15";
  adjustmentRequest.reason = "加班";

}

// 返回上一頁
function goBack() {
  window.history.back();
}
</script>
