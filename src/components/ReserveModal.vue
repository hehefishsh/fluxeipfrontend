<template>
    <el-dialog 
      :model-value="isOpen" 
      title="預約會議室" 
      width="500px"
      @close="close"
    >
      <el-form label-width="100px">
        <el-form-item label="會議室">
          <el-input v-model="room.roomName" disabled></el-input>
        </el-form-item>
  
        <el-form-item label="申請人">
          <el-input v-model="employee.empName" disabled></el-input>
        </el-form-item>
  
        <el-form-item label="主題">
          <el-input v-model="meeting.title" placeholder="請輸入會議主題"></el-input>
        </el-form-item>


        <el-form-item label="內容">
          <el-input v-model="meeting.notes" placeholder="請輸入會議內容"></el-input>
        </el-form-item>
        
  
        <el-form-item label="選擇日期">
  <el-date-picker
    v-model="meeting.date"
    type="date"
    placeholder="選擇日期"
    :disabled-date="disabledDate"
    value-format="YYYY-MM-DD"
    
  ></el-date-picker>
</el-form-item>

<el-form-item label="開始時間">
  <el-time-select
    v-model="meeting.startTime"
    placeholder="選擇開始時間"
    start="08:00"
    step="01:00"
    end="18:00"
  ></el-time-select>
</el-form-item>

<el-form-item label="結束時間">
  <el-time-select
    v-model="meeting.endTime"
    placeholder="選擇結束時間"
    start="08:00"
    step="01:00"
    end="18:00"
  ></el-time-select>
</el-form-item>
  
        <div class="d-flex justify-content-end">
          <el-button @click="close">取消</el-button>
          <el-button type="primary" @click="reserveMeeting">送出預約</el-button>
        </div>
      </el-form>
    </el-dialog>
  </template>
  
  <script setup>
import { ref, watch, defineProps, defineEmits } from "vue";
import Swal from "sweetalert2";
import dayjs from "dayjs";  //dayjs 處理時間格式

//定義 emit 事件
const emits = defineEmits(["update:isOpen", "reserve"]);







const props = defineProps({
  isOpen: Boolean,
  room: Object,
  employee: Object, 
});

const meeting = ref({
  title: "",
  notes:"",
  date: "",
  startTime: null,
  endTime: null,
  employeeId: null, 
  employeeName: "",
});


watch(() => props.employee, (newVal) => {
  if (newVal) {
    meeting.value.employeeId = newVal.empId?.value || null;
    meeting.value.employeeName = newVal.empName?.value || "";
  }
}, { immediate: true });  



const disabledDate = (time) => {
  
  const dayOfWeek = dayjs(time).day();

  
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return true; 
  }
  return false; 
};



//關閉對話框
const close = () => {
  emits("update:isOpen", false);
};

//送出預約
const reserveMeeting = () => {

  console.log("props.employee 檢查:", props.employee); 
  console.log("props.employee.empId:", props.employee?.empId); 
  console.log("props.employee.empId.value:", props.employee?.empId?.value); 


  if (!meeting.value.title.trim()) {
    Swal.fire("錯誤", "請輸入會議主題", "error");
    close();
    return;
  }
  if (!meeting.value.startTime || !meeting.value.endTime) {
    Swal.fire("錯誤", "請選擇開始和結束時間", "error");
    close();
    return;
  }
  if (meeting.value.startTime >= meeting.value.endTime) {
    Swal.fire("錯誤", "結束時間必須大於開始時間", "error");
    close();
    return;
  }

  


  const reservationData = {
  title: meeting.value.title,
  notes: meeting.value.notes,
  date: meeting.value.date,
  startTime: meeting.value.startTime,
  endTime: meeting.value.endTime,
  roomId: props.room.id,
  roomName: props.room.roomName,
  employeeId: props.employee.empId,  
  employeeName: props.employee.empName,  
};


  console.log("發送預約資料:", reservationData);

  
  emits("reserve", reservationData);

  
  close();
};
</script>

<style scoped>

:deep(.el-input.is-disabled .el-input__inner) {
  color: black !important;
  -webkit-text-fill-color: black !important;
  opacity: 1 !important;
  cursor: text !important; 
}


:deep(.el-input.is-disabled) {
  cursor: text !important; 
}


:deep(.el-input__wrapper.is-disabled) {
  cursor: text !important;
}

</style>