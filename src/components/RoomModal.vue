<template>
  <div class="modal" :class="{ 'd-block': isOpen }">
    <div class="modal-dialog">
      <div class="modal-content">
        <!-- 標題列 -->
        <div class="modal-header">
          <h5 class="modal-title">{{ isEdit ? "修改會議室" : "新增會議室" }}</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>

        <!-- 表單內容 -->
        <div class="modal-body">
          <!-- 會議室名稱 -->
          <input
            v-model="roomData.roomName"
            class="form-control mb-2"
            :class="{ 'is-invalid': isInvalid && !roomData.roomName }"
            placeholder="會議室名稱"
          />
          <div v-if="isInvalid && !roomData.roomName" class="text-danger">請輸入會議室名稱</div>

          <!-- 容納人數 -->
          <input
            v-model.number="roomData.capacity"
            type="number"
            class="form-control mb-2"
            placeholder="容納人數"
          />

          <!-- 地點 -->
          <input
            v-model="roomData.location"
            class="form-control mb-2"
            :class="{ 'is-invalid': isInvalid && !roomData.location }"
            placeholder="地點"
          />
          <div v-if="isInvalid && !roomData.location" class="text-danger">請輸入會議室地點</div>

          <!-- 圖片上傳 -->
          <label for="roomImage" class="form-label">上傳會議室圖片</label>
          <input
            type="file"
            class="form-control mb-2"
            id="roomImage"
            @change="onFileChange"
            accept="image/*"
          />
          <div v-if="previewImage" class="text-center mt-2">
            <img :src="previewImage" class="preview-img" />
          </div>
        </div>

        <!-- 底部按鈕區 -->
        <div class="modal-footer d-flex justify-content-between align-items-center">
          <!-- 左下角 Demo -->
          <button class="btn btn-outline-primary btn-sm" @click="fillDemo">Demo</button>

          <!-- 右下角取消 / 新增 -->
          <div class="action-buttons">
            <button class="btn btn-secondary" @click="close">取消</button>
            <button class="btn btn-primary" @click="submit">{{ isEdit ? "更新" : "新增" }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps(["isOpen", "isEdit", "room"]);
const emits = defineEmits(["close", "save"]);

const roomData = ref({
  id: null,
  roomName: "",
  capacity: 1,
  location: "",
});

const selectedFile = ref(null);
const previewImage = ref(null);
const isInvalid = ref(false);

// 監聽編輯資料
watch(
  () => props.room,
  (newRoom) => {
    if (newRoom) {
      roomData.value = { ...newRoom };
      previewImage.value = newRoom.image ? `data:image/jpeg;base64,${newRoom.image}` : null;
    }
  },
  { immediate: true }
);

// 處理圖片上傳預覽
function onFileChange(event) {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    previewImage.value = URL.createObjectURL(file);
  }
}

// 關閉 modal
function close() {
  emits("close");
}

// 填入 demo 資料（不包含圖片）
function fillDemo() {
  roomData.value.roomName = "研發會議室";
  roomData.value.capacity = 20;
  roomData.value.location = "A棟二樓會議區";
  isInvalid.value = false;
}

// 送出表單
function submit() {
  if (!roomData.value.roomName || !roomData.value.location) {
    isInvalid.value = true;
    return;
  }

  emits("save", { ...roomData.value, image: selectedFile.value });
}
</script>

<style scoped>
.modal {
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-img {
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 8px;
}

.action-buttons {
  display: flex;
  gap: 12px; /* 調整按鈕間距 */
}
</style>
