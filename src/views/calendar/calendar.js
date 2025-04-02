import DepartmentCalendar from "./DepartmentCalendar.vue";
import PersonalCalendar from "./PersonalCalendar.vue";

const calendarRoutes = {
    path: "/calendar",
    name: "calendar",
    meta: { title: '行事曆' },
    children: [
        {
            path: "personal",
            name: "calendar-personal-link",
            component: PersonalCalendar,
            meta: { title: '個人行事曆' },
        },
        {
            path: "department",
            name: "calendar-department-link",
            component: DepartmentCalendar,
            meta: { title: '部門行事曆' },
        },
    ],
};

export default calendarRoutes;