import {
  formatServerError,
  formatGraphQLError,
  parseData,
  pageInfo,
  dispatchMutationReq,
  dispatchMutationErr,
  dispatchMutationResp,
} from "@openimis/fe-core";

function reducer(
  state = {
    fetchingContracts: false,
    errorContracts: null,
    fetchedContracts: false,
    contracts: [],
    contractsPageInfo: {},
    contractsTotalCount: 0,
    fetchingContract: false,
    fetchedContract: false,
    contract: {},
    errorContract: null,
    fetchingContractDetails: false,
    errorContractDetails: null,
    fetchedContractDetails: false,
    contractDetails: [],
    contractDetailsPageInfo: {},
    contractDetailsTotalCount: 0,
    fetchingContractContributionDetails: false,
    errorContractContributionDetails: null,
    fetchedContractContributionDetails: false,
    contractContributionDetails: [],
    contractContributionDetailsPageInfo: {},
    contractContributionDetailsTotalCount: 0,
    fetchingInsureePolicies: false,
    errorInsureePolicies: null,
    fetchedInsureePolicies: false,
    insureePolicies: [],
    insureePoliciesPageInfo: {},
    insureePoliciesTotalCount: 0,
  },
  action
) {
  switch (action.type) {
    case "CONTRACT_CONTRACTS_REQ":
      return {
        ...state,
        fetchingContracts: true,
        fetchedContracts: false,
        contracts: [],
        contractsPageInfo: {},
        contractsTotalCount: 0,
        errorContracts: null,
      };
    case "CONTRACT_CONTRACTS_RESP":
      return {
        ...state,
        fetchingContracts: false,
        fetchedContracts: true,
        contracts: parseData(action.payload.data.contract),
        contractsPageInfo: pageInfo(action.payload.data.contract),
        contractsTotalCount: !!action.payload.data.contract
          ? action.payload.data.contract.totalCount
          : null,
        errorContracts: formatGraphQLError(action.payload),
      };
    case "CONTRACT_CONTRACTS_ERR":
      return {
        ...state,
        fetchingContracts: false,
        errorContracts: formatServerError(action.payload),
      };
    case "CONTRACT_CONTRACT_REQ":
      return {
        ...state,
        fetchingContract: true,
        fetchedContract: false,
        contract: [],
        errorContract: null,
      };
    case "CONTRACT_CONTRACT_RESP":
      return {
        ...state,
        fetchingContract: false,
        fetchedContract: true,
        contract: parseData(action.payload.data.contract).find(
          (contract) => !!contract
        ),
        errorContract: formatGraphQLError(action.payload),
      };
    case "CONTRACT_CONTRACT_ERR":
      return {
        ...state,
        fetchingContract: false,
        errorContract: formatServerError(action.payload),
      };
    case "CONTRACT_CONTRACTDETAILS_REQ":
      return {
        ...state,
        fetchingContractDetails: true,
        fetchedContractDetails: false,
        contractDetails: [],
        contractDetailsPageInfo: {},
        contractDetailsTotalCount: 0,
        errorContractDetails: null,
      };
    case "CONTRACT_CONTRACTDETAILS_RESP":
      return {
        ...state,
        fetchingContractDetails: false,
        fetchedContractDetails: true,
        contractDetails: parseData(action.payload.data.contractDetails),
        contractDetailsPageInfo: pageInfo(action.payload.data.contractDetails),
        contractDetailsTotalCount: !!action.payload.data.contractDetails
          ? action.payload.data.contractDetails.totalCount
          : null,
        errorContractDetails: formatGraphQLError(action.payload),
      };
    case "CONTRACT_CONTRACTDETAILS_ERR":
      return {
        ...state,
        fetchingContractDetails: false,
        errorContractDetails: formatServerError(action.payload),
      };
    case "CONTRACT_CONTRACTCONTRIBUTIONDETAILS_REQ":
      return {
        ...state,
        fetchingContractContributionDetails: true,
        fetchedContractContributionDetails: false,
        contractContributionDetails: [],
        contractContributionDetailsPageInfo: {},
        contractContributionDetailsTotalCount: 0,
        errorContractContributionDetails: null,
      };
    case "CONTRACT_CONTRACTCONTRIBUTIONDETAILS_RESP":
      return {
        ...state,
        fetchingContractContributionDetails: false,
        fetchedContractContributionDetails: true,
        contractContributionDetails: parseData(
          action.payload.data.contractContributionPlanDetails
        ),
        contractContributionDetailsPageInfo: pageInfo(
          action.payload.data.contractContributionPlanDetails
        ),
        contractContributionDetailsTotalCount: !!action.payload.data
          .contractContributionPlanDetails
          ? action.payload.data.contractContributionPlanDetails.totalCount
          : null,
        errorContractContributionDetails: formatGraphQLError(action.payload),
      };
    case "CONTRACT_CONTRACTCONTRIBUTIONDETAILS_ERR":
      return {
        ...state,
        fetchingContractContributionDetails: false,
        errorContractContributionDetails: formatServerError(action.payload),
      };
    case "CONTRACT_INSUREEPOLICIES_REQ":
      return {
        ...state,
        fetchingInsureePolicies: true,
        fetchedInsureePolicies: false,
        insureePolicies: [],
        insureePoliciesPageInfo: {},
        insureePoliciesTotalCount: 0,
        errorInsureePolicies: null,
      };
    case "CONTRACT_INSUREEPOLICIES_RESP":
      return {
        ...state,
        fetchingInsureePolicies: false,
        fetchedInsureePolicies: true,
        insureePolicies: parseData(action.payload.data.insureePolicy),
        insureePoliciesPageInfo: pageInfo(action.payload.data.insureePolicy),
        insureePoliciesTotalCount: !!action.payload.data.insureePolicy
          ? action.payload.data.insureePolicy.totalCount
          : null,
        errorInsureePolicies: formatGraphQLError(action.payload),
      };
    case "CONTRACT_INSUREEPOLICIES_ERR":
      return {
        ...state,
        fetchingInsureePolicies: false,
        errorInsureePolicies: formatServerError(action.payload),
      };
    case "CONTRACT_MUTATION_REQ":
      return dispatchMutationReq(state, action);
    case "CONTRACT_MUTATION_ERR":
      return dispatchMutationErr(state, action);
    case "CONTRACT_CREATE_CONTRACT_RESP":
      return dispatchMutationResp(state, "createContract", action);
    case "CONTRACT_UPDATE_CONTRACT_RESP":
      return dispatchMutationResp(state, "updateContract", action);
    case "CONTRACT_DELETE_CONTRACT_RESP":
      return dispatchMutationResp(state, "deleteContract", action);
    case "CONTRACT_SUBMIT_CONTRACT_RESP":
      return dispatchMutationResp(state, "submitContract", action);
    case "CONTRACT_APPROVE_CONTRACT_RESP":
      return dispatchMutationResp(state, "approveContract", action);
    case "CONTRACT_APPROVE_CONTRACT_BULK_RESP":
      return dispatchMutationResp(state, "approveBulkContract", action);
    case "CONTRACT_COUNTER_CONTRACT_RESP":
      return dispatchMutationResp(state, "counterContract", action);
    case "CONTRACT_COUNTER_CONTRACT_BULK_RESP":
      return dispatchMutationResp(state, "counterBulkContract", action);
    case "CONTRACT_AMEND_CONTRACT_RESP":
      return dispatchMutationResp(state, "amendContract", action);
    case "CONTRACT_CREATE_CONTRACTDETAILS_RESP":
      return dispatchMutationResp(state, "createContractDetails", action);
    case "CONTRACT_UPDATE_CONTRACTDETAILS_RESP":
      return dispatchMutationResp(state, "updateContractDetails", action);
    case "CONTRACT_DELETE_CONTRACTDETAILS_RESP":
      return dispatchMutationResp(state, "deleteContractDetails", action);
    default:
      return state;
  }
}

export default reducer;
