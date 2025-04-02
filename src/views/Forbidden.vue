<template>
        
</template>
    
<script setup>
import Swal from "sweetalert2";
import {  onMounted } from 'vue'
import { useRouter } from "vue-router";

const router = useRouter();

function notthing(){
    Swal.fire({
        title: "你沒有這個權限!",
        icon: "error",
    });
    router.push("/");
}

onMounted(function(){
    notthing();
})

</script>

<style>
    
</style>