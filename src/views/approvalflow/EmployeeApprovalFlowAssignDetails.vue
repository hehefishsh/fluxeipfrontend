<template>
  <div
    class="modal fade"
    id="employeeApprovalFlowAssignModal"
    tabindex="-1"
    role="dialog"
    aria-labelledby="employeeApprovalFlowAssignModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">已綁定流程</h5>
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
          <div v-if="employeeApprovalFlowAssign">
            <h5>
              <span class="badge badge-square badge-outline-dark"
                >{{ employeeApprovalFlowAssign.employeeId }}-{{
                  employeeApprovalFlowAssign.employeeName
                }}</span
              >
            </h5>
            <br />
            <div
              v-if="approvalFlows.length > 0"
              class="accordion accordion-shadow"
            >
              <div
                class="card"
                v-for="flow in approvalFlows"
                :key="flow.flowId"
                id="accordionShadow"
              >
                <div class="card-header" :id="'heading' + flow.flowId">
                  <h2 class="mb-0">
                    <button
                      class="btn btn-link collapsed"
                      type="button"
                      data-toggle="collapse"
                      :data-target="'#collapse' + flow.flowId"
                      :aria-expanded="false"
                      :aria-controls="'collapse' + flow.flowId"
                    >
                      【{{ flow.flowId }}】 {{ flow.flowName }}
                    </button>
                  </h2>
                </div>
                <div
                  :id="'collapse' + flow.flowId"
                  class="collapse"
                  :aria-labelledby="'heading' + flow.flowId"
                  data-parent="#accordionShadow"
                >
                  <div class="card-body">
                    <table class="table table-borderless">
                      <thead>
                        <tr>
                          <th>步驟</th>
                          <th>簽核人</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="step in approvalSteps.filter(
                            (s) => s.flowId === flow.flowId
                          )"
                          :key="step.stepOrder"
                        >
                          <td>{{ step.stepOrder }}</td>
                          <td>{{ step.approverPosition }}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div class="d-flex justify-content-end mt-2">
                      <button
                        class="btn btn-danger btn-sm"
                        @click="deleteApprovalFlow(flow.id)"
                      >
                        刪除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- 沒有綁定流程時顯示 -->
            <div v-else class="text-center text-muted">
              <p>該員工尚未綁定任何簽核流程</p>
            </div>
          </div>
          <div v-else>
            <p>正在加載簽核詳情...</p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-dark" data-dismiss="modal">
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
import Swal from "sweetalert2";

const props = defineProps({
  employeeApprovalFlowAssign: Object,
});

const approvalFlows = ref([]);
const approvalSteps = ref([]);

const fetchApprovalFlows = async () => {
  if (!props.employeeApprovalFlowAssign) return;
  try {
    const response = await axiosapi.get(
      `/api/employee-approval-flows/${props.employeeApprovalFlowAssign.employeeId}`
    );
    console.log("???");
    approvalFlows.value = response.data;
  } catch (error) {
    console.error("取得簽核流程失敗", error);
  }
};
const fetchApprovalSteps = async () => {
  approvalSteps.value = []; // 清空舊資料

  if (!approvalFlows.value.length) return; // 確保有資料才執行

  try {
    const steps = await Promise.all(
      approvalFlows.value.map(async (flow) => {
        const response = await axiosapi.get(
          `/api/approval/flow/stepone/${flow.flowId}`
        );
        return response.data.map((step) => ({
          ...step,
          flowId: flow.flowId, // 讓步驟能對應到正確的流程
        }));
      })
    );
    approvalSteps.value = steps.flat();
  } catch (error) {
    console.error("取得簽核步驟失敗", error);
  }
};
// 刪除簽核流程
const deleteApprovalFlow = async (id) => {
  const result = await Swal.fire({
    title: "確定要解綁此簽核流程嗎？",
    text: "解綁後將無法復原！",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "確定刪除",
    cancelButtonText: "取消",
  });

  if (!result.isConfirmed) return; // 如果使用者取消，就不執行刪除

  try {
    console.log("刪除 ID:", id);
    const response = await axiosapi.delete(
      `/api/employee-approval-flows/delete/${id}`
    );

    // 刪除成功
    approvalFlows.value = approvalFlows.value.filter((flow) => flow.id !== id);
    fetchApprovalSteps();

    await Swal.fire({
      title: "刪除成功",
      text: response.data || "該簽核流程已與員工成功解綁",
      icon: "success",
      confirmButtonText: "確定",
    });
  } catch (error) {
    console.error("刪除簽核流程失敗", error);

    await Swal.fire({
      title: "刪除失敗",
      text: error.response.data || "發生錯誤，請稍後再試",
      icon: "error",
      confirmButtonText: "確定",
    });
  }
};
watch(
  () => props.employeeApprovalFlowAssign,
  async (newVal) => {
    if (newVal) {
      await fetchApprovalFlows(); // 先拿流程
      await fetchApprovalSteps(); // 再拿對應的步驟
    }
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
