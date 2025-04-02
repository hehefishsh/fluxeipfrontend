<template>
    <div v-if="isOpen" class="schedule-modal-overlay" @click.self="closeModal">
      <div class="schedule-container">
        <h3 class="modal-title">會議室時段查詢</h3>
  
        <!-- 選擇日期 -->
        <el-date-picker
          v-model="selectedDate"
          type="date"
          placeholder="選擇日期"
          value-format="YYYY-MM-DD"
          :disabled-date="disableWeekends"
          @change="fetchSchedule"
          class="date-picker"
        ></el-date-picker> 
  
        <!-- 顯示時段 -->
        <el-card class="time-card">
          <div class="time-slot-container">
            <div 
              v-for="slot in timeSlots"
              :key="slot.time"
              :class="['time-slot', slot.status]"
            >
              {{ slot.time }} 
              <el-tag v-if="slot.status === 'pending'" type="warning" effect="dark">已佔用</el-tag>
              <el-tag v-if="slot.status === 'approved'" type="success" effect="dark">已佔用</el-tag>
            </div>
          </div>
        </el-card>
  
        <el-button type="danger" class="close-btn" @click="closeModal">
          關閉
        </el-button>
      </div>
    </div>
  </template>
  
  
  

  <script setup>
import { ref, watch } from "vue";
import axios from "axios";
import dayjs from "dayjs";

const props = defineProps({
  isOpen: Boolean,
  roomId: Number
});

const emits = defineEmits(["close"]);

const selectedDate = ref(dayjs().format("YYYY-MM-DD")); 
const timeSlots = ref([]);

const path = import.meta.env.VITE_API_URL;




watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    selectedDate.value = dayjs().format("YYYY-MM-DD");
    fetchSchedule(); 
  }
});


async function fetchSchedule() {
  if (!props.roomId) return;

  if (!selectedDate.value) {
    console.error("`selectedDate` 為 null，請先選擇日期！");
    return;
  }

  try {
    console.log(` Fetching data for roomId: ${props.roomId}, date: ${selectedDate.value}`);

    const response = await axios.get(`${path}/api/meetings/room/${props.roomId}/date/${selectedDate.value}`);
    const meetings = response.data || [];

    console.log("API 回傳的資料:", meetings);

    const filteredMeetings = meetings.filter(meeting => 
      meeting.statusName === "審核中" || meeting.statusName === "已審核"
    );

    console.log("篩選後的時段:", filteredMeetings);

    
    timeSlots.value = generateTimeSlots();

    
    filteredMeetings.forEach(meeting => {
      timeSlots.value.forEach(slot => {
        if (isTimeOverlap(slot.time, meeting.startTime, meeting.endTime)) {
          slot.status = meeting.statusName === "審核中" ? "pending" : "approved";
        }
      });
    });

    console.log("處理後的時段:", JSON.stringify(timeSlots.value, null, 2));

  } catch (error) {
    console.error("API 查詢失敗：", error);
  }
}


function generateTimeSlots() {
  const slots = [];
  let startTime = dayjs(selectedDate.value + "T08:00:00");
  let endTime = dayjs(selectedDate.value + "T18:00:00");

  while (startTime.isBefore(endTime)) {
    slots.push({
      time: startTime.format("HH:mm") + " ~ " + startTime.add(1, "hour").format("HH:mm"),
      status: "available"  
    });
    startTime = startTime.add(1, "hour");
  }
  return slots;
}


function isTimeOverlap(slotTime, startTime, endTime) {
  const [slotStart, slotEnd] = slotTime.split(" ~ ");

  
  const meetingStart = dayjs(startTime).format("HH:mm");
  const meetingEnd = dayjs(endTime).format("HH:mm");

  return (
    (slotStart >= meetingStart && slotStart < meetingEnd) ||
    (slotEnd > meetingStart && slotEnd <= meetingEnd)
  );
}




function disableWeekends(date) {
  const day = dayjs(date).day();
  return day === 0 || day === 6;
}


function closeModal() {
  emits("close");
}
</script>

  
  
<style scoped>
/* 背景遮罩 */
.schedule-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 主容器 */
.schedule-container {
  background: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  width: 500px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  animation: fadeIn 0.3s ease-in-out;
}

/* 標題 */
.modal-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

/* 日期選擇器 */
.date-picker {
  width: 100%;
  margin-bottom: 15px;
  margin-bottom: 20px;
 
}
/* 時段區塊 */
.time-card {
  padding: 15px;
  background: #f9f9f9;
  border-radius: 10px;
  margin-top: 20px; 
  margin-bottom: 20px;
}

/* 時段容器 */
.time-slot-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 10px;
  
}

/* 單個時段 */
.time-slot {
  padding: 10px;
  border-radius: 5px;
  font-weight: bold;
  text-align: center;
  transition: all 0.3s ease-in-out;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 可用時段 */
.available {
  background: #e0f7fa;
  color: #00796b;
}

/*  審核中 */
.pending {
  background: #fff3cd;
  color: #856404;
}

/* 已審核 */
.approved {
  background: #d4edda;
  color: #155724;
}

/* 按鈕樣式 */
.close-btn {
  margin-top: 15px;
  width: 100%;
}

/* ✅ 動畫效果 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
