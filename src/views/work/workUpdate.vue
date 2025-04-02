<template>
    <div class="card card-default form-container">

            <h3 class="form-title">工作內容</h3>
            工作名稱<input v-model="work.workName" placeholder="輸入名稱" class="input-field" />
            開始日期<input type="date" v-model="work.createDate" class="custom-select my-1 mr-sm-2 w-auto"/>
            預計完成日期<input type="date" v-model="work.expectedFinishDate" class="custom-select my-1 mr-sm-2 w-auto"/>
            完成日期<input type="date" v-model="work.finishDate" class="custom-select my-1 mr-sm-2 w-auto"/>
            狀態<select v-model="work.status" @change="workreview(work.status)">
                            <option v-for="sta in statusSelect"  :value="sta">
                                {{ sta }}
                            </option>
                        </select>

            <h3 class="form-title">分配工作</h3>
            <div v-for="(content, index) in contents" :key="index" class="content-group">
                <div class="content-wrapper">
                項目名稱 {{ index+1 }}<input v-model="content.taskName" :placeholder="'輸入名稱 '" class="input-field" />

                工作內容<input
                    v-model="content.taskContent" 
                    :placeholder="'輸入內容 '" class="input-field" />
                            
                負責員工<select v-model="content.employee" >
                            <option v-for="emplo in empselect"  :value="emplo.employeeName">
                              {{ emplo.employeeName }}
                            </option>
                        </select>
                
                開始日期<input type="date"  v-model="content.createDate" class="custom-select my-1 mr-sm-2 w-auto"/>
                預計完成日期<input type="date"  v-model="content.expectedFinishDate" class="custom-select my-1 mr-sm-2 w-auto"/>
                完成日期<input type="date"  v-model="content.finishDate" class="custom-select my-1 mr-sm-2 w-auto"/>
                狀態<select v-model="content.status" @change="review(content.status,index)">
                    <option v-for="sta in statusSelect"  :value="sta">
                        {{ sta }}
                    </option>
                </select>
            </div>
                <!-- 刪除按鈕 -->
                <button type="button" @click="removeField(index)" class="delete-button">X</button>
            </div>
                <!-- 新增內容按鈕 -->
                <button type="button" @click="addField" class="add-button">新增交辦事項</button>
          
                <!-- 送出按鈕 -->
                <div style="text-align: right;" class="fixed-button">
                  <button @click="submit" class="mb-1 btn btn-pill btn-info" >修改</button>
                  <button @click="clean" class="mb-1 btn btn-outline-primary btn-pill" >重置</button>
                  <button @click="deletework" class="mb-1 btn btn-pill btn-danger" >刪除</button>
                </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router"; // 引入 useRoute
import axiosapi from "@/plugins/axios-login";
import { useRouter } from 'vue-router';
import useUserStore from '@/stores/user';
import Swal from "sweetalert2";
const route = useRoute();
const workId=route.params.id;
const user=useUserStore();
const employeeId=user.empId
const work=ref({})
const statusSelect=ref(["已完成","未完成"])

async function findWork(){
    const response=await axiosapi.get(`/work/taskassign/${workId}`);
    work.value=response.data.workprogress
    work.value.status=work.value.status.statusName
    work.value.createDate=formatDate(work.value.createDate)
    work.value.expectedFinishDate=formatDate(work.value.expectedFinishDate)
    if(work.value.finishDate){
        work.value.finishDate=formatDate(work.value.finishDate)
    }
    contents.value=response.data.taskassign
    contents.value = response.data.taskassign.map(item => {
        item.employee=item.assign.employeeName
        item.status=item.status.statusName
        item.reveiew=employeeId
    // 格式化每個日期欄位
        if (item.createDate) {
            item.createDate = formatDate(item.createDate); // 將格式化後的日期設回到 item 中
        }
        if (item.expectedFinishDate) {
            item.expectedFinishDate = formatDate(item.expectedFinishDate);
        }
        if (item.finishDate) {
            item.finishDate = formatDate(item.finishDate);
        }
        return item;
    });
    console.log(work.value)
}

const router = useRouter();
// 使用 useRoute 獲取當前路由
// const route = useRoute();


// **狀態管理**
const contents = ref([
    {
        taskName:"",
        taskContent: "",
        createDate: "", 
        expectedFinishDate:"",
        finishDate:"",
        employee:"" ,
        reveiew: employeeId,  
        status:"",
        taskId:""
    }
]);

async function submit() {
    if(new Date(work.value.createDate) > new Date(work.value.expectedFinishDate)){
        Swal.fire({
                    title:"工作的開始日期比預計完成日期晚",
                    icon:"warning"
                })
                return;
    }
    for (let [index, task] of contents.value.entries()) {
        if(new Date(task.createDate) > new Date(task.expectedFinishDate)){
            Swal.fire({
                    title:`項目${index+1}的開始日期比預計完成日期晚`,
                    icon:"warning"
                })
                return;
            }
        if(task.createDate==''){
            Swal.fire({
                    title:`項目${index+1}請輸入交辦事項的創建日期`,
                    icon:"warning"
                })
            return;
            }
        if(task.employee==''){
            Swal.fire({
                    title:`項目${index+1}請輸入交辦事項的員工`,
                    icon:"warning"
            })
            return;
        }
        if(task.expectedFinishDate==''){
            Swal.fire({
                    title:`項目${index+1}請輸入交辦事項的預計完成日期`,
                    icon:"warning"
            })
            return;
        }
        if(task.taskContent==''){
            Swal.fire({
                    title:`項目${index+1}請輸入交辦事項的內容`,
                    icon:"warning"
            })
            return;
        }
        if(task.taskName==''){
            Swal.fire({
                    title:`項目${index+1}請輸入交辦事項的名稱`,
                    icon:"warning"
            })
            return;
        }
    };
    Swal.fire({
        title:"確定要修改嗎?",
        icon:"question",
        showCancelButton: true,
        confirmButtonText: '確認',
        cancelButtonText: '取消'
    }).then(async (result) => {
        if (result.isConfirmed) {
            const workRequest = {
                workId:workId,
                workName: work.value.workName,
                createDate: work.value.createDate,
                expectedFinishdate: work.value.expectedFinishDate,
                finishdate: work.value.finishDate,
                status:work.value.status,
                taskassigns: contents.value,  // 這是一個對象或數組，會被自動轉換成 JSON 字符串
            };
            console.log(workRequest)
            const response = await axiosapi.post("/workProgress/update", workRequest);
            if(response.data){
                Swal.fire({
                    title:"修改成功",
                    icon:"success"
                })
                router.push(`/work/progress/detail/${workId}`);
            }else{
                Swal.fire({
                    title:"新增失敗",
                    icon:"warning"
                })
            }
        }
    })
}

async function deletework(){
    Swal.fire({
        title:"確定要刪除嗎?",
        icon:"question",
        showCancelButton: true,
        confirmButtonText: '確認',
        cancelButtonText: '取消'
    }).then(async (result) => {
        const response =await axiosapi.delete(`/workprogress/${workId}`);
        if(response){
            router.push("/work/progress");
        }
    })
}

function clean(){
    findWork()
    findEmp()
}

function workreview(data){
    if(data=="已完成"){
        work.value.finishDate=getTodayDate()
    }
}

function review(data,index){
    if(data=="已完成"){
        contents.value[index].finishDate=getTodayDate()
    }else{
        contents.value[index].finishDate=''
    }
}

// **新增欄位**
function addField() {
        contents.value.push({
            taskName:"",
            taskContent: "",
            createDate: getTodayDate(), 
            expectedFinishDate:"",
            finishDate:"",
            employee:"" ,
            reveiew: employeeId,  
            status:"未完成"
        });
    }

// **刪除欄位**
function removeField(index) {
  contents.value.splice(index, 1); // 根據 index 刪除對應的欄位
}

const empselect=ref([])
async function findEmp(){
    const dep=await axiosapi.get(`/employee/find/department/emp/${employeeId}`);
    empselect.value=dep.data
}

onMounted(function(){
    findWork()
    findEmp()
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

<style scoped>
.fixed-button {
    position: fixed;
    bottom: 20px; /* 按鈕離底部 20px */
    right: 20px;  /* 按鈕離右邊 20px */
    padding: 10px 20px;
    border: none;
    border-radius: 10%;
    /* font-size: 16px; */
    cursor: pointer;
    /* box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); */
    transition: background-color 0.3s ease;
}
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
  /* 刪除按鈕 */
  .delete-button {
    color: red;
    text-decoration: underline;
    background: none;
    padding: 0;
    border: none;
  }

</style>
