<template>
  <div class="row min-vh-100">
    <div class="col-xl-6">
      <div class="card card-default" id="employee-search" style="height: 78%">
        <div class="card-header">
          <h3><span class="badge badge-outline-primary">查詢員工</span></h3>
        </div>
        <div class="card-body py-0" data-simplebar>
          <!-- 查詢條件 -->

          <label>部門：</label>
          <select v-model="department" class="custom-select my-1 mr-sm-2">
            <option
              v-for="dep in departments"
              :key="dep.id"
              :value="dep.departmentName"
            >
              {{ dep.departmentName }}
            </option>
          </select>

          <label> <font color="red">*</font>職位： </label>
          <select v-model="position" class="custom-select my-1 mr-sm-2">
            <option
              v-for="pos in positions"
              :key="pos.positionId"
              :value="pos.positionName"
            >
              {{ pos.positionName }}
            </option>
          </select>

          <!-- 搜尋按鈕 -->
          <button
            type="button"
            @click="searchEmployees(1)"
            class="submit-button"
          >
            查詢
          </button>

          <!-- 查詢結果 -->
          <div v-if="employees.length > 0">
            <br />
            <h4></h4>
            <ul class="list-group">
              <li
                v-for="employee in employees"
                :key="employee.id"
                class="list-group-item list-group-item-action"
              >
                <div class="media media-sm mb-0">
                  <div class="media-body">
                    <span class="title"
                      >{{ employee.employeeId }}-{{
                        employee.employeeName
                      }}</span
                    >
                    <p>
                      {{ employee.department.departmentName }} -
                      {{ employee.position.positionName }}
                    </p>
                  </div>
                  <div class="align-self-center">
                    <button
                      class="badge badge-info mr-5"
                      @click="showEmployeeModal(employee)"
                      data-toggle="modal"
                      data-target="#employeeApprovalFlowAssignModal"
                    >
                      已綁定流程
                    </button>
                  </div>
                  <div class="custom-control custom-checkbox align-self-center">
                    <input
                      type="checkbox"
                      class="custom-control-input"
                      :id="'customCheck' + employee.employeeId"
                      v-model="selectedEmployees"
                      :value="employee.employeeId"
                    />
                    <label
                      class="custom-control-label"
                      :for="'customCheck' + employee.employeeId"
                    ></label>
                  </div>
                </div>
              </li>
            </ul>
            <br />
          </div>
        </div>

        <!-- Separated Pagination -->
        <div
          class="align-items-center"
          v-if="employees.length > 0 && totalPages > 1"
        >
          <nav aria-label="Page navigation example">
            <ul class="pagination pagination-seperated">
              <li class="page-item" :class="{ disabled: pageNumber <= 1 }">
                <a
                  class="page-link"
                  href="#"
                  @click="searchEmployees(pageNumber - 1)"
                  aria-label="Previous"
                >
                  <span
                    aria-hidden="true"
                    class="mdi mdi-chevron-left mr-1"
                  ></span>
                  上一頁
                  <span class="sr-only">上一頁</span>
                </a>
              </li>

              <!-- 動態生成頁面數量 -->
              <li
                v-for="page in totalPagesArray"
                :key="page"
                class="page-item"
                :class="{ active: pageNumber === page }"
              >
                <a class="page-link" href="#" @click="searchEmployees(page)">
                  {{ page }}
                </a>
              </li>

              <li
                class="page-item"
                :class="{ disabled: pageNumber >= totalPages }"
              >
                <a
                  class="page-link"
                  href="#"
                  @click="searchEmployees(pageNumber + 1)"
                  aria-label="Next"
                >
                  下一頁
                  <span
                    aria-hidden="true"
                    class="mdi mdi-chevron-right ml-1"
                  ></span>
                  <span class="sr-only">下一頁</span>
                </a>
              </li>
            </ul>
          </nav>
          <div class="bg-white py-4"></div>
        </div>
      </div>
    </div>

    <div class="col-xl-6">
      <div class="card card-default" id="employee-search" style="height: 78%">
        <div class="card-header">
          <h3><span class="badge badge-outline-primary">簽核流程</span></h3>
        </div>
        <div class="card-body py-0" data-simplebar v-if="approvalFlows.length">
          <!-- 提交選擇的簽核流程 -->

          <table class="table table-borderless table-thead-border">
            <thead>
              <tr>
                <th class="text">流程 ID</th>
                <th class="text">流程名稱</th>
                <th class="text">請求類型</th>
                <th class="text">適用職位</th>
                <th class="text">其他</th>
                <th class="text">選擇</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(flow, index) in paginatedFlows" :key="index">
                <td class="text">{{ flow.flowId }}</td>
                <td class="text">{{ flow.flowName }}</td>
                <td class="text">{{ flow.requestType }}</td>
                <td class="text">{{ flow.employeePosition }}</td>
                <td>
                  <h6>
                    <button
                      class="badge badge-info"
                      @click="showModal(flow)"
                      data-toggle="modal"
                      data-target="#approvalFlowAssignModal"
                    >
                      查看詳情
                    </button>
                  </h6>
                </td>
                <td class="text">
                  <!-- 只有 stepOrder 為 1 的流程才顯示勾選框 -->
                  <input
                    v-if="flow.stepOrder === 1"
                    type="checkbox"
                    :id="'flowCheck' + flow.flowId"
                    v-model="selectedFlows"
                    :value="flow.flowId"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else>
          <p class="text-center text-muted">無簽核流程資料</p>
        </div>

        <!-- 分頁 -->
        <nav
          aria-label="Page navigation example"
          class="d-flex justify-content-center"
          v-if="approvalFlows.length"
        >
          <ul class="pagination pagination-separated">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a
                class="page-link"
                href="#"
                @click.prevent="changePage(currentPage - 1)"
              >
                <span
                  aria-hidden="true"
                  class="mdi mdi-chevron-left mr-1"
                ></span>
                上一頁
              </a>
            </li>
            <li
              class="page-item"
              v-for="page in visiblePages"
              :key="page"
              :class="{ active: currentPage === page }"
            >
              <a
                v-if="page !== '...'"
                class="page-link"
                href="#"
                @click.prevent="changePage(page)"
              >
                {{ page }}
              </a>
              <span v-else class="page-link">...</span>
            </li>
            <li
              class="page-item"
              :class="{ disabled: currentPage === totalPages }"
            >
              <a
                class="page-link"
                href="#"
                @click.prevent="changePage(currentPage + 1)"
              >
                下一頁
                <span
                  aria-hidden="true"
                  class="mdi mdi-chevron-right ml-1"
                ></span>
              </a>
            </li>
          </ul>
        </nav>
        <div class="bg-white py-4"></div>
      </div>
    </div>
    <div
      v-if="selectedEmployees.length > 0 && selectedFlows.length > 0"
      class="fixed-bottom-right"
    >
      <button type="button" @click="submitEmployeeFlow" class="submit-button2">
        提交選擇的簽核流程
      </button>
    </div>

    <EmployeeApprovalFlowAssignDetails
      :employeeApprovalFlowAssign="selectedEmployeeApprovalFlowAssign"
    />

    <ApprovalFlowAssignDetails
      :approvalFlowAssign="selectedApprovalFlowAssign"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axiosapi from "@/plugins/axios.js";
import Swal from "sweetalert2";
import EmployeeApprovalFlowAssignDetails from "./EmployeeApprovalFlowAssignDetails.vue";
import ApprovalFlowAssignDetails from "./ApprovalFlowAssignDetails.vue";

const department = ref(null);
const position = ref(null);
const status = ref(null);
const pageNumber = ref(1);
const pageSize = ref(5);
const selectedEmployees = ref([]); // 確保選擇的是單一員工
const selectedFlows = ref([]); // 只存 stepOrder === 1 的流程

const departments = ref([]);
const positions = ref([]);
const statuses = ref([
  { id: 1, statusName: "在職" },
  { id: 2, statusName: "離職" },
]);

const employees = ref([]);
const totalPages = ref(1);
const approvalFlows = ref([]);

// 取得部門、職位及簽核流程列表
onMounted(async () => {
  try {
    const departmentResponse = await axiosapi.get("/department/find");
    departments.value = departmentResponse.data;

    const positionResponse = await axiosapi.get("/position/find");
    positions.value = positionResponse.data;

    // const flowResponse = await axiosapi.get("/api/approval/flow/all");
    // approvalFlows.value = flowResponse.data;
  } catch (error) {
    console.error(
      "Error fetching departments, positions, and approval flows:",
      error
    );
  }
});

// 查詢員工
async function searchEmployees(page) {
  // 清空選擇的員工與簽核流程
  selectedEmployees.value = [];
  selectedFlows.value = [];
  try {
    if (!position.value) {
      Swal.fire({
        // title: "Warn!",
        text: "請選擇職位再進行查詢",
        icon: "warning",
        confirmButtonText: "重新查詢",
      });
      return;
    }
    if (page < 1 || page > totalPages.value) return;

    pageNumber.value = page;
    const requestPayload = {
      department: department.value,
      position: position.value,
    };

    // 查詢員工
    const response = await axiosapi.post(
      `/employee/search?page=${pageNumber.value - 1}&size=${pageSize.value}`,
      requestPayload
    );
    // console.log(response.data.content);
    if (!response.data || !response.data.content) {
      Swal.fire({
        title: "錯誤!",
        text: "查無資料",
        icon: "error",
        confirmButtonText: "重新查詢",
      });
      employees.value = []; // 確保查無資料時清空
      approvalFlows.value = []; // 也清空流程
      return;
    }

    employees.value = response.data.content;
    totalPages.value = response.data.totalPages || 1;

    // 重新獲取所有簽核流程，然後根據所選職位篩選
    const flowResponse = await axiosapi.get("/api/approval/flow/stepone/all");
    approvalFlows.value = flowResponse.data.filter(
      (flow) => flow.employeePosition === position.value
    );
  } catch (error) {
    console.error("Error searching employees:", error);
    Swal.fire({
      title: "錯誤!",
      text: error,
      icon: "error",
      confirmButtonText: "重新查詢",
    });
  }
}

// 計算總頁數的數組
const totalPagesArray = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1);
});

const currentPage = ref(1);
const itemsPerPage = 5;
const selectedEmployeeApprovalFlowAssign = ref(null);
const selectedApprovalFlowAssign = ref(null);

const showEmployeeModal = (request) => {
  selectedEmployeeApprovalFlowAssign.value = request;
};
const showModal = (request) => {
  selectedApprovalFlowAssign.value = request;
};

const totalPagess = computed(() =>
  Math.ceil(approvalFlows.value.length / itemsPerPage)
);

const paginatedFlows = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return approvalFlows.value.slice(start, start + itemsPerPage);
});

const visiblePages = computed(() => {
  const pages = [];
  if (totalPagess.value <= 4) {
    for (let i = 1; i <= totalPagess.value; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    if (currentPage.value > 3) pages.push("...");

    let start = Math.max(2, currentPage.value - 1);
    let end = Math.min(totalPagess.value - 1, currentPage.value + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage.value < totalPagess.value - 2) pages.push("...");
    pages.push(totalPagess.value);
  }
  return pages;
});

const changePage = (page) => {
  if (page !== "..." && page >= 1 && page <= totalPagess.value) {
    currentPage.value = page;
  }
};

// 提交員工與簽核流程
async function submitEmployeeFlow() {
  try {
    if (selectedEmployees.value.length === 0) {
      alert("請選擇至少一名員工");
      return;
    }
    if (selectedFlows.value.length === 0) {
      alert("請選擇至少一個簽核流程");
      return;
    }

    // 讓每位員工綁定所有選擇的簽核流程
    const requestData = selectedEmployees.value.flatMap((employeeId) =>
      selectedFlows.value.map((flowId) => ({
        employeeId: employeeId,
        flowId: flowId,
      }))
    );

    const response = await axiosapi.post(
      "/api/employee-approval-flows/create",
      requestData
    );
    Swal.fire({
      title: "成功!",
      text: response.data,
      icon: "success",
      confirmButtonText: "OK",
    }).then(() => {
      window.location.href = "/approvalflow/assign";
    });
  } catch (error) {
    if (error.response && error.response.data) {
      const errorMessage =
        error.response.data || "指派員工自訂簽核流程設置失敗";
      Swal.fire({
        title: "錯誤!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "重新提交",
      });
    } else {
      Swal.fire({
        title: "錯誤!",
        text: "提交綁定時發生未知錯誤",
        icon: "error",
        confirmButtonText: "重新提交",
      });
    }
  }
}
</script>
<style>
.submit-button {
  padding: 10px;
  margin: 5px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background: #9e6de0;
  color: white;
}
.submit-button2 {
  font-size: 1.5rem;
  padding: 10px;
  margin: 5px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background: #fd5190;
  color: white;
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.pagination-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  margin: 0 5px;
  border-radius: 5px;
  cursor: pointer;
}

.pagination-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 16px;
  font-weight: bold;
}

.fixed-bottom-right {
  position: fixed;
  bottom: 8%; /* 調整與下邊緣的距離 */
  right: 1.5%; /* 調整與右邊緣的距離 */
  z-index: 9999; /* 確保在最上層 */
}
</style>
