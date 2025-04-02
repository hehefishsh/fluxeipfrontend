<template>
        <div class="card card-default" id="page-views">
      <div class="card-header">
        <h2>薪資一覽</h2>
      </div>
      <div class="card-body py-0" data-simplebar>
        <div v-if="allSalarySetting && allSalarySetting.length">
          <table class="table table-borderless table-thead-border">
            <thead>
              <tr>
                <th class="text">員工id</th>
                <th class="text">員工名稱</th>
                <th class="text">部門</th>
                <th class="text">預計月薪</th>
                <th class="text">換算時薪</th>
                <th class="text">編輯</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="contact in contacts" :key="contact.empId">
                <td class="text">{{ contact.empId }}</td>
                <td class="text">{{ contact.name }}</td>
                <td class="text">{{ contact.department }}</td>
                <td class="text">{{ getSalaryDetail(contact.empId).monthlySalary }}</td>
                <td class="text">{{ getSalaryDetail(contact.empId).hourlyWage }}</td>
                <td>
                    <!-- 編輯按鈕 -->
        <button class="btn btn-primary btn-sm" @click="editSalary(contact.empId)">編輯</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      <div class="bg-white py-4"></div>
    </div>
  </div>
</template>
    
<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
const path = import.meta.env.VITE_API_URL;

const allSalarySetting = ref([])
const contacts = ref([]);


onMounted(async () => {
  try {
    const response = await axios.get(`${path}/api/salary`)
    allSalarySetting.value = response.data

    const contactsResponse = await axios.get(`${path}/api/contacts`)
    contacts.value = contactsResponse.data
  } catch (error) {
    console.error('Error fetching SalarySetting:', error)
  }
})


const getSalaryDetail = (empId) => {
  return allSalarySetting.value.find(salary => salary.employeeID === empId);
};

//編輯
const editSalary = async (empId) => {
      const salaryData = getSalaryDetail(empId);

      const { value: formValues } = await Swal.fire({
        title: "編輯薪資",
        html: `
          <label>月薪</label>
          <input id="monthlySalary" type="number" class="swal2-input" value="${salaryData.monthlySalary || 0}">
          <br>
          <label>時薪</label>
          <input id="hourlyWage" type="number" class="swal2-input" value="${salaryData.hourlyWage}" oninput="document.getElementById('monthlySalary').disabled = !!this.value">
        `,
    didOpen: () => {
      const monthlyInput = document.getElementById("monthlySalary");
      const hourlyInput = document.getElementById("hourlyWage");

      // **監聽月薪輸入，呼叫後端計算時薪**
      monthlyInput.addEventListener("input", async () => {
        if (monthlyInput.value) {
          try {
            const res = await axios.get(`${path}/api/salary/calculateHourly?monthlySalary=${monthlyInput.value}`);
            hourlyInput.value = res.data.hourlyWage;

          } catch (error) {
            console.error("時薪計算失敗:", error);
          }
        }
      });
    },
        focusConfirm: false,
        preConfirm: () => {
          const monthlySalary = document.getElementById("monthlySalary").value;
          const hourlyWage = document.getElementById("hourlyWage").value;

          if (!monthlySalary && !hourlyWage) {
            Swal.showValidationMessage("請輸入月薪或時薪");
            return false;
          }

          return {
            monthlySalary: monthlySalary ? parseInt(monthlySalary, 10) : null,
            hourlyWage: hourlyWage ? parseInt(hourlyWage, 10) : null,
          };
        },
      });

      if (!formValues) return;


      try {
        await axios.put(`${path}/api/salary/${empId}`, {
          employeeID: empId,
          salaryId:salaryData.salaryId,
          monthlySalary: formValues.monthlySalary,
          hourlyWage: formValues.hourlyWage,
        });

        await Swal.fire({
    title: "更新成功!",
    icon: "success",
    confirmButtonText: "確定",
  });
        location.reload(); // 重新整理頁面

      } catch (error) {
        console.error("更新薪資失敗:", error);
        Swal.fire("更新失敗", "請稍後再試", "error");
      }
    };
</script>
    
<style scoped>
    
</style>