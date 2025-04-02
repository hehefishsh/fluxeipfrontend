<template>
    <div class="card card-default form-container">
      <div class="card-header">
        <h3 class="form-title">工作內容</h3>
        <button type="button" @click="Demo" class="badge badge-pill badge-info">Demo</button>
      </div>
            工作名稱<input v-model="work.workName" placeholder="輸入名稱" class="input-field" required  />
            開始日期<input type="date" v-model="work.createDate" class="custom-select my-1 mr-sm-2 w-auto" required />
            預計完成日期<input type="date" v-model="work.expectedFinishDate" class="custom-select my-1 mr-sm-2 w-auto" required />
      <div class="card-header">
        <h3 class="form-title">分配工作</h3>
      </div>
            <div v-for="(content, index) in contents" :key="index" class="content-group">
                <div class="content-wrapper">
                項目名稱<input
                  v-model="content.taskName" 
                  :placeholder="'輸入名稱 '" class="input-field" required />

                工作內容<input
                    v-model="content.taskContent" 
                    :placeholder="'輸入內容 '" class="input-field" required />
                            
                負責員工<select v-model="content.employee" required >
                            <option v-for="emplo in empselect"  :value="emplo.employeeName">
                              {{ emplo.employeeName }}
                            </option>
                        </select>
                
                開始日期<input type="date"  v-model="content.createDate" required  />
                預計完成日期<input type="date"  v-model="content.expectedFinishDate"  required />
                </div>

                <!-- 刪除按鈕 -->
                <button type="button" @click="removeField(index)" class="delete-button">X</button>
            </div>
                <!-- 新增內容按鈕 -->
                <button type="button" @click="addField" class="add-button">新增交辦事項</button>
          
                <!-- 送出按鈕 -->
                <div style="text-align: right;">
                  <button @click="submit" class="btn btn-secondary btn-pill">提交</button>
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
const user=useUserStore();
const employeeId=user.empId
const work=ref({createDate: getTodayDate(),expectedFinishDate:""})

const router = useRouter();
// 使用 useRoute 獲取當前路由
const route = useRoute();

const empselect=ref([])
// **狀態管理**
const contents = ref([
      {
        taskName:"",
        taskContent: "",
        createDate: getTodayDate(), 
        expectedFinishDate:"",
        finishDate:"",
        employee:"" ,
        reveiew: employeeId,  
        status:"未完成"
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
  if(work.value.workName==null){
    Swal.fire({
                title:"請輸入工作的名稱",
                icon:"warning"
            })
            return;
  }
  if(work.value.createDate==''){
    Swal.fire({
                title:"請輸入工作的開始日期",
                icon:"warning"
            })
            return;
  }
  if(work.value.expectedFinishDate==''){
    Swal.fire({
                title:"請輸入工作的預計完成日期",
                icon:"warning"
            })
            return;
  }
  for (let task of contents.value) {
      if(new Date(task.createDate) > new Date(task.expectedFinishDate)){
        Swal.fire({
                title:"分配工作的開始日期比預計完成日期晚",
                icon:"warning"
            })
            return;
          }
      if(task.employee==''){
        Swal.fire({
                title:"請輸入交辦事項的員工",
                icon:"warning"
        })
        return;
      }
      if(task.createDate==''){
        Swal.fire({
                title:"請輸入交辦事項的創建日期",
                icon:"warning"
        })
        return;
      }
      if(task.expectedFinishDate==''){
        Swal.fire({
                title:"請輸入交辦事項的預計完成日期",
                icon:"warning"
        })
        return;
      }
      if(task.taskContent==''){
        Swal.fire({
                title:"請輸入交辦事項的內容",
                icon:"warning"
        })
        return;
      }
      if(task.taskName==''){
        Swal.fire({
                title:"請輸入交辦事項的名稱",
                icon:"warning"
        })
        return;
      }

    };
    const workRequest = {
      supervisorId: employeeId,
      workName: work.value.workName,
      createDate: work.value.createDate,
      expectedFinishdate: work.value.expectedFinishDate,
      taskassigns: contents.value,  // 這是一個對象或數組，會被自動轉換成 JSON 字符串
    };
    const response = await axiosapi.post("/workProgress/create", workRequest);
    if(response.data){
              Swal.fire({
                  title:"新增成功",
                  icon:"success"
              })
              router.push("/work/progress");
          }else{
              Swal.fire({
                  title:"新增失敗",
                  icon:"warning"
              })
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

function Demo(){
  work.value.workName='報表製作'
  work.value.expectedFinishDate='2025-04-25'
  contents.value[0].taskName='美編'
  contents.value[0].taskContent='美化排版'
  contents.value[0].employee='小明'
  contents.value[0].expectedFinishDate='2025-04-23'
  contents.value[1].taskName='蒐集資料'
  contents.value[1].taskContent='做成報表'
  contents.value[1].employee='趙六'
  contents.value[1].expectedFinishDate='2025-04-20'
}

// **刪除欄位**
function removeField(index) {
  contents.value.splice(index, 1); // 根據 index 刪除對應的欄位
}

async function findEmp(){
  const dep=await axiosapi.get(`/employee/find/department/emp/${employeeId}`);
  empselect.value=dep.data
}

onMounted(function(){
    findEmp()
})

function getTodayDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0'); // 月份從0開始，需加1
      const day = String(today.getDate()).padStart(2, '0'); // 使日期為兩位數

      return `${year}-${month}-${day}`;
}

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
