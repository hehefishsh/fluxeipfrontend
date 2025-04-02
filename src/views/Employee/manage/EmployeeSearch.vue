<template>
  <div>
    <div>
      <!-- 頁面標題 -->

      <!-- 內容 -->
      <div class="card card-default" id="page-views">
        <div class="card-header">
          <!-- <h2>所有員工</h2> -->
          部門查詢<select id="departmentId" v-model="department" required @change="dochangeDep()">
            <option value="">全部</option>
            <option v-for="department in departments" :key="department.departmentName"
              :value="department.departmentName">
              {{ department.departmentName }}
            </option>
          </select>
          職位查詢<select id="positionId" v-model="position" required @change="dochange()">
            <option value="">全部</option>
            <option v-for="position in positions" :key="position.positionName" :value="position.positionName">
              {{ position.positionName }}
            </option>
          </select>
          <RouterLink class="btn btn-primary btn-pill" to="/employee/manage/create">
            <span class="nav-text">新增員工</span>
          </RouterLink>
        </div>
        <div class="card-body py-0" data-simplebar>
          <!-- <div v-if="employees && employees.length"> -->
          <table class="table table-borderless table-thead-border">
            <thead>
              <tr>
                <th class="text">員工ID</th>
                <th class="text">姓名</th>
                <th class="text">職位</th>
                <th class="text">部門</th>
                <th class="text">入職時間</th>
                <th class="text"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="employee in employees" :key="employee.employeeId">
                <td class="text">{{ employee.employeeId }}</td>
                <td class="text">{{ employee.employeeName }}</td>
                <td class="text">{{ employee.department.departmentName }}</td>
                <td class="text">{{ employee.position.positionName }}</td>
                <td class="text">{{ formatDate(employee.hireDate) }}</td>
                <td class="text"><button type="button" class="btn btn-primary"
                    @click="openModal(employee.employeeId, employee.department.departmentName)">修改</button></td>
              </tr>
            </tbody>
          </table>
          <!-- </div> -->
        </div>
        <Paginate :first-last-button="true" first-button-text="&lt;&lt;" last-button-text="&gt;&gt;" :prev-text="'Prev'"
          :nextText="'Next'" :click-handler="empFind" :page-range="3" :margin-pages="2" :inital-page="current"
          v-model="current" :pageCount="pages">
        </Paginate>
        <div class="bg-white py-4"></div>
      </div>
    </div>
  </div>

  <EmployeeUpdate ref="modal" v-model:emp="employee" v-model:dep="departments" v-model:pos="positions"
    v-model:sts="status" @update="callUpdate" @posfind="positionFind2(employee.department)"></EmployeeUpdate>

</template>

<script setup>
import EmployeeUpdate from "@/components/employeeUpdate.vue";
// npm install vuejs-paginate-next       vue要安裝插件
import Swal from "sweetalert2";
import Paginate from "vuejs-paginate-next";
import { ref, onMounted } from 'vue'
import axiosapi from "@/plugins/axios-login";
import useUserStore from '@/stores/user';
const current = ref(1);//目前在第幾頁
const pages = ref(0);  //總共幾頁
const total = ref(0);  //總共幾筆
const rows = ref(5);   //一頁要幾筆
const employees = ref({})
const employee = ref({})
const user = useUserStore();

async function callUpdate() {
  const emp = {
    employeeId: employee.value.employeeId,
    employeeName: employee.value.employeeName,
    department: employee.value.department,
    position: employee.value.position,
    status: employee.value.status
  }
  if (employee.value.position == "") {
    Swal.fire({
      title: "請輸入職位",
      icon: "warning"
    })
  } else if (employee.value.employeeName == "") {
    Swal.fire({
      title: "請輸入姓名",
      icon: "warning"
    })
  } else {
    const response = await axiosapi.post("/employee/update", emp);
    if (response.data) {
      Swal.fire({
        title: "修改成功",
        icon: "success"
      })
      empFind()
      modal.value.closeModal();
    } else {
      Swal.fire({
        title: "修改失敗",
        text: "請檢查該員工是否有未核決的自訂簽核流程",
        icon: "error"
      });
    }
  }
}

async function findEmp(id) {
  if (id) {
    const response = await axiosapi.get(`/employee/detail/${id}`);
    employee.value = response.data
  }
}
const modal = ref(null);
function openModal(id, dep) {
  findEmp(id)
  positionFind2(dep)
  modal.value.showModal();
}

const status = ref(["在職", "離職"])

const department = ref("");
const departments = ref([]);
async function departmentFind() {
  try {
    const response = await axiosapi.get("/department/find");
    departments.value = response.data;
  } catch (error) {
    console.error("獲取部門資料失敗:", error);
  }
}

const position = ref("");
const positions = ref([]);
async function positionFind() {
  if (department.value) {
    try {
      const response = await axiosapi.get(`/position/find/${department.value}`);
      positions.value = response.data;
      // console.log(positions.value)
    } catch (error) {
      console.error("獲取職位1資料失敗:", error);
    }
  } else {
    try {
      const response = await axiosapi.get("/position/find");
      positions.value = response.data;
    } catch (error) {
      console.error("獲取部門資料失敗:", error);
    }
  }
}

async function positionFind2(dep) {
  employee.value.position = ""
  const response = await axiosapi.get(`/position/find/${dep}`);
  positions.value = response.data;
}

function dochangeDep() {
  current.value = 1
  position.value = ""
  empFind(current.value)
  positionFind();
}

function dochange() {
  current.value = 1
  empFind(current.value)
}

async function empFind(page) {
  if (page) {
    current.value = page
    // start.value=rows.value*(current.value-1)
  }
  if (department.value == "") {
    department.value = null;
  } if (position.value == "") {
    position.value = null;
  }
  const data = {
    "current": current.value - 1,
    "rows": rows.value,
    "department": department.value,
    "position": position.value
  };
  try {
    const response = await axiosapi.post("/employee/find", data);
    employees.value = response.data.lists.content;
    total.value = response.data.count;
    pages.value = Math.ceil(total.value / rows.value);
    // lastPageRows.value=total.value % rows.value
    // console.log(position.value)
  } catch (error) {
    console.log("error", error);
    // Swal.fire({
    //     title:"失敗"+error.message,
    //     icon:"error"
    // })
  }
};

function formatDate(date) {
  const formattedDate = new Date(date);
  const year = formattedDate.getFullYear(); // 取得年份
  const month = (formattedDate.getMonth() + 1).toString().padStart(2, '0'); // 取得月份並補零
  const day = formattedDate.getDate().toString().padStart(2, '0'); // 取得日期並補零
  return `${year}/${month}/${day}`; // 返回格式化的日期字符串
};

onMounted(function () {
  empFind();
  departmentFind();
  positionFind();
})
</script>

<!-- 保留你的樣式 -->
<style></style>
