<template>
  <div
    class="modal fade"
    id="fieldWorkDetailModal"
    tabindex="-1"
    aria-labelledby="fieldWorkDetailModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="fieldWorkDetailModalLabel">
            外勤紀錄詳情
          </h5>
          <button
            type="button"
            class="btn-close"
            data-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <div v-if="fieldWorkRecord">
            <table class="table table-borderless">
              <tbody>
                <tr>
                  <td>外勤紀錄ID</td>
                  <td>{{ fieldWorkRecord.recordId }}</td>
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
                    {{ fieldWorkRecord.location }}
                  </td>
                </tr>
                <tr>
                  <td>外勤目的</td>
                  <td>{{ fieldWorkRecord.purpose }}</td>
                </tr>
                <tr>
                  <td>狀態</td>
                  <td>{{ fieldWorkRecord.status }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-danger" data-dismiss="modal">關閉</button>
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

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}年${month}月${day}日`;
};
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
