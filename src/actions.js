import {
    graphql, formatPageQuery, formatPageQueryWithCount, decodeId, formatMutation, formatGQLString
} from "@openimis/fe-core";

const CONTRACT_FULL_PROJECTION = modulesManager =>  [
    "id", "code", "amountNotified", "amountRectified", "amountDue", "dateApproved", "datePaymentDue",
    "state", "paymentReference", "amendment", "dateValidFrom", "dateValidTo", "isDeleted",
    "policyHolder" + modulesManager.getProjection("policyHolder.PolicyHolderPicker.projection")
];

const CONTRACTDETAILS_FULL_PROJECTION = modulesManager =>  [
    "id", "jsonExt",
    "insuree" + modulesManager.getProjection("insuree.InsureePicker.projection"),
    "contributionPlanBundle" + modulesManager.getProjection("contributionPlan.ContributionPlanBundlePicker.projection")
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

export function fetchContractDetails(modulesManager, params) {
    const payload = formatPageQueryWithCount(
        "contractDetails",
        params,
        CONTRACTDETAILS_FULL_PROJECTION(modulesManager)
    );
    return graphql(payload, "CONTRACT_CONTRACTDETAILS");
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

function formatContractDetailsGQL(contractDetails) {
    return `
        ${!!contractDetails.id ? `id: "${decodeId(contractDetails.id)}"` : ''}
        ${!!contractDetails.contract ? `contractId: "${decodeId(contractDetails.contract.id)}"` : ''}
        ${!!contractDetails.insuree ? `insureeId: ${decodeId(contractDetails.insuree.id)}` : ''}
        ${!!contractDetails.contributionPlanBundle ? `contributionPlanBundleId: "${decodeId(contractDetails.contributionPlanBundle.id)}"` : ''}
        ${!!contractDetails.jsonExt ? `jsonExt: ${JSON.stringify(contractDetails.jsonExt)}` : ''}
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

export function submitContract(contract, clientMutationLabel) {
    let contractId = `id: "${decodeId(contract.id)}"`; 
    let mutation = formatMutation("submitContract", contractId, clientMutationLabel);
    var requestedDateTime = new Date();
    return graphql(
        mutation.payload,
        ["CONTRACT_MUTATION_REQ", "CONTRACT_SUBMIT_CONTRACT_RESP", "CONTRACT_MUTATION_ERR"],
        {
            clientMutationId: mutation.clientMutationId,
            clientMutationLabel,
            requestedDateTime
        }
    );
}

export function approveContract(contract, clientMutationLabel) {
    let contractId = `id: "${decodeId(contract.id)}"`; 
    let mutation = formatMutation("approveContract", contractId, clientMutationLabel);
    var requestedDateTime = new Date();
    return graphql(
        mutation.payload,
        ["CONTRACT_MUTATION_REQ", "CONTRACT_APPROVE_CONTRACT_RESP", "CONTRACT_MUTATION_ERR"],
        {
            clientMutationId: mutation.clientMutationId,
            clientMutationLabel,
            requestedDateTime
        }
    );
}

export function counterContract(contract, clientMutationLabel) {
    let contractId = `id: "${decodeId(contract.id)}"`; 
    let mutation = formatMutation("counterContract", contractId, clientMutationLabel);
    var requestedDateTime = new Date();
    return graphql(
        mutation.payload,
        ["CONTRACT_MUTATION_REQ", "CONTRACT_COUNTER_CONTRACT_RESP", "CONTRACT_MUTATION_ERR"],
        {
            clientMutationId: mutation.clientMutationId,
            clientMutationLabel,
            requestedDateTime
        }
    );
}

export function createContractDetails(contractDetails, clientMutationLabel) {
    let mutation = formatMutation("createContractDetails", formatContractDetailsGQL(contractDetails), clientMutationLabel);
    var requestedDateTime = new Date();
    return graphql(
        mutation.payload,
        ["CONTRACT_MUTATION_REQ", "CONTRACT_CREATE_CONTRACTDETAILS_RESP", "CONTRACT_MUTATION_ERR"],
        {
            clientMutationId: mutation.clientMutationId,
            clientMutationLabel,
            requestedDateTime
        }
    );
}

export function updateContractDetails(contractDetails, clientMutationLabel) {
    let mutation = formatMutation("updateContractDetails", formatContractDetailsGQL(contractDetails), clientMutationLabel);
    var requestedDateTime = new Date();
    return graphql(
        mutation.payload,
        ["CONTRACT_MUTATION_REQ", "CONTRACT_UPDATE_CONTRACTDETAILS_RESP", "CONTRACT_MUTATION_ERR"],
        {
            clientMutationId: mutation.clientMutationId,
            clientMutationLabel,
            requestedDateTime
        }
    );
}

export function deleteContractDetails(contractDetails, clientMutationLabel, clientMutationDetails = null) {
    let contractDetailsUuids = `uuids: ["${decodeId(contractDetails.id)}"]`;
    let mutation = formatMutation("deleteContractDetails", contractDetailsUuids, clientMutationLabel, clientMutationDetails);
    var requestedDateTime = new Date();
    return graphql(
        mutation.payload,
        ["CONTRACT_MUTATION_REQ", "CONTRACT_DELETE_CONTRACTDETAILS_RESP", "CONTRACT_MUTATION_ERR"],
        {
            clientMutationId: mutation.clientMutationId,
            clientMutationLabel,
            requestedDateTime
        }
    );
}
