<template>
  <div class="accordion accordion-shadow">
    <div class="card card-default">
                <ul class="nav nav-tabs mb-3" id="pills-tab" role="tablist">
                    <li class="nav-item">
                        <a class="nav-link" data-toggle="pill" @click="find('')">全部</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link active"  data-toggle="pill" @click="find('未完成')">未完成</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link"  data-toggle="pill" @click="find('待審核')">待審核</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link"  data-toggle="pill" @click="find('已完成')">已完成</a>
                    </li>
                </ul>
                <div class="tab-content mt-3">
                  <div>
                    <table class="table table-borderless table-thead-border">
                      <thead>
                        <tr>
                          <th class="text">工作名</th>
                          <th class="text">工作內容</th>
                          <th class="text">開始時間</th>
                          <th class="text">預計結束時間</th>
                          <th class="text">結束時間</th>
                          <th class="text">狀態</th>
                          <th class="text" v-if="status!=''&&status!='已完成'">提交</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="task in taskassign" :key="task.taskId" v-if="taskassign[0]!=null">
                          <td class="text">{{ task.taskName }}</td>
                          <td class="text">{{ task.taskContent }}</td>
                          <td class="text">{{ formatDate(task.createDate) }}</td>
                          <td class="text">{{ formatDate(task.expectedFinishDate) }}</td>
                          <td class="text" v-if="task.finishDate!=null">{{ formatDate(task.finishDate) }}</td>
                          <td class="text" v-else>未完成</td>
                          <td class="text">{{ task.status.statusName }}</td>
                          <td class="text" v-if="status=='未完成'"><button class="badge badge-square badge-success" @click="review(task.taskId,'待審核')">送出審核</button>
                          </td>
                          <td class="text" v-if="status=='待審核'"><button class="badge badge-square badge-success" @click="review(task.taskId,'未完成')">收回審核</button>
                          </td>
                        </tr>
                        <tr v-else><td colspan="7" class="text-center"><h3>暫無資料</h3></td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
            </div>
          </div>
</template>
    
<script setup>
import { ref, onMounted } from "vue";
import axiosapi from "@/plugins/axios.js";
import useUserStore from '@/stores/user';
const taskassign=ref({})
const user=useUserStore();
const status=ref('')
async function find(data){
  status.value=data
  if(data==''){
    const response = await axiosapi.get(`/taskassign/emp/${user.empId}`);
    taskassign.value=response.data;
    return;
  }else{
    const response = await axiosapi.get(`/taskassign/emp/${user.empId}/${data}`);
    taskassign.value=response.data;
    return;
  }
}
async function review(data,review){
  const response =await axiosapi.put(`/taskassign/update/${data}/${review}`);
  if(response){
    find(status.value)
  }
}
function formatDate(date) {
  const formattedDate = new Date(date);
  const year = formattedDate.getFullYear(); // 取得年份
  const month = (formattedDate.getMonth() + 1).toString().padStart(2, '0'); // 取得月份並補零
  const day = formattedDate.getDate().toString().padStart(2, '0'); // 取得日期並補零
  return `${year}/${month}/${day}`; // 返回格式化的日期字符串
    };
onMounted(function(){
  find('未完成')
});
</script>
    
<style scoped>
.accordion {
  display: flex;
  justify-content: center;
}
    .card {
  background-color: #fff;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  padding: 30px 0px 30px 0px;
  border-radius: 10px;
  text-align: center;
  width: 100%;
  border-radius: 0%;
  box-shadow: none
}

</style>