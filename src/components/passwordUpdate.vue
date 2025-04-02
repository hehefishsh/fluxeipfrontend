<template>
        <div class="modal fade" id="exampleModalForm" tabindex="-1" role="dialog" aria-labelledby="exampleModalFormTitle"
            aria-hidden="true" ref="passwordModalRef">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalFormTitle">修改密碼</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <form @submit.prevent="emits('passwordsubmit')">
                        <div class="modal-body">
                                <div class="form-group">
                                    <label for="exampleInputEmail1">舊密碼</label>
                                    <input type="password" class="form-control" id="oldPassword" aria-describedby="emailHelp"
                                    placeholder="舊密碼" required v-model="pas.old" @input="doinput('old',$event)">
                                </div>
                                <div class="form-group">
                                    <label for="exampleInputPassword1">新密碼</label>
                                    <input type="password" class="form-control" id="newPassword" placeholder="新密碼" required v-model="pas.new" @input="doinput('new',$event)">
                                </div>
                                
                                <div class="form-group">
                                    <label for="exampleInputPassword1">確認密碼</label>
                                    <input type="password" class="form-control" id="checkPassword" placeholder="確認密碼" required v-model="pas.check" @input="emits('check')" >
                                </div>
                                <span v-if="newPasswordError" class="error-message">新密碼與確認密碼不同</span>
                        </div>
                        <div class="modal-footer">
                            <button type="submit" class="btn btn-primary  btn-success">修改</button>
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
const emits = defineEmits(["passwordsubmit","update:pass","check"])
const props = defineProps(["pas","newPasswordError"])



function doinput(action, event) {
    emits("update:pass", {
        ...props.pas,
        [action]: event.target.value
    });
}

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