import LeaveRequestApproval from "./LeaveRequestApproval.vue";
import LeaveRequestApprovalDetails from "./LeaveRequestApprovalDetails.vue";
import WorkAdjustApproval from "./WorkAdjustApproval.vue";
import WorkAdjustApprovalDetails from "./WorkAdjustApprovalDetails.vue";
import MissingPunchApproval from "./MissingPunchApproval.vue";
import MissingPunchApprovalDetails from "./MissingPunchApprovalDetails.vue";
import ExpenseRequestApproval from "./ExpenseRequestApproval.vue";
import ExpenseRequestApprovalDetails from "./ExpenseRequestApprovalDetails.vue";

const requestapprovalRoutes = {
  path: "/requestapproval",
  name: "requestapproval",
  meta: { title: "簽核表單" },
  children: [
    {
      path: "leave",
      name: "requestapproval-leave-link",
      component: LeaveRequestApproval,
      meta: { title: "請假簽核" },
    },
    {
      path: "leave-request-approval-details/:id",
      name: "LeaveRequestApprovalDetails",
      component: LeaveRequestApprovalDetails,
    },
    {
      path: "workadjust",
      name: "requestapproval-workadjust-link",
      component: WorkAdjustApproval,
      meta: { title: "加減班簽核" },
    },
    {
      path: "workadjust-request-approval-details/:id",
      name: "WorkAdjustApprovalDetails",
      component: WorkAdjustApprovalDetails,
    },
    {
      path: "missingpunch",
      name: "requestapproval-missingpunch-link",
      component: MissingPunchApproval,
      meta: { title: "補卡簽核" },
    },
    {
      path: "missingpunch-request-approval-details/:id",
      name: "MissingPunchApprovalDetails",
      component: MissingPunchApprovalDetails,
    },
    {
      path: "expense",
      name: "requestapproval-expense-link",
      component: ExpenseRequestApproval,
      meta: { title: "費用簽核" },
    },
    {
      path: "expense-request-approval-details/:id",
      name: "ExpenseRequestApprovalDetails",
      component: ExpenseRequestApprovalDetails,
    },
  ],
};

export default requestapprovalRoutes;
