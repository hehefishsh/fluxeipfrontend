import LeaveRequest from "./LeaveRequest.vue";
import WorkAdjustRequest from "./WorkAdjustRequest.vue";
import ExpenseRequest from "./ExpenseRequest.vue";
import MissingPunchRequest from "./MissingPunchRequest.vue";

const requestformRoutes = {
  path: "/requestform",
  name: "requestform",
  meta: { title: '申請表單' },
  children: [
    {
      path: "leave",
      name: "requestform-leave-link",
      component: LeaveRequest,
      meta: { title: '請假申請' },
    },
    {
      path: "workadjust",
      name: "requestform-workadjust-link",
      component: WorkAdjustRequest,
      meta: { title: '加減班申請' },
    },
    {
      path: "missingpunch",
      name: "requestform-missingpunch-link",
      component: MissingPunchRequest,
      meta: { title: '補卡申請' },
    },
    {
      path: "expense",
      name: "requestform-expense-link",
      component: ExpenseRequest,
      meta: { title: '費用申請' },
    },

  ],
};

export default requestformRoutes;
