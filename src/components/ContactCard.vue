<template>
    <div class="card h-100 shadow-sm">
        <img class="card-img-top contact-img" alt="員工照片"
        :src="item.photo ? 'data:image/jpeg;base64,' + item.photo : defaultImage">
        <div class="card-body">
            <h5 class="card-title">{{ item.name }}</h5>
            <div class="card-text text-danger">{{ item.department }}
                <span v-if="item.position !== '員工'"> {{ item.position }}</span>
            </div>
            <div class="card-text">信箱: {{ item.email }}</div>
            <div class="card-text">電話: {{ item.phone }}</div>
        </div>
    </div>

</template>

<script setup >

import { ref } from 'vue';

const defaultImage = ref('https://dummyimage.com/300x200/ccc/000&text=No+Image');

const props = defineProps(["item"]);


</script>
<style scoped>

/* 圖片不要超過卡片的範圍 */
.contact-img {
width: 100%; /* 滿版 */
height: 200px; /* 高度 */
object-fit: cover; /* 保持比例 */
border-top-left-radius: 8px;
border-top-right-radius: 8px;
}

/* 對齊 */
.card {
border-radius: 8px;
overflow: hidden;
transition: transform 0.2s ease-in-out;
}

/* 放大 */
.card:hover {
transform: scale(1.02); 
}
</style>