<template>
<div class="card h-100 shadow-sm">
  <img class="card-img-top room-img" 
    alt="會議室圖片"
    :src="item.image ? `data:image/jpeg;base64,${item.image}` : defaultImage"
  >
  <div class="card-body">
    <h5 class="card-title">{{ item.roomName }}</h5>
    <div class="card-text text-danger">容納人數: {{ item.capacity }}</div>
    <div class="card-text">地點: {{ item.location }}</div>

      <div class="d-flex justify-content-between mt-3" v-if="isEmployee">
        <button class="btn btn-danger px-4 ms-auto"  @click="emits('openReserve', item)">
          預約
        </button>
        <button class="btn btn-primary px-4" @click="emits('openIdle', item.id)">
          顯示
        </button>
      </div>

    <!-- 調整按鈕對齊方式 -->
    <div class="d-flex justify-content-between mt-3" v-if="isAdmin">
      <button class="btn btn-danger px-4 ms-auto" @click="emits('delete', item.id)">刪除</button> 
      <button class="btn btn-primary px-4" @click="emits('openUpdate', item)">修改</button>
    
    </div>
    
  </div>
</div>

</template>

<script setup>
import {  ref, computed } from 'vue';

const defaultImage = ref('https://dummyimage.com/300x200/ccc/000&text=No+Image');

const props = defineProps({
  item: Object,
  roleName: String, 
});
const emits = defineEmits(["openUpdate", "delete","openReserve", "openIdle"]);

// 管理員
const isAdmin = computed(checkIsAdminComputed);


function checkIsAdminComputed() {
  return props.roleName === "最高管理員" || props.roleName === "次等管理員";
}

// 員工
const isEmployee = computed(checkIsEmployee);

function checkIsEmployee() {
    return props.roleName === "員工" || props.roleName === "行政主管" || props.roleName === "人資主管" || props.roleName === "業務主管" || props.roleName === "技術主管";
}


</script>



<style scoped>
.room-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.card {
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: scale(1.02); 
}

.card-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.8rem;
  letter-spacing: 0.5px;
}

.card-text {
  font-size: 0.95rem;
  color: #555;
  margin-bottom: 0.4rem;
  letter-spacing: 0.3px;
}

.card-text.text-danger {
  color: #e74c3c;
  font-weight: 600;
}

.card-body {
  font-family: "Noto Sans TC", "微軟正黑體", sans-serif;
}
</style>
