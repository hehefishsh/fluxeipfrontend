<template>
  <div>
    <div class="card card-default" id="expense-request-query">
      <div class="card-header"></div>
      <div class="card-body py-0" data-simplebar>
        <div v-show="error" class="alert alert-danger" role="alert">
          {{ error }}
        </div>
        <div class="d-flex justify-content-between">
          <ul class="nav nav-pills mb-3 justify-content-between" id="pills-tab12" role="tablist">
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'" href="#">全部</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab === 'pending' }" @click="activeTab = 'pending'"
                href="#">待審核</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab === 'reviewing' }" @click="activeTab = 'reviewing'"
                href="#">審核中</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab === 'approved' }" @click="activeTab = 'approved'"
                href="#">已核決</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab === 'rejected' }" @click="activeTab = 'rejected'"
                href="#">未核准</a>
            </li>
          </ul>
          <div>
            <RouterLink class="btn btn-outline-primary btn-pill ms-auto" to="/">返回首頁</RouterLink>
          </div>
        </div>

        <div class="tab-content mt-3">
          <div v-if="filteredExpenseRequests.length">
            <table class="table table-borderless table-thead-border">
              <thead>
                <tr>
                  <th class="text">申請Id</th>
                  <th class="text">申請人</th>
                  <th class="text">費用類型</th>
                  <th class="text">金額</th>
                  <th class="text">說明</th>
                  <th class="text">申請時間</th>
                  <th class="text">附件</th>
                  <th class="text" style="width: 5%">狀態</th>
                  <th class="text">其他</th>
                  <th class="text">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(expense, index) in filteredExpenseRequests" :key="index">
                  <td>{{ expense.expenseRequestId }}</td>
                  <td>{{ expense.employeeName }}</td>
                  <td>{{ expense.expenseType }}</td>
                  <td class="highlinestar">NT$ {{ expense.amount }}元</td>
                  <td>{{ expense.description }}</td>
                  <td>{{ formatDate(expense.submittedAt) }}</td>
                  <td>
                    <button v-if="expense.attachmentName" @click="
                      downloadFile(
                        expense.attachmentName,
                        expense.attachmentPath
                      )
                      " class="badge badge-primary">
                      下載附件
                    </button>
                    <span v-else>無</span>
                    {{ expense.attachmentName }}
                  </td>
                  <td>{{ expense.status }}</td>
                  <td>
                    <button class="badge badge-info" @click="showModal(expense)" data-toggle="modal"
                      data-target="#expenseRequestModal">
                      查看詳情
                    </button>
                  </td>
                  <td class="text">
                    <button v-if="expense.status === '待審核'" class="badge badge-danger"
                      @click="deleteExpenseRequest(expense.expenseRequestId)">
                      刪除
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else>
            <p class="text-center text-muted">無相關費用申請資料</p>
          </div>
        </div>
        <div class="bg-white py-4"></div>
      </div>
    </div>
    <ExpenseRequestDetails :expenseRequest="selectedExpenseRequest" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axiosapi from "@/plugins/axios.js";
import useUserStore from "@/stores/user";
import ExpenseRequestDetails from "./ExpenseRequestDetails.vue";
import Swal from "sweetalert2";
const user = useUserStore();
const expenseRequestData = ref([]);
const error = ref("");
const activeTab = ref("all");
const selectedExpenseRequest = ref(null);

const showModal = (expense) => {
  selectedExpenseRequest.value = expense;
};

onMounted(async () => {
  try {
    const response = await axiosapi.get(
      `/api/expense-requests/employee/${user.empId}`
    );
    expenseRequestData.value = response.data;
  } catch (err) {
    error.value = "無法取得費用申請資料";
  }
});

const filteredExpenseRequests = computed(() => {
  if (activeTab.value === "all") return expenseRequestData.value;
  return expenseRequestData.value.filter((expense) => {
    switch (activeTab.value) {
      case "pending":
        return expense.status === "待審核";
      case "reviewing":
        return expense.status === "審核中";
      case "approved":
        return expense.status === "已核決";
      case "rejected":
        return expense.status === "未核准";
      default:
        return true;
    }
  });
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
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
};

function downloadFile(attachmentName, attachmentPath) {
  axiosapi
    .get(`/api/expense-requests/attachments/${attachmentPath}`, {
      responseType: "blob",
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
      Swal.fire({ title: "下載失敗: " + error.message, icon: "error" });
    });
}

// 刪除費用資料
const deleteExpenseRequest = async (expenseRequestId) => {
  const result = await Swal.fire({
    title: "您確定要刪除此費用申請單嗎？",
    text: "此操作無法撤回！",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "確定",
    cancelButtonText: "取消",
  });

  if (result.isConfirmed) {
    try {
      const response = await axiosapi.delete(`/api/expense-requests/${expenseRequestId}`);
      if (response.status === 204) {
        Swal.fire({
          title: "刪除成功",
          icon: "success",
        });
        // 重新載入資料
        reloadData();
      } else {
        Swal.fire({
          title: "刪除失敗",
          icon: "error",
        });
      }
    } catch (err) {
      Swal.fire({
        title: "刪除失敗",
        text: err.message,
        icon: "error",
      });
    }
  }
};

// 重新載入費用申請資料
const reloadData = async () => {
  try {
    const response = await axiosapi.get(`/api/expense-requests/employee/${user.empId}`);
    expenseRequestData.value = response.data;
  } catch (err) {
    error.value = "無法取得費用申請資料";
  }
};
</script>

<style scoped>
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
