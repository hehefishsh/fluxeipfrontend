<template>
  <div>
    <!-- 查詢補卡簽核資料 -->
    <div class="card card-default" id="work-adjust-query">
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
            <button v-if="missingPunchRequestData.length" class="btn btn-success btn-pill ms-2"
              @click="confirmApproveAll">
              一鍵簽核
            </button>
          </div>
        </div>

        <!-- 篩選顯示對應的補卡資料 -->
        <div class="tab-content mt-3">
          <div v-if="missingPunchRequestData.length">
            <table class="table table-borderless table-thead-border">
              <thead>
                <tr>
                  <th class="text">申請Id</th>
                  <th class="text">申請人</th>
                  <th class="text">補卡類型</th>
                  <th class="text">缺卡日期</th>
                  <th class="text">原因</th>
                  <th class="text">提交時間</th>
                  <th class="text">狀態</th>
                  <th class="text">核准</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(missingPunch, index) in missingPunchRequestData" :key="index">
                  <td class="text">{{ missingPunch.requestId }}</td>
                  <td class="text">{{ missingPunch.requestEmployeeName }}</td>
                  <td class="text">{{ missingPunch.type }}</td>
                  <td class="text highlinestar">
                    <span>{{ formatDate(missingPunch.missingDate) }}</span>
                  </td>
                  <td class="text">{{ missingPunch.reason }}</td>
                  <td class="text">
                    {{ formatDateSecond(missingPunch.submittedAt) }}
                  </td>
                  <td class="text">{{ missingPunch.status }}</td>
                  <td class="text">
                    <button class="badge badge-square badge-success" @click="showModal(missingPunch, 'approve')"
                      data-toggle="modal" data-target="#missingPunchModal">
                      核可
                    </button>
                    <button class="badge badge-square badge-warning" @click="showModal(missingPunch, 'reject')"
                      data-toggle="modal" data-target="#missingPunchModal">
                      否決
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else>
            <p class="text-center text-muted">無相關補卡資料</p>
          </div>
        </div>

        <div class="bg-white py-4"></div>
      </div>
    </div>

    <!-- 呼叫加減班詳情元件並傳遞 selectedWorkAdjustRequest -->
    <MissingPunchApprovalDetails :missingPunchRequest="selectedMissingPunchRequest" :actionType="actionType"
      @update:missingPunchRequest="reloadData" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axiosapi from "@/plugins/axios.js";
import useUserStore from "@/stores/user";
import MissingPunchApprovalDetails from "./MissingPunchApprovalDetails.vue";
import Swal from "sweetalert2";

const user = useUserStore();
const missingPunchRequestData = ref([]);
const error = ref("");
const selectedMissingPunchRequest = ref(null);
const actionType = ref("");

// 顯示補卡詳情 Modal
const showModal = (missingPunch, type) => {
  selectedMissingPunchRequest.value = missingPunch;
  actionType.value = type; // 設定是「核准」還是「否決」
};

// 重新載入數據
const reloadData = async () => {
  selectedMissingPunchRequest.value = null; // 清除選取
  actionType.value = ""; // 清空 actionType
  try {
    const response = await axiosapi.get(
      `/api/approval/missingpunch/pending/${user.empId}`
    );
    missingPunchRequestData.value = response.data; // 更新列表
  } catch (err) {
    error.value = "無法取得補卡資料";
  }
};

// 查詢補卡資料
onMounted(async () => {
  try {
    const response = await axiosapi.get(
      `/api/approval/missingpunch/pending/${user.empId}`
    );
    missingPunchRequestData.value = response.data;
  } catch (err) {
    error.value = "無法取得補卡資料";
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

  return `${year}年${month}月${day}日 (${weekDay})`;
};

// 簡單日期格式化函式，依需求調整格式
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

// 顯示確認對話框
const confirmApproveAll = () => {
  Swal.fire({
    title: "您確定要一鍵簽核所有補卡申請單嗎？",
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

// 一鍵簽核補卡申請
const approveAllRequests = async () => {
  try {
    const response = await axiosapi.put(`/api/approval/missingpunch/pending/${user.empId}/review`);

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
        title: "一鍵簽核完成，但部分補卡申請單可能未成功",
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
