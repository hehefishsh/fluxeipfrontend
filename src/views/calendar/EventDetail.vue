<template>
    <div>
      <input v-model="newEventContent" placeholder="事件名稱" class="border p-2 mb-2 w-full" />
      <input type="date" v-model="newEventStart" class="border p-2 mb-2 w-full" />
      <input type="date" v-model="newEventEnd" class="border p-2 mb-2 w-full" />
      <button @click="addEvent" class="btn btn-primary btn-pill">確認</button>
      <button @click="cancel" class="btn btn-primary btn-pill">取消</button>
    </div>
</template>

<script>
import { useRouter } from "vue-router";
import { ref } from "vue";
import axios from "axios";
import useUserStore from "@/stores/user";  // 引入 Pinia Store
import Swal from "sweetalert2";  // 引入 SweetAlert2

export default {
    setup() {
        const router = useRouter();
        const newEventContent = ref("");
        const newEventStart = ref("");
        const newEventEnd = ref("");
        
        const userStore = useUserStore();  // 使用 Pinia Store
        const empId = userStore.empId;  // 獲取員工ID

        const formatDateTime = (dateStr) => {
            const parsedDate = new Date(dateStr);
            if (isNaN(parsedDate.getTime())) {
                console.error("❌ Invalid date format:", dateStr);
                return null;
            }
            return `${dateStr}T00:00:00`;  // 確保符合 LocalDateTime 格式
        };

        const addEvent = async () => {
            if (!newEventContent.value || !newEventStart.value || !newEventEnd.value) {
                Swal.fire("錯誤", "請輸入完整的事件資訊", "error");
                return;
            }

            const formattedStart = formatDateTime(newEventStart.value);
            const formattedEnd = formatDateTime(newEventEnd.value);

            if (!formattedStart || !formattedEnd) {
                Swal.fire("錯誤", "請輸入有效的日期", "error");
                return;
            }

            const newEvent = {
                content: newEventContent.value,
                startDate: formattedStart,
                finishDate: formattedEnd,
                employeeId: empId,  // 發送員工ID
            };

            console.log("📌 Sending event data:", newEvent);

            try {
                const response = await axios.post("https://fluxeipbackend.onrender.com/calendar/personal", newEvent);
                console.log("✅ Event created successfully:", response.data);
                router.push("/calendar/personal");
                Swal.fire("成功", "事件新增成功", "success");
            } catch (error) {
                const errorMessage = error.response?.data || error.message;
                console.error("❌ Error creating event:", errorMessage);
                Swal.fire("錯誤", `無法新增事件，錯誤訊息：${errorMessage}`, "error");
            }
        };

        const cancel = () => {
            router.push("/calendar/personal");
        };

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
