<template>
  <div>
    <FullCalendar :options="calendarOptions" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import useUserStore from '@/stores/user';
const user = useUserStore();
const employeeId = user.empId

const path = import.meta.env.VITE_API_URL;


const departments = ref([]); // 部門列表
const employees = ref([]); // 員工列表
const selectedDepartment = ref(""); // 已選擇的部門
const selectedEmployee = ref(""); // 已選擇的員工
const schedules = ref([]); // 該員工的班表
const shiftTypes = ref([]); // 班別資料

const calendarOptions = ref({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: "dayGridMonth",
  events: schedules,
  eventContent: function (arg) {
    return {
      html: `<b style="font-size: 16px;">${arg.event.title.split(" (")[0]}</b><br><small style="font-size: 14px;">${arg.event.title.split(" (")[1].replace(")", "")}</small>`,
    };
  }
});

onMounted(async () => {
  try {
    const res = await axios.get(`${path}/api/shiftType`);
    shiftTypes.value = res.data; // 取得班別資料
  } catch (error) {
    console.error("取得班別資料失敗:", error);
  }

  if (employeeId) {
    fetchSchedule(employeeId);  // 當前登入員工查詢班表
  }
});

// 根據登入員工 ID 查詢班表
const fetchSchedule = async (employeeId) => {
  if (!employeeId) return;

  try {
    const res = await axios.get(`${path}/api/schedule/emp/${employeeId}`);
    schedules.value = res.data.map((schedule) => {
      const shift = shiftTypes.value.find(st => st.shiftName === schedule.shiftTypeName);
      return {
        title: shift ? `${schedule.shiftTypeName} (${shift.startTime} - ${shift.finishTime})` : schedule.shiftTypeName,
        start: schedule.date,
      };
    });

    calendarOptions.value.events = schedules.value; // 更新日曆
  } catch (error) {
    console.error("取得班表資料失敗:", error);
  }
};
</script>

<style scoped></style>