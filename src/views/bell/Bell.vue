<template>
    <div>
      <button @click="toggleDropdown" class="notify-btn">
        <i class="mdi mdi-bell-outline notify-icon"></i>
        <span v-if="unreadCount > 0" class="notify-badge">{{ unreadCount }}</span>
      </button>
  
      <Teleport to="body">
        <div v-if="dropdownVisible" class="notify-dropdown">
          <header class="dropdown-header">
            通知 ({{ notifyList.length }})
          </header>
  
          <div class="dropdown-body">
            <div v-if="notifyList.length === 0" class="empty">目前無通知</div>
            <div
              v-for="notify in notifyList"
              :key="notify.id"
              class="notify-item"
              :class="{ unread: !notify.isRead }"
              @click="handleNotifyClick(notify)"
            >
              <div class="message">{{ notify.message }}</div>
              <div class="time">{{ formatTime(notify.createTime) }}</div>
            </div>
          </div>
  
          <footer class="dropdown-footer">
            <button @click="fetchNotifications">重新整理</button>
          </footer>
        </div>
      </Teleport>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import axios from '@/plugins/axios-login';
  import useUserStore from '@/stores/user';
  import { useRouter } from 'vue-router';
  
  const user = useUserStore();
  const router = useRouter();
  
  const dropdownVisible = ref(false);
  const notifyList = ref([]);
  const unreadCount = ref(0);
  const previousIds = ref(new Set());
  let pollingInterval = null;
  
  function toggleDropdown() {
    dropdownVisible.value = !dropdownVisible.value;
    if (dropdownVisible.value) {
      fetchNotifications();
    }
  }
  
  onMounted(() => {
    fetchNotifications(); // 初次載入
    pollingInterval = setInterval(fetchNotifications, 3600000);
    document.addEventListener('click', handleClickOutside);
  });
  
  onUnmounted(() => {
    clearInterval(pollingInterval);
    document.removeEventListener('click', handleClickOutside);
  });
  
  function handleClickOutside(e) {
    const dropdown = document.querySelector('.notify-dropdown');
    const btn = document.querySelector('.notify-btn');
    if (dropdown && !dropdown.contains(e.target) && btn && !btn.contains(e.target)) {
      dropdownVisible.value = false;
    }
  }
  
  function formatTime(str) {
    return new Date(str).toLocaleString();
  }
  
  async function fetchNotifications() {
    try {
      const res = await axios.get(`/api/notify/${user.empId}`);
      const newList = res.data || [];
  
      // 檢查是否有新通知
      const currentIds = new Set(newList.map(n => n.id));
      const newNotifies = newList.filter(n => !previousIds.value.has(n.id));
  
      if (newNotifies.length > 0) {
        console.log('有新通知來了！', newNotifies);
        // 這裡可以加 toast 通知提示
      }
  
      notifyList.value = newList;
      unreadCount.value = newList.filter(n => !n.isRead).length;
      previousIds.value = currentIds;
    } catch (err) {
      console.error('通知讀取失敗', err);
    }
  }
  
  async function handleNotifyClick(notify) {
    try {
      await axios.put(`/api/notify/read/${notify.id}`);
      notify.isRead = true;
  
      unreadCount.value = notifyList.value.filter(n => !n.isRead).length;
  
      if (notify.message.includes('會議')) {
        router.push('/meeting/create');
      } else if (notify.message.includes('假單')) {
        router.push('/requestapproval/leave');
      } else if (notify.message.includes('請假申請')) {
        router.push('/requestmanage/leave');
      } else if (notify.message.includes('《減班》申請') || notify.message.includes('《加班》申請')) {
        router.push('/requestmanage/workadjust');
      } else if (notify.message.includes('加班單') || notify.message.includes('減班單')) {
        router.push('/requestapproval/workadjust');
      } else if (notify.message.includes('薪資查詢')) {
        router.push('/salary/detail');
      }else if (notify.message.includes('費用》申請單')) {
        router.push('/requestapproval/expense');
      }else if (notify.message.includes('費用申請')) {
        router.push('/requestmanage/expense');
      }else if (notify.message.includes('交辦任務')) {
        router.push('/work/taskprogress');
      }else if (notify.message.includes('被退回')) {
        router.push('/work/taskprogressㄟ');
      }else if (notify.message.includes('工作分配')) {
        router.push('/work/progress/detail/55');
      }else if (notify.message.includes('補卡申請待審核')) {
        router.push('/requestapproval/missingpunch');
      }else if (notify.message.includes('《上班》')) {
        router.push('/requestmanage/missingpunch');
      }else if (notify.message.includes('《下班》')) {
        router.push('/requestmanage/missingpunch');
      }else if (notify.message.includes('班表已排定')) {
        router.push('/schedule/detail');
      }
  
    } catch (error) {
      console.error('點擊通知失敗', error);
    }
  }
  </script>
  
  <style scoped>
  .notify-btn {
    position: relative;
    background: none;
    border: none;
    padding: 0;
    margin: 0 1px;
    cursor: pointer;
  }
  
  .notify-icon {
    font-size: 30px;
    color: #333;
  }
  
  .notify-badge {
    position: absolute;
    top: -2px;
    right: -4px;
    background: #f54281;
    color: white;
    border-radius: 50%;
    padding: 1px 5px;
    font-size: 10px;
    font-weight: bold;
    min-width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .notify-dropdown {
    position: fixed;
    top: 56px;
    right: 16px;
    width: 320px;
    max-width: 90vw;
    background: white;
    border-radius: 10px;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
    z-index: 99999;
    overflow: hidden;
    font-size: 14.5px;
  }
  
  .dropdown-header {
    background-color: #f8f9fa;
    padding: 10px 14px;
    font-weight: bold;
    border-bottom: 1px solid #eee;
  }
  
  .dropdown-body {
    max-height: 280px;
    overflow-y: auto;
  }
  
  .notify-item {
    padding: 12px 16px;
    border-bottom: 1px solid #f4f4f4;
    background-color: #fff7e0;
    margin: 6px 10px;
    border-radius: 6px;
    cursor: pointer;
  }
  
  .notify-item.unread {
    background-color: #D2E9FF;
  }
  
  .message {
    margin-bottom: 4px;
    line-height: 1.4;
    color: #000;
    font-weight: 500;
  }
  
  .message strong {
    color: #000;
    font-weight: bold;
  }
  
  .time {
    font-size: 12px;
    color: #444;
  }
  
  .empty {
    text-align: center;
    color: #aaa;
    padding: 20px 12px;
  }
  
  .dropdown-footer {
    padding: 8px;
    text-align: center;
    background-color: #f9f9f9;
    border-top: 1px solid #eee;
  }
  
  .dropdown-footer button {
    font-size: 12px;
    padding: 4px 8px;
    background: #f0f0f0;
    border: 1px solid #ccc;
    border-radius: 6px;
    cursor: pointer;
    transition: 0.2s;
  }
  
  .dropdown-footer button:hover {
    background: #e0e0e0;
  }
  </style>
  