import AttendanceClock from "@/views/attendance/Clock.vue";
import AttendanceLog from "@/views/attendance/AttendanceLog.vue";

const attendanceRoutes = {
  path: "/attendance",
  name: "attendance",
  meta: { title: '出勤管理' },
  children: [
    {
      path: "clock",
      name: "attendance-clock-link",
      component: AttendanceClock,
      meta: { title: '打卡' },
    },
    {
      path: "log",
      name: "attendance-log-link",
      component: AttendanceLog,
      meta: { title: '出勤記錄查詢' },
    },
  ],
};

export default attendanceRoutes;
