<template>
    <div class="modal fade" id="exampleModalForm" tabindex="-1" role="dialog" aria-labelledby="exampleModalFormTitle"
        aria-hidden="true" ref="passwordModalRef">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalFormTitle">重設密碼</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <form @submit.prevent="emits('submit')">
                    <div class="modal-body">
                            <div class="form-group">
                                <label for="exampleInputEmail1">員工ID</label>
                                <input type="text" class="form-control" id="oldPassword" aria-describedby="emailHelp"
                                placeholder="id" required v-model="check.id">
                            </div>
                            <div class="form-group">
                                <label for="exampleInputPassword1">姓名</label>
                                <input type="text" class="form-control" id="newPassword" placeholder="姓名" required v-model="check.name">
                            </div>
                            
                            <div class="form-group">
                                <label for="exampleInputPassword1">信箱</label>
                                <input type="email" class="form-control" id="checkPassword" placeholder="信箱" required v-model="check.email">
                            </div>
                            
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-primary  btn-success" :disabled="disabled">送出驗證信</button>
                        <button type="button" class="btn btn-primary  btn-danger" data-dismiss="modal">取消</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup lang='ts'>
import { onMounted, ref } from 'vue';
import { Modal } from 'bootstrap';

const passwordModalRef = ref(null);
const passwordModal = ref(null);
const emits = defineEmits(["submit"])
const props = defineProps(["check","disabled"])

onMounted(function () {
passwordModal.value =new Modal(passwordModalRef.value);
})
function showModal() {
passwordModal.value.show();
}

// 關閉 modal
function closeModal() {
passwordModal.value.hide();
}

defineExpose({
showModal,
closeModal
})

</script>

<style>

</style>