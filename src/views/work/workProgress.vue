<template>
  <div class="row mb-4">
    <div class="col-4">
      <input type="text" class="form-control" placeholder="搜尋工作..." v-model="worksearch" @input="find">
    </div>
    <div v-if="user.roleName == '最高管理員'">
    部門查詢<select v-model="department" @change="dochangeDep()" >
              <option value="">全部</option>
              <option v-for="department in departments" :key="department.departmentName" :value="department.departmentName">
                {{ department.departmentName }}
              </option>
            </select>
    </div>
    狀態查詢<select v-model="status" @change="find">
              <option value="">全部</option>
              <!-- 使用v-for來動態顯示部門選項 -->
              <option v-for="sta in statusSelect" :value="sta">
                {{ sta }}
            </option>
    </select>
    <RouterLink class="btn btn-primary btn-pill" to="/work/progress/create">
      <span class="nav-text">新增工作</span>
    </RouterLink>
  </div>
    <h2 v-if="check">查無資料</h2>
    <div class="accordion accordion-shadow" id="accordionShadow">
        <div class="card"  v-for="work in works" :key="work.workprogressId">
            <div class="card-header" :id="'headingShadow'+work.workprogressId">
                <h2 class="mb-0">
                    <button class="btn btn-link collapsed" type="button" data-toggle="collapse" :data-target="'#collapseShadow'+work.workprogressId" aria-expanded="false" :aria-controls="'collapseShadow'+work.workprogressId">{{work.workName}}     {{ work.status.statusName }}
                    </button>
                </h2>
            </div>
            <div :id="'collapseShadow'+work.workprogressId" class="collapse" :aria-labelledby="'headingShadow'+work.workprogressId" data-parent="#accordionShadow">
                <div class="card-body">
                    <p class="card-text pb-4 pt-1">創建日期 : {{formatDate(work.createDate)}}</p>
                    <p class="card-text pb-4 pt-1">預計完成日期 : {{formatDate(work.expectedFinishDate)}}</p>
                    <p class="card-text pb-4 pt-1" v-if="work.finishDate==null">完成日期 : 尚未完成</p>
                    <p class="card-text pb-4 pt-1" v-if="work.finishDate!=null">完成日期 : {{formatDate(work.finishDate)}}</p>
                    <p class="card-text pb-4 pt-1">負責人 : {{work.supervisor.employeeName}}</p>
                    完成進度 :<div class="progress mb-3">
                     <div class="progress-bar" role="progressbar" :style="{ width: work.progress + '%' }" :aria-valuenow="work.progress"  aria-valuemin="0"
                    aria-valuemax="100">{{work.progress}}%
                    </div></div>
                    <RouterLink :to="`/work/progress/detail/${work.workprogressId}`" class="btn btn-primary btn-sm">查看</RouterLink>
                </div>
            </div>
        </div>
      </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axiosapi from "@/plugins/axios-login";
import useUserStore from '@/stores/user';
const user = useUserStore();
const worksearch=ref("")
const works=ref({});
const check=ref(false)

const status=ref("")
const statusSelect=ref(["未完成","已完成"])
async function find(){
  if(user.roleName != '最高管理員'){
    department.value=user.empDep
  }
  if(status.value==''&&worksearch.value==''&&department.value==''){
    const response=await axiosapi.get("/workProgress/all");
    works.value=response.data
    check.value=false
  }else if(worksearch.value==''&&status.value!=''&&department.value==''){
    const response=await axiosapi.get(`/workProgress/findstatus/${status.value}`);
    works.value=response.data
    check.value=false
    if (response.data.length === 0) {
        check.value=true
    }
  }else if(worksearch.value!=''&&status.value==''&&department.value==''){
    const response=await axiosapi.get(`/workProgress/findname/${worksearch.value}`);
    works.value=response.data
    check.value=false
    if (response.data.length === 0) {
        check.value=true
    }
  }else if(worksearch.value!=''&&status.value!=''&&department.value==''){
    const response=await axiosapi.get(`/workProgress/find/${status.value}/${worksearch.value}`);
    works.value=response.data
    check.value=false
    if (response.data.length === 0) {
        check.value=true
    }
  }else if(worksearch.value==''&&status.value==''&&department.value!=''){
    const response=await axiosapi.get(`/workProgress/finddepartment/${department.value}`);
    works.value=response.data
    check.value=false
    if (response.data.length === 0) {
        check.value=true
    }
  }else if(worksearch.value==''&&status.value!=''&&department.value!=''){
    console.log(department.value+status.value)
    const response=await axiosapi.get(`/workProgress/findDepAndSta/${department.value}/${status.value}`);
    works.value=response.data
    check.value=false
    if (response.data.length === 0) {
        check.value=true
    }
  }else if(worksearch.value!=''&&status.value==''&&department.value!=''){
    const response=await axiosapi.get(`/workProgress/findDepAndName/${department.value}/${worksearch.value}`);
    works.value=response.data
    check.value=false
    if (response.data.length === 0) {
        check.value=true
    }
  }else{
    const response=await axiosapi.get(`/workProgress/findDepAndStaAndName/${department.value}/${status.value}/${worksearch.value}`);
    works.value=response.data
    check.value=false
    if (response.data.length === 0) {
        check.value=true
    }
  }
}

function dochangeDep(){
  status.value=''
  find()
}

const department=ref("");
const departments = ref([]);
async function departmentFind(){
  if(user.roleName != '最高管理員'){
    department.value=user.empDep
  }
    try {
    const response = await axiosapi.get("/department/find");  
    departments.value = response.data;  
    } catch (error) {
    console.error("獲取部門資料失敗:", error);
    }
}

onMounted(function () {
  find();
  departmentFind()
});

function formatDate(date) {
  const formattedDate = new Date(date);
  const year = formattedDate.getFullYear(); // 取得年份
  const month = (formattedDate.getMonth() + 1).toString().padStart(2, "0"); // 取得月份並補零
  const day = formattedDate.getDate().toString().padStart(2, "0"); // 取得日期並補零
  return `${year}/${month}/${day}`; // 返回格式化的日期字符串
}
</script>

<style setup>

</style>
