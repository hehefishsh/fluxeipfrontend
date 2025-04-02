<template>
  <div>
    <div class="card card-default" id="approval-flow-management">
      <div class="card-header">
        <h2>簽核流程管理</h2>
      </div>
      <div class="card-body py-0" data-simplebar>
        <div class="row mb-3 align-items-center">
          <!-- 搜尋輸入框 -->
          <div class="col-md-3">
            <label class="form-label">流程名稱</label>
            <input
              v-model="searchQuery"
              @input="fetchApprovalFlows"
              class="form-control"
              placeholder="搜尋流程名稱..."
            />
          </div>

          <!-- 申請類型 -->
          <div class="col-md-2">
            <label class="form-label">申請類型</label>
            <select
              v-model="selectedCategory"
              @change="handleCategoryChange"
              class="form-control"
            >
              <option value="">全部</option>
              <option
                v-for="category in applicationCategories"
                :key="category.value"
                :value="category.value"
              >
                {{ category.label }}
              </option>
            </select>
          </div>

          <!-- 請求類型 (保持固定位置) -->
          <div
            class="col-md-4 request-type-container"
            :class="{ 'd-none': false }"
            :style="
              selectedCategory
                ? ''
                : 'visibility: hidden; height: 0; opacity: 0; overflow: hidden;'
            "
          >
            <label class="form-label">請求類型</label>
            <select
              v-model="selectedRequestType"
              @change="fetchApprovalFlows"
              class="form-control"
            >
              <option v-if="requestTypes.length === 0" disabled value="">
                無可用請求類型
              </option>
              <option
                v-for="type in requestTypes"
                :key="type.typeId"
                :value="type.typeName"
              >
                {{ type.typeName }}
              </option>
            </select>
          </div>

          <!-- 適用職位 -->
          <div class="col-md-3">
            <label class="form-label">適用職位</label>
            <select
              v-model="selectedPosition"
              @change="fetchApprovalFlows"
              class="form-control"
            >
              <option value="">全部</option>
              <option
                v-for="position in positions"
                :key="position.positionId"
                :value="position.positionName"
              >
                {{ position.positionName }}
              </option>
            </select>
          </div>
        </div>

        <!-- 每頁顯示筆數放在右上角，變小 -->
        <div class="d-flex justify-content-end align-items-center mb-2">
          <label class="mr-2 text-muted mb-0">每頁顯示：</label>
          <select
            v-model="itemsPerPage"
            class="form-control form-control-sm w-auto"
          >
            <option :value="5">5 筆</option>
            <option :value="10">10 筆</option>
            <option :value="20">20 筆</option>
          </select>
        </div>

        <!-- 簽核流程列表 -->
        <div v-if="approvalFlows.length">
          <table class="table table-borderless table-thead-border">
            <thead>
              <tr>
                <th>流程 ID</th>
                <th>流程名稱</th>
                <th>請求類型</th>
                <th>適用職位</th>
                <th>其他</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(flow, index) in approvalFlows" :key="index">
                <td>{{ flow.flowId }}</td>
                <td>{{ flow.flowName }}</td>
                <td>{{ flow.requestType }}</td>
                <td>{{ flow.employeePosition }}</td>
                <td>
                  <button
                    class="badge badge-info"
                    @click="showModal(flow)"
                    data-toggle="modal"
                    data-target="#approvalFlowManageModal"
                  >
                    查看詳情
                  </button>
                </td>
                <td>
                  <button
                    v-if="flow.stepOrder === 1"
                    class="badge badge-danger"
                    @click="deleteFlow(flow.flowId)"
                  >
                    刪除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center text-muted">無簽核流程資料</div>
        <br />
      </div>

      <!-- 分頁控制 (簡化顯示) -->
      <nav class="d-flex justify-content-center">
        <ul class="pagination pagination-separated">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a
              class="page-link"
              href="#"
              @click.prevent="changePage(currentPage - 1)"
              >前一頁</a
            >
          </li>

          <li class="page-item" v-if="currentPage > 2">
            <a class="page-link" href="#" @click.prevent="changePage(1)">1</a>
          </li>

          <li class="page-item disabled" v-if="currentPage > 3">
            <span class="page-link">...</span>
          </li>

          <li
            class="page-item"
            v-for="page in visiblePages"
            :key="page"
            :class="{ active: currentPage === page }"
          >
            <a class="page-link" href="#" @click.prevent="changePage(page)">{{
              page
            }}</a>
          </li>

          <li class="page-item disabled" v-if="currentPage < totalPages - 2">
            <span class="page-link">...</span>
          </li>

          <li class="page-item" v-if="currentPage < totalPages - 1">
            <a
              class="page-link"
              href="#"
              @click.prevent="changePage(totalPages)"
              >{{ totalPages }}</a
            >
          </li>

          <li
            class="page-item"
            :class="{ disabled: currentPage === totalPages }"
          >
            <a
              class="page-link"
              href="#"
              @click.prevent="changePage(currentPage + 1)"
              >後一頁</a
            >
          </li>
        </ul>
      </nav>
      <div class="bg-white py-4"></div>
    </div>
    <ApprovalFlowManageDetails
      :approvalFlowManage="selectedApprovalFlowManage"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
import axiosapi from "@/plugins/axios";
import debounce from "lodash/debounce";
import Swal from "sweetalert2";
import ApprovalFlowManageDetails from "./ApprovalFlowManageDetails.vue";

const approvalFlows = ref([]);
const searchQuery = ref("");
const selectedCategory = ref("");
const requestTypes = ref([]);
const selectedRequestType = ref("");
const positions = ref([]);
const selectedPosition = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalPages = ref(1);
const selectedApprovalFlowManage = ref(null);
const visiblePages = computed(() => {
  const range = [];
  const left = Math.max(1, currentPage.value - 1);
  const right = Math.min(totalPages.value, currentPage.value + 1);

  for (let i = left; i <= right; i++) {
    range.push(i);
  }
  return range;
});
// 顯示彈窗
const showModal = (request) => {
  selectedApprovalFlowManage.value = request;
};

const handleCategoryChange = async () => {
  if (!selectedCategory.value) {
    selectedRequestType.value = ""; // 清空請求類型
    requestTypes.value = []; // 清空請求類型列表
    fetchApprovalFlows(); // **確保清空後，重新查詢流程**
    return;
  }

  await fetchRequestTypes();

  if (requestTypes.value.length > 0) {
    selectedRequestType.value = requestTypes.value[0].typeName; // 預設選第一個請求類型
  } else {
    selectedRequestType.value = "";
  }

  fetchApprovalFlows(); // **執行流程查詢**
};

const applicationCategories = ref([
  { value: "leave_type", label: "請假" },
  { value: "work_adjustment_type", label: "加減班" },
  { value: "clock_type", label: "補卡" },
  { value: "expense_type", label: "費用" },
]);

// 請求類型變更時獲取請求類型
const fetchRequestTypes = async () => {
  if (!selectedCategory.value) return;
  const response = await axiosapi.get(
    `/api/types/category/${selectedCategory.value}`
  );
  requestTypes.value = response.data;
  fetchApprovalFlows(); // 獲取新類型後，重新查詢流程
};

// **使用 debounce 限制輸入過快時的請求**
const debouncedFetchApprovalFlows = debounce(() => {
  fetchApprovalFlows();
}, 500);

// **獲取簽核流程**
const fetchApprovalFlows = async () => {
  console.log("查詢參數：", {
    page: currentPage.value,
    size: itemsPerPage.value,
    search: searchQuery.value || null,
    position: selectedPosition.value || null,
    requestType: selectedRequestType.value || null,
  });

  try {
    const response = await axiosapi.get("/api/approval/flow/stepone", {
      params: {
        page: currentPage.value,
        size: itemsPerPage.value,
        search: searchQuery.value || null,
        position: selectedPosition.value || null,
        requestType: selectedRequestType.value || null,
      },
    });
    approvalFlows.value = response.data.content;
    console.log(approvalFlows.value);
    totalPages.value = response.data.totalPages; // 設置總頁數
  } catch (error) {
    console.error("獲取簽核流程失敗", error);
  }
};

// **刪除流程**
const deleteFlow = async (flowId) => {
  Swal.fire({
    title: "確定要刪除此簽核流程嗎？",
    text: "此操作無法復原！",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "是，刪除！",
    cancelButtonText: "取消",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axiosapi.delete(`/api/approval/delete/approval-flows/${flowId}`);
        approvalFlows.value = approvalFlows.value.filter(
          (flow) => flow.flowId !== flowId
        );

        Swal.fire({
          title: "刪除成功！",
          text: "該簽核流程已被刪除。",
          icon: "success",
          timer: 3000,
          showConfirmButton: false,
        }).then(() => fetchApprovalFlows()); // 刪除後刷新列表
      } catch (err) {
        Swal.fire({
          title: "刪除失敗！",
          text: err.response.data,
          icon: "error",
          confirmButtonText: "確定",
        });
      }
    }
  });
};

// **監聽搜尋條件變更**
watch(searchQuery, () => debouncedFetchApprovalFlows());
watch(selectedRequestType, fetchApprovalFlows);
watch(selectedPosition, fetchApprovalFlows);
watch(itemsPerPage, () => {
  currentPage.value = 1; // 重新選擇每頁數量時，回到第一頁
  fetchApprovalFlows();
});

// **切換頁面**
const changePage = (newPage) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    currentPage.value = newPage;
    fetchApprovalFlows();
  }
};

// **初始化請求**
onMounted(async () => {
  fetchApprovalFlows();
  const positionResponse = await axiosapi.get("/position/find");
  positions.value = positionResponse.data;
});
</script>
