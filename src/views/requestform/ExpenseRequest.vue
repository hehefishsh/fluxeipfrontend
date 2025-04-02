<template>
  <div class="card card-default" id="expense-request">
    <div class="card-header">
      <h2>費用申請</h2>
      <button type="button" @click="fillDemoData" class="badge badge-pill badge-info">Demo</button>
    </div>
    <div class="card-body py-0" data-simplebar>
      <form @submit.prevent="submitExpenseRequest" class="form-group">
        <!-- 申請人（自動填入） -->
        <div class="form-group">
          <label for="employee">申請人</label>
          <input type="text" id="employee" class="form-control rounded-0" v-model="currentEmployeeName" readonly />
        </div>

        <!-- 費用類型 -->
        <div class="form-group">
          <label for="expenseType">
            <font color="red">*</font>費用類型
          </label>
          <select id="expenseType" class="form-control rounded-0" v-model="expenseRequest.expenseTypeId" required>
            <option v-for="type in expenseTypes" :key="type.id" :value="type.id">
              {{ type.typeName }}
            </option>
          </select>
        </div>

        <!-- 費用金額 -->
        <div class="form-group">
          <label for="amount">
            <font color="red">*</font>費用金額
          </label>
          <div class="input-group">
            <input type="number" id="amount" class="form-control rounded-0" v-model.number="expenseRequest.amount"
              placeholder="金額" required min="1" />
            <span class="input-group-text">元</span>
          </div>
        </div>

        <!-- 描述 -->
        <div class="form-group">
          <label for="description">
            <font color="red">*</font>說明
          </label>
          <textarea id="description" class="form-control rounded-0" v-model="expenseRequest.description" required
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
const currentEmployeeId = computed(() => userStore.empId); // 假設有 empId

// 表單資料
const expenseRequest = reactive({
  employee_id: currentEmployeeId.value, // 自動填入使用者 ID
  expenseTypeId: null,
  amount: 0,
  description: "",
  attachments: null,
});

// 取得費用類型
const expenseTypes = ref([]);

onMounted(async () => {
  try {
    // 取得費用類型清單，請確認後端 API 是否為 /api/types/category/expense_type
    const typeResponse = await axiosapi.get("/api/types/category/expense_type");
    expenseTypes.value = typeResponse.data;
  } catch (error) {
    console.error("Error fetching expense types:", error);
  }
});

// 處理附件上傳
function handleFileUpload(event) {
  expenseRequest.attachments = event.target.files[0];
}

// 提交費用申請
async function submitExpenseRequest() {
  if (expenseRequest.amount <= 0) {
    Swal.fire({
      title: "錯誤!",
      text: "費用金額必須大於 0 元",
      icon: "error",
      confirmButtonText: "確定",
    });
    return;
  }
  const formData = new FormData();
  // 添加表單欄位
  formData.append("employeeId", expenseRequest.employee_id);
  formData.append("expenseTypeId", expenseRequest.expenseTypeId);
  formData.append("amount", expenseRequest.amount);
  formData.append("description", expenseRequest.description);
  formData.append("statusId", 4); // 假設 4 為「申請中」狀態
  // 如有附件，加入附件
  if (expenseRequest.attachments) {
    formData.append("attachments", expenseRequest.attachments);
  }

  try {
    await axiosapi.post("/api/expense-requests", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    Swal.fire({
      title: "成功!",
      text: "費用申請提交成功！",
      icon: "success",
      confirmButtonText: "OK",
    }).then(() => {
      // 提交成功後跳轉到首頁或指定頁面
      window.location.href = "/";
    });
  } catch (error) {
    const errorMessage =
      error.response && error.response.data
        ? error.response.data
        : "提交費用申請時發生未知錯誤";
    Swal.fire({
      title: "錯誤!",
      text: errorMessage,
      icon: "error",
      confirmButtonText: "重新提交",
    });
  }
}

// Demo 鈕
function fillDemoData() {
  const businessExpense = expenseTypes.value.find(type => type.typeName === "差旅費用");
  if (businessExpense) {
    expenseRequest.expenseTypeId = businessExpense.id;
  }

  expenseRequest.amount = 15000;
  expenseRequest.description = "0410台北出差費用";

}

// 返回上一頁
function goBack() {
  window.history.back();
}
</script>
