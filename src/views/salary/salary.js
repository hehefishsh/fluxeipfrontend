import Salary from "./Salary.vue";
import useUserStore from "@/stores/user";
import MonthlySalary from "./MonthlySalary.vue";
import SalaryDetail from "./SalaryDetail.vue";
import SalaryManage from "./SalaryManage.vue";
import bonusSetting from "./bonusSetting.vue";

const adminRoles = ["最高管理員", "次等管理員"]; // 管理員角色
const userRoles = ["行政主管", "人資主管", "業務主管", "技術主管"]; // 普通角色
const emp = ["員工"]
const salarySettingRole = ["最高管理員", "次等管理員", "人資主管"];

const salaryRoutes = {
    path: "/salary",
    name: "salary",
    meta: { title: '薪資' },
    children: [
        {
            path: "all",
            name: "salary-all-link",
            component: Salary,
            meta: { title: '薪資設定' },
            beforeEnter: (to, from, next) => {
                const userStore = useUserStore();
                if ([...salarySettingRole].includes(userStore.roleName)) {
                    next(); // 所有指定角色均允許訪問
                } else {
                    next("/403"); // 未授權角色禁止
                }
            },
        },
        {
            path: "monthly",
            name: "salary-monthly-link",
            component: MonthlySalary,
            meta: { title: '薪資結算' },
            beforeEnter: (to, from, next) => {
                const userStore = useUserStore();
                if ([...salarySettingRole].includes(userStore.roleName)) {
                    next(); // 所有指定角色均允許訪問
                } else {
                    next("/403"); // 未授權角色禁止
                }
            },
        },
        {
            path: "manage",
            name: "salary-manage-link",
            component: SalaryManage,
            meta: { title: '薪資結算' },
            beforeEnter: (to, from, next) => {
                const userStore = useUserStore();
                if ([...salarySettingRole].includes(userStore.roleName)) {
                    next(); // 所有指定角色均允許訪問
                } else {
                    next("/403"); // 未授權角色禁止
                }
            },
        },
        {
            path: "detail",
            name: "salary-detail-link",
            component: SalaryDetail,
            meta: { title: '薪資明細' }
        },
        {
            path: "bonus",
            name: "salary-bonus-link",
            component: bonusSetting,
            meta: { title: '獎金津貼' },
            beforeEnter: (to, from, next) => {
                const userStore = useUserStore();
                if ([...salarySettingRole].includes(userStore.roleName)) {
                    next(); // 所有指定角色均允許訪問
                } else {
                    next("/403"); // 未授權角色禁止
                }
            },
        },
    ],
};

export default salaryRoutes;
