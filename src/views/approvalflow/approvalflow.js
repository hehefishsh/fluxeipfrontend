import CreateApprovalFlow from "./CreateApprovalFlow.vue";
import ApprovalFlowManage from "./ApprovalFlowManage.vue";
import ApprovalFlowAssign from "./ApprovalFlowAssign.vue";
import ApprovalFlowManageDetails from "./ApprovalFlowManageDetails.vue";

const approvalflowRoutes = {
  path: "/approvalflow",
  name: "approvalflow",
  meta: { title: "簽核流程管理" },
  children: [
    {
      path: "create",
      name: "approvalflow-create-link",
      component: CreateApprovalFlow,
      meta: { title: "自訂簽核流程" },
    },
    {
      path: "manage",
      name: "approvalflow-manage-link",
      component: ApprovalFlowManage,
      meta: { title: "管理簽核流程" },
    },
    {
      path: "assign",
      name: "approvalflow-assign-link",
      component: ApprovalFlowAssign,
      meta: { title: "指派簽核流程" },
    },
    {
      path: "approvalflow-manage-details/:id",
      name: " ApprovalFlowManageDetails",
      component: ApprovalFlowManageDetails,
    },
  ],
};

export default approvalflowRoutes;
