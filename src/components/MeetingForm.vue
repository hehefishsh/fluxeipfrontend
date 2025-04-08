<template>
  <div>
    <!-- 狀態標籤切換 -->
    <el-tabs :model-value="props.selectedStatus" @tab-click="onStatusChange">
      <el-tab-pane label="所有預約" name="all" />
      <el-tab-pane label="審核中" name="審核中" />
      <el-tab-pane label="已審核" name="已審核" />
      <el-tab-pane label="未完成" name="未完成" />
    </el-tabs>

    <!-- 表格 -->
    <el-table
      :data="meetings"
      border
      stripe
      style="width: 100%"
      empty-text="無此資料"
      :default-sort="{ prop: 'createdAt', order: 'ascending' }"
      @sort-change="onSortChange"
    >
      <el-table-column prop="createdAt" label="申請時間" width="180" sortable>
        <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column prop="employeeName" label="姓名" width="120" />
      <el-table-column prop="roomName" label="會議室" width="160" />
      <el-table-column prop="title" label="主題" min-width="160" />
      <el-table-column prop="startTime" label="開始時間" width="180" sortable>
        <template #default="{ row }">{{ formatDate(row.startTime) }}</template>
      </el-table-column>
      <el-table-column prop="endTime" label="結束時間" width="180" sortable>
        <template #default="{ row }">{{ formatDate(row.endTime) }}</template>
      </el-table-column>
      <el-table-column prop="statusName" label="狀態" width="120">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.statusName)">
            {{ row.statusName }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="showApprovalColumn" label="審核操作" width="200">
        <template #default="{ row }">
          <el-button type="success" size="small" class="me-2" @click="approve(row.id)">通過</el-button>
          <el-button type="danger" size="small" @click="reject(row.id)">拒絕</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分頁元件插入 -->
    <Pagination
      :current="props.current"  
      :pages="props.pages"
      @update:current="changePage"
    />
  </div>

<!-- 傳入目前頁碼 -->
<!-- 傳入總頁數 -->
<!-- 點了頁數 傳給父元件 -->


</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';
import Swal from 'sweetalert2';
import axios from 'axios';
import Pagination from '@/components/Pagination.vue'; // ✅ 引入你剛封裝的元件

const props = defineProps({
  meetings: Array,
  employeeId: Number,
  selectedStatus: String,
  current: Number,
  pages: Number,
});

const emit = defineEmits(["refresh", "change-status", "change-sort", "change-page"]);

function onStatusChange(tab) {
  emit("change-status", tab.props.name);
}

function onSortChange({ prop, order }) {
  emit("change-sort", { prop, order });
}


//點分頁按鈕時，會把新頁碼傳回父元件
function changePage(page) {
  emit("change-page", page); 
}

const showApprovalColumn = computed(() => {
  return props.employeeId === 1002 && props.selectedStatus === "審核中";
});

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString();
}

function statusTagType(status) {
  switch (status) {
    case "審核中": return "warning";
    case "已審核": return "success";
    case "未完成": return "danger";
    default: return "info";
  }
}

async function approve(meetingId) {
  try {
    await axios.put(`${import.meta.env.VITE_API_URL}/api/meetings/${meetingId}/approve`, null, {
      params: { employeeId: props.employeeId, isApproved: true },
    });
    Swal.fire("成功", "會議已通過審核", "success");
    emit("refresh");
  } catch (error) {
    Swal.fire("錯誤", "審核失敗：" + error.message, "error");
  }
}

async function reject(meetingId) {
  try {
    await axios.put(`${import.meta.env.VITE_API_URL}/api/meetings/${meetingId}/approve`, null, {
      params: { employeeId: props.employeeId, isApproved: false },
    });
    Swal.fire("成功", "會議已被拒絕", "success");
    emit("refresh");
  } catch (error) {
    Swal.fire("錯誤", "拒絕失敗：" + error.message, "error");
  }
}
</script>

