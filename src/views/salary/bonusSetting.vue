<template>
<div class="card card-default" id="page-views">
      <div class="card-body py-0" data-simplebar>

        <!-- 新增按鈕 -->
        <div class="d-flex justify-content-end mb-3">
        <button class="btn btn-success" @click="showAddBonusForm">新增獎金</button>
        </div>
        <div v-if="allBonuses && allBonuses.length">
          <table class="table table-borderless table-thead-border">
            <thead>
              <tr>
                <th class="text">獎金/津貼種類</th>
                <th class="text">編輯名稱</th>
                <th class="text">金額</th>
                <th class="text">編輯金額</th>
                <th class="text">刪除</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="bonus in allBonuses" :key="bonus.salaryBonusId">
                              <!-- 編輯名稱欄位 -->
              <td class="text">
                <span v-if="!editingName[bonus.salaryBonusId]">{{ bonus.bonusType }}</span>
                <input 
                  v-else 
                  v-model="editedName" 
                  type="text" 
                  class="form-control"
                />
              </td>
              <td>
                <button 
                  v-if="!editingName[bonus.salaryBonusId]" 
                  class="btn btn-primary btn-sm" 
                  @click="editName(bonus.salaryBonusId, bonus.bonusType)"
                >
                  編輯
                </button>
                <div v-else>
                  <button class="btn btn-success btn-sm" @click="saveName(bonus.salaryBonusId)">確定</button>
                  <button class="btn btn-secondary btn-sm" @click="cancelEdit('name', bonus.salaryBonusId)">取消</button>
                </div>
              </td>
              <!-- 編輯金額欄位 -->
              <td class="text">
                <span v-if="!editingAmount[bonus.salaryBonusId]">{{ bonus.amount }}</span>
                <input 
                  v-else 
                  v-model="editedAmount" 
                  type="number" 
                  class="form-control"
                />
              </td>
              <td>
                <button 
                  v-if="!editingAmount[bonus.salaryBonusId]" 
                  class="btn btn-primary btn-sm" 
                  @click="editAmount(bonus.salaryBonusId, bonus.amount)"
                >
                  編輯
                </button>
                <div v-else>
                  <button class="btn btn-success btn-sm" @click="saveAmount(bonus.salaryBonusId)">確定</button>
                  <button class="btn btn-secondary btn-sm" @click="cancelEdit('amount', bonus.salaryBonusId)">取消</button>
                </div>
              </td>
              <td>
                <button class="btn btn-danger btn-sm" @click="deleteBonus(bonus.salaryBonusId)">刪除</button> <!-- 刪除按鈕 -->
              </td>
              </tr>
            </tbody>
          </table>
        </div>
      <div class="bg-white py-4"></div>
    </div>
</div>
</template>
    
<script setup>
import { ref,onMounted } from 'vue';
import axiosapi from "@/plugins/axios";
import Swal from 'sweetalert2';

const editingName = ref({});
const editingAmount = ref({});
const editedName = ref("");
const editedAmount = ref("");

const allBonuses = ref([]);
onMounted(async () => {
    try {
    const res = await axiosapi.get(`/api/salary/bonus`);
    allBonuses.value = res.data;
    } catch (error) {
    console.error("取得獎金資料失敗:", error);
    }
})

const editName = (id, currentName) => {
  editingName.value[id] = true;
  editedName.value = currentName;
};

const editAmount = (id, currentAmount) => {
  editingAmount.value[id] = true;
  editedAmount.value = currentAmount;
};

const cancelEdit = (type, id) => {
  if (type === "name") {
    editingName.value[id] = false;
  } else if (type === "amount") {
    editingAmount.value[id] = false;
  }
};

const saveName = async (id) => {
  try {
    await axiosapi.put(`/api/salary/newBonus/${id}?bonusType=${editedName.value}`);
    Swal.fire("成功", "名稱已更新！", "success").then(() => {
      window.location.reload(); // 重整頁面
    });
  } catch (error) {
    console.error("更新名稱失敗:", error);
    Swal.fire("錯誤", "無法更新名稱！", "error");
  }
};

// 保存金額
const saveAmount = async (id) => {
  try {
    await axiosapi.post(`/api/salary/newBonus/${id}?amount=${editedAmount.value }`);
    Swal.fire("成功", "金額已更新！", "success").then(() => {
      window.location.reload(); // 重整頁面
    });
  } catch (error) {
    console.error("更新金額失敗:", error);
    Swal.fire("錯誤", "無法更新金額！", "error");
  }
};
// 刪除獎金
const deleteBonus = async (bonusId) => {
  try {
    // 彈出確認框
    const result = await Swal.fire({
      title: '確定要刪除此獎金嗎?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '確定',
      cancelButtonText: '取消',
    });

    // 若用戶確認刪除
    if (result.isConfirmed) {
      await axiosapi.delete(`/api/salary/newBonus/${bonusId}`); // 呼叫後端刪除API
      // 更新表格
      Swal.fire('刪除成功', '', 'success').then(() => {
      window.location.reload(); // 重整頁面
    });
    }
  } catch (error) {
    console.error("刪除獎金失敗:", error);
    Swal.fire('錯誤', '刪除失敗', 'error');
  }
};

const showAddBonusForm = async () => {
  const { value: formValues } = await Swal.fire({
    title: '新增獎金',
    html: `
      <input id="bonusType" class="swal2-input" placeholder="獎金/津貼種類名稱">
      <input id="amount" type="number" class="swal2-input" placeholder="金額">
    `,
    focusConfirm: false,
    preConfirm: () => {
      return {
        bonusType: document.getElementById('bonusType').value,
        amount: document.getElementById('amount').value
      };
    }
  });

  if (formValues) {
    const { bonusType, amount } = formValues;
    if (!bonusType || !amount) {
      Swal.fire('錯誤', '請輸入所有欄位', 'error');
    } else {
      try {
        // 呼叫後端 API 新增獎金
        const response = await axiosapi.post(`/api/salary/newBonus?bonusType=${bonusType}&amount=${amount}`);
        Swal.fire('新增成功', '', 'success').then(() => {
      window.location.reload(); // 重整頁面
    });
      } catch (error) {
        console.error("新增獎金失敗:", error);
        Swal.fire('錯誤', '新增失敗', 'error');
      }
    }
  }
};
</script>
    
<style scoped>
/* 給按鈕外層容器設定邊距 */
.d-flex {
  margin-top: 20px; /* 左邊距 */
  margin-right: 10px; /* 右邊距 */
}
</style>