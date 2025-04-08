<template>
  <div>
    <!-- 新增事件按鈕 -->
    <RouterLink class="btn btn-primary btn-pill" to="/calendar/create2">
      <span class="nav-text">新增事件</span>
    </RouterLink>

    <!-- 顯示部門行事曆 -->
    <FullCalendar :options="calendarOptions" />
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useRoute } from "vue-router";
import axios from "axios";
import useUserStore from "@/stores/user";
import Swal from "sweetalert2";

const useToast = () => ({
  success(msg) { Swal.fire("成功", msg, "success"); },
  error(msg) { Swal.fire("錯誤", msg, "error"); },
});

export default {
  components: { FullCalendar },
  setup() {
    const route = useRoute();
    const events = ref([]);
    const toast = useToast();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "https://fluxeipbackend.onrender.com/api/calendar/department"; // 改用環境變數配置API URL
    const userStore = useUserStore();
    const empId = userStore.empId; // 取得員工 ID
    const departmentId = ref("");  // 儲存從後端獲取的部門 ID

    const calendarOptions = ref({
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: "dayGridMonth",
      events: events,
      eventClick: (info) => {
        Swal.fire({
          title: `確定要刪除事件: ${info.event.title}?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: '刪除',
          cancelButtonText: '取消'
        }).then((result) => {
          if (result.isConfirmed) {
            const eventId = info.event.id;
            info.event.remove();
            deleteEventFromBackend(eventId);
          }
        });
      },
    });

    // **步驟 1: 根據員工 ID 獲取部門 ID**
    const fetchDepartmentId = async () => {
      if (!empId) {
        toast.error("員工 ID 無效");
        return;
      }

      try {
        // 修改 API 路徑為正確的格式
        const response = await axios.get(`https://fluxeipbackend.onrender.com/api/employee/${empId}/department`);
        departmentId.value = response.data.departmentId;
        toast.success("部門 ID 獲取成功");

        // 成功獲取部門 ID 後，再載入行事曆事件
        loadEventsFromBackend();
      } catch (error) {
        toast.error("無法獲取部門 ID");
        console.error("獲取部門 ID 失敗", error);
      }
    };

    // **步驟 2: 根據部門 ID 載入行事曆事件**
    const loadEventsFromBackend = async () => {
      if (!departmentId.value) {
        toast.error("無有效的部門 ID");
        return;
      }

      try {
        const response = await axios.get(`${apiBaseUrl}/${departmentId.value}`);
        const data = response.data;

        events.value = data.map(event => {
          return {
            id: event.id,
            title: event.content,
            start: new Date(event.startDate).toISOString(),
            end: new Date(event.finishDate).toISOString(),
            allDay: true, // 確保所有事件都被視為全天事件
          };
        });

        toast.success("事件加載成功");
      } catch (error) {
        toast.error("事件加載失敗");
        console.error("無法加載事件", error);
      }
    };


    // **步驟 3: 新增事件**
    const saveEventToBackend = async (eventContent, startDate, finishDate) => {
      if (!eventContent || !startDate || !finishDate) {
        toast.error("請填寫完整的事件資訊");
        return;
      }

      if (!departmentId.value) {
        toast.error("無有效的部門 ID，請重新登入");
        return;
      }

      const event = {
        content: eventContent,
        startDate: new Date(startDate).toISOString(),
        finishDate: new Date(finishDate).toISOString(),
        departmentId: departmentId.value,
      };

      try {
        await axios.post(apiBaseUrl, event);
        toast.success("事件新增成功");
        loadEventsFromBackend();
      } catch (error) {
        toast.error("事件新增失敗");
        console.error("無法新增事件", error);
      }
    };

    // **步驟 4: 刪除事件**
    const deleteEventFromBackend = async (eventId) => {
      try {
        await axios.delete(`${apiBaseUrl}/${eventId}`);
        toast.success("事件刪除成功");
        events.value = events.value.filter(event => event.id !== eventId);
      } catch (error) {
        toast.error("事件刪除失敗");
        console.error("無法刪除事件", error);
      }
    };

    // **當元件載入時，先獲取部門 ID**
    onMounted(() => {
      fetchDepartmentId();
    });

    return {
      calendarOptions,
      events,
      saveEventToBackend,
    };
  },
};
</script>
