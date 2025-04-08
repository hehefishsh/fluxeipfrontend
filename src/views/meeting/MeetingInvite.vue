<template>
    <div class="container mt-4">
      <el-table :data="meetings" stripe border style="width: 100%" v-loading="loading">
        <el-table-column prop="meetingTitle" label="主題" width="120" />
        <el-table-column prop="meetingHostName" label="主辦人" width="100" />
        <el-table-column prop="meetingRoomName" label="會議室" />
  
        <el-table-column label="日期" width="120">
          <template #default="{ row }">
            {{ formatDateOnly(row.meetingStartTime) }}
          </template>
        </el-table-column>
  
        <el-table-column label="時間">
          <template #default="{ row }">
            {{ formatTimeRange(row.meetingStartTime, row.meetingEndTime) }}
          </template>
        </el-table-column>
  
        <el-table-column label="附件">
          <template #default="{ row }">
            <ul v-if="row.files && row.files.length">
              <li v-for="file in row.files" :key="file.id">
                <a :href="`/${file.filesPath}`" target="_blank">{{ file.filesName }}</a>
              </li>
            </ul>
            <span v-else class="text-muted">無附件</span>
          </template>
        </el-table-column>
  
        <el-table-column label="回覆狀態">
          <template #default="{ row }">
            <span :class="replyClass(row.isAttending)">{{ replyText(row.isAttending) }}</span>
          </template>
        </el-table-column>
  
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button size="small" type="success" @click="respond(row.attendeeId, true)" :disabled="row.isAttending === true">
            參加
            </el-button>
            <el-button size="small" type="danger" @click="respond(row.attendeeId, false)" :disabled="row.isAttending === false">
              不參加
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import Swal from 'sweetalert2';
  import useUserStore from '@/stores/user';
  
  const path = import.meta.env.VITE_API_URL;
  const userStore = useUserStore();
  const meetings = ref([]);
  const loading = ref(false);
  
  onMounted(() => {
    loadInvitedMeetings();
  });
  
  async function loadInvitedMeetings() {
    loading.value = true;
    try {
      const res = await axios.get(`${path}/api/meetings/attendees/${userStore.empId}`);
      meetings.value = res.data || [];
  
      for (const meeting of meetings.value) {
        const fileRes = await axios.get(`${path}/api/meetings/${meeting.meetingId}/files`);
        meeting.files = fileRes.data || [];
      }
    } catch (err) {
      console.error('載入失敗', err);
      Swal.fire('錯誤', '無法載入邀請會議', 'error');
    } finally {
      loading.value = false;
    }
  }
  
  function formatDateOnly(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('zh-TW');
  }
  
  function formatTimeRange(start, end) {
    const s = new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const e = new Date(end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${s} ~ ${e}`;
  }
  
  function replyText(status) {
    if (status === true) return '✅ 參加';
    if (status === false) return '❌ 不參加';
    return '尚未回覆';
  }
  
  function replyClass(status) {
    if (status === true) return 'text-success';
    if (status === false) return 'text-danger';
    return 'text-warning';
  }
  
  async function respond(attendeeId, accept) {
    try {
      await axios.put(`${path}/api/meetings/attendees/${attendeeId}/response`, null, {
        params: {
          accept,
          employeeId: userStore.empId
        }
      });
      Swal.fire('成功', accept ? '您已參加此會議' : '您已拒絕參加', 'success');
      loadInvitedMeetings();
    } catch (err) {
      Swal.fire('錯誤', '回覆失敗', 'error');
      console.error(err);
    }
  }
  </script>
  
  <style scoped>
  .text-success {
    color: #67c23a;
  }
  .text-danger {
    color: #f56c6c;
  }
  .text-warning {
    color: #e6a23c;
  }
  </style>