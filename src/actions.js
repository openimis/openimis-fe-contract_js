import {
    graphql, formatPageQueryWithCount
} from "@openimis/fe-core";

const CONTRACT_FULL_PROJECTION = modulesManager =>  [
    "id", "code", "amountNotified", "amountRectified", "amountDue", "datePaymentDue", "state",
    "paymentReference", "amendment", "dateValidFrom", "dateValidTo", "isDeleted",
    "policyHolder" + modulesManager.getProjection("policyHolder.PolicyHolderPicker.projection")
];

export function fetchContracts(modulesManager, params) {
    const payload = formatPageQueryWithCount(
        "contract",
        params,
        CONTRACT_FULL_PROJECTION(modulesManager)
    );
    return graphql(payload, "CONTRACT_CONTRACTS");
}
