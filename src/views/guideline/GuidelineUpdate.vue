<template>
    <div class="card card-default form-container">
      <form @submit.prevent="submitForm">
        <!-- 標題 -->
        <h3 class="form-title">標題</h3>
        <input v-model="guideline.guideTitle" placeholder="輸入標題" class="input-field" required/>
  
        <!-- 內容區塊 -->
        <h3 class="form-title">內容</h3>
        <div v-for="(content, index) in contents" :key="index" class="content-group">
          <div class="content-wrapper">
            <!-- 選擇內容類型 -->
            <select v-model="content.contentType" class="select-field">
              <option value="text">文字</option>
              <option value="link">超連結</option>
              <option value="image">圖片</option>
              <option value="map">地圖</option>
              <option value="video">影片</option>
            </select>
  
            <!-- 文字 or 連結輸入框 -->
            <input
      v-if="['text', 'link', 'map', 'video'].includes(content.contentType)"
      v-model="content.textContent"
      :placeholder="getPlaceholder(content.contentType)"
      class="input-field"
    />
  
            <!-- 圖片上傳 -->
            <div v-if="content.contentType === 'image'" class="image-upload">
              <input type="file" @change="handleFileUpload($event, index)" class="file-input" />
              <img v-if="imagePreviews[index]" :src="imagePreviews[index]" class="image-preview" />
            </div>
          </div>
  
          <!-- 刪除按鈕 -->
          <button type="button" @click="removeField(index)" class="delete-button">X</button>
        </div>
  
        <!-- 新增內容按鈕 -->
        <button type="button" @click="addField" class="add-button">新增內容</button>
  
        <!-- 送出按鈕 -->
        <button type="submit" class="submit-button">提交</button>
<button type="button" @click="cancelEdit" class="cancel-button">取消</button>

      </form>
    </div>
  </template>
  
  <script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router"; // 引入 useRoute
import axios from "axios";
import { useRouter } from 'vue-router';

const path = import.meta.env.VITE_API_URL;

// **狀態管理**
const guideline = ref({ guideTitle: "" });
const contents = ref([{ contentType: "text", textContent: "" }]);
const imageFiles = ref([]);
const imagePreviews = ref([]);
const router = useRouter();
// 使用 useRoute 獲取當前路由
const route = useRoute();

const guidelineId = route.params.guidelineId; // 從路由參數中獲取 guidelineId

// **新增欄位**
function addField() {
  contents.value.push({ contentType: "text", textContent: "" });
}

// **刪除欄位**
function removeField(index) {
  contents.value.splice(index, 1);
  imageFiles.value.splice(index, 1);
  imagePreviews.value.splice(index, 1);
}

// **圖片上傳處理**
function handleFileUpload(event, index) {
  const file = event.target.files[0];
  if (file) {
    imageFiles.value[index] = file;
    contents.value[index].imageContent = "";

    // 圖片預覽
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreviews.value[index] = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// **表單提交**
async function submitForm() {
  const formData = new FormData();

  // **組裝 JSON**
  const payload = {
    guideline: guideline.value,
    contents: contents.value.map((content, index) => ({
      contentType: content.contentType,
      textContent: content.contentType!=="image"?content.textContent : "",
      imageContent: content.contentType === "image" ? content.imageContent : "",
    })),
  };

  formData.append("data", JSON.stringify(payload));

  // **附加圖片**
  imageFiles.value.forEach((file) => {
    if (file) {
      formData.append("files", file);
    }
  });

  // **發送請求**
  try {
    const response = await axios.post(`${path}/api/guidelines`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    router.push({ name: "guideline-all-link" });
  } catch (error) {
    console.error("提交失敗:", error);
  }
}


async function cancelEdit() {
    // 這裡可以根據需求執行返回上一頁、清空表單等操作
    router.push(`/guideline/all`); // 導回指引首頁
}
// 根據類型顯示不同的 placeholder
const getPlaceholder = (type) => {
  switch (type) {
    case "text":
      return "輸入文字";
    case "link":
      return "輸入超連結 (https://...)";
    case "map":
      return "輸入 Google 地圖網址 (https://www.google.com/maps/...)";
    case "video":
      return "輸入 YouTube 內嵌連結 (https://www.youtube.com/embed/...)";
    default:
      return "";
  }
};
  </script>
  
  <style scoped>
  /* 表單容器 */
  .form-container {
    max-width: 600px;
    margin: 20px auto;
    padding: 20px;
    background: #fff;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
  }
  
  /* 標題樣式 */
  .form-title {
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  /* 輸入框 */
  .input-field {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  /* 選擇類型 */
  .select-field {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background: white;
  }
  
  /* 內容區塊 */
  .content-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
    padding: 5px;
    border: 1px solid #e0e0e0;
    border-radius: 5px;
  }
  
  /* 內容包裝區 */
  .content-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    flex: 1;
  }
  
  /* 輸入框與選項 */
  .input-field,
  .select-field {
    flex: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: 100%;
  }
  
  /* 圖片上傳區 */
  .image-upload {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .file-input {
    width: 100%;
  }
  
  /* 刪除按鈕 */
  .delete-button {
    color: red;
    text-decoration: underline;
    background: none;
    padding: 0;
    border: none;
  }
  
  .delete-button:hover {
    font-weight: bold;
  }
  
  /* 其他按鈕 */
  .add-button, .submit-button {
    padding: 10px 15px;
    border-radius: 5px;
  }
  
  .image-preview {
    width: 50px;
    height: 50px;
    margin-top: 5px;
    border-radius: 5px;
    object-fit: cover;
  }

  .cancel-button {
  background-color: #ccc;
  color: black;
  border: none;
  padding: 8px 16px;
  margin-left: 10px; /* 讓按鈕有間距 */
  cursor: pointer;
  border-radius: 4px;
}

.cancel-button:hover {
  background-color: #aaa;
}
  </style>
  