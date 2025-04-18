<template>
 <div>
    <h2>員工班表管理</h2>

    <!-- 部門選擇 -->
    <div class="mb-3" v-if="[...adminRoles].includes(userStore.roleName)">
      <label class="form-label">選擇部門：</label>
      <select v-model="selectedDepartment" @change="fetchEmployees">
        <option value="">請選擇部門</option>
        <option v-for="dep in departments" :key="dep.departmentId" :value="dep.departmentId">
          {{ dep.departmentName }}
        </option>
      </select>
    </div>

    <!-- 員工選擇 -->
    <div class="mb-3" v-if="employees.length > 0">
      <label class="form-label">選擇員工：</label>
      <select v-model="selectedEmployee" @change="fetchSchedule">
        <option value="">請選擇員工</option>
        <option v-for="emp in employees" :key="emp.employeeId" :value="emp.employeeId">
          {{ emp.employeeName }}
        </option>
      </select>
    </div>
        <!-- 新增整個月班表按鈕 -->
    <button class="btn btn-success mr-3" @click="addMonthlySchedule">
      新增這個月班表
    </button>
    <button class="btn btn-danger" @click="handleDeleteMonthSchedule">刪除整月班表</button>


    <FullCalendar ref="calendarRef" :options="calendarOptions" />
  </div>
</template>
    
<script setup>
import { ref, onMounted, watch  } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axiosapi from "@/plugins/axios";

const path = import.meta.env.VITE_API_URL;
import useUserStore from "@/stores/user";
const userStore=useUserStore()

const adminRoles = ["最高管理員", "次等管理員"]; // 管理員角色
const departmentRoles = ["行政主管", "人資主管", "業務主管", "技術主管"]; // 部門主管

const departments = ref([]); // 部門列表
const employees = ref([]); // 員工列表
const selectedDepartment = ref(""); // 已選擇的部門
const selectedEmployee = ref(""); // 已選擇的員工
const schedules = ref([]); // 該員工的班表
const shiftTypes = ref([]); // 班別資料
const shiftTypesAll = ref([]); // 班別資料

const contacts=ref([])
const calendarRef = ref(null);

const calendarOptions = ref({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: "dayGridMonth",
  events: schedules,
  dateClick: handleDateClick, // 點擊日期觸發
  eventContent : function (arg) {
  return {
    html: `<b style="font-size: 16px;">${arg.event.title.split(" (")[0]}</b><br><small style="font-size: 14px;">${arg.event.title.split(" (")[1].replace(")", "")}</small>`,
  };
},
  eventClick: handleEventClick, // 點擊事件觸發
  datesSet: fetchCurrentMonthData, // 當月變更時重新獲取資料

});

async function fetchCurrentMonthData() {
  if (!calendarRef.value) return;

  const calendarApi = calendarRef.value.getApi();
  const currentStart = calendarApi.view.currentStart;

  // 強制使用 UTC 時間來計算當月的第一天，避免時區問題
  const firstDayOfMonth = new Date(Date.UTC(currentStart.getFullYear(), currentStart.getMonth(), 1));  // 使用 UTC 時間，將日期設為當月的第一天
  const firstDayOfMonthISO = firstDayOfMonth.toISOString().slice(0, 10);  // 轉換為 YYYY-MM-DD 格式
  return firstDayOfMonthISO;
}

// 取得所有部門
onMounted(async () => {
  try {
    const res = await axios.get(`${path}/department/find`);
    departments.value = res.data;
  } catch (error) {
    console.error("取得部門資料失敗:", error);
  }

  try {
    const res = await axios.get(`${path}/api/shiftType`);
    shiftTypes.value = res.data; // 取得班別資料
  } catch (error) {
    console.error("取得班別資料失敗:", error);
  }

  try {
    const res = await axios.get(`${path}/api/shiftType/all`);
    shiftTypesAll.value = res.data; // 取得班別資料
  } catch (error) {
    console.error("取得班別資料失敗:", error);
  }
  
  try {
    const res = await axios.get(`${path}/api/contacts`);
    contacts.value = res.data; // 取得班別資料    
  } catch (error) {
    console.error("取得員工資料失敗:", error);
  }
});

//主管只能看到自己部門員工
if([...departmentRoles].includes(userStore.roleName)){
  watch(contacts, (newContacts) => {
const contact = newContacts.find((emp) => emp.empId === userStore.empId);
const department = departments.value.find(dep => dep.departmentName === contact.department);
selectedDepartment.value=department.departmentId;

fetchEmployees();
});
}

// 取得該部門下的員工
const fetchEmployees = async () => {
  if (!selectedDepartment.value) return;

  try {
    const res = await axios.get(
      `${path}/api/schedule/dep/${selectedDepartment.value}`
    );
    employees.value = res.data; // 根據部門取得員工資料
  } catch (error) {
    console.error("取得員工資料失敗:", error);
  }
};


// 取得該員工的班表
const fetchSchedule = async () => {
  if (!selectedEmployee.value) return;

  try {
    const res = await axios.get(
      `${path}/api/schedule/emp/${selectedEmployee.value}`
    );
    schedules.value = res.data.map((schedule) => {
        const shift = shiftTypesAll.value.find(st => st.shiftName === schedule.shiftTypeName)
return{
        title: shift ? `${schedule.shiftTypeName} (${shift.startTime} - ${shift.finishTime})` : schedule.shiftTypeName,
        start: schedule.date,
        id: schedule.scheduleId, // 加入 scheduleId 用於刪除或修改
}

    });

    calendarOptions.value.events = schedules.value; // 更新日曆
  } catch (error) {
    console.error("取得班表資料失敗:", error);
  }
};

// 點擊日曆上的日期，彈出 SweetAlert2 讓使用者選擇班別
async function handleDateClick(info) {
        if (!selectedEmployee.value) {
    Swal.fire("請先選擇員工", "", "warning");
    return;
  }

  // 取得該員工所屬的部門 ID
  const employee = employees.value.find((emp) => emp.employeeId === selectedEmployee.value);
  if (!employee) return;

  const department = departments.value.find(dep => dep.departmentId === employee.department.departmentId);
if (!department) {
  Swal.fire("找不到該員工的部門", "", "error");
  return;
}
const departmentName = department.departmentName;
  // 只篩選該部門的班別
  const filteredShifts = shiftTypes.value.filter(
    (shift) => shift.departmentName === departmentName
  );
  if (filteredShifts.length === 0) {
    Swal.fire("該部門沒有可選擇的班別", "", "warning");
    return;
  }

  // 生成班別選項
  const shiftOptions = filteredShifts.reduce((options, shift) => {
    options[shift.shiftTypeId] = shift.shiftName;
    return options;
  }, {});

  const { value: shiftTypeId, isConfirmed } = await Swal.fire({
    title: "選擇班別",
    input: "select",
    inputOptions: shiftOptions,
    inputPlaceholder: "選擇班別",
    showCancelButton: true,
    confirmButtonText: "確定",
    cancelButtonText: "取消",
  });

  if (isConfirmed) {
  if (!shiftTypeId) {
    return Swal.fire("請選擇班別", "", "error");
  }

  const selectedShift = filteredShifts.find((shift) => shift.shiftTypeId == shiftTypeId);

  if (!selectedShift) {
    return Swal.fire("找不到選擇的班別", "", "error");
  }

  try {
    await axios.post(`${path}/api/schedule`, {
      employeeId: selectedEmployee.value,
      date: info.dateStr,
      shiftTypeId: selectedShift.shiftTypeId,
      departmentName: departmentName,
    });

    Swal.fire("班表已新增", "", "success");
    fetchSchedule(); // 重新載入班表
  } catch (error) {
    Swal.fire({
      title: error.response?.data || "新增班表失敗",
      icon: "error",
    });
  }
}
}

async function addMonthlySchedule() {
  if (!selectedEmployee.value) {
    Swal.fire("請先選擇員工", "", "warning");
    return;
  }

  // 取得該員工所屬的部門 ID
  const employee = employees.value.find((emp) => emp.employeeId === selectedEmployee.value);
  if (!employee) return;

  const department = departments.value.find(dep => dep.departmentId === employee.department.departmentId);
if (!department) {
  Swal.fire("找不到該員工的部門", "", "error");
  return;
}
const departmentName = department.departmentName;
  // 只篩選該部門的班別
  const filteredShifts = shiftTypes.value.filter(
    (shift) => shift.departmentName === departmentName
  );
  if (filteredShifts.length === 0) {
    Swal.fire("該部門沒有可選擇的班別", "", "warning");
    return;
  }

  // 生成班別選項
  const shiftOptions = filteredShifts.reduce((options, shift) => {
    options[shift.shiftTypeId] = shift.shiftName;
    return options;
  }, {});

  const { value: monthShiftTypeId, isDismissed } = await Swal.fire({
    title: "選擇班別（整個月）",
    input: "select",
    inputOptions: shiftOptions,
    inputPlaceholder: "選擇班別",
    showCancelButton: true,
  });

    // 按「取消」時，直接 return，什麼都不做
    if (isDismissed) {
    return;
  }

  if (!monthShiftTypeId) {
    return Swal.fire("請選擇班別", "", "error");
  }

  const selectedShift = filteredShifts.find((shift) => shift.shiftTypeId == monthShiftTypeId);

  if (!selectedShift) {
    return Swal.fire("找不到選擇的班別", "", "error");
  }

  try {
    await axios.post(`${path}/api/schedule/month`, {
      employeeId: selectedEmployee.value,
      date: await fetchCurrentMonthData(),
      shiftTypeId: selectedShift.shiftTypeId,
      departmentName: departmentName,
    });

    Swal.fire("整個月班表已新增", "", "success");
    fetchSchedule(); // 重新載入班表
  } catch (error) {
    Swal.fire({
      title: error.response.data,
      icon: "error",
    });
  }
}


async function handleEventClick(arg) {
  const scheduleId = arg.event.id;
  const scheduleTitle = arg.event.title;
  const scheduleDate = arg.event.start;

  const { value: action } = await Swal.fire({
    title: `您要刪除或修改這個班表嗎？`,
    text: scheduleTitle,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "修改",
    cancelButtonText: "刪除",
  });

  if (action) {
    // 修改班表
        // 取得該員工所屬的部門 ID
  const employee = employees.value.find((emp) => emp.employeeId === selectedEmployee.value);
  if (!employee) return;

  const department = departments.value.find(dep => dep.departmentId === employee.department.departmentId);
if (!department) {
  Swal.fire("找不到該員工的部門", "", "error");
  return;
}
const departmentName = department.departmentName;
  // 只篩選該部門的班別
  const filteredShifts = shiftTypes.value.filter(
    (shift) => shift.departmentName === departmentName
  );
  if (filteredShifts.length === 0) {
    Swal.fire("該部門沒有可選擇的班別", "", "warning");
    return;
  }
  const shiftOptions = filteredShifts.reduce((options, shift) => {
    options[shift.shiftTypeId] = shift.shiftName;
    return options;
  }, {});

    const { value: shiftTypeId } = await Swal.fire({
      title: "選擇新班別",
      input: "select",
      inputOptions: shiftOptions,
      inputPlaceholder: "選擇新班別",
      showCancelButton: true,
    });

    if (shiftTypeId) {
      try {
        await axios.put(`${path}/api/schedule/${scheduleId}?shiftTypeId=${shiftTypeId}`);
        Swal.fire("班表已更新", "", "success");
        fetchSchedule();
      } catch (error) {
        Swal.fire("更新班表失敗", error.response.data, "error");
      }
    }
  } else {
    // 刪除班表
    const { value: confirmDelete } = await Swal.fire({
      title: "確定刪除這個班表嗎？",
      text: `班表日期: ${new Date(scheduleDate).toLocaleDateString()}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "刪除",
      cancelButtonText: "取消",
    });

    if (confirmDelete) {
      try {
        await axios.delete(`${path}/api/schedule/${scheduleId}`);
        Swal.fire("班表已刪除", "", "success");
        fetchSchedule();
      } catch (error) {
        Swal.fire("刪除班表失敗", error.response.data, "error");
      }
    }
  }
}

const handleDeleteMonthSchedule = async () => {
  if (!selectedEmployee.value) {
    Swal.fire("請先選擇員工", "", "warning");
    return;
  }

  const result = await Swal.fire({
    title: '確定刪除整月班表嗎?',
    text: '這將會刪除當月的所有班表資料!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '確定刪除',
    cancelButtonText: '取消',
  });
  if (result.isConfirmed) {

  try {
    // 在這裡獲取當前月份或其他必要的資料
    const date = await fetchCurrentMonthData();
    
    // 向後端發送請求來刪除整月班表
    await axiosapi.delete(`/api/schedule/month/${selectedEmployee.value}?date=${date}`);
    
    Swal.fire('成功', '已刪除整月班表', 'success');
    fetchSchedule();

  } catch (error) {
    Swal.fire('錯誤', error.response.data, 'error');
  }
}
};
</script>
    
<style scoped>
    
</style>