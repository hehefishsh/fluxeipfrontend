<template>
  <div
    class="modal fade"
    id="approvalFlowAssignModal"
    tabindex="-1"
    role="dialog"
    aria-labelledby="approvalFlowAssignModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">簽核流程詳情</h5>
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
          <div v-if="approvalFlowAssign">
            <table class="table table-borderless">
              <tbody>
                <tr>
                  <td>流程Id</td>
                  <td>{{ approvalFlowAssign.flowId }}</td>
                </tr>
                <tr>
                  <td>流程名稱</td>
                  <td>{{ approvalFlowAssign.flowName }}</td>
                </tr>
                <tr></tr>
                <tr>
                  <td>適用職位</td>
                  <td>{{ approvalFlowAssign.employeePosition }}</td>
                </tr>
              </tbody>
            </table>

            <div>
              <h5><span class="badge badge-secondary">簽核步驟</span></h5>
            </div>

            <table class="table table-borderless">
              <thead>
                <tr>
                  <th>步驟</th>
                  <th>簽核人</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="flow in approvalFlows" :key="flow.flowId">
                  <td>{{ flow.stepOrder }}</td>
                  <td>{{ flow.approverPosition }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else>
            <p>正在加載簽核詳情...</p>
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
  approvalFlowAssign: Object,
});

const approvalFlows = ref([]);

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

const fetchApprovalSteps = async () => {
  if (!props.approvalFlowAssign) return;
  try {
    const response = await axiosapi.get(
      `/api/approval/flow/stepone/${props.approvalFlowAssign.flowId}`
    );
    console.log(props.approvalFlowAssign.flowId);
    approvalFlows.value = response.data;
  } catch (error) {
    console.error("取得簽核步驟失敗", error);
  }
};

watch(
  () => props.approvalFlowAssign,
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
