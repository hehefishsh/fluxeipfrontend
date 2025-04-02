<template>
  <div>
    <MeetingForm
      :meetings="paginatedMeetings"
      :employeeId="Number(userStore.empId)"
      :selectedStatus="selectedStatus"
      :current="currentPageForStatus"
      :pages="pagesForStatus"
      @refresh="refreshMeetings"
      @change-status="handleStatusChange" 
      @change-sort="handleSortChange"
      @change-page="handlePageChange"
    />
  </div>

<!-- current 第幾頁 -->
<!-- pages 總共幾頁 -->
<!-- change-page 用來接受子元件頁碼點擊 -->

</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import useUserStore from '@/stores/user';
import MeetingForm from '@/components/MeetingForm.vue';

const userStore = useUserStore();
const path = import.meta.env.VITE_API_URL;

const allMeetings = ref([]);
const selectedStatus = ref('all');
const sortInfo = ref({ prop: 'createdAt', order: 'ascending' });
const itemsPerPage = 10;

// 分頁狀態（記錄目前頁碼 & 總頁數）
const current = ref({ all: 1, 審核中: 1, 已審核: 1, 未核准: 1 });
const pages = ref({ all: 0, 審核中: 0, 已審核: 0, 未核准: 0 });

//用 computed 包裝 current / pages，確保 reactive
const currentPageForStatus = computed(() => current.value[selectedStatus.value]);
const pagesForStatus = computed(() => pages.value[selectedStatus.value]);

onMounted(callFind);

async function callFind() {
  try {
    const userRole = userStore.roleName;
    const userId = userStore.empId;
    const res = ["最高管理員", "次等管理員"].includes(userRole)
      ? await axios.get(`${path}/api/meetings`)
      : await axios.get(`${path}/api/meetings/user/${userId}`);
    allMeetings.value = res.data || [];
    calculatePages();
  } catch (error) {
    console.error("讀取失敗", error);
  }
}

function refreshMeetings() {
  callFind();
}

function handleStatusChange(newStatus) {
  selectedStatus.value = newStatus;
  current.value[newStatus] = 1; // 切換狀態時回到第一頁
}

function handleSortChange({ prop, order }) {
  sortInfo.value = { prop, order };
}

function handlePageChange(page) {
  current.value[selectedStatus.value] = page;
}

// 篩選 + 排序
const filteredAndSorted = computed(() => {
  const status = selectedStatus.value;
  let filtered = status === 'all'
    ? allMeetings.value
    : allMeetings.value.filter(m => m.statusName === status);

  const { prop, order } = sortInfo.value;
  if (prop && order) {
    filtered = [...filtered].sort((a, b) => {
      const valA = a[prop];
      const valB = b[prop];
      if (valA == null || valB == null) return 0;
      return order === 'ascending'
        ? valA > valB ? 1 : -1
        : valA < valB ? 1 : -1;
    });
  }

  return filtered;
});

// 分頁資料
const paginatedMeetings = computed(() => {
  const currentStatus = selectedStatus.value;
  const currentPage = current.value[currentStatus];
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredAndSorted.value.slice(startIndex, endIndex);
});

// 計算各狀態的總頁數
function calculatePages() {
  const statusOptions = ['all', '審核中', '已審核', '未核准'];

  statusOptions.forEach(status => {
    const meetingsForStatus =
      status === 'all'
        ? allMeetings.value
        : allMeetings.value.filter(m => m.statusName === status);
    const totalPages = Math.ceil(meetingsForStatus.length / itemsPerPage);
    pages.value[status] = totalPages;
  });
}
</script>

<style scoped>
/* 這裡可以補上自訂樣式 */
</style>
