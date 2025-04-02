<template>
        <div class="form-group">
                        <label for="employeeName">員工姓名</label>
                        <input type="text" class="form-control rounded-0" id="employeeName" placeholder="姓名"
                            v-model="employee.employeeName"/>
                    </div>
        
        <div class="form-group">
                        <label for="departmentId">部門</label>
                        <select class="form-control rounded-0" id="departmentId" v-model="employee.departmentName" @change="positionFind">
                            <option v-for="department in departments" :key="department.departmentName"
                                :value="department.departmentName">
                                {{ department.departmentName }}
                            </option>
                        </select>
        </div>
        <div class="form-group">
                        <label for="departmentId">職位</label>
                        <select class="form-control rounded-0" id="positionId" v-model="employee.positionName">
                            <option v-for="position in positions" :key="position.positionName"
                                :value="position.positionName">
                                {{ position.positionName }}
                            </option>
                        </select>
        </div>
        <div class="form-group">
                        <label for="startDate">入職時間</label>
                        <input type="date" id="startDate" v-model="employee.hireDate" class="custom-select my-1 mr-sm-2 w-auto"/>
        </div>
        <div class="form-group">
                        <label for="startDate">生日</label>
                        <input type="date" id="startDate" v-model="employee.birthday" class="custom-select my-1 mr-sm-2 w-auto"/>
        </div>
        <div>
        <label for="email">電子郵件:</label>
        <input
            type="email"
            id="email"
            v-model="employee.email"
            placeholder="請輸入電子郵件"
            required
            class="form-control rounded-"
            @input="checkmail()"
        />
        <small v-if="employee.email && !isValidEmail" style="color: red;">
            請輸入有效的電子郵件格式。
        </small>
        <small v-if=checkemail style="color: red;">
            此信箱已使用過。
        </small>
        </div>
        <div>
            <label>性別:</label>
            <input type="radio" id="male" value="男" v-model="employee.gender" /> 男性
            <input type="radio" id="female" value="女" v-model="employee.gender" /> 女性
        </div>
        <div class="form-group">
            <label for="idCard">身分證字號:</label>
            <input
                type="text"
                id="idCard"
                v-model="employee.identityCard"
                maxlength="10"
                placeholder="輸入身分證字號"
                pattern="^[A-Z]{1}[1-2]{1}[0-9]{8}$"
                required
                class="form-control rounded-0"
                @input="checkidentity()"
            />
            <small v-if="employee.identityCard && !isValidIdCard" style="color: red;">格式不正確，請輸入有效的身分證字號。</small>
            <small v-if=checkidentityCard style="color: red;">此身分證已使用過</small>
        </div>
        <div class="form-group">
            <label for="phone">電話號碼:</label>
            <input
                type="tel"
                id="phone"
                v-model="employee.phone"
                maxlength="10"
                placeholder="輸入電話號碼"
                required
                class="form-control rounded-0"
                @input="checkphonenumber()"
            />
            <small v-if="employee.phone && !isValidPhone" style="color: red;">輸入正確電話格式</small>
            <small v-if=checkphone style="color: red;">此電話已使用過</small>
        </div>
        <button type="button" class="btn btn-secondary btn-pill" @click="submit">提交</button>
</template>
    
<script setup lang='ts'>
import { ref, onMounted,computed  } from 'vue';
import axiosapi from "@/plugins/axios-login";
import Swal from "sweetalert2";

import { useRouter } from "vue-router";
const router = useRouter();

const employee=ref({
    email:"",
    gender:"",
    phone:"",
    identityCard:"",
    birthday:"",
    hireDate:"",
    departmentName:"",
    positionName:"",
    employeeName:""
});

const departments = ref([]);
const positions=ref([]);

const checkemail=ref(false);
async function checkmail(){
    if(employee.value.email){
        try {
        const response = await axiosapi.get(`/check/email/${employee.value.email}`);
        checkemail.value=response.data;
        } catch (error) {
        console.error("檢查失敗:", error);
        }
    }
}

const checkidentityCard=ref(false)
async function checkidentity(){
    if(employee.value.identityCard){
        try {
        const response = await axiosapi.get(`/check/identityCard/${employee.value.identityCard}`);
        checkidentityCard.value=response.data;
        } catch (error) {
        console.error("檢查失敗:", error);
        }
    }
}

const checkphone=ref(false);
async function checkphonenumber(){
    if(employee.value.phone){
        try {
        const response = await axiosapi.get(`/check/phone/${employee.value.phone}`);
        checkphone.value=response.data;
        } catch (error) {
        console.error("檢查失敗:", error);
        }
    }
}

const isValidEmail = computed(() => {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(employee.value.email);
    });

const isValidPhone = computed(() => {
    const regex = /^09\d{8}$/;
        return regex.test(employee.value.phone);
    });

const isValidIdCard = computed(() => {
        const regex = /^[A-Z]{1}[1-2]{1}[0-9]{8}$/;
        return regex.test(employee.value.identityCard);
    });

async function departmentFind(){
    try {
    const response = await axiosapi.get("/department/find");  
    departments.value = response.data;  
    } catch (error) {
    console.error("獲取部門資料失敗:", error);
    }
}

async function positionFind(){
    if (employee.value.departmentName) {
        try {
        const response = await axiosapi.get(`/position/find/${employee.value.departmentName}`);  
        positions.value = response.data;  
        console.log(positions.value)
        } catch (error) {
        console.error("獲取職位1資料失敗:", error);
        }
    }else{
        try {
        const response = await axiosapi.get("/position/find");  
        positions.value = response.data;  
    } catch (error) {
        console.error("獲取職位2資料失敗:", error);
    } 
    }
}

function submit(){
    Swal.fire({
        title: "處理中",
        text: "請稍後...",
        icon: "info",
        showCancelButton: false,
        showConfirmButton: false,
        allowOutsideClick: false,  // 禁止點擊外部關閉提示框
        didOpen: () => {
          Swal.showLoading();  // 顯示進度條
        }
    });
    axiosapi.post("/employee/create",employee.value)
    .then(function(response){
        if(response.data.success){
            Swal.fire({
                title:response.data.message,
                icon:"success"
            })
            router.push("/employee/manage/search");
        }else{
            Swal.fire({
                title:response.data.message,
                icon:"warning"
            })
        }
    }).catch(function(error){
        console.log("error",error);
        Swal.fire({
            title:"失敗"+error.message,
            icon:"error"
        });
    })
}


onMounted(function(){
    departmentFind();
    positionFind();
})
</script>
    
<style>
    
</style>