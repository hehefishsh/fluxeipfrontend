<template>
    <div class="card card-default">
        <div class="container">
            <div class="card-header">
            <h3>個人資料修改</h3>
        </div>
        <div class="card-body">
            <form @submit.prevent="submitForm" enctype="multipart/form-data">
                <div>
                    <img :src="employee.employeePhoto" alt="User Image" />
                    <label for="file">修改照片:</label>
                    <input type="file" id="file" name="file" accept="image/*" @change="handleFileUpload"/>
                <table >
                    <tbody>
                    <tr>
                        <td>ID</td>
                        <td><input type="text" id="employeeId" v-model="employee.employeeId" readonly v-if="false"/>{{ employee.employeeId }}</td>
                    </tr>
                    <tr>
                        <td>姓名</td>
                        <td>{{ employee.employeeName }}</td>
                    </tr>
                    <tr>
                        <td>部門</td>
                        <td>{{ employee.department }}</td>
                    </tr>
                    <tr>
                        <td>職位</td>
                        <td>{{ employee.position }}</td>
                    </tr>
                    <tr>
                        <td>入職日</td>
                        <td>{{ formatDate(employee.hireDate) }}</td>
                    </tr>
                    <tr>
                        <td>性別</td>
                        <td>{{ employee.gender }}</td>
                    </tr>
                    <tr>
                        <td>生日</td>
                        <td>{{ formatDate(employee.birthday) }}</td>
                    </tr>
                    <tr>
                        <td>身分證</td>
                        <td>{{ employee.identityCard }}</td>
                    </tr>
                    <tr>
                        <td>信箱</td>
                        <td><input type="text" v-model="employee.email" id="email" required></td>
                    </tr>
                    <tr>
                        <td>電話</td>
                        <td><input type="text" v-model="employee.phone" id="phone" required></td>
                    </tr>
                    <tr>
                        <td>住址</td>
                        <td><input type="text" v-model="employee.address" id="address" required></td>
                    </tr>
                    <tr>
                        <td>緊急連絡人</td>
                        <td><input type="text" v-model="employee.emergencyContact" id="emergencyContact" required></td>
                    </tr>
                    <tr>
                        <td>緊急電話</td>
                        <td><input type="text" v-model="employee.energencyPhone" id="energencyPhone" required></td>
                    </tr>
                
                    </tbody>
                </table>
            </div>
            <button type="submit" class="btn btn-secondary btn-pill">修改</button>
            <button type="button" class="btn btn-info btn-pill" @click="openModal">
                修改密碼
            </button>
            </form>
        </div>
    </div>
</div>
            <passwordUpdate ref="modal" 
                            v-model:pas="password" 
                            v-model:newPasswordError="newPasswordError"
                            @passwordsubmit="passwordsubmit"
                            @check="check">
            </passwordUpdate>

</template>

<script setup>
import passwordUpdate from '@/components/passwordUpdate.vue';
import { ref, onMounted } from 'vue';
import useUserStore from '@/stores/user';
import axiosapi from "@/plugins/axios";
import Swal from "sweetalert2";

import { useRouter } from "vue-router";
const router = useRouter();

const modal=ref(null);
function openModal(){
    modal.value.showModal();
}

const password=ref({});

const newPasswordError=ref(false);
function check(){
    if(password.value.new!=password.value.check){
        newPasswordError.value=true
    }else{
        newPasswordError.value=false
    }
}
async function passwordsubmit(){
    if(password.value.new!=password.value.check){
        Swal.fire({
                title:"新密碼與確認密碼不同",
                icon:"warning"
            })
    }else{
    const form = new FormData();
    form.append("newPassword",password.value.new);
    form.append("oldPassword",password.value.old);
    const response = await axiosapi.post("/password/update", form, {});
        console.log(response.data);
        if(response.data){
            Swal.fire({
                title:"修改成功",
                icon:"success",
            })
            modal.value.closeModal();
            router.push("/employee/detail");
        }else{
            Swal.fire({
                title:"原密碼錯誤",
                icon:"warning"
            })
        }
    }
}

const user=useUserStore();
const employeeId=user.empId
const employee = ref({});

async function submitForm(){
    const formData = new FormData();
    formData.append("employeeId", employee.value.employeeId);
    formData.append("email", employee.value.email);
    formData.append("phone", employee.value.phone);
    formData.append("address", employee.value.address);
    formData.append("emergencyContact", employee.value.emergencyContact);
    formData.append("energencyPhone", employee.value.energencyPhone);
    const photoFile = document.getElementById('file').files[0];
    if (photoFile) {
        formData.append("photoFile", photoFile);
    }
    const response = await axiosapi.post("/employee/detail/update", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        if(response.data){
            Swal.fire({
                title:"修改成功",
                icon:"success",
            })
            user.updatePhoto(employee.value.employeePhoto)
            router.push("/employee/detail");
        }else{
            Swal.fire({
                title:"修改失敗",
                icon:"warning"
            })
        }
}

async function employeeFind(){
try {
    const response = await axiosapi.get(`/employee/detail/${employeeId}`);
    employee.value = response.data; } 
catch (error) {
    console.error('獲取員工資料錯誤:', error);
}
}

function formatDate(date) {
    const formattedDate = new Date(date);
    const year = formattedDate.getFullYear(); // 取得年份
    const month = (formattedDate.getMonth() + 1).toString().padStart(2, '0'); // 取得月份並補零
    const day = formattedDate.getDate().toString().padStart(2, '0'); // 取得日期並補零
    return `${year}/${month}/${day}`; // 返回格式化的日期字符串
        };

function handleFileUpload(event) {
        const file = event.target.files[0];
        
        // 確保檔案存在
        if (file) {
            // 使用 URL.createObjectURL 來創建一個臨時的圖片 URL
            employee.value.employeePhoto = URL.createObjectURL(file);
        }
    }

onMounted(function(){
    employeeFind()
});
</script>

<style scoped>
table {
width: 100%;
border-collapse: collapse;
}
th, td {
border: 1px solid #ddd;
padding: 8px;
}
th {
background-color: #f4f4f4;
text-align: left;
}
</style>