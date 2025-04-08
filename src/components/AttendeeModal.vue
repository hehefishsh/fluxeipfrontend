<template>
    <Teleport to="body">
      <div v-if="isOpen" class="custom-overlay" @click.self="close">
        <div class="custom-modal">
          <div class="modal-header">
            <h4 class="modal-title">選擇與會人員</h4>
          </div>
  
          <div class="modal-body">
            <!-- 部門選擇 -->
            <div class="form-group">
              <label>部門</label>
              <select v-model="selectedDepartment" class="department-select">
                <option value="">全部部門</option>
                <option v-for="dep in departmentList" :key="dep" :value="dep">{{ dep }}</option>
              </select>
            </div>
  
            <!-- 員工多選 -->
            <div class="form-group">
              <label>選擇員工</label>
              <div class="custom-select" @click="toggleDropdown">
                <span class="select-text">請選擇員工</span>
              </div>
  
              <div v-if="dropdownOpen" class="dropdown-options" @click.stop>
                <label
                  v-for="emp in filteredEmployees"
                  :key="emp.empId"
                  class="dropdown-option"
                  :class="{ 'disabled-option': invitedEmployeeIds.includes(emp.empId) }"
                >
                  <input
                    type="checkbox"
                    :value="emp.empId"
                    v-model="selectedEmployees"
                    :disabled="invitedEmployeeIds.includes(emp.empId)"
                  />
                  <span class="option-text">{{ emp.name }}</span>
                </label>
              </div>
            </div>
  
            <!-- 已選清單 -->
            <div class="form-group" v-if="selectedEmployees.length">
              <label>已選與會人員：</label>
              <div class="selected-tags">
                <span v-for="empId in selectedEmployees" :key="empId" class="tag">
                  {{ getEmployeeName(empId) }}
                  <span class="remove-tag" @click="removeSelected(empId)">&times;</span>
                </span>
              </div>
            </div>
          </div>
  
          <div class="modal-footer">
            <button class="btn btn-cancel" @click="close">取消</button>
            <button class="btn btn-primary" @click="saveAttendees">邀請</button>
          </div>
        </div>
      </div>
    </Teleport>
  </template>
  
  <script setup>
  import { ref, defineProps, defineEmits, watch, onBeforeUnmount, computed } from 'vue';
  import axios from 'axios';
  import Swal from 'sweetalert2';
  
  const props = defineProps({ isOpen: Boolean, meeting: Object });
  const emit = defineEmits(['close', 'saved']);
  const path = import.meta.env.VITE_API_URL;
  
  const employees = ref([]);
  const selectedEmployees = ref([]);
  const selectedDepartment = ref('');
  const dropdownOpen = ref(false);
  const invitedEmployeeIds = ref([]);
  
  const departmentList = computed(() => {
    const set = new Set(employees.value.map(e => e.department));
    return Array.from(set);
  });
  
  const filteredEmployees = computed(() => {
    return employees.value
      .filter(emp => emp.empId !== props.meeting.employeeId)
      .filter(emp => !selectedDepartment.value || emp.department === selectedDepartment.value);
  });
  
  watch(
    () => props.isOpen,
    async (val) => {
      if (val) {
        document.addEventListener('click', handleClickOutside);
        document.body.style.overflow = 'hidden';
        resetSelection();
        await fetchEmployees();
      } else {
        document.removeEventListener('click', handleClickOutside);
        document.body.style.overflow = '';
      }
    },
    { immediate: true }
  );
  
  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
    document.body.style.overflow = '';
  });
  
  async function fetchEmployees() {
  try {
    const res = await axios.get(`${path}/api/contacts`);
    employees.value = res.data || [];

    if (props.meeting?.id) {
      const attendeesRes = await axios.get(`${path}/api/meetings/${props.meeting.id}/attendees`);
      if (Array.isArray(attendeesRes.data)) {
        invitedEmployeeIds.value = attendeesRes.data.map(a => a.employeeId);
      } else {
        invitedEmployeeIds.value = [];
      }
    } else {
      invitedEmployeeIds.value = [];
    }
  } catch (error) {
    console.error('員工載入失敗', error);
    Swal.fire('錯誤', '無法載入員工清單', 'error');
  }
}
  
  function toggleDropdown() {
    dropdownOpen.value = !dropdownOpen.value;
  }
  function closeDropdown() {
    dropdownOpen.value = false;
  }
  function handleClickOutside(e) {
    if (!e.target.closest('.form-group')) closeDropdown();
  }
  function resetSelection() {
    selectedEmployees.value = [];
    selectedDepartment.value = '';
    dropdownOpen.value = false;
  }
  function close() {
    resetSelection();
    emit('close');
  }
  function getEmployeeName(id) {
    const found = employees.value.find(emp => emp.empId === id);
    return found ? found.name : id;
  }
  function removeSelected(id) {
    selectedEmployees.value = selectedEmployees.value.filter(e => e !== id);
  }
  async function saveAttendees() {
    if (!selectedEmployees.value.length) {
      Swal.fire('提醒', '請至少選擇一位與會人員', 'warning');
      return;
    }
    try {
      const requestData = { employeeIds: selectedEmployees.value };
      await axios.post(`${path}/api/meetings/${props.meeting.id}/attendees`, requestData);
      emit('saved');
      close();
    } catch (error) {
      console.error('儲存失敗', error);
      Swal.fire('錯誤', '儲存與會人員失敗', 'error');
    }
  }
  </script>
  
  <style scoped>
  .custom-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.01);
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .custom-modal {
    background: white;
    width: 500px;
    max-width: 90%;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #ebeef5;
  }
  .modal-header {
    padding: 20px;
    border-bottom: 1px solid #f0f0f0;
  }
  .modal-title {
    font-size: 18px;
    font-weight: 500;
    margin: 0;
    color: #303133;
  }
  .modal-body {
    padding: 20px;
  }
  .form-group {
    margin-bottom: 18px;
  }
  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    color: #606266;
  }
  .department-select {
    width: 100%;
    padding: 6px;
    font-size: 14px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    background-color: #fff;
  }
  .custom-select {
    width: 100%;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 6px 10px;
    background-color: #fff;
    font-size: 14px;
    color: #303133;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .select-text {
    color: #565758;
  }
  .dropdown-options {
    border: 1px solid #dcdfe6;
    border-top: none;
    border-radius: 0 0 4px 4px;
    max-height: 200px;
    overflow-y: auto;
    background-color: #fff;
  }
  .dropdown-option {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    font-size: 14px;
    cursor: pointer;
  }
  .dropdown-option:hover {
    background-color: #f5f7fa;
  }
  .dropdown-option input {
    margin-right: 8px;
  }
  .option-text {
    color: #303133;
  }
  .selected-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
  }
  .tag {
    background-color: #f0f0f0;
    color: #333;
    border-radius: 3px;
    padding: 4px 8px;
    font-size: 13px;
  }
  .remove-tag {
    margin-left: 6px;
    cursor: pointer;
    color: red;
  }
  .modal-footer {
    padding: 10px 20px 20px;
    text-align: right;
  }
  .btn {
    display: inline-block;
    padding: 10px 20px;
    font-size: 14px;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    cursor: pointer;
    margin-left: 10px;
  }
  .btn-primary {
    background-color: #9e6de0;
    color: #fff;
    border-color: #9e6de0;
  }
  .btn-primary:hover {
    background-color: #bd95f1;
  }
  .btn-cancel:hover {
    color: #409eff;
    border-color: #c6e2ff;
    background-color: #ecf5ff;
  }
  .disabled-option {
    opacity: 0.5;
    pointer-events: none;
  }
  .disabled-option .option-text {
    color: #999;
  }
  .disabled-option input {
    cursor: not-allowed;
  }
  </style>
  