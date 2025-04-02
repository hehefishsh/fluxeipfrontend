<template>
  <div
    class="modal fade"
    id="expenseRequestModal"
    tabindex="-1"
    role="dialog"
    aria-labelledby="expenseRequestModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">費用申請詳情</h5>
          <button
            type="button"
            class="close"
            data-dismiss="modal"
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="expenseRequest">
            <table class="table table-borderless">
              <tbody>
                <tr>
                  <td>申請Id</td>
                  <td>{{ expenseRequest.expenseRequestId }}</td>
                </tr>
                <tr>
                  <td>申請人</td>
                  <td>{{ expenseRequest.employeeName }}</td>
                </tr>
                <tr>
                  <td>費用類型</td>
                  <td>{{ expenseRequest.expenseType }}</td>
                </tr>
                <tr>
                  <td>申請金額</td>
                  <td class="highlinestar">
                    NT$ {{ expenseRequest.amount }}元
                  </td>
                </tr>
                <tr>
                  <td>說明</td>
                  <td>{{ expenseRequest.description }}</td>
                </tr>
                <tr>
                  <td>申請時間</td>
                  <td>{{ formatDateSecond(expenseRequest.submittedAt) }}</td>
                </tr>
                <tr>
                  <td>狀態</td>
                  <td>{{ expenseRequest.status }}</td>
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

            <!-- 顯示審核步驟 -->
            <div>
              <h5 class="badge badge-secondary">審核流程</h5>
            </div>

            <table class="table table-borderless">
              <thead>
                <tr>
                  <th style="width: 12%">步驟</th>
                  <th>審核人</th>
                  <th>狀態</th>
                  <th>意見</th>
                  <th style="width: 40%">更新時間</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="step in approvalSteps" :key="step.stepId">
                  <td>{{ step.currentStep }}</td>
                  <td>{{ step.approverName }}</td>
                  <td>{{ step.status }}</td>
                  <td>{{ step.comment || "無" }}</td>
                  <td>{{ formatDateSecond(step.updatedAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else>
            <p>正在加載費用申請詳情...</p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-danger" data-dismiss="modal">
            關閉
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import axiosapi from "@/plugins/axios";

const props = defineProps({
  expenseRequest: Object,
});

const approvalSteps = ref([]);

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

const fetchApprovalSteps = async () => {
  if (!props.expenseRequest) return;
  try {
    const response = await axiosapi.get(
      `/api/approval/expense/steps/${props.expenseRequest.expenseRequestId}`
    );
    approvalSteps.value = response.data;
  } catch (error) {
    console.error("獲取審核步驟失敗", error);
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

watch(
  () => props.expenseRequest,
  (newVal) => {
    if (newVal) fetchApprovalSteps();
  }
);
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
