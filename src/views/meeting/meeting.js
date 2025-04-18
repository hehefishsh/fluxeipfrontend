import MeetingCreate from "./MeetingCreate.vue";
import MeetingManage from "./MeetingManage.vue";
import MeetingHost from "./MeetingHost.vue";
import useUserStore from "@/stores/user";
import MeetingInvite from "./MeetingInvite.vue";


const adminRoles = ["最高管理員", "次等管理員"]; // 管理員角色
const userRoles = ["員工", "行政主管", "人資主管", "業務主管", "技術主管"]; // 普通角色

const meetingRoutes = {
  path: "/meeting",
  name: "meeting",
  meta: { title: "會議" },
  children: [
    {
      path: "manage",
      name: "meeting-manage-link",
      component: MeetingManage,
      meta: { title: "會議室資訊" },
      // 移除了 beforeEnter，表示所有人都可以訪問
    },
    {
      path: "create",
      name: "meeting-create-link",
      component: MeetingCreate,
      meta: { title: "預約列表" },
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
      path: "host",
      name: "meeting-host-link",
      component: MeetingHost,
      meta: { title: "我主辦的會議" },
      beforeEnter: (to, from, next) => {
        const userStore = useUserStore();
        if ([...adminRoles, ...userRoles].includes(userStore.roleName)) {
          next();
        } else {
          next("/403");
        }
      },
    },
    {
      path: "invite",
      name: "meeting-invite-link",
      component: MeetingInvite,
      meta: { title: "我被邀請的會議" },
    },
  ],
};

export default meetingRoutes;
