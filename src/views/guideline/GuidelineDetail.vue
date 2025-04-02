<template>
    <div class="card card-default" id="page-views">
    <div class="card-header">
        <h2>{{guideline.guideTitle}}</h2>
    </div>
        <div class="card-body py-0" data-simplebar>
            <div v-for="content in contents" :key="content.guidelineContentId">
                <!-- 如果是純文字 -->
                <p v-if="content.contentType === 'text'">{{ content.textContent }}</p>

                <!-- 如果是超連結 -->
                <p v-if="content.contentType === 'link'">
                <a :href="content.textContent" target="_blank">{{ content.textContent }}</a>
                </p>

                <!-- 如果是圖片 -->
                <p v-if="content.contentType === 'image'">
                <img :src="content.imageContent" alt="圖片" style="width: 50%; height: auto;">
                </p>

                <!-- Google Map -->
    <div v-if="content.contentType === 'map'">
      <iframe
        :src="content.textContent"
        width="100%"
        height="1000"
        style="border:0;"
        allowfullscreen=""
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade">
      </iframe>
    </div>

    <!-- 內嵌影片 -->
    <div v-if="content.contentType === 'video'" class="video-container">
      <iframe
        :src="content.textContent"
        width="100%"
        height="1000"
        frameborder="0"
        allowfullscreen>
      </iframe>
    </div>
            </div>
        <div class="bg-white py-4"></div>
        </div>
        <div class="action-text" v-if="[...adminRoles, ...userRoles].includes(userStore.roleName)">
            <RouterLink :to="`/guideline/update/${guideId}`" class="edit-text">編輯</RouterLink>
            <span @click="deleteContent(guideline.guideId)" class="delete-text">刪除</span>
        </div>
    </div>
    <div>
        <RouterLink to="/guideline/all">回智庫首頁</RouterLink>
    </div>
</template>
    
<script setup>
import Swal from "sweetalert2";
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { useRouter } from 'vue-router';
import useUserStore from "@/stores/user";

const path = import.meta.env.VITE_API_URL;
const userStore = useUserStore();
const adminRoles = ["最高管理員", "次等管理員"]; // 管理員角色
const userRoles = ["行政主管", "人資主管", "業務主管", "技術主管"]; // 普通角色

const router = useRouter();
const route = useRoute()
const guideline = ref({})
const contents = ref([])
const guideId = route.params.id
onMounted(async () => {
     // 從路由中取得動態參數 id
    try {
    // 發送 GET 請求到後端 API
        const response = await axios.get(`${path}/api/guidelines/${guideId}`)
        guideline.value = response.data.guideline  // 儲存返回的指南資料
        contents.value = response.data.contents  // 儲存相關的內容列表
    } catch (error) {
        console.error('Error fetching guideline detail:', error)
    }
})

async function deleteContent(id){
    if(id){
        const result=await Swal.fire({
            title:"確定?",
            icon:"question",
            showCancelButton:true,
        });
        if(result.isConfirmed){
            try{
                const response=await axios.delete(`http://localhost:8080/api/guidelines/${id}`);
                console.log(response)
                if(response.data.success){
                    await Swal.fire({
                        title:response.data.message,
                        icon:"success"
                    });
                    router.push({ name: "guideline-all-link" });
                }else{
                    Swal.fire({
                        title:response.data.message,
                        icon:"warning"
                    })
                }
            }catch(error){
                console.log("error",error);
                Swal.fire({
                    title:"失敗"+error.message,
                    icon:"error"
                })
            }

        }
    }

}
</script>
    
<style scoped>
.card {
    position: relative; /* 使action-text能夠相對於這個元素定位 */
}

.action-text {
    position: absolute;
    bottom: 20px; /* 距離底部 20px */
    right: 20px; /* 距離右邊 20px */
    display: flex;
    justify-content: space-between; /* 讓文字左右排列 */
    gap: 10px; /* 文字之間的間距 */
}

/* 編輯文字 */
.edit-text {
    color: #007bff; /* 編輯文字藍色 */
    text-decoration: underline; /* 底線 */
    cursor: pointer;
}

/* 刪除文字 */
.delete-text {
    color: #dc3545; /* 刪除文字紅色 */
    text-decoration: underline; /* 底線 */
    cursor: pointer;
}

/* 懸停時顏色變化 */
.edit-text:hover {
    color: #0056b3; /* 編輯懸停藍色 */
}

.delete-text:hover {
    color: #c82333; /* 刪除懸停紅色 */
}
</style>