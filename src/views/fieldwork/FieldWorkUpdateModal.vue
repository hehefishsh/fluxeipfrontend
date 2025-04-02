<template>
  <div v-if="fieldWorkRecord" class="modal fade" id="fieldWorkUpdateModal" tabindex="-1"
    aria-labelledby="fieldWorkUpdateModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="fieldWorkUpdateModalLabel">
            外勤紀錄詳情
          </h5>

          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
            @click="closeModal"></button>
        </div>
        <div class="modal-body">

          <table class="table table-borderless">
            <tbody>
              <tr>
                <td>外勤紀錄ID</td>
                <td>{{ fieldWorkRecord.recordId }}
                  <button type="button" @click="fillDemoData" class="mr-3 badge badge-pill badge-info"
                    style="position: relative; float: right">Demo</button>
                </td>
              </tr>
              <tr>
                <td>記錄人</td>
                <td>
                  {{ fieldWorkRecord.employeeId }}-{{
                    fieldWorkRecord.employeeName
                  }}
                </td>
              </tr>
              <tr>
                <td>外勤日期</td>
                <td>{{ formatDate(fieldWorkRecord.fieldWorkDate) }}</td>
              </tr>
              <tr>
                <td>外勤時數</td>
                <td>{{ fieldWorkRecord.totalHours }}</td>
              </tr>
              <tr>
                <td>外勤地點</td>
                <td>
                  <textarea type="text" v-model="updatedFieldWork.location" class="form-control"></textarea>
                  <small class="form-text text-muted">最多可輸入 50字。</small>
                </td>
              </tr>
              <tr>
                <td>外勤目的</td>
                <td>
                  <textarea type="text" v-model="updatedFieldWork.purpose" class="form-control"
                    maxlength="200"></textarea>
                  <small class="form-text text-muted">最多可輸入 200字。</small>
                </td>
              </tr>
              <tr>
                <td>狀態</td>
                <td>
                  <select v-model="updatedFieldWork.status" class="form-control">
                    <option value="更新中">更新中</option>
                    <option value="已完成">已完成</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="updateFieldWorkRecord">
            更新
          </button>
          <button class="btn btn-danger" @click="closeModal">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import axiosapi from "@/plugins/axios.js";
import Swal from "sweetalert2";

const props = defineProps({
  fieldWorkRecord: Object,
});

const emit = defineEmits(["update:fieldWorkRecord"]);

const updatedFieldWork = ref({
  recordId: null,
  employeeId: null,
  employeeName: "",
  fieldWorkDate: null,
  totalHours: null,
  location: "",
  purpose: "",
  status: "更新中", // 預設為 "更新中"
});

const closeModal = () => {
  emit("update:fieldWorkRecord", null);
  const modal = document.getElementById("fieldWorkUpdateModal");
  if (modal) {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    modal.style.display = "none";
    const backdrops = document.getElementsByClassName("modal-backdrop");
    while (backdrops.length > 0) {
      backdrops[0].parentNode.removeChild(backdrops[0]);
    }
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "auto";
  }
};

// 監聽 fieldWorkRecord 變化，確保 status 有值
watch(
  () => props.fieldWorkRecord,
  (newVal) => {
    if (newVal) {
      updatedFieldWork.value = {
        ...newVal,

        status: "更新中", // 如果 status 為空，設為 "更新中"
      };
    }
  },
  { immediate: true } // 這樣 watch 會立刻執行一次，確保一開始有值
);

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}年${month}月${day}日`;
};

// 更新外勤紀錄
const updateFieldWorkRecord = async () => {
  try {
    const response = await axiosapi.put(
      `/api/field-work/update/${updatedFieldWork.value.recordId}`,
      updatedFieldWork.value
    );

    Swal.fire({
      icon: "success",
      title: "更新成功",
      text: "外勤紀錄已成功更新。",
    }).then(() => {
      emit("update:fieldWorkRecord", response.data);
      closeModal();
    });
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "更新失敗",
      text: "更新外勤紀錄時出現錯誤。",
    });
  }
};


// Demo 流程填入
function fillDemoData() {
  updatedFieldWork.value.location = "高雄市政府";
  updatedFieldWork.value.purpose = "辦理行政業務";
}

</script>

<style scoped>
.table {
  table-layout: fixed;
  width: 100%;
}

.table td,
.table th {
  word-wrap: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}
</style>
