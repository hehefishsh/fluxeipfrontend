import GuidelineAll from "./GuidelineAll.vue";
import GuidelineDetail from "./GuidelineDetail.vue";
import GuidelineUpdate from "./GuidelineUpdate.vue";
import GuidelineUpdateById from "./GuidelineUpdateById.vue";
import useUserStore from "@/stores/user";


const adminRoles = ["最高管理員", "次等管理員"]; // 管理員角色
const userRoles = ["行政主管", "人資主管", "業務主管", "技術主管"]; // 普通角色
const emp = ["員工"]

const guidelineRoutes = {
  path: "/guideline",
  name: "guideline",
  meta: { title: '智庫' },
  children: [
    {
      path: "all",
      name: "guideline-all-link",
      component: GuidelineAll,
      meta: { title: '智庫總覽' }
    },
    {
      path: "detail/:id",  // 動態路由，會接收 id 參數
      name: "guideline-detail-link",
      component: GuidelineDetail,
      meta: { title: '智庫詳細' }
    },
    {
      path: "update",
      name: 'guideline-update-link',
      component: GuidelineUpdate,
      meta: { title: '智庫編輯' },
      beforeEnter: (to, from, next) => {
        const userStore = useUserStore();
        if ([...adminRoles, ...userRoles].includes(userStore.roleName)) {
          next(); // 所有指定角色均允許訪問
        } else {
          next("/403"); // 未授權角色禁止
        }
      },
    },
    {
      path: "update/:id",
      name: 'guideline-update-link-by-id',
      component: GuidelineUpdateById,
      meta: { title: '智庫編輯' },
      beforeEnter: (to, from, next) => {
        const userStore = useUserStore();
        if ([...adminRoles, ...userRoles].includes(userStore.roleName)) {
          next(); // 所有指定角色均允許訪問
        } else {
          next("/403"); // 未授權角色禁止
        }
      },
    }
  ],
};

export default guidelineRoutes;
