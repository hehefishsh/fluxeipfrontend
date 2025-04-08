<template>
    <div v-if="isOpen" class="modal-mask" @click.self="close">
      <div class="modal-wrapper">
        <div class="modal-container">
          <div class="modal-header">
            <h5>與會人員回覆狀態</h5>
            <button type="button" class="close" @click="close">&times;</button>
          </div>
          <div class="modal-body">
            <ul v-if="attendees.length">
              <li v-for="att in attendees" :key="att.attendeeId">
                {{ att.employeeName }}：
                <span :class="replyClass(att.isAttending)">
                  {{ replyText(att.isAttending) }}
                </span>
              </li>
            </ul>
            <p v-else class="text-muted">尚無與會人員</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="close">關閉</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { watch } from 'vue';
  
  const props = defineProps({
    isOpen: Boolean,
    attendees: Array
  });
  const emits = defineEmits(['close']);
  
  function close() {
    emits('close');
  }
  
  function replyText(status) {
    if (status === true) return '✅ 已參加';
    if (status === false) return '❌ 不參加';
    return '尚未回覆';
  }
  
  function replyClass(status) {
    if (status === true) return 'text-success';
    if (status === false) return 'text-danger';
    return 'text-warning';
  }
  
  // 禁止背景滾動
  watch(() => props.isOpen, (newVal) => {
    if (newVal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });
  </script>
  
  <style scoped>
  .modal-mask {
    position: fixed;
    z-index: 9999;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.01); 
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .modal-wrapper {
    width: 400px;
    max-width: 90%;
  }
  
  .modal-container {
    background: white;
    border-radius: 10px;
    overflow: hidden;
    font-size: 15px;
  }
  
  .modal-header,
  .modal-footer {
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #eee;
  }
  
  .modal-header h5 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: bold;
  }
  
  .modal-body {
    padding: 16px;
    line-height: 1.6;
  }
  
  .modal-footer {
    border-top: 1px solid #eee;
    justify-content: flex-end;
  }
  
  .close {
    background: none;
    border: none;
    font-size: 1.5rem;
    line-height: 1;
    cursor: pointer;
    color: #999;
    transition: color 0.2s;
  }
  .close:hover {
    color: #333;
  }
  
  .text-success {
    color: #67c23a;
  }
  .text-danger {
    color: #f56c6c;
  }
  .text-warning {
    color: #e6a23c;
  }

  
  </style>
  