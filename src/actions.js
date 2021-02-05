import {
    graphql, formatPageQuery, formatPageQueryWithCount, decodeId, formatMutation, formatGQLString
} from "@openimis/fe-core";

const CONTRACT_FULL_PROJECTION = modulesManager =>  [
    "id", "code", "amountNotified", "amountRectified", "amountDue", "dateApproved", "datePaymentDue",
    "state", "paymentReference", "amendment", "dateValidFrom", "dateValidTo", "isDeleted",
    "policyHolder" + modulesManager.getProjection("policyHolder.PolicyHolderPicker.projection")
];

function dateTimeToDate(date) {
    return date.split('T')[0];
}

export function fetchContracts(modulesManager, params) {
    const payload = formatPageQueryWithCount(
        "contract",
        params,
        CONTRACT_FULL_PROJECTION(modulesManager)
    );
    return graphql(payload, "CONTRACT_CONTRACTS");
}

export function fetchContract(modulesManager, params) {
    const payload = formatPageQuery(
        "contract",
        params,
        CONTRACT_FULL_PROJECTION(modulesManager)
    );
    return graphql(payload, "CONTRACT_CONTRACT");
}

function formatContractGQL(contract, readOnlyFields = []) {
    return `
        ${!!contract.id ? `id: "${decodeId(contract.id)}"` : ''}
        ${!!contract.code && !readOnlyFields.includes('code') ? `code: "${formatGQLString(contract.code)}"` : ""}
        ${!!contract.policyHolder && !readOnlyFields.includes('policyHolder') ? `policyHolderId: "${decodeId(contract.policyHolder.id)}"` : ""}
        ${!!contract.dateApproved && !readOnlyFields.includes('dateApproved') ? `dateApproved: "${contract.dateApproved}"` : ""}
        ${!!contract.datePaymentDue && !readOnlyFields.includes('datePaymentDue') ? `datePaymentDue: "${contract.datePaymentDue}"` : ""}
        ${!!contract.paymentReference && !readOnlyFields.includes('paymentReference') ? `paymentReference: "${formatGQLString(contract.paymentReference)}"` : ""}
        ${!!contract.dateValidFrom && !readOnlyFields.includes('dateValidFrom') ? `dateValidFrom: "${dateTimeToDate(contract.dateValidFrom)}"` : ""}
        ${!!contract.dateValidTo && !readOnlyFields.includes('dateValidTo') ? `dateValidTo: "${dateTimeToDate(contract.dateValidTo)}"` : ""}
    `;
}

export function createContract(contract, clientMutationLabel) {
    let mutation = formatMutation("createContract", formatContractGQL(contract), clientMutationLabel);
    var requestedDateTime = new Date();
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

export function updateContract(contract, clientMutationLabel, readOnlyFields = []) {
    let mutation = formatMutation("updateContract", formatContractGQL(contract, readOnlyFields), clientMutationLabel);
    var requestedDateTime = new Date();
    return graphql(
        mutation.payload,
        ["CONTRACT_MUTATION_REQ", "CONTRACT_UPDATE_CONTRACT_RESP", "CONTRACT_MUTATION_ERR"],
        {
            clientMutationId: mutation.clientMutationId,
            clientMutationLabel,
            requestedDateTime
        }
    );
}

export function deleteContract(contract, clientMutationLabel, clientMutationDetails = null) {
    let contractUuids = `uuids: ["${decodeId(contract.id)}"]`;
    let mutation = formatMutation("deleteContract", contractUuids, clientMutationLabel, clientMutationDetails);
    var requestedDateTime = new Date();
    return graphql(
        mutation.payload,
        ["CONTRACT_MUTATION_REQ", "CONTRACT_DELETE_CONTRACT_RESP", "CONTRACT_MUTATION_ERR"],
        {
            clientMutationId: mutation.clientMutationId,
            clientMutationLabel,
            requestedDateTime
        }
    );
}
