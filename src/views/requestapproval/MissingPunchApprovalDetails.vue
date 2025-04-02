<template>
  <div
    v-if="missingPunchRequest"
    class="modal fade"
    id="missingPunchModal"
    tabindex="-1"
    aria-labelledby="missingPunchModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="missingPunchModalLabel">補卡詳情</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <table class="table table-borderless">
            <tbody>
              <tr>
                <td>申請Id</td>
                <td>{{ missingPunchRequest.requestId }}</td>
              </tr>
              <tr>
                <td>申請人</td>
                <td>{{ missingPunchRequest.requestEmployeeName }}</td>
              </tr>
              <tr>
                <td>補卡類型</td>
                <td>{{ missingPunchRequest.type }}</td>
              </tr>
              <tr>
                <td>缺卡日期</td>
                <td class="highlinestar">
                  {{ formatDate(missingPunchRequest.missingDate) }}
                </td>
              </tr>
              <tr>
                <td>原因</td>
                <td>{{ missingPunchRequest.reason }}</td>
              </tr>
              <tr>
                <td>提交時間</td>
                <td>{{ formatDateSecond(missingPunchRequest.submittedAt) }}</td>
              </tr>
            </tbody>
          </table>
          <!-- 新增評論輸入框 -->
          <div class="mb-3">
            <label for="comment" class="form-label">評論</label>
            <textarea
              v-model="comment"
              class="form-control"
              id="comment"
              rows="3"
              maxlength="50"
            ></textarea>
            <small class="form-text text-muted">最多可輸入 50字。</small>
          </div>
        </div>
        <div class="modal-footer">
          <button
            v-if="actionType === 'approve'"
            class="btn btn-success"
            @click="approveMissingPunch"
          >
            核准
          </button>
          <button
            v-if="actionType === 'reject'"
            class="btn btn-warning"
            @click="rejectMissingPunch"
          >
            否決
          </button>
          <button
            class="btn btn-danger"
            @click="closeModal"
            data-dismiss="modal"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axiosapi from "@/plugins/axios.js";
import Swal from "sweetalert2";

const comment = ref("");
const props = defineProps({
  missingPunchRequest: Object,
  actionType: String,
});

const emit = defineEmits(["update:missingPunchRequest"]);

const closeModal = () => {
  emit("update:missingPunchRequest", null);
  comment.value = "";
  // 手動關閉 Bootstrap modal (Bootstrap 4 寫法)
  const modal = document.getElementById("missingPunchModal");
  if (modal) {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    modal.style.display = "none";
    // 移除 modal-backdrop
    const backdrops = document.getElementsByClassName("modal-backdrop");
    while (backdrops.length > 0) {
      backdrops[0].parentNode.removeChild(backdrops[0]);
    }
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "auto";
  }
};

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
const approveMissingPunch = async () => {
  await reviewMissingPunch("核准");
};

const rejectMissingPunch = async () => {
  await reviewMissingPunch("未核准");
};

const reviewMissingPunch = async (status) => {
  if (!props.missingPunchRequest) return;
  try {
    const response = await axiosapi.put(
      `/api/approval/missingpunch/step/${props.missingPunchRequest.stepId}/review`,
      null,
      {
        params: {
          approverId: props.missingPunchRequest.approverId,
          status: status,
          comment: comment.value,
        },
      }
    );
    Swal.fire({
      icon: "success",
      title: "操作成功",
      text: response.data,
    }).then(() => {
      closeModal();
    });
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "操作失敗",
      text: error.response?.data || error.message,
    }).then(() => {
      closeModal();
    });
  }
};
</script>

<style scoped>
.table {
  table-layout: fixed;
  width: 100%;
}

.table td,
.table th {
  word-wrap: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}
</style>
