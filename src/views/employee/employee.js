import EmployeeSearch from "@/views/employee/manage/EmployeeSearch.vue";

import EmployeeCreate from "@/views/employee/manage/EmployeeCreate.vue";
import EmployeeDetail from "@/views/employee/EmployeeDetail.vue";
import EmployeeDetailUpdate from "@/views/employee/manage/EmployeeDetailUpdate.vue";

import useUserStore from '@/stores/user';

const routes = [
  { path: "detail", component: EmployeeDetail, name: "employee-detail-link", meta: { title: '個人資訊' } },
  {
    path: "manage/search", component: EmployeeSearch, name: "employee-manage-search-link", meta: { title: '員工查詢' }, beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      if (userStore.roleName === '最高管理員') {
        // 如果是主管，可以進入新增員工頁面
        next();
      } else if (userStore.roleName === '人資主管') {
        // 如果是主管，可以進入新增員工頁面
        next();
      } else {
        // 否則重定向到打卡頁面或其他頁面
        next('/403');
      }
    }
  },
  {
    path: "manage/create", component: EmployeeCreate, name: "employee-manage-create-link", meta: { title: '員工新增' }, beforeEnter: (to, from, next) => {
      const userStore = useUserStore();
      if (userStore.roleName === '最高管理員') {
        // 如果是主管，可以進入新增員工頁面
        next();
      } else if (userStore.roleName === '人資主管') {
        // 如果是主管，可以進入新增員工頁面
        next();
      } else {
        // 否則重定向到打卡頁面或其他頁面
        next('/403');
      }
    }
  },
  { path: "detail/update", component: EmployeeDetailUpdate, name: "employee-manage-update-link", meta: { title: '員工個人資料修改' } },
]

const employeeRoutes = {
  path: "/employee",
  name: "employee",
  meta: { title: '員工管理' },
  children: routes
};

export default employeeRoutes;
