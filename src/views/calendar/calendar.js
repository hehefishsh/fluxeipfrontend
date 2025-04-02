// calendar.js
import DepartmentCalendar from "./DepartmentCalendar.vue";
import PersonalCalendar from "./PersonalCalendar.vue";
import EventDetail from "./EventDetail.vue";
import CalendarLayout from "./CalendarLayout.vue";
import CreateEvent from "./CreateEvent.vue";

// 這裡 **不要用 createRouter**，只輸出 `routes`
const calendarRoutes = [
    {
        path: "/calendar",
        name: "calendar",
        component: CalendarLayout,
        children: [
            {
                path: "personal",
                name: "calendar-personal-link",
                component: PersonalCalendar,
                meta: { title: "個人行事曆" },
            },
            {
                path: "create",
                name: "calendar-create",
                component: EventDetail,
                meta: { title: "新增事件" },
            },
            {
                path: "department",
                name: "calendar-department-link",
                component: DepartmentCalendar,
                meta: { title: "部門行事曆" },
            },
            {
                path: 'create2',
                name: 'CreateEvent',
                component: CreateEvent,
                meta: { title: "新增事件" },
            },
        ],
    },
];

export default calendarRoutes;

