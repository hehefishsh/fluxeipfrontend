import workProgress from "@/views/work/workProgress.vue";
import workDetail from "./workDetail.vue";
import workCreate from "./workCreate.vue";
import Taskprogress from "./Taskassign.vue";
import workUpdate from "./workUpdate.vue";

import useUserStore from '@/stores/user';

const workpro = {
    path: "/work",
    name: "work",
    meta: { title: "工作事項" },
    children: [
        {
            path: "progress",
            name: "workprogress-link",
            component: workProgress,
            meta: { title: "所有工作" },
            beforeEnter: (to, from, next) => {
                const userStore = useUserStore();
                if (userStore.roleName != '員工') {
                    next();
                } else {
                    // 否則重定向到打卡頁面或其他頁面
                    next('/403');
                }
            }
        },
        {
            path: "progress/detail/:id",
            name: "workprogressdetail-link",
            component: workDetail,
            meta: { title: "工作分配" },
            beforeEnter: (to, from, next) => {
                const userStore = useUserStore();
                if (userStore.roleName != '員工') {
                    next();
                } else {
                    // 否則重定向到打卡頁面或其他頁面
                    next('/403');
                }
            }
        },
        {
            path: "progress/create",
            name: "workprogresscreate-link",
            component: workCreate,
            meta: { title: "新增工作" },
            beforeEnter: (to, from, next) => {
                const userStore = useUserStore();
                if (userStore.roleName != '員工') {
                    next();
                } else {
                    // 否則重定向到打卡頁面或其他頁面
                    next('/403');
                }
            }
        },
        {
            path: "taskprogress",
            name: "taskprogress-link",
            component: Taskprogress,
            meta: { title: "交辦事項" }
        },
        {
            path: "progress/update/:id",
            name: "taskprogressupdate-link",
            component: workUpdate,
            meta: { title: "修改工作" },
            beforeEnter: (to, from, next) => {
                const userStore = useUserStore();
                if (userStore.roleName != '員工') {
                    next();
                } else {
                    // 否則重定向到打卡頁面或其他頁面
                    next('/403');
                }
            }
        }
    ],
};

export default workpro;