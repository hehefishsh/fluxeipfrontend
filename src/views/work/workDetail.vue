<template>
    <div class="card card-default">
        <div>
            <div class="card-header">
                <div class="col">
                    <h2>項目名 : {{work.workName}}</h2>
                </div>
                <div class="col">
                    <h2>創建日期 : {{formatDate(work.createDate)}}</h2>
                </div>
                <div class="col">
                    <h2>預計完成日期 : {{formatDate(work.expectedFinishDate)}}</h2>
                </div>
                <div class="col">
                    <h2 v-if="work.finishDate!=null">完成日期 : {{formatDate(work.finishDate)}}</h2>
                    <h2 v-if="work.finishDate==null">完成日期 : 未完成</h2>
                </div>
                <div class="col">
                    <h2>負責主管 : {{supervisor}}</h2>
                </div>
                <div class="col">
                    <RouterLink class="btn btn-primary btn-pill" :to="`/work/progress/update/${work.workprogressId}`">
                        <span class="nav-text">編輯工作</span>
                    </RouterLink>
                </div>
            </div>
            
            <div class="card-body py-0" data-simplebar>
                <h4>工作進度{{work.progress}}%</h4>
                <div class="progress mb-3">
                    <div class="progress-bar" role="progressbar" :style="{ width: work.progress + '%' }" :aria-valuenow="work.progress"  aria-valuemin="0"
                    aria-valuemax="100">{{work.progress}}%
                    </div>
                </div>
            </div>
            <div class="card-body py-0" data-simplebar>
                <ul class="nav nav-tabs mb-3" id="pills-tab" role="tablist">
                    <li class="nav-item">
                        <a class="nav-link" data-toggle="pill" @click="findtaskAssign('')">全部</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link"  data-toggle="pill" @click="findtaskAssign('未完成')">未完成</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link active"  data-toggle="pill" @click="findtaskAssign('待審核')">待審核</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link"  data-toggle="pill" @click="findtaskAssign('已完成')">已完成</a>
                    </li>
                </ul>
                <div class="tab-content mt-3">
                    <div>
                        <table class="table table-borderless table-thead-border">
                            <thead>
                                <tr>
                                    <th class="text">工作名</th>
                                    <th class="text">工作內容</th>
                                    <th class="text">負責員工</th>
                                    <th class="text">開始時間</th>
                                    <th class="text">預計結束時間</th>
                                    <th class="text">結束時間</th>
                                    <th class="text" v-if="status=='待審核'||status=='已完成'">審核</th>
                                    <th class="text"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                v-for="task in taskAssigns" :key="task.taskId">
                                    <td class="text">{{ task.taskName }}</td>
                                    <td class="text">{{ task.taskContent }}</td>
                                    <td class="text">{{ task.assign.employeeName }}</td>
                                    <td class="text">{{ formatDate(task.createDate) }}</td>
                                    <td class="text">{{ formatDate(task.expectedFinishDate) }}</td>
                                    <td class="text" v-if="task.finishDate!=null">{{ formatDate(task.finishDate) }}</td>
                                    <td class="text" v-else>未完成</td>
                                    <td class="text" v-if="status=='待審核'">
                                        <button class="badge badge-square badge-success" @click="review(task.taskId,'已完成')">完成</button>
                                        <button class="badge badge-square badge-warning" @click="review(task.taskId,'未完成')">重做</button>
                                    </td>
                                    <td class="text" v-if="status=='已完成'">
                                        <button class="badge badge-square badge-warning" @click="review(task.taskId,'未完成')">重做</button>
                                    </td>
                                    <td class="text"><i class="mdi mdi-pencil mdi-24px" @click="openModal(task.taskId)"></i></td>
                                    <td class="text"><i class="mdi mdi-delete mdi-24px"
                                    @click="deletetask(task.taskId)"></i></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <button class="fixed-button" @click="openModal(null)">新增交辦事項</button>
    <Taskassign ref="modal" 
                    v-model:task="task" 
                    v-model:empselect="empselect"
                    :is-show-button-insert="isShowButtonInsert"
                    @update="callUpdate"
                    @insert="insert"
    ></Taskassign>
</template>
    
<script setup>
import Taskassign from "@/components/Taskassign.vue";
import { ref,onMounted } from "vue";
import { useRoute } from "vue-router";
import axiosapi from "@/plugins/axios";
import Swal from "sweetalert2";
const route = useRoute();
const workId = route.params.id;
const work=ref({})
const taskAssigns=ref({})
const supervisor=ref("")
const empselect=ref([])
const status=ref('')

const task=ref({})
async function callUpdate(){
    if(task.value.taskName==''){
        Swal.fire({
            title: "請輸入名稱",
            icon: "warning"
        });
    } else if(task.value.taskContent==''){
        Swal.fire({
            title: "請輸入內容",
            icon: "warning"
        });
    }else {
        task.value.reveiew=supervisor.value
        const response=await axiosapi.put(`/taskassign/${task.value.taskId}`,task.value);
        if(response){
            Swal.fire({
                title:"修改成功",
                icon:"success"
            })
            task.value=""
            findtaskAssign(status.value)
            modal.value.closeModal();
        }else{
            Swal.fire({
                title:"修改失敗",
                icon:"warning"
            })
        }
    }
}

async function insert(){
    if(task.value.taskName==''){
        Swal.fire({
            title: "請輸入名稱",
            icon: "warning"
        });
    } else if(task.value.taskContent==''){
        Swal.fire({
            title: "請輸入內容",
            icon: "warning"
        });
    }else if(task.value.expectedFinishDate==null){
        Swal.fire({
            title: "請輸入預計完成日期",
            icon: "warning"
        });
    }else {
        task.value.status ="未完成"
        task.value.finishDate =null
        task.value.reveiew=supervisor.value
        console.log(task.value)
        const response=await axiosapi.post(`/taskassign/create/${workId}`,task.value);
        if(response){
                Swal.fire({
                    title:"新增成功",
                    icon:"success"
                })
                task.value=""
                findwork()
                findtaskAssign(status.value)
                modal.value.closeModal();
            }else{
                Swal.fire({
                    title:"修改失敗",
                    icon:"warning"
            })
        }
    }
}

async function deletetask(data){
    const response =await axiosapi.delete(`/taskassign/${data}`);
    if(response){
        findtaskAssign(status.value)
    }
}

async function review(data,review){
    const response =await axiosapi.put(`/taskassign/update/${data}/${review}`);
    if(response){
        findtaskAssign(status.value)
        findwork()
    }
}

const isShowButtonInsert=ref(true);
const modal=ref(null);
async function openModal(data){
    if(data!=null){
        isShowButtonInsert.value=true
        const response=await axiosapi.get(`/taskassign/${data}`);
        task.value=response.data
        task.value.createDate = formatDate(task.value.createDate);
        task.value.expectedFinishDate = formatDate(task.value.expectedFinishDate);
        task.value.employee=response.data.assign.employeeName
    }
    else{
        task.value={}
        task.value.createDate =getTodayDate()
        isShowButtonInsert.value=false
    }
    modal.value.showModal();
}

async function findwork(){
    const response=await axiosapi.get(`/work/taskassign/${workId}`);
    work.value=response.data.workprogress
    console.log(work.value)
    supervisor.value=response.data.workprogress.supervisor.employeeName
    const dep=await axiosapi.get(`/employee/find/department/${response.data.workprogress.supervisor.department.departmentName}`);
    empselect.value=dep.data
}

async function findtaskAssign(data){
    if(data==''){
        const response=await axiosapi.get(`/work/taskassign/${workId}`);
        taskAssigns.value=response.data.taskassign
        status.value=data
        return;
    }else if(data=='待審核'){
        const response=await axiosapi.get(`/work/taskassign/${workId}/${data}`);
        taskAssigns.value=response.data
        status.value=data
        return;
    }else if(data=='已完成'){
        const response=await axiosapi.get(`/work/taskassign/${workId}/${data}`);
        taskAssigns.value=response.data
        status.value=data
        return;
    }else if(data=='未完成'){
        const response=await axiosapi.get(`/work/taskassign/${workId}/${data}`);
        taskAssigns.value=response.data
        status.value=data
        return;
    }
}

onMounted(function(){
    findwork()
    findtaskAssign('待審核')
})
function formatDate(date) {
    const formattedDate = new Date(date);
    const year = formattedDate.getFullYear(); // 取得年份
    const month = (formattedDate.getMonth() + 1).toString().padStart(2, '0'); // 取得月份並補零
    const day = formattedDate.getDate().toString().padStart(2, '0'); // 取得日期並補零
    return `${year}-${month}-${day}`; // 返回格式化的日期字符串
};
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // 月份從0開始，需加1
        const day = String(today.getDate()).padStart(2, '0'); // 使日期為兩位數

    return `${year}-${month}-${day}`;
}
</script>
    
<style  scoped>
.fixed-button {
    position: fixed;
    bottom: 20px; /* 按鈕離底部 20px */
    right: 20px;  /* 按鈕離右邊 20px */
    padding: 10px 20px;
    background-color: #007BFF;
    color: white;
    border: none;
    border-radius: 10%;
    /* font-size: 16px; */
    cursor: pointer;
    /* box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); */
    transition: background-color 0.3s ease;
}
</style>