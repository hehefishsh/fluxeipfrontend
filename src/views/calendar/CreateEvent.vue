<template>
  <div class="container">
    <input v-model="newEventContent" placeholder="事件名稱" class="border p-2 mb-2 w-full" />
    <input type="date" v-model="newEventStart" class="border p-2 mb-2 w-full" />
    <input type="date" v-model="newEventEnd" class="border p-2 mb-2 w-full" />
    <button @click="addEvent" class="btn btn-primary btn-pill">確認</button>
    <button @click="cancel" class="btn btn-secondary btn-pill">取消</button>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import useUserStore from '@/stores/user';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const newEventContent = ref('');
    const newEventStart = ref('');
    const newEventEnd = ref('');
    const departmentId = ref('');
    const apiBaseUrl = 'https://fluxeipbackend.onrender.com/api/calendar/department';
    const userStore = useUserStore();
    const empId = userStore.empId;
    const router = useRouter();

    const toast = {
      success(msg) { Swal.fire("成功", msg, "success"); },
      error(msg) { Swal.fire("錯誤", msg, "error"); },
    };

    // 獲取部門 ID
    const fetchDepartmentId = async () => {
      if (!empId) {
        toast.error('員工 ID 無效');
        return;
      }

      try {
        const response = await axios.get(`https://fluxeipbackend.onrender.com/api/employee/${empId}/department`);
        departmentId.value = response.data.departmentId;
        console.log("獲取的部門 ID:", departmentId.value); // 保留日誌，方便偵錯
      } catch (error) {
        toast.error('無法獲取部門 ID');
        console.error('獲取部門 ID 失敗', error);
      }
    };

    // 新增事件
    const addEvent = async () => {
      if (!newEventContent.value || !newEventStart.value || !newEventEnd.value) {
        toast.error('請填寫所有欄位');
        return;
      }

      if (!departmentId.value) {
        toast.error('部門 ID 無效');
        return;
      }

      const event = {
        content: newEventContent.value,
        startDate: `${newEventStart.value}T00:00:00`,
        finishDate: `${newEventEnd.value}T23:59:59`,
        departmentId: departmentId.value,
      };

      console.log("要發送的事件資料:", event);

      try {
        await axios.post(apiBaseUrl, event);
        toast.success('事件新增成功');
        router.push('/calendar/department');
      } catch (error) {
        toast.error('新增事件失敗');
        console.error('新增事件失敗', error.response ? error.response.data : error);
      }
    };

    const cancel = () => {
      router.push('/calendar/department');
    };

    onMounted(() => {
      fetchDepartmentId();
    });

    return {
      newEventContent,
      newEventStart,
      newEventEnd,
      addEvent,
      cancel,
    };
  },
};
</script>

<style scoped>
.container {
  
  margin: auto;
  text-align: center;
}



button {
  margin: 5px;
}
</style>
