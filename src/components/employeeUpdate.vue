<template>
    <div class="modal fade" ref="EmployeeModalRef" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">

                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">修改員工資料</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>

                <div class="modal-body">
                    <table>
                        <tbody>
                            <tr>
                                <td>ID : </td>
                                <td><input type="text" name="id" :value="emp.employeeId" disabled></td>
                            </tr>
                            <tr>
                                <td>Name : </td>
                                <td><input type="text" name="name" :value="emp.employeeName" @input="doinput('employeeName',$event)"></td>
                            </tr>

                            <tr>
                                <td><label for="departmentId">部門</label></td>
                                <td>
                                    <select class="form-control" id="departmentId" v-model="emp.department" required @change="emits('posfind')">
                                        <option v-for="department in dep" :value="department.departmentName">
                                            {{ department.departmentName }}
                                        </option>
                                    </select>
                                </td>
                            </tr>

                            <tr>
                                <td><label for="positionId">職位</label></td>
                                <td>
                                    <select class="form-control" id="positionId" v-model="emp.position" required>
                                        <option v-for="position in pos"  :value="position.positionName">
                                            {{ position.positionName }}
                                        </option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td><label for="positionId">狀態</label></td>
                                <td>
                                    <select class="form-control" id="positionId" v-model="emp.status" required>
                                        <option v-for="status in sts" :value="status">
                                            {{ status }}
                                        </option>
                                    </select>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" @click="emits('update')">修改</button>
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">取消</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { Modal } from 'bootstrap';

const EmployeeModalRef = ref(null);
const EmployeeModal = ref(null);
const emits = defineEmits(["update:emp", "update","posfind"]);
const props = defineProps(["emp", "dep", "pos","sts"]);

// 更新輸入值
function doinput(action, event) {
    emits("update:emp", {
        ...props.emp,
        [action]: event.target.value
    });
}

// 初始化 modal
onMounted(function () {
    EmployeeModal.value =new Modal(EmployeeModalRef.value);
    // EmployeeModal.value = new bootstrap.Modal(EmployeeModalRef.value);
})


// 顯示 modal
function showModal() {
    EmployeeModal.value.show();
}

// 關閉 modal
function closeModal() {
    EmployeeModal.value.hide();
}

defineExpose({
    showModal,
    closeModal
})
</script>

<style>
/* 如果需要額外的自定義樣式，可以在這裡添加 */
</style>
