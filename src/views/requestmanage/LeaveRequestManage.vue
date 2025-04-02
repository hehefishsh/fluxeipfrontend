<template>
  <div>
    <!-- 查詢請假資料 -->
    <div class="card card-default" id="leave-request-query">
      <div class="card-header">
        <!-- <h2>請假資料查詢</h2>
        <RouterLink class="btn btn-outline-primary btn-pill" to="/">返回首頁</RouterLink> -->
      </div>
      <div class="card-body py-0" data-simplebar>
        <!-- 顯示錯誤信息 -->
        <div v-show="error" class="alert alert-danger" role="alert">
          {{ error }}
        </div>
        <!-- 分類標籤 -->
        <div class="d-flex justify-content-between">
          <ul class="nav nav-pills mb-3 justify-content-between" id="pills-tab12" role="tablist">
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'"
                id="pills-home-tab" data-toggle="pill" href="#pills-home-custom-pill" role="tab"
                aria-controls="pills-home" aria-selected="true">全部</a>
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
          <!-- 返回首頁按鈕，靠右對齊 -->
          <div>
            <RouterLink class="btn btn-outline-primary btn-pill ms-auto" to="/">返回首頁</RouterLink>
          </div>
        </div>

        <!-- 篩選顯示對應的請假資料 -->
        <div class="tab-content mt-3">
          <div v-if="filteredLeaveRequests.length">
            <!-- <div v-if="leaveRequestData"> -->
            <!-- 顯示請假資料 -->
            <!-- <h4>
            <span class="badge badge-square badge-outline-primary">請假資料</span>
          </h4> -->
            <table class="table table-borderless table-thead-border">
              <thead>
                <tr>
                  <th class="text">申請Id</th>
                  <th class="text">申請人</th>
                  <th class="text">請假類型</th>
                  <th class="text">開始時間</th>
                  <th class="text">結束時間</th>
                  <th class="text">請假時數</th>
                  <th class="text">請假原因</th>
                  <th class="text">申請時間</th>
                  <th class="text">附件</th>
                  <th class="text">狀態</th>
                  <th class="text">其他</th>
                  <th class="text">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(leave, index) in filteredLeaveRequests" :key="index">
                  <td class="text">{{ leave.leaveRequestId }}</td>
                  <td class="text">{{ leave.employeeName }}</td>
                  <td class="text">{{ leave.leaveType }}</td>
                  <td class="text highlinestar">
                    {{ formatDate(leave.startDatetime) }}
                  </td>
                  <td class="text highlinestar">
                    {{ formatDate(leave.endDatetime) }}
                  </td>
                  <td class="text">{{ leave.leaveHours }}</td>
                  <td class="text">{{ leave.reason }}</td>
                  <td class="text">
                    {{ formatDateSecond(leave.submittedAt) }}
                  </td>
                  <td class="text">
                    <button v-if="leave.attachmentName" @click="
                      downloadfile(leave.attachmentName, leave.attachmentPath)
                      " class="badge badge-primary">
                      下載附件
                    </button>
                    <span v-else>無</span>
                    {{ leave.attachmentName }}
                  </td>
                  <td class="text">{{ leave.status }}</td>
                  <td class="text">
                    <!-- <RouterLink :to="`/requestmanage/leave-request-details/${leave.leaveRequestId}`" >查看詳情</RouterLink> -->
                    <button class="badge badge-info" @click="showModal(leave)" data-toggle="modal"
                      data-target="#leaveRequestModal">
                      查看詳情
                    </button>
                  </td>
                  <td class="text">
                    <button v-if="leave.status === '待審核'" class="badge badge-danger"
                      @click="deleteLeaveRequest(leave.leaveRequestId)">
                      刪除
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
    <!-- 請假詳情 Modal -->
    <LeaveRequestDetails :leaveRequest="selectedLeaveRequest" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axiosapi from "@/plugins/axios.js";
import useUserStore from "@/stores/user";
import LeaveRequestDetails from "./LeaveRequestDetails.vue";
import Swal from "sweetalert2";
const user = useUserStore();
// 用來儲存請假資料
const leaveRequestData = ref([]);
const error = ref("");
const activeTab = ref("all"); // 預設顯示 "全部"
const selectedLeaveRequest = ref(null);

// 選擇請假單，傳遞給 Modal
const showModal = (leave) => {
  selectedLeaveRequest.value = leave;
};
// 查詢請假資料
onMounted(async () => {
  try {
    const response = await axiosapi.get(
      `/api/leave-requests/employee/${user.empId}`
    );
    leaveRequestData.value = response.data;
  } catch (err) {
    error.value = "無法取得請假資料";
  }
});

// 根據標籤篩選請假資料
const filteredLeaveRequests = computed(() => {
  if (activeTab.value === "all") return leaveRequestData.value;
  return leaveRequestData.value.filter((leave) => {
    switch (activeTab.value) {
      case "pending":
        return leave.status === "待審核";
      case "reviewing":
        return leave.status === "審核中";
      case "approved":
        return leave.status === "已核決";
      case "rejected":
        return leave.status === "未核准";
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
  console.log(attachmentName);
  console.log(attachmentPath);
  axiosapi
    .get(`/api/leave-requests/attachments/${attachmentPath}`, {
      responseType: "blob", // 確保返回的是二進制數據
    })
    .then((response) => {
      // 創建 Blob 對象
      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });

      // 創建下載連結
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
      Swal.fire({
        title: "下載失敗: " + error.message,
        icon: "error",
      });
    });
}

// 刪除請假資料
const deleteLeaveRequest = async (leaveRequestId) => {
  const result = await Swal.fire({
    title: "您確定要刪除此請假單嗎？",
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
      const response = await axiosapi.delete(`/api/leave-requests/${leaveRequestId}`);
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

// 重新載入請假資料
const reloadData = async () => {
  try {
    const response = await axiosapi.get(`/api/leave-requests/employee/${user.empId}`);
    leaveRequestData.value = response.data;
  } catch (err) {
    error.value = "無法取得請假資料";
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
