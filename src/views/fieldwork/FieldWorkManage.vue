<template>
  <div>
    <!-- 查詢外勤記錄資料 -->
    <div class="card card-default" id="field-work-query">
      <div class="card-header"></div>
      <div class="card-body py-0" data-simplebar>
        <!-- 顯示錯誤信息 -->
        <div v-show="error" class="alert alert-danger" role="alert">
          {{ error }}
        </div>

        <div class="d-flex justify-content-between">
          <ul class="nav nav-pills mb-3 justify-content-between" id="pills-tab12" role="tablist">
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'" href="#">全部</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab === 'unrecord' }" @click="activeTab = 'unrecord'"
                href="#">未填寫</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab === 'uncompleted' }" @click="activeTab = 'uncompleted'"
                href="#">更新中</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab === 'completed' }" @click="activeTab = 'completed'"
                href="#">已完成</a>
            </li>
          </ul>
          <div>
            <RouterLink class="btn btn-outline-primary btn-pill ms-auto" to="/">
              返回首頁
            </RouterLink>
          </div>
        </div>

        <!-- 篩選顯示對應的外勤記錄資料 -->
        <div class="tab-content mt-3">
          <div v-if="filteredFieldWorkRecords.length">
            <table class="table table-borderless table-thead-border">
              <thead>
                <tr>
                  <th class="text">Id</th>
                  <th class="text">記錄人</th>
                  <th class="text">外勤日期</th>
                  <th class="text">總時數</th>
                  <th class="text">地點</th>
                  <th class="text">目的</th>
                  <th class="text">狀態</th>
                  <th class="text">其他</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(record, index) in filteredFieldWorkRecords" :key="index">
                  <td>{{ record.recordId }}</td>
                  <td>{{ record.employeeId }}-{{ record.employeeName }}</td>
                  <td class="highlinestar">
                    {{ formatDate(record.fieldWorkDate) }}
                  </td>
                  <td>{{ record.totalHours }}</td>
                  <td>{{ record.location }}</td>
                  <td>{{ record.purpose }}</td>
                  <td>{{ record.status }}</td>
                  <td>
                    <h5>
                      <button v-if="record.status !== '已完成'" class="badge badge-secondary"
                        @click="showUpdateModal(record)" data-toggle="modal" data-target="#fieldWorkUpdateModal">
                        更新
                      </button>
                      <button v-else class="badge badge-info" @click="showDetailModal(record)" data-toggle="modal"
                        data-target="#fieldWorkDetailModal">
                        查看詳情
                      </button>
                    </h5>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else>
            <p class="text-center text-muted">無相關外勤記錄資料</p>
          </div>
        </div>
        <div class="bg-white py-4"></div>
      </div>
    </div>
    <FieldWorkUpdateModal :fieldWorkRecord="selectedFieldWorkRecord" @update:fieldWorkRecord="reloadData" />
    <FieldWorkDetailModal :fieldWorkRecord="selectedFieldWorkRecord" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axiosapi from "@/plugins/axios.js";
import useUserStore from "@/stores/user";
import FieldWorkUpdateModal from "./FieldWorkUpdateModal.vue";
import FieldWorkDetailModal from "./FieldWorkDetailModal.vue";

const user = useUserStore();
const fieldWorkRecordData = ref([]);
const error = ref("");
const activeTab = ref("all");
const selectedFieldWorkRecord = ref(null);

const showUpdateModal = (record) => {
  selectedFieldWorkRecord.value = record;
};
const showDetailModal = (record) => {
  selectedFieldWorkRecord.value = record;
};

// 重新載入數據
const reloadData = async () => {
  selectedFieldWorkRecord.value = null; // 清除選取
  try {
    const response = await axiosapi.get(
      `/api/field-work/employee/${user.empId}`
    );
    fieldWorkRecordData.value = response.data;
  } catch (err) {
    error.value = "無法獲取外勤記錄資料";
  }
};
onMounted(async () => {
  try {
    const response = await axiosapi.get(
      `/api/field-work/employee/${user.empId}`
    );
    fieldWorkRecordData.value = response.data;
  } catch (err) {
    error.value = "無法獲取外勤記錄資料";
  }
});
const filteredFieldWorkRecords = computed(() => {
  if (activeTab.value === "all") return fieldWorkRecordData.value;
  return fieldWorkRecordData.value.filter((record) => {
    switch (activeTab.value) {
      case "unrecord":
        return record.status === "未填寫";
      case "uncompleted":
        return record.status === "更新中";
      case "completed":
        return record.status === "已完成";
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

  return `${year}年${month}月${day}日 (${weekDay})`;
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
