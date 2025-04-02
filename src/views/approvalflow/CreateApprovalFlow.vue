<template>
  <div class="card card-default" id="leave-request">
    <div class="card-header">
      <h2>設定員工自訂簽核流程</h2>
      <div>
        <button type="button" @click="fillDemoData2" class="mr-3 badge badge-pill badge-info">Demo(加班)</button>
        <button type="button" @click="fillDemoData" class="badge badge-pill badge-info">Demo(補卡)</button>
      </div>

    </div>
    <div class="card-body py-0" data-simplebar>
      <!-- 流程名稱輸入 -->
      <div>
        <h4><span class="badge badge-primary badge-pill">流程名稱</span></h4>
        <input v-model="flowName" type="text" placeholder="請輸入流程名稱" class="form-control" style="margin-top: 10px"
          maxlength="20" />
        <small class="form-text text-muted">最多可輸入 20字。</small>
      </div>

      <!-- 簽核步驟列表 -->
      <div v-for="(step, index) in approvalSteps" :key="index" class="step-group">
        <h3>步驟 {{ index + 1 }}</h3>

        <!-- 申請類型選單（僅第一步可變更） -->
        <label>申請類型：</label>
        <select v-model="selectedCategory" class="custom-select my-1 mr-sm-2" @change="onCategoryChange"
          :disabled="index !== 0">
          <option v-for="cat in applicationCategories" :key="cat.value" :value="cat.value">
            {{ cat.label }}
          </option>
        </select>

        <!-- 請求類型選單（根據所選申請類型取得的） -->
        <label>請求類型：</label>
        <select v-model="step.requestTypeId" class="custom-select my-1 mr-sm-2"
          :disabled="!requestTypes.length || index !== 0">
          <option v-for="type in requestTypes" :key="type.id" :value="type.id">
            {{ type.typeName }}
          </option>
        </select>

        <!-- 員工職位（第一步固定） -->
        <label>員工職位：</label>
        <select v-model="step.employeePositionId" class="custom-select my-1 mr-sm-2" :disabled="index !== 0">
          <option v-for="position in positions" :key="position.positionId" :value="position.positionId">
            {{ position.positionName }}
          </option>
        </select>

        <!-- 簽核人職位（依照條件過濾） -->
        <label>簽核人職位：</label>
        <select v-model="step.approverPositionId" class="custom-select my-1 mr-sm-2"
          @change="handleApproverChange(index)">
          <option v-for="position in getAvailableApproverPositions(index)" :key="position.positionId"
            :value="position.positionId">
            {{ position.positionName }}
          </option>
        </select>

        <button type="button" @click="removeStep(index)" class="delete-button" v-if="index !== 0">
          刪除步驟
        </button>
      </div>

      <!-- 新增步驟按鈕 -->
      <button type="button" @click="addStep" class="add-button">
        新增步驟
      </button>
      <button type="submit" @click="submitForm" class="submit-button">
        提交
      </button>
    </div>
    <div class="bg-white py-4"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import axiosapi from "@/plugins/axios.js";
import Swal from "sweetalert2";

const flowName = ref("");
// 初始僅有一個步驟，其他步驟會繼承第一步的設定
const approvalSteps = ref([
  { requestTypeId: "", employeePositionId: "", approverPositionId: "" },
]);

// 申請類型選單固定資料
const applicationCategories = ref([
  { value: "leave_type", label: "請假" },
  { value: "work_adjustment_type", label: "加減班" },
  { value: "clock_type", label: "補卡" },
  { value: "expense_type", label: "費用" },
]);

// 選擇的申請類型（僅第一步可修改），預設請假
const selectedCategory = ref("leave_type");

// 後端取得的請求類型，根據所選申請類型取得
const requestTypes = ref([]);

// 取得所有職位，需包含 positionId 與 level 屬性（level：數值越小代表職位越高）
const positions = ref([]);

// 取得請求類型資料（根據 selectedCategory）
const fetchRequestTypes = async () => {
  try {
    const response = await axiosapi.get(
      `/api/types/category/${selectedCategory.value}`
    );
    if (selectedCategory.value === "clock_type") {
      requestTypes.value = response.data.filter(
        (item) => item.typeName !== "外出打卡" && item.typeName !== "外出結束"
      );
    } else {
      requestTypes.value = response.data;
    }
  } catch (error) {
    console.error("Error fetching request types:", error);
  }
};

onMounted(async () => {
  await fetchRequestTypes();
  try {
    const positionResponse = await axiosapi.get("/position/find");
    positions.value = positionResponse.data;
  } catch (error) {
    console.error("Error fetching positions:", error);
  }
});

// 當第一步驟的請求類型或員工職位改變時，自動更新後續步驟
watch(
  () => [
    approvalSteps.value[0].requestTypeId,
    approvalSteps.value[0].employeePositionId,
  ],
  ([newRequestTypeId, newEmployeePositionId]) => {
    for (let i = 1; i < approvalSteps.value.length; i++) {
      approvalSteps.value[i].requestTypeId = newRequestTypeId;
      approvalSteps.value[i].employeePositionId = newEmployeePositionId;
    }
  }
);

// 當申請類型改變時，更新請求類型並清空第一步的請求類型選擇
const onCategoryChange = async () => {
  await fetchRequestTypes();
  approvalSteps.value[0].requestTypeId = "";
};

// 新增步驟：若最後一步的簽核人職位已選擇老闆（positionId === 1），則不允許新增
function addStep() {
  const lastStep = approvalSteps.value[approvalSteps.value.length - 1];
  if (
    lastStep.approverPositionId &&
    parseInt(lastStep.approverPositionId) === 1
  ) {
    Swal.fire({
      title: "警告",
      text: "已選擇老闆作為簽核人，無法新增後續步驟！",
      icon: "warning",
      confirmButtonText: "確定",
    });
    return;
  }
  const firstStep = approvalSteps.value[0];
  approvalSteps.value.push({
    requestTypeId: firstStep.requestTypeId,
    employeePositionId: firstStep.employeePositionId,
    approverPositionId: "",
  });
}

// 刪除步驟
function removeStep(index) {
  approvalSteps.value.splice(index, 1);
}

// 當某個步驟的簽核人選擇改變時，檢查後續步驟是否符合條件
function handleApproverChange(stepIndex) {
  // 取得目前步驟的選擇
  const currentStep = approvalSteps.value[stepIndex];
  if (!currentStep.approverPositionId) return;
  const currentApprover = parseInt(currentStep.approverPositionId);
  // 若第一步變為老闆，則刪除所有後續步驟
  if (stepIndex === 0 && currentApprover === 1) {
    approvalSteps.value = approvalSteps.value.slice(0, 1);
    return;
  }
  // 從當前步驟的下一個步驟開始，檢查每一個步驟的簽核人職位是否符合要求
  let lastValid = currentApprover;
  let newSteps = approvalSteps.value.slice(0, stepIndex + 1);
  for (let i = stepIndex + 1; i < approvalSteps.value.length; i++) {
    const step = approvalSteps.value[i];
    if (step.approverPositionId) {
      const stepApprover = parseInt(step.approverPositionId);
      // 條件：必須比前一個有效簽核人的 positionId 還要小（數值較低表示更高職位）
      if (stepApprover < lastValid) {
        newSteps.push(step);
        lastValid = stepApprover;
      } else {
        // 若不符合條件則自動捨棄該步驟（不加入 newSteps）
      }
    } else {
      // 若尚未選擇，仍保留
      newSteps.push(step);
    }
  }
  approvalSteps.value = newSteps;
}

// 取得可用的簽核人職位：根據第一步的員工職位或前一步的簽核人選項來過濾
function getAvailableApproverPositions(stepIndex) {
  if (!approvalSteps.value[0].employeePositionId) return [];
  const empPosId = parseInt(approvalSteps.value[0].employeePositionId);
  if (stepIndex === 0) {
    return positions.value.filter((p) => parseInt(p.positionId) < empPosId);
  } else {
    const prevStep = approvalSteps.value[stepIndex - 1];
    if (prevStep.approverPositionId) {
      const prevApprover = parseInt(prevStep.approverPositionId);
      return positions.value.filter(
        (p) => parseInt(p.positionId) < prevApprover
      );
    } else {
      return positions.value.filter((p) => parseInt(p.positionId) < empPosId);
    }
  }
}

// Demo 流程填入
function fillDemoData() {
  flowName.value = "趙六補卡申請流程";
}

function fillDemoData2() {
  flowName.value = "趙六加班申請流程";
}

// 送出表單
async function submitForm() {
  const payload = approvalSteps.value.map((step, index) => ({
    flowName: flowName.value,
    requestTypeId: step.requestTypeId,
    employeePositionId: step.employeePositionId,
    stepOrder: index + 1,
    approverPositionId: step.approverPositionId,
  }));

  try {
    const response = await axiosapi.post(
      `/api/approval/create/approval-flows`,
      payload
    );
    Swal.fire({
      title: "成功!",
      text: response.data,
      icon: "success",
      confirmButtonText: "OK",
    }).then(() => {
      window.location.href = "/approvalflow/create";
    });
  } catch (error) {
    const errorMessage =
      error.response && error.response.data
        ? error.response.data
        : "提交簽核流程時發生未知錯誤";
    Swal.fire({
      title: "錯誤!",
      text: errorMessage,
      icon: "error",
      confirmButtonText: "重新提交",
    });
  }
}
</script>

<style scoped>
.form-container {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  background: #fff;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.input-field,
.custom-select-field {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-bottom: 10px;
}

.step-group {
  border: 1px solid #ddd;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
}

.add-button,
.submit-button,
.delete-button {
  padding: 10px;
  margin: 5px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.add-button {
  background: #4caf50;
  color: white;
}

.submit-button {
  background: #008cba;
  color: white;
}

.delete-button {
  background: #f44336;
  color: white;
}
</style>
