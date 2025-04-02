<template>
  <div class="bg-image" id="body">
    <div class="container d-flex align-items-center justify-content-center" style="min-height: 100vh">
      <div class="d-flex flex-column justify-content-between">
        <div class="row justify-content-center">
          <div class="col-lg-6 col-md-10">
            <div class="card card-default mb-0">
              <div class="card-header pb-0">
                <div class="app-brand w-100 d-flex justify-content-center border-bottom-0">
                  <a class="w-auto pl-0" href="/index.html">
                    <img
                      src="https://cdn.iconscout.com/icon/free/png-256/free-dashboard-icon-download-in-svg-png-gif-file-formats--speedometer-neon-blue-ui-icons-pack-user-interface-461930.png?f=webp&w=256"
                      alt="Mono" width="25%" />
                    <span class="brand-name text-dark" style="margin-left: 20px; font-size: xx-large">Flux EIP</span>
                  </a>
                </div>
              </div>
              <div class="card-body px-5 pb-5 pt-0">
                <h4 class="text-dark mb-6 text-center">登入系統</h4>
                <!-- <form> -->
                <div class="row">
                  <div class="form-group col-md-12 mb-4">
                    <input type="text" v-model="username" class="form-control input-lg" id="email"
                      aria-describedby="emailHelp" placeholder="帳號" required />
                  </div>
                  <div class="form-group col-md-12">
                    <input type="password" v-model="password" class="form-control input-lg" id="password"
                      placeholder="密碼" required />
                  </div>
                  <div class="col-md-12">
                    <div class="d-flex justify-content-between mb-3">
                      <div class="custom-control custom-checkbox mr-3 mb-3">
                        <input type="checkbox" v-model="rememberMe" class="custom-control-input" id="customCheck2" />
                      </div>
                      <a class="text-color" href="#" @click="openModal"> 忘記密碼？ </a>

                    </div>
                    <button class="btn btn-primary btn-pill mb-4" @click="login">
                      登入
                    </button>
                    <!-- Demo 按鈕 -->
                    <div class="">
                      <button class="mr-1 mb-1 badge badge-pill badge-info" @click="fillDemo('1001')">
                        老闆
                      </button>
                      <button class="mr-1 mb-1 badge badge-pill badge-info" @click="fillDemo('1002')">
                        總經理
                      </button>
                      <button class="mr-1 mb-1 badge badge-pill badge-info" @click="fillDemo('1003')">
                        行政部-經理-小明
                      </button>
                      <br>
                      <button class="mr-1 mb-1 badge badge-pill badge-info" @click="fillDemo('1005')">
                        行政部-組長-名五
                      </button>
                      <button class="mr-1 mb-1 badge badge-pill badge-info " @click="fillDemo('1006')">
                        行政部-員工-趙六
                      </button>
                    </div>
                  </div>
                </div>
                <!-- </form> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <passwordForget ref="modal" v-model:check="check" v-model:disabled="disabled" @submit="submit">
  </passwordForget>
</template>

<script setup>
import passwordForget from "@/components/passwordForget.vue";
import { ref } from "vue";
import axiosapi from "@/plugins/axios-login";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";
import useUserStore from "@/stores/user";
const userStore = useUserStore();

const modal = ref(null);
function openModal() {
  modal.value.showModal();
}

const disabled=ref(false)
const check=ref({})
async function submit(){
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
  disabled.value=true;
  const form = new FormData();
  form.append("id", check.value.id);
  form.append("name", check.value.name);
  form.append("email", check.value.email);
  const response = await axiosapi.post("/forgot/password", form, {});
  disabled.value = false;
  if (response.data) {
    Swal.fire({
      title: "已寄驗證信到信箱",
      icon: "success",
    })
    modal.value.closeModal();
  } else {
    Swal.fire({
      title: "id，姓名，信箱有錯誤",
      icon: "warning"
    })
  }
}




const username = ref("");
const password = ref("");
const rememberMe = ref(false);
const router = useRouter();

async function login() {
  if (username.value === "") {
    username.value = null;
  }
  if (password.value === "") {
    password.value = null;
  }
  const data = {
    userId: username.value,
    password: password.value,
  };
  axiosapi.defaults.headers.common["Authorization"] = ``;
  try {
    const response = await axiosapi.post("/secure/ajax/login", data);
    if (response.data.success) {
      await Swal.fire({
        title: response.data.employeeName + " " + response.data.message,
        icon: "success",
      });
      axiosapi.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;
      const emp = {
        empDep:response.data.department,
        empId: response.data.employeeId,
        empName: response.data.employeeName,
        empPhoto: response.data.photo,
        token: response.data.token,
        roleName: response.data.roleName
      };
      userStore.set(emp);
      router.push("/");
    } else {
      Swal.fire({
        title: response.data.message,
        icon: "warning",
      });
    }
  } catch (error) {
    console.log("error", error);
    Swal.fire({
      title: "錯誤" + error.message,
      icon: "error",
    });
  }
}

// Demo 帳號填入
function fillDemo(empId) {
  username.value = empId;
  password.value = "1234";
}
</script>

<style>
.bg-image {
  background-image: url("https://images.unsplash.com/photo-1616596871445-bb8290a7a2c2?q=80&w=2007&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
}

.card {
  background: rgba(255, 255, 255, 0.9);
  /* 白色但透明 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}
</style>
