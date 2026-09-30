import {
  describe, expect, it, vi,
} from "vitest";

// fe-core's barrel imports itself, so the real helpers come from their defining modules.
vi.mock("@openimis/fe-core", async () => vi.importActual("@openimis/fe-core/helpers/api"));

const { default: reducer } = await import("./reducer");
const {
  globalId, graphqlErrors, relayPage, serverError,
} = await import("@openimis/fe-core/testing");

const initial = () => reducer(undefined, { type: "@@INIT" });
const dispatch = (state, type, { payload, meta } = {}) => reducer(state, { type, payload, meta });
const respond = (state, type, data) => dispatch(state, type, { payload: { data } });
const fail = (state, type, payload = serverError(500, "Internal Server Error", "boom")) => dispatch(
  state,
  type,
  { payload },
);

const SERVER_ERROR = { code: 500, message: "Internal Server Error", detail: "boom" };

describe("contract reducer", () => {
  describe("initialisation", () => {
    it("starts with nothing loaded and nothing in flight", () => {
      const state = initial();

      expect(state.contracts).toEqual([]);
      expect(state.contract).toEqual({});
      expect(state.contractDetails).toEqual([]);
      expect(state.contractContributionDetails).toEqual([]);
      expect(state.insureePolicies).toEqual([]);
      expect(state.fetchingContracts).toBe(false);
    });

    it("returns the same state object for an unrelated action", () => {
      const state = initial();

      expect(reducer(state, { type: "SOMETHING_ELSE" })).toBe(state);
    });
  });

  describe("searches", () => {
    const SEARCHES = [
      ["contracts", "CONTRACT_CONTRACTS", "contract", "Contracts", "contracts"],
      ["contract details", "CONTRACT_CONTRACTDETAILS", "contractDetails", "ContractDetails", "contractDetails"],
      ["contribution details", "CONTRACT_CONTRACTCONTRIBUTIONDETAILS", "contractContributionPlanDetails",
        "ContractContributionDetails", "contractContributionDetails"],
      ["insuree policies", "CONTRACT_INSUREEPOLICIES", "insureePolicy", "InsureePolicies", "insureePolicies"],
    ];

    it.each(SEARCHES)("empties the %s list and clears the error when a search starts", (
      _label,
      type,
      _entity,
      suffix,
      field,
    ) => {
      const stale = {
        ...initial(),
        [field]: [{ id: "stale" }],
        [`${field}TotalCount`]: 1,
        [`${field}PageInfo`]: { totalCount: 1 },
        [`error${suffix}`]: SERVER_ERROR,
      };

      expect(dispatch(stale, `${type}_REQ`)).toMatchObject({
        [`fetching${suffix}`]: true,
        [`fetched${suffix}`]: false,
        [field]: [],
        [`${field}PageInfo`]: {},
        [`${field}TotalCount`]: 0,
        [`error${suffix}`]: null,
      });
    });

    it.each(SEARCHES)("stores the %s page with its count and cursors", (_label, type, entity, suffix, field) => {
      const node = { id: globalId("Type", "row-1"), code: "A" };
      const state = respond(initial(), `${type}_RESP`, {
        [entity]: relayPage([node], { totalCount: 5, pageInfo: { hasNextPage: true } }),
      });

      expect(state[field]).toEqual([node]);
      expect(state[`${field}TotalCount`]).toBe(5);
      expect(state[`${field}PageInfo`]).toMatchObject({ totalCount: 5, hasNextPage: true });
      expect(state[`fetching${suffix}`]).toBe(false);
      expect(state[`fetched${suffix}`]).toBe(true);
    });

    it.each(SEARCHES)("reports an empty %s response rather than throwing", (_label, type, entity, _suffix, field) => {
      const state = respond(initial(), `${type}_RESP`, { [entity]: null });

      expect(state[field]).toEqual([]);
      expect(state[`${field}TotalCount`]).toBeNull();
    });

    it.each(SEARCHES)("surfaces a data error from the %s search", (_label, type, entity, suffix) => {
      const state = dispatch(initial(), `${type}_RESP`, {
        payload: { data: { [entity]: relayPage([]) }, ...graphqlErrors("bad filter") },
      });

      expect(state[`error${suffix}`]).toMatchObject({ detail: "bad filter" });
    });

    it.each(SEARCHES)("stops fetching and formats a transport failure of the %s search", (
      _label,
      type,
      _entity,
      suffix,
    ) => {
      const state = fail(dispatch(initial(), `${type}_REQ`), `${type}_ERR`);

      expect(state[`fetching${suffix}`]).toBe(false);
      expect(state[`error${suffix}`]).toEqual(SERVER_ERROR);
    });
  });

  describe("single contract", () => {
    it("marks the contract in flight and drops the previous one", () => {
      const loaded = { ...initial(), contract: { id: "c-1" }, fetchedContract: true };
      const state = dispatch(loaded, "CONTRACT_CONTRACT_REQ");

      expect(state.fetchingContract).toBe(true);
      expect(state.fetchedContract).toBe(false);
      expect(state.contract).not.toHaveProperty("id");
    });

    it("keeps the first contract returned, with its id still encoded", () => {
      const id = globalId("ContractGQLType", "c-1");
      const state = respond(initial(), "CONTRACT_CONTRACT_RESP", {
        contract: relayPage([{ id, code: "CT-1" }, { id: globalId("ContractGQLType", "c-2"), code: "CT-2" }]),
      });

      expect(state.contract).toEqual({ id, code: "CT-1" });
      expect(state.fetchedContract).toBe(true);
      expect(state.errorContract).toBeNull();
    });

    it("formats a transport failure", () => {
      const state = fail(dispatch(initial(), "CONTRACT_CONTRACT_REQ"), "CONTRACT_CONTRACT_ERR");

      expect(state.fetchingContract).toBe(false);
      expect(state.errorContract).toEqual(SERVER_ERROR);
    });

    it("forgets the contract on clear", () => {
      const loaded = {
        ...initial(), contract: { id: "c-1" }, fetchedContract: true, errorContract: SERVER_ERROR,
      };

      expect(dispatch(loaded, "CONTRACT_CONTRACT_CLEAR")).toMatchObject({
        contract: {},
        fetchedContract: false,
        fetchingContract: false,
        errorContract: null,
      });
    });
  });

  describe("contract code validation", () => {
    const code = (state) => state.validationFields.contractCode;
    const validating = () => dispatch(initial(), "CONTRACT_CODE_FIELDS_VALIDATION_REQ");

    it("marks the code as validating and not yet valid while the check runs", () => {
      expect(code(validating())).toEqual({ isValidating: true, isValid: false, validationError: null });
    });

    it.each([true, false])("stores the server's verdict (%s)", (isValid) => {
      const state = respond(validating(), "CONTRACT_CODE_FIELDS_VALIDATION_RESP", {
        validateContractCode: { isValid },
      });

      expect(code(state)).toEqual({ isValidating: false, isValid, validationError: null });
    });

    // Currently fails: the verdict is read as data?.validateContractCode.isValid, so a
    // data error (validateContractCode: null) throws inside the reducer.
    it.fails("reports a data error from the check instead of throwing", () => {
      const state = dispatch(validating(), "CONTRACT_CODE_FIELDS_VALIDATION_RESP", {
        payload: { data: { validateContractCode: null }, ...graphqlErrors("not allowed") },
      });

      expect(code(state).isValidating).toBe(false);
      expect(code(state).isValid).toBeFalsy();
      expect(code(state).validationError).toMatchObject({ detail: "not allowed" });
    });

    it("treats a failed check as invalid and keeps the reason", () => {
      const state = fail(validating(), "CONTRACT_CODE_FIELDS_VALIDATION_ERR");

      expect(code(state)).toEqual({ isValidating: false, isValid: false, validationError: SERVER_ERROR });
    });

    it("marks the code valid without asking the server", () => {
      expect(code(dispatch(initial(), "CONTRACT_CODE_FIELDS_VALIDATION_SET_VALID"))).toEqual({
        isValidating: false,
        isValid: true,
        validationError: null,
      });
    });

    it("keeps other validated fields when the code changes", () => {
      const state = dispatch(
        { ...initial(), validationFields: { other: { isValid: true } } },
        "CONTRACT_CODE_FIELDS_VALIDATION_REQ",
      );

      expect(state.validationFields.other).toEqual({ isValid: true });
    });

    // Currently fails: clearing sets isValidating true, so the code field shows a check
    // in progress that was in fact cancelled.
    it.fails("stops validating on clear", () => {
      const state = dispatch(validating(), "CONTRACT_CODE_FIELDS_VALIDATION_CLEAR");

      expect(code(state)).toEqual({ isValidating: false, isValid: false, validationError: null });
    });
  });

  describe("mutations", () => {
    const MUTATION_RESULTS = [
      ["CONTRACT_CREATE_CONTRACT_RESP", "createContract"],
      ["CONTRACT_UPDATE_CONTRACT_RESP", "updateContract"],
      ["CONTRACT_DELETE_CONTRACT_RESP", "deleteContract"],
      ["CONTRACT_SUBMIT_CONTRACT_RESP", "submitContract"],
      ["CONTRACT_APPROVE_CONTRACT_RESP", "approveContract"],
      ["CONTRACT_APPROVE_CONTRACT_BULK_RESP", "approveBulkContract"],
      ["CONTRACT_COUNTER_CONTRACT_RESP", "counterContract"],
      ["CONTRACT_COUNTER_CONTRACT_BULK_RESP", "counterBulkContract"],
      ["CONTRACT_AMEND_CONTRACT_RESP", "amendContract"],
      ["CONTRACT_CREATE_CONTRACTDETAILS_RESP", "createContractDetails"],
      ["CONTRACT_UPDATE_CONTRACTDETAILS_RESP", "updateContractDetails"],
      ["CONTRACT_DELETE_CONTRACTDETAILS_RESP", "deleteContractDetails"],
    ];

    const submitting = () => dispatch(initial(), "CONTRACT_MUTATION_REQ", {
      meta: { clientMutationId: "cmid-1", clientMutationLabel: "Update contract" },
    });

    it("records the request metadata while a mutation is in flight", () => {
      expect(submitting()).toMatchObject({
        submittingMutation: true,
        mutation: { id: "cmid-1", clientMutationLabel: "Update contract" },
      });
    });

    it.each(MUTATION_RESULTS)("clears the in-flight flag and keeps the internal id of %s", (type, service) => {
      const state = respond(submitting(), type, { [service]: { internalId: "internal-1" } });

      expect(state.submittingMutation).toBe(false);
      expect(state.mutation.id).toBe("internal-1");
    });

    it("raises an alert when a mutation fails", () => {
      const state = fail(submitting(), "CONTRACT_MUTATION_ERR", { status: 500, statusText: "Internal Server Error" });

      expect(JSON.parse(state.alert)).toEqual({ status: 500, statusText: "Internal Server Error" });
    });

    // Currently fails: dispatchMutationErr in fe-core only stores the alert, so every
    // module is left believing the mutation is still being submitted.
    it.fails("stops submitting once a mutation has failed", () => {
      expect(fail(submitting(), "CONTRACT_MUTATION_ERR", { status: 500 }).submittingMutation).toBe(false);
    });
  });

  describe("immutability", () => {
    it("does not mutate the state it was given", () => {
      const state = initial();
      const snapshot = JSON.stringify(state);

      respond(state, "CONTRACT_CONTRACTS_RESP", { contract: relayPage([{ id: "c-1" }]) });
      dispatch(state, "CONTRACT_CODE_FIELDS_VALIDATION_REQ");

      expect(JSON.stringify(state)).toBe(snapshot);
    });
  });
});
