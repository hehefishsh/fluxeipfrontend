<template>
  <div class="card card-default" id="work-adjustment-request">
    <div class="card-header">
      <h2>補卡申請</h2>
      <button
        type="button"
        @click="fillDemoData"
        class="badge badge-pill badge-info"
      >
        Demo
      </button>
    </div>
    <div class="card-body py-0">
      <form @submit.prevent="submitMissingPunch" class="form-group">
        <!-- 申請人 -->
        <div class="form-group">
          <label for="employee">申請人</label>
          <input
            type="text"
            id="employee"
            class="form-control rounded-0"
            v-model="currentEmployeeName"
            readonly
          />
        </div>

        <!-- 補卡類型 -->
        <div class="form-group">
          <label for="adjustmentType">
            <font color="red">*</font>補卡類型
          </label>
          <select
            id="adjustmentType"
            class="form-control rounded-0"
            v-model="missingPunchRequest.clockTypeId"
            required
          >
            <option v-for="type in clockTypes" :key="type.id" :value="type.id">
              {{ type.typeName }}
            </option>
          </select>
        </div>

        <!-- 補卡日期 -->
        <div class="form-group">
          <label for="adjustmentDate">
            <font color="red">*</font>補卡日期
          </label>
          <input
            type="date"
            id="adjustmentDate"
            class="form-control rounded-0"
            v-model="missingPunchRequest.missingDate"
            required
          />
        </div>

        <!-- 申請原因 -->
        <div class="form-group">
          <label for="reason"> <font color="red">*</font>申請原因 </label>
          <textarea
            id="reason"
            class="form-control rounded-0"
            v-model="missingPunchRequest.reason"
            required
            maxlength="200"
          ></textarea>
          <small class="form-text text-muted">最多可輸入 200 字。</small>
        </div>

        <!-- 按鈕區 -->
        <div class="form-footer">
          <button type="submit" class="btn btn-secondary btn-pill">提交</button>
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
const missingPunchRequest = reactive({
  employeeId: currentEmployeeId.value, // 自動填入使用者 ID
  clockTypeId: null,
  missingDate: "",
  reason: "",
  statusId: 4, // 預設狀態為申請中
});

// 取得加減班類型
const clockTypes = ref([]);

onMounted(async () => {
  try {
    const typeResponse = await axiosapi.get("/api/types/category/clock_type");
    clockTypes.value = typeResponse.data.filter(
      (item) => item.typeName !== "外出打卡" && item.typeName !== "外出結束"
    );
  } catch (error) {
    console.error("Error fetching adjustment types:", error);
  }
});

// 是否時數無效
const isHoursInvalid = computed(() => missingPunchRequest.hours > 24);

// 提交加減班申請
async function submitMissingPunch() {
  try {
    await axiosapi.post("/api/missing-punch", missingPunchRequest, {
      headers: { "Content-Type": "application/json" },
    });

    Swal.fire({
      title: "成功!",
      text: "補卡申請提交成功！",
      icon: "success",
      confirmButtonText: "OK",
    }).then(() => {
      window.location.href = "/";
    });
  } catch (error) {
    console.error("Error submitting missing punch request:", error);
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
  const businessMissingPunch = clockTypes.value.find(
    (type) => type.typeName === "上班"
  );
  if (businessMissingPunch) {
    missingPunchRequest.clockTypeId = businessMissingPunch.id;
  }

  // 設定今天日期（格式為 yyyy-MM-dd）
  const today = new Date().toISOString().split("T")[0];
  missingPunchRequest.missingDate = today;
  missingPunchRequest.reason = "忘記打卡";
}

// 返回上一頁
function goBack() {
  window.history.back();
}
</script>
