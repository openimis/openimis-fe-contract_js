import {
    graphql, formatPageQueryWithCount, decodeId, formatMutation, formatGQLString
} from "@openimis/fe-core";
import { DATE_TO_DATETIME_SUFFIX } from "./constants";

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

function formatContractGQL(contract) {
    return `
        ${!!contract.id ? `id: "${decodeId(contract.id)}"` : ''}
        ${!!contract.code ? `code: "${formatGQLString(contract.code)}"` : ""}
        ${!!contract.policyHolder ? `policyHolderId: "${decodeId(contract.policyHolder.id)}"` : ""}
        ${!!contract.amountNotified ? `amountNotified: "${contract.amountNotified}"` : ""}
        ${!!contract.amountRectified ? `amountRectified: "${contract.amountRectified}"` : ""}
        ${!!contract.amountDue ? `amountDue: "${contract.amountDue}"` : ""}
        ${!!contract.dateApproved ? `dateApproved: "${contract.dateApproved}${DATE_TO_DATETIME_SUFFIX}"` : ""}
        ${!!contract.datePaymentDue ? `datePaymentDue: "${contract.datePaymentDue}"` : ""}
        ${!!contract.paymentReference ? `paymentReference: "${formatGQLString(contract.paymentReference)}"` : ""}
        ${!!contract.dateValidFrom ? `dateValidFrom: "${contract.dateValidFrom}"` : ""}
        ${!!contract.dateValidTo ? `dateValidTo: "${contract.dateValidTo}"` : ""}
    `;
}

export function createContract(contract, clientMutationLabel) {
    let mutation = formatMutation("createContract", formatContractGQL(contract), clientMutationLabel);
    var requestedDateTime = new Date();
    console.log(mutation.payload);
    return graphql(
        mutation.payload,
        ["CONTRACT_MUTATION_REQ", "CONTRACT_CREATE_CONTRACT_RESP", "CONTRACT_MUTATION_ERR"],
        {
            clientMutationId: mutation.clientMutationId,
            clientMutationLabel,
            requestedDateTime
        }
    );
}
