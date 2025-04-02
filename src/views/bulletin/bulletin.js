import BulletinList from "@/views/bulletin/BulletinList.vue";
import BulletinForm from "@/views/bulletin/BulletinForm.vue";
import BulletinDetail from "./BulletinDetail.vue";

const bulletinRoutes = {
  path: "/bulletin",
  name: "bulletin",
  meta: { title: "公佈欄" },
  children: [
    {
      path: "",
      name: "bulletin-list",
      component: BulletinList,
      meta: { title: "公佈欄列表" },
    },
    {
      path: "create",
      name: "bulletin-create",
      component: BulletinForm,
      meta: { title: "新增公告" },
    },
    {
      path: "edit/:id",
      name: "bulletin-edit",
      component: BulletinForm,
      meta: { title: "編輯公告" },
    },
    {
      path: '/bulletin/:id',
      name: 'BulletinDetail',
      component: BulletinDetail,  // 載入你的詳細頁面組件
      meta: { title: "詳細內容" }
    },

  ],
};

export default bulletinRoutes;


