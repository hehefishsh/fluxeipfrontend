<template>
  <div>
    <!-- 查詢費用資料 -->
    <div class="card card-default" id="leave-request-query">
      <div class="card-header"></div>
      <div class="card-body py-0" data-simplebar>
        <!-- 顯示錯誤信息 -->
        <div v-show="error" class="alert alert-danger" role="alert">
          {{ error }}
        </div>

        <!-- 分類標籤 -->
        <div class="d-flex justify-content-between">
          <div>
            <RouterLink class="btn btn-outline-primary btn-pill ms-auto" to="/">返回首頁</RouterLink>
          </div>
          <div>
            <button v-if="expenseRequestData.length" class="btn btn-success btn-pill ms-2" @click="confirmApproveAll">
              一鍵簽核
            </button>
          </div>
        </div>

        <!-- 篩選顯示對應的費用資料 -->
        <div class="tab-content mt-3">
          <div v-if="expenseRequestData.length">
            <table class="table table-borderless table-thead-border">
              <thead>
                <tr>
                  <th class="text">申請Id</th>
                  <th class="text">申請人</th>
                  <th class="text">請假類型</th>
                  <th class="text">費用</th>
                  <th class="text">說明</th>
                  <th class="text">申請時間</th>
                  <th class="text">附件</th>
                  <th class="text">狀態</th>
                  <th class="text">核准</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(expense, index) in expenseRequestData" :key="index">
                  <td class="text">{{ expense.expenseRequestId }}</td>
                  <td class="text">{{ expense.requestEmployeeName }}</td>
                  <td class="text">{{ expense.expenseType }}</td>
                  <td class="text highlinestar">NT${{ expense.amount }}元</td>
                  <td class="text">{{ expense.description }}</td>
                  <td class="text">
                    {{ formatDateSecond(expense.submittedAt) }}
                  </td>
                  <td class="text">
                    <button v-if="expense.attachmentName" @click="
                      downloadfile(
                        expense.attachmentName,
                        expense.attachmentPath
                      )
                      " class="badge badge-primary">
                      下載附件
                    </button>
                    <span v-else>無</span>
                    {{ expense.attachmentName }}
                  </td>
                  <td class="text">{{ expense.status }}</td>
                  <td class="text">
                    <button class="badge badge-square badge-success" @click="showModal(expense, 'approve')"
                      data-toggle="modal" data-target="#expenseRequestModal">
                      核可
                    </button>
                    <button class="badge badge-square badge-warning" @click="showModal(expense, 'reject')"
                      data-toggle="modal" data-target="#expenseRequestModal">
                      否決
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else>
            <p class="text-center text-muted">無相關請假資料</p>
          </div>
        </div>

        <div class="bg-white py-4"></div>
      </div>
    </div>

    <!-- 呼叫請假詳情元件並傳遞selectedLeaveRequest -->
    <ExpenseRequestApprovalDetails :expenseRequest="selectedExpenseRequest" :actionType="actionType"
      @update:expenseRequest="reloadData" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axiosapi from "@/plugins/axios.js";
import useUserStore from "@/stores/user";
import ExpenseRequestApprovalDetails from "./ExpenseRequestApprovalDetails.vue";
import Swal from "sweetalert2";

const user = useUserStore();
const expenseRequestData = ref([]);
const error = ref("");
const selectedExpenseRequest = ref(null);
const actionType = ref("");

// 顯示請假詳情Modal
const showModal = (expense, type) => {
  selectedExpenseRequest.value = expense;
  actionType.value = type; // 設定是「核准」還是「否決」
};
const reloadData = async () => {
  selectedExpenseRequest.value = null; // 確保 modal 關閉時清空選取
  actionType.value = ""; // 清空 actionType
  try {
    const response = await axiosapi.get(
      `/api/approval/expense/pending/${user.empId}`
    );
    expenseRequestData.value = response.data; // 更新列表
  } catch (err) {
    error.value = "無法獲取請假資料";
  }
};
// 查詢請假資料
onMounted(async () => {
  try {
    const response = await axiosapi.get(
      `/api/approval/expense/pending/${user.empId}`
    ); // 查詢待審核的請假單
    expenseRequestData.value = response.data;
  } catch (err) {
    error.value = "無法獲取請假資料";
  }
});

// 簡單日期格式化函式，依需求調整格式
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 月份從0開始
  const day = String(date.getDate()).padStart(2, "0");

  // 取得星期幾的中文名稱
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  const weekDay = weekdays[date.getDay()];

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}年${month}月${day}日 (${weekDay}) ${hours}:${minutes}`;
};

const formatDateSecond = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 月份從0開始
  const day = String(date.getDate()).padStart(2, "0");

  // 取得星期幾的中文名稱
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  const weekDay = weekdays[date.getDay()];

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
};

function downloadfile(attachmentName, attachmentPath) {
  axiosapi
    .get(`/api/expense-requests/attachments/${attachmentPath}`, {
      responseType: "blob", // 確保返回的是二進制數據
    })
    .then((response) => {
      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = decodeURIComponent(attachmentName);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    })
    .catch((error) => {
      console.error("下載失敗", error);
    });
}

// 顯示確認對話框
const confirmApproveAll = () => {
  Swal.fire({
    title: "您確定要一鍵簽核所有費用申請單嗎？",
    text: "這個操作無法撤回！",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "確定",
    cancelButtonText: "取消",
  }).then((result) => {
    if (result.isConfirmed) {
      approveAllRequests(); // 確認後執行一鍵簽核
    }
  });
};

// 一鍵簽核請假申請
const approveAllRequests = async () => {
  try {
    const response = await axiosapi.put(`/api/approval/expense/pending/${user.empId}/review`);

    if (response.status === 200) {
      Swal.fire({
        icon: "success",
        title: "一鍵簽核成功",
        text: response.data,
      }).then(() => {
        reloadData(); // 重新載入資料
      });
    } else {
      Swal.fire({
        icon: "warning",
        title: "一鍵簽核完成，但部分費用申請單可能未成功",
        text: response.data,
      });
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "一鍵簽核失敗",
      text: "請稍後再試。",
    });
  }
};


</script>

<style scoped>
/* .table {
  table-layout: fixed;
  width: 100%;
} */

.table td,
.table th {
  word-wrap: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.text {
  white-space: nowrap;
}
</style>
