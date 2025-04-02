import Schedule from "./Schedule.vue";
import ShiftType from "./ShiftType.vue";
import scheduleDetail from "./scheduleDetail.vue";
import ShiftTypeEdit from "./ShiftTypeEdit.vue";
import ShiftTypeEditById from "./ShiftTypeEditById.vue";
import useUserStore from '@/stores/user';

const scheduleRoles = ["最高管理員", "次等管理員", "行政主管", "人資主管", "業務主管", "技術主管"]; // 可以排班的角色


const scheduleRoutes = {
    path: "/schedule",
    name: "schedule",
    meta: { title: '排班' },
    children: [
        {
            path: "shiftType",
            name: "schedule-shiftType-link",
            component: ShiftType,
            meta: { title: '班別' },
            beforeEnter: (to, from, next) => {
                const user = useUserStore();
                if ([...scheduleRoles].includes(user.roleName)) {
                    next(); // 所有指定角色均允許訪問
                } else {
                    next("/403"); // 未授權角色禁止
                }
            },
        },
        {
            path: "shiftType/edit",
            name: "schedule-shiftType-edit-link",
            component: ShiftTypeEdit,
            meta: { title: '班別新增' },
            beforeEnter: (to, from, next) => {
                const user = useUserStore();
                if ([...scheduleRoles].includes(user.roleName)) {
                    next(); // 所有指定角色均允許訪問
                } else {
                    next("/403"); // 未授權角色禁止
                }
            },
        },
        {
            path: "shiftType/edit/:id",
            name: "schedule-shiftType-edit-id-link",
            component: ShiftTypeEditById,
            meta: { title: '班別編輯' },
            beforeEnter: (to, from, next) => {
                const user = useUserStore();
                if ([...scheduleRoles].includes(user.roleName)) {
                    next(); // 所有指定角色均允許訪問
                } else {
                    next("/403"); // 未授權角色禁止
                }
            },
        },
        {
            path: "create",
            name: "schedule-create-link",
            component: Schedule,
            meta: { title: '排班功能' },
            beforeEnter: (to, from, next) => {
                const user = useUserStore();
                if ([...scheduleRoles].includes(user.roleName)) {
                    next(); // 所有指定角色均允許訪問
                } else {
                    next("/403"); // 未授權角色禁止
                }
            },
        },
        {
            path: "detail",
            name: "schedule-detail-link",
            component: scheduleDetail,
            meta: { title: '排班查詢' }
        }
    ]
};

export default scheduleRoutes;