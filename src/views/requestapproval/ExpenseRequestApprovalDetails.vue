<template>
  <div
    v-if="expenseRequest"
    class="modal fade"
    id="expenseRequestModal"
    tabindex="-1"
    aria-labelledby="expenseRequestModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="expenseRequestModalLabel">費用詳情</h5>
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
                <td>{{ expenseRequest.expenseRequestId }}</td>
              </tr>
              <tr>
                <td>申請人</td>
                <td>{{ expenseRequest.requestEmployeeName }}</td>
              </tr>
              <tr>
                <td>請假類型</td>
                <td>{{ expenseRequest.expenseType }}</td>
              </tr>
              <tr>
                <td>費用</td>
                <td class="highlinestar">NT${{ expenseRequest.amount }}元</td>
              </tr>
              <tr>
                <td>說明</td>
                <td>{{ expenseRequest.description }}</td>
              </tr>
              <tr>
                <td>申請時間</td>
                <td>{{ formatDateSecond(expenseRequest.submittedAt) }}</td>
              </tr>
              <tr v-if="expenseRequest.attachmentName">
                <td>附件</td>
                <td>
                  <button
                    @click="
                      downloadFile(
                        expenseRequest.attachmentName,
                        expenseRequest.attachmentPath
                      )
                    "
                    class="badge badge-primary"
                  >
                    下載附件
                  </button>
                  {{ expenseRequest.attachmentName }}
                </td>
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
            @click="approveExpense"
          >
            核准
          </button>
          <button
            v-if="actionType === 'reject'"
            class="btn btn-warning"
            @click="rejectExpense"
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
const comment = ref(""); // 新增評論變數
const props = defineProps({
  expenseRequest: Object,
  actionType: String,
});

const emit = defineEmits(["update:expenseRequest"]);

const closeModal = () => {
  emit("update:expenseRequest", null);
  comment.value = ""; // 清空評論

  // 手動關閉 Bootstrap modal
  const modal = document.getElementById("expenseRequestModal");
  if (modal) {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    modal.style.display = "none";

    // 手動移除 modal-backdrop，避免畫面卡住
    const backdrops = document.getElementsByClassName("modal-backdrop");
    while (backdrops.length > 0) {
      backdrops[0].parentNode.removeChild(backdrops[0]);
    }

    // 讓 body 滾動恢復
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "auto";
  }
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

const approveExpense = async () => {
  await reviewExpense("核准"); // 1 代表核准
};

const rejectExpense = async () => {
  await reviewExpense("未核准"); // 2 代表否決
};

const reviewExpense = async (status) => {
  if (!props.expenseRequest) return;
  try {
    const response = await axiosapi.put(
      `/api/approval/expense/step/${props.expenseRequest.stepId}/review`,
      null,
      {
        params: {
          approverId: props.expenseRequest.approverId,
          status: status,
          comment: comment.value, // 傳遞評論
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

const downloadFile = (attachmentName, attachmentPath) => {
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
      console.error("下載失敗", error);
    });
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
