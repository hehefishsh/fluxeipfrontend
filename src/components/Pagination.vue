<template>
    <div class="pagination" v-if="pages > 1">
      <button @click="emitChange(current - 1)" :disabled="current === 1">＜</button>
  
      <button
        v-for="page in pages"
        :key="page"
        :class="{ active: page === current }"
        @click="emitChange(page)"
      >{{ page }}</button>
  
      <button @click="emitChange(current + 1)" :disabled="current === pages">＞</button>
    </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue';
  
  const props = defineProps({
    current: Number,
    pages: Number
  });
  
  const emit = defineEmits(['update:current']);
  
  function emitChange(page) {
    if (page >= 1 && page <= props.pages && page !== props.current) {
      emit('update:current', page);
    }
  }
  </script>
  
  <style scoped>
  .pagination {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-top: 1rem;
  }
  
  .pagination button {
    padding: 6px 12px;
    border: 1px solid #ccc;
    background: #fff;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .pagination button.active {
    background-color: #9254de;
    color: white;
    font-weight: bold;
  }
  
  .pagination button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  </style>
  
