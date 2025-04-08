<template>
  <div>
    <RouterLink class="btn btn-primary btn-pill" to="/calendar/create">
      <span class="nav-text">新增事件</span>
    </RouterLink>
    <FullCalendar :options="calendarOptions" />
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useRoute } from "vue-router";
import axios from "axios";
import useUserStore from "@/stores/user";  // 引入 Pinia Store
import Swal from "sweetalert2";  // 引入 SweetAlert2

// ✅ 小提示函數
const useToast = () => {
  return {
    success(msg) { Swal.fire("成功", msg, "success"); },
    error(msg) { Swal.fire("錯誤", msg, "error"); },
  }
}

export default {
  components: { FullCalendar },
  setup() {
    const route = useRoute();
    const events = ref([]);  // 用於存儲事件數據
    const toast = useToast();
    const apiBaseUrl = "https://fluxeipbackend.onrender.com/calendar/personal";

    // 用戶信息
    const userStore = useUserStore();
    const empId = userStore.empId;  // 獲取當前用戶的 empId

    // 用於綁定表單數據
    const eventContent = ref('');
    const startDate = ref(null);
    const finishDate = ref(null);

    // FullCalendar 配置
    const calendarOptions = ref({
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: "dayGridMonth",
      events: events,  // 直接綁定 events
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

    const parseDate = (dateValue) => {
      if (!dateValue) {
        console.error(`🚨 無效的日期值: ${dateValue}`);
        return null;
      }

      let date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        console.error(`🚨 日期格式錯誤: ${dateValue}`);
        return null;
      }

      return date;
    };

    // 加載事件並過濾掉其他用戶的事件
    const loadEventsFromBackend = async () => {
  try {
    const response = await axios.get(`${apiBaseUrl}/${empId}`);  // 加入 empId 篩選條件
    const data = response.data;

    events.value = data
      .map(event => {
        console.log("📌 事件內容:", event.content);  // 確認 event.content

        // 清除 `12a`，如果有的話
        let cleanedContent = event.content.replace(/12a/g, '').trim();

        let startDate = parseDate(event.startDate);
        let finishDate = parseDate(event.finishDate);

        if (!startDate || !finishDate) {
          console.error(`🚨 無效的日期值: ${event.content}`);
          return null;
        }

        // 判斷是否為全天事件
        const isAllDay = startDate.getHours() === 0 && finishDate.getHours() === 0;

        return {
          id: event.id,
          title: cleanedContent,  // 使用清理過的 content
          start: startDate.toISOString(),
          end: finishDate.toISOString(),
          allDay: isAllDay,  // 如果是全天事件，設置為 true
        };
      })
      .filter(event => event !== null);

    toast.success("事件加載成功");
  } catch (error) {
    toast.error("事件加載失敗");
    console.error("無法加載事件", error);
  }
};

    // 新增事件
    const saveEventToBackend = () => {
      if (!eventContent.value || !startDate.value || !finishDate.value) {
        toast.error("請填寫完整的事件資訊");
        return;
      }

      const event = {
        content: eventContent.value,
        startDate: new Date(startDate.value).toISOString(),
        finishDate: new Date(finishDate.value).toISOString(),
        employeeId: empId,  // 發送員工ID
      };

      axios.post(apiBaseUrl, event)
        .then(response => {
          console.log('事件保存成功', response.data);
          loadEventsFromBackend();  // 加載最新的事件
        })
        .catch(error => {
          console.error('保存事件時發生錯誤:', error.response);
          toast.error("無法保存事件");
        });
    };

    // 刪除事件
    const deleteEventFromBackend = async (eventId) => {
      try {
        // 發送刪除請求，只傳遞 eventId
        await axios.delete(`${apiBaseUrl}/${eventId}`);
        toast.success("事件刪除成功");
        // 移除事件資料
        events.value = events.value.filter(event => event.id !== eventId);
      } catch (error) {
        toast.error("事件刪除失敗");
        console.error("無法刪除事件", error);
      }
    };

    // 監聽路由參數
    watch(
      () => route.query.event,
      (newEvent) => {
        if (newEvent) {
          try {
            const parsedEvent = JSON.parse(newEvent);
            const newCalendarEvent = {
              title: parsedEvent.name,
              start: parsedEvent.start,
              end: parsedEvent.end,
            };
            events.value.push(newCalendarEvent);
            eventContent.value = parsedEvent.name;
            startDate.value = parsedEvent.start;
            finishDate.value = parsedEvent.end;
            saveEventToBackend();  // 保存事件到後端
          } catch (error) {
            toast.error("事件解析錯誤");
            console.error("事件解析錯誤", error);
          }
        }
      },
      { immediate: true }
    );

    onMounted(() => {
      loadEventsFromBackend();
    });

    return {
      calendarOptions,
      events,
      eventContent,
      startDate,
      finishDate,
      saveEventToBackend,
    };
  },
};
</script>