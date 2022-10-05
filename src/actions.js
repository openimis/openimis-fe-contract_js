import {
    graphql, formatPageQuery, formatPageQueryWithCount, decodeId, formatMutation, formatGQLString
} from "@openimis/fe-core";
import { APPLY_DEFAULT_VALIDITY_FILTER } from "./constants";

const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

const CONTRACT_FULL_PROJECTION = modulesManager => [
    "id", "code", "amount", "amountNotified", "amountRectified", "amountDue", "dateApproved", "datePaymentDue",
    "state", "paymentReference", "amendment", "dateValidFrom", "dateValidTo", "isDeleted",
    "policyHolder" + modulesManager.getProjection("policyHolder.PolicyHolderPicker.projection")
];

export const CONTRACT_PICKER_PROJECTION = ["id", "code"];

const CONTRACTDETAILS_FULL_PROJECTION = modulesManager => [
    "id", "jsonExt", "contract{id}", 
    "insuree" + modulesManager.getProjection("insuree.InsureePicker.projection"),
    "contributionPlanBundle" + modulesManager.getProjection("contributionPlan.ContributionPlanBundlePicker.projection")
];

const CONTRACTCONTRIBUTIONDETAILS_FULL_PROJECTION = modulesManager => [
    "jsonExt",
    "contractDetails" + `{${CONTRACTDETAILS_FULL_PROJECTION(modulesManager)}}`,
    "contributionPlan" + modulesManager.getProjection("contributionPlan.ContributionPlanPicker.projection")
];

const INSUREEPOLICY_FULL_PROJECTION = modulesManager => [
    "insuree" + modulesManager.getProjection("insuree.InsureePicker.projection")
];

const extendedFilters = query =>
    `"{${query
        .filter(filter => filter.split(":")[0] !== APPLY_DEFAULT_VALIDITY_FILTER)
        .map(filter => `\\"${filter.split(":")[0]}\\": \\"${filter.split(":")[1].replaceAll('"', '').trim()}\\"`)
        .join(",")
        .replaceAll("false", "False")
        .replaceAll("true", "True")}}"`;

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

export function fetchPickerContracts(params) {
    const payload = formatPageQuery(
        "contract",
        params,
        CONTRACT_PICKER_PROJECTION
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

export function fetchContractContributionDetails(modulesManager, params) {
    const payload = formatPageQueryWithCount(
        "contractContributionPlanDetails",
        params,
        CONTRACTCONTRIBUTIONDETAILS_FULL_PROJECTION(modulesManager)
    );
    return graphql(payload, "CONTRACT_CONTRACTCONTRIBUTIONDETAILS");
}

export function fetchInsureePolicies(modulesManager, params) {
    const payload = formatPageQueryWithCount(
        "insureePolicy",
        params,
        INSUREEPOLICY_FULL_PROJECTION(modulesManager)
    );
    return graphql(payload, "CONTRACT_INSUREEPOLICIES");
}

function formatContractGQL(contract, readOnlyFields = []) {
    // check if uuid decoded correctly 
    var policyHolderId = null;
    if (contract.policyHolder && !readOnlyFields.includes('policyHolder')){
        policyHolderId = contract.policyHolder.id 
        policyHolderId = (regexExp.test(policyHolderId))? policyHolderId : decodeId(policyHolderId);
    }
    return `
        ${!!contract.id ? `id: "${decodeId(contract.id)}"` : ''}
        ${!!contract.code && !readOnlyFields.includes('code') ? `code: "${formatGQLString(contract.code)}"` : ""}
        ${!!contract.policyHolder && !readOnlyFields.includes('policyHolder') ? `policyHolderId: "${policyHolderId}"` : ""}
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

export function approveContractBulk(contracts, clientMutationLabel, clientMutationDetails = null) {
    let contractUuids = `contractUuids: ["${contracts.map(contract => decodeId(contract.id)).join("\",\"")}"]`;
    let mutation = formatMutation("approveBulkContract", contractUuids, clientMutationLabel, clientMutationDetails);
    var requestedDateTime = new Date();
    contracts.forEach(contract => contract.clientMutationId = mutation.clientMutationId);
    return graphql(
        mutation.payload,
        ["CONTRACT_MUTATION_REQ", "CONTRACT_APPROVE_CONTRACT_BULK_RESP", "CONTRACT_MUTATION_ERR"],
        {
            clientMutationId: mutation.clientMutationId,
            clientMutationLabel,
            clientMutationDetails: !!clientMutationDetails ? JSON.stringify(clientMutationDetails) : null,
            requestedDateTime
        }
    );
}

export function approveContractAll(query, clientMutationLabel) {
    const mutationInput = `
        contractUuids: []
        extendedFilters: ${extendedFilters(query)}
    `;
    const mutation = formatMutation("approveBulkContract", mutationInput, clientMutationLabel);
    var requestedDateTime = new Date();
    return graphql(
        mutation.payload,
        ["CONTRACT_MUTATION_REQ", "CONTRACT_APPROVE_CONTRACT_BULK_RESP", "CONTRACT_MUTATION_ERR"],
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

export function counterContractBulk(contracts, clientMutationLabel, clientMutationDetails = null) {
    let contractUuids = `contractUuids: ["${contracts.map(contract => decodeId(contract.id)).join("\",\"")}"]`; 
    let mutation = formatMutation("counterBulkContract", contractUuids, clientMutationLabel, clientMutationDetails);
    var requestedDateTime = new Date();
    contracts.forEach(contract => contract.clientMutationId = mutation.clientMutationId);
    return graphql(
        mutation.payload,
        ["CONTRACT_MUTATION_REQ", "CONTRACT_COUNTER_CONTRACT_BULK_RESP", "CONTRACT_MUTATION_ERR"],
        {
            clientMutationId: mutation.clientMutationId,
            clientMutationLabel,
            clientMutationDetails: !!clientMutationDetails ? JSON.stringify(clientMutationDetails) : null,
            requestedDateTime
        }
    );
}

export function counterContractAll(query, clientMutationLabel) {
    const mutationInput = `
        contractUuids: []
        extendedFilters: ${extendedFilters(query)}
    `;
    const mutation = formatMutation("counterBulkContract", mutationInput, clientMutationLabel);
    var requestedDateTime = new Date();
    return graphql(
        mutation.payload,
        ["CONTRACT_MUTATION_REQ", "CONTRACT_COUNTER_CONTRACT_BULK_RESP", "CONTRACT_MUTATION_ERR"],
        {
            clientMutationId: mutation.clientMutationId,
            clientMutationLabel,
            requestedDateTime
        }
    );
}

export function amendContract(contract, clientMutationLabel) {
    let contractId = `id: "${decodeId(contract.id)}"`; 
    let mutation = formatMutation("amendContract", contractId, clientMutationLabel);
    var requestedDateTime = new Date();
    return graphql(
        mutation.payload,
        ["CONTRACT_MUTATION_REQ", "CONTRACT_AMEND_CONTRACT_RESP", "CONTRACT_MUTATION_ERR"],
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
