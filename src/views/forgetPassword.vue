<template>
    <div class="bg-image" id="body">
        <div
        class="container d-flex align-items-center justify-content-center"
        style="min-height: 100vh"
        >
            <div class="d-flex flex-column justify-content-between">
                <div class="row justify-content-center">
                    <div class="col-lg-8 col-md-10">
                        <div class="card card-default mb-0">
                            <div class="card-header pb-0">
                                <div
                                class="app-brand w-100 d-flex justify-content-center border-bottom-0">
                                    <a class="w-auto pl-0" href="/index.html">
                                    <img
                                        src="https://cdn.iconscout.com/icon/free/png-256/free-dashboard-icon-download-in-svg-png-gif-file-formats--speedometer-neon-blue-ui-icons-pack-user-interface-461930.png?f=webp&w=256"
                                        alt="Mono"
                                        width="25%"
                                    />
                                    <span
                                        class="brand-name text-dark"
                                        style="margin-left: 20px; font-size: xx-large"
                                        >Flux EIP</span
                                    >
                                    </a>
                                </div>
                            </div>
                            <div class="card-body px-5 pb-5 pt-0">
                                <h4 class="text-dark mb-6 text-center">密碼重設</h4>
                                <form @submit.prevent="passwordsubmit">
                                    <div class="row">
                                        <div class="form-group col-md-12 mb-4">
                                            <input
                                            type="password"
                                            v-model="password"
                                            class="form-control input-lg"
                                            placeholder="新密碼"
                                            required
                                            @input="checkpas"/>
                                        </div>
                                        <div class="form-group col-md-12">
                                            <input
                                                type="password"
                                                v-model="checkpassword"
                                                class="form-control input-lg"
                                                placeholder="驗證密碼"
                                                required
                                                @input="checkpas"/>
                                        </div>
                                        <span v-if="check" class="error-message" style="color: red;">新密碼與確認密碼不同</span>
                                    </div>
                                    <div class="col-md-12">
                                        <button class="btn btn-primary btn-pill mb-4" type="submit">修改密碼
                                        </button>
                                    </div>
                                    
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import axiosapi from "@/plugins/axios-login";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";
import useUserStore from "@/stores/user";
import { useRoute } from "vue-router";
const userStore = useUserStore();
const router = useRouter();
const route = useRoute(); // 使用 useRoute 鉤子來獲取當前路由資訊

// 獲取 query 參數中的 token
const token = route.query.token;

const check=ref(false)
const checkpassword=ref("");
const password=ref("");
function checkpas(){
    if(checkpassword.value!=password.value){
        check.value=true
    }else{
        check.value=false
    }
}

async function passwordsubmit(){
    if(password.value!=checkpassword.value){
        Swal.fire({
                title:"新密碼與確認密碼不同",
                icon:"warning"
            })
    }else{
    const form = new FormData();
        form.append("token",token);
        form.append("newPassword",password.value);
    console.log(form)
    const response = await axiosapi.post("/reset/password", form, {});
        console.log(response.data);
        if(response.data){
            Swal.fire({
                title:"密碼修改成功",
                icon:"success",
            })
            router.push("/login");
        }else{
            Swal.fire({
                title:"請重新發送驗證信",
                icon:"warning"
            })
        }
    }
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
    background: rgba(255, 255, 255, 0.9); /* 白色但透明 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
  }
  </style>
  