<template>
  <div class="container mt-4">
    <div v-for="meeting in approvedMeetings" :key="meeting.id" class="card mb-4 shadow-sm">
      <div class="card-body">
        <h5 class="card-title">{{ meeting.title }}</h5>
        <p class="card-text">
          <strong>主辦人：</strong> {{ meeting.employeeName }}<br />
          <strong>會議室：</strong> {{ meeting.roomName }}<br />
          <strong>開始：</strong> {{ formatDate(meeting.startTime) }}<br />
          <strong>結束：</strong> {{ formatDate(meeting.endTime) }}<br />
        </p>

        <!-- 附件區塊 -->
        <ul v-if="meeting.files && meeting.files.length" class="file-list">
  <li v-for="file in meeting.files" :key="file.id" class="file-item">
    <div class="file-info">
      <a :href="`/${file.filesPath}`" target="_blank" download class="file-link">
        {{ file.filesName }}
      </a>
      <small class="text-muted ms-2"></small>
    </div>
    <button
      v-if="meeting.employeeId === userStore.empId"
      class="close-btn"
      @click="deleteFile(file.id)"
      title="刪除檔案"
    ></button>
  </li>
</ul>

<div class="btn-group-spaced" v-if="meeting.employeeId === userStore.empId">
  <!-- 上傳檔案 -->
  <label class="btn btn-outline-dark btn-sm mb-0">
    上傳檔案
    <input type="file" :ref="el => fileInputRefs[meeting.id] = el" @change="e => handleFileUpload(e, meeting.id)" hidden />
  </label>

  <!-- 選擇與會人員 -->
  <button class="btn btn-outline-primary btn-sm" v-if="meeting.statusName === '已審核'" @click="selectAttendees(meeting)">
    選擇與會人員
  </button>

  <!-- 查看與會者 -->
  <button class="btn btn-outline-secondary btn-sm" v-if="meeting.attendees && meeting.attendees.length" @click="openViewer(meeting)">
    查看與會者
  </button>
</div>
        <!-- Modal: 選擇與會人員 -->
        <AttendeeModal
          :isOpen="isAttendeeModalOpen"
          :meeting="selectedMeeting"
          @close="isAttendeeModalOpen = false"
          @saved="handleAttendeesSaved"
        />

        <!-- Modal: 查看與會者狀態 -->
        <AttendeeView
          :isOpen="isViewerOpen"
          :attendees="viewerAttendees"
          @close="isViewerOpen = false"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import useUserStore from '@/stores/user';
import AttendeeModal from '@/components/AttendeeModal.vue';
import AttendeeView from '@/components/AttendeeView.vue'; //  查看與會者對話框元件

const path = import.meta.env.VITE_API_URL;
const userStore = useUserStore();

const allMeetings = ref([]);
const isAttendeeModalOpen = ref(false);
const selectedMeeting = ref(null);

const approvedMeetings = computed(() => {
  return allMeetings.value
    .filter(m => m.statusName === '已審核')
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
});

const isViewerOpen = ref(false);        //  控制 AttendeeView 的顯示
const viewerAttendees = ref([]);        //  儲存目前會議的與會者清單
const fileInputRefs = {}; 

onMounted(fetchMeetings);

async function fetchMeetings() {
  try {
    const res = await axios.get(`${path}/api/meetings/user/${userStore.empId}`);
    allMeetings.value = res.data || [];

    for (const meeting of allMeetings.value) {
      const [fileRes, attendeeRes] = await Promise.all([
        axios.get(`${path}/api/meetings/${meeting.id}/files`),
        axios.get(`${path}/api/meetings/${meeting.id}/attendees`)
      ]);

      meeting.files = fileRes.data || [];
      meeting.attendees = attendeeRes.data || [];
      meeting.showAttendees = false;
    }
  } catch (err) {
    console.error('載入失敗', err);
    Swal.fire('錯誤', '無法載入主辦會議', 'error');
  }
}

// 上傳檔案
async function handleFileUpload(event, meetingId) {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('uploaderId', userStore.empId);

  try {
    await axios.post(`${path}/api/meetings/${meetingId}/files`, formData);
    Swal.fire('成功', '檔案上傳成功！', 'success');
    fetchMeetings();
  } catch (err) {
    Swal.fire('錯誤', '上傳失敗：' + err.message, 'error');
  } finally {
    //  清空 input 的值，讓相同檔案可以重新觸發 change
    if (fileInputRefs[meetingId]) {
      fileInputRefs[meetingId].value = '';
    }
  }
}

// 刪除檔案
async function deleteFile(fileId) {
  const confirm = await Swal.fire({
    title: '確定要刪除這個檔案嗎？',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '刪除',
    cancelButtonText: '取消'
  });

  if (!confirm.isConfirmed) return;

  try {
    await axios.delete(`${path}/api/meetings/files/${fileId}`, {
      params: { requesterId: userStore.empId }
    });
    Swal.fire('已刪除', '檔案已成功刪除', 'success');
    fetchMeetings();
  } catch (err) {
    Swal.fire('錯誤', '刪除失敗：' + err.message, 'error');
  }
}

//  開啟與會者狀態檢視
function openViewer(meeting) {
  viewerAttendees.value = meeting.attendees || [];
  isViewerOpen.value = true;
}

//  開啟與會人員選擇 modal
function selectAttendees(meeting) {
  selectedMeeting.value = meeting;
  isAttendeeModalOpen.value = true;
}

function handleAttendeesSaved() {
  Swal.fire('成功', '已選擇與會人員！', 'success');
  fetchMeetings();
}

function statusClass(status) {
  switch (status) {
    case '已審核': return 'text-success';
    case '審核中': return 'text-warning';
    case '未核准': return 'text-danger';
    default: return 'text-secondary';
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString();
}
</script>

<style scoped>
.card-title {
  font-size: 1.25rem;
  font-weight: bold;
}

.card-text {
  line-height: 1.8;
}

.card-body {
  background-color: #fefefe;
  border-radius: 12px;
  padding: 1.5rem;
}

.file-list {
  list-style: none;
  padding-left: 0;
  margin-top: 0.5rem;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 8px;
  transition: background-color 0.2s ease;
}

.file-item:hover {
  background-color: #eef1f7;
}

.file-link {
  color: #9e6de0;
  text-decoration: none;
  font-weight: 500;
}

.file-link:hover {
  text-decoration: underline;
}

/* 刪除檔案按鈕（叉叉） */
.close-btn {
  position: relative;
  width: 20px;
  height: 20px;
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 10px;
}

.close-btn::before,
.close-btn::after {
  content: "";
  position: absolute;
  top: 9px;
  left: 3px;
  width: 14px;
  height: 2px;
  background-color: #666;
}

.close-btn::before {
  transform: rotate(45deg);
}

.close-btn::after {
  transform: rotate(-45deg);
}

.close-btn:hover::before,
.close-btn:hover::after {
  background-color: #333;
}

/* 按鈕通用樣式 */
.btn {
  border-radius: 20px;
  font-weight: 500;
  padding: 6px 16px;
  transition: all 0.3s ease;
}

.btn-sm {
  font-size: 0.875rem;
}

/* 上傳檔案按鈕 */
.btn-outline-dark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 38px;
  line-height: 1;
}

.btn-outline-dark:hover {
  background-color: #555;
  color: #fff;
}

/* 選擇與會人員按鈕 */
.btn-outline-primary {
  border: 1px solid #9e6de0;
  color: #9e6de0;
}

.btn-outline-primary:hover {
  background-color: #9e6de0;
  color: #fff;
}

/* 查看與會者按鈕 */
.btn-outline-secondary {
  border: 1px solid #FD5190;
  color: #FD5190;
}

.btn-outline-secondary:hover {
  background-color: #FD5190;
  color: #fff;
}

/* 控制按鈕間距 */
.btn-group-spaced {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  align-items: center;
  margin-top: 1rem;
}
</style>
