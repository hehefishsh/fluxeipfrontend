<template>
    <div class="modal fade" ref="TaskassignModalRef" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">

                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">編輯工作事項</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>

                <div class="modal-body">
                    <table>
                        <tbody>
                            <tr>
                                <td><label for="empId">項目名 :</label></td>
                                <td><input type="text" name="name" :value="task.taskName" @input="doinput('taskName',$event)"></td>
                            </tr>
                            <tr>
                                <td><label for="empId">工作內容 : </label></td>
                                <td><textarea name="taskContent" :value="task.taskContent" @input="doinput('taskContent', $event)" class="form-control" rows="3"></textarea>
                                </td>
                            </tr>
                            <tr>
                                <td><label for="empId">負責員工 :</label></td>
                                <td><select class="form-control" id="empId" v-model="task.employee">
                                        <option v-for="emplo in empselect"  :value="emplo.employeeName">
                                            {{ emplo.employeeName }}
                                        </option>
                                    </select></td>
                            </tr>
                            <tr>
                                <td><label for="empId">開始日期 :</label></td>
                                <td><input type="date" id="createDate" v-model="task.createDate" class="custom-select my-1 mr-sm-2 w-auto" /></td>
                            </tr>
                            <tr>
                                <td><label for="empId">預計完成日期 :</label></td>
                                <td><input type="date" id="expectedFinishDate" v-model="task.expectedFinishDate" class="custom-select my-1 mr-sm-2 w-auto" /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" v-show="!isShowButtonInsert" @click="emits('insert')">新增</button>
                    <button type="button" class="btn btn-primary" v-show="isShowButtonInsert" @click="emits('update')">修改</button>
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">取消</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { Modal } from 'bootstrap';

const TaskassignModalRef = ref(null);
const TaskassignModal = ref(null);
const emits = defineEmits(["update:task", "update","insert"]);
const props = defineProps(["isShowButtonInsert","task","empselect"]);
// 更新輸入值
function doinput(action, event) {
    emits("update:task", {
        ...props.task,
        [action]: event.target.value
    });
}

// 初始化 modal
onMounted(function () {
    TaskassignModal.value =new Modal(TaskassignModalRef.value);
})


// 顯示 modal
function showModal() {
    TaskassignModal.value.show();
}

// 關閉 modal
function closeModal() {
    TaskassignModal.value.hide();
}

defineExpose({
    showModal,
    closeModal
})


</script>

<style>
/* 如果需要額外的自定義樣式，可以在這裡添加 */
</style>
