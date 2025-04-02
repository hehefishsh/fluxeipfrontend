import FieldWorkManage from "./FieldWorkManage.vue";
import FieldWorkUpdateModal from "./FieldWorkUpdateModal.vue";
import FieldWorkDetailModal from "./FieldWorkDetailModal.vue";

const fieldworkmanageRoutes = {
  path: "/fieldwork",
  name: "fieldworkmanage",
  meta: { title: "外勤管理" },
  children: [
    {
      path: "manage",
      name: "fieldwork-manage-link",
      component: FieldWorkManage,
      meta: { title: "外勤記錄填寫" },
    },
    {
      path: "fieldwork-manage-details/:id",
      name: "FieldWorkDetailModal",
      component: FieldWorkDetailModal,
    },
    {
      path: "fieldwork-manage-update/:id",
      name: "FieldWorkUpdateModal",
      component: FieldWorkUpdateModal,
    },
  ],
};

export default fieldworkmanageRoutes;
