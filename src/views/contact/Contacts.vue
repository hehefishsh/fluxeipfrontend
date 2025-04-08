<template>
<div class="container mt-4">
    <div class="row mb-4">
    <div class="col-4">
        <input type="text" class="form-control" placeholder="搜尋員工..." v-model.trim="search" @input="applyFilter">
    </div>
    <select class="form-control custom-select" v-model="department" @change="applyFilter">
          <option value="">所有部門</option>
          <!-- 使用v-for來動態顯示部門選項 -->
          <option v-for="dep in departments" :key="dep.departmentId" :value="dep.departmentName">
            {{ dep.departmentName }}
          </option>
        </select>
    </div>


    <div class="row">
    <div class="col-lg-4 col-md-6 mb-4" v-for="item in contacts" :key="item.id">
        <ContactCard :item="item"></ContactCard>
    </div>
    </div>


    <div class="row justify-content-center mt-4">
    <Paginate 
        :first-last-button="true"
        first-button-text="&lt;&lt;"
        last-button-text="&gt;&gt;"
        prev-text="&lt;"
        next-text="&gt;"
        :force-page="current"
        :page-count="pages"
        :page-range="3"
        :margin-pages="2"
        :click-handler="changePage"
        class="pagination"
    />
    </div>
</div>
</template>
    
<script setup>
import Paginate from 'vuejs-paginate-next';
import { ref, onMounted, computed, watch } from 'vue';
import Swal from 'sweetalert2';
import axios from 'axios';
import ContactCard from '@/components/ContactCard.vue';


const path = import.meta.env.VITE_API_URL;

const current = ref(1); 
const pages = ref(0); 
const rows = ref(6); 
const emps = ref([]); 
const filteredEmps = ref([]); 
const search = ref(""); 
const department = ref("");
const departments = ref([]);
onMounted(() => {
    callFind();
});


watch(search, () => {
    current.value = 1; 
    applyFilter();
});


async function callFind(page = current.value) {
    try {
        const response = await axios.get(`${path}/api/contacts`, {
        params: {
            page: page,
            limit: rows.value,
            search: search.value,
        },
        });
    emps.value = response.data || [];
    applyFilter();
    } catch (error) {
        console.error("查詢失敗:", error);
        Swal.fire({
            title: "讀取失敗：" + error.message,
            icon: "error",
        });
    }
}


function applyFilter() {
    let filteredData = emps.value;

    if (search.value) {
        filteredData = filteredData.filter(emp =>
        emp.name.toLowerCase().includes(search.value.toLowerCase())
        );
    }


    if (department.value) {
        filteredData = filteredData.filter(emp =>
        emp.department.toLowerCase().includes(department.value.toLowerCase())
        );
    }

    filteredEmps.value = filteredData;

    pages.value = Math.ceil(filteredEmps.value.length / rows.value);
    current.value=1;
}

function changePage(page) {
    current.value = page;
}


const contacts = computed(() => {
    const start = (current.value - 1) * rows.value;
    const end = start + rows.value;
    const paginatedData = filteredEmps.value.slice(start, end) || [];
    return paginatedData;
});

onMounted(async () => {
    try {
        const response = await axios.get(`${path}/department/find`);
        departments.value = response.data || [];  // 假設回應是部門資料
    } catch (error) {
    console.error("取得部門資料失敗:", error);
    }
});

</script>
    
<style>
.pagination {
    display: flex;
    justify-content: center;
}
.custom-select {
    width: 150px;
    padding: 5px;
}
</style>