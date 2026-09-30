import {
  describe, expect, it, vi,
} from "vitest";

// Only fe-core's two dispatchers are stubbed; the formatters are real, imported from
// their defining modules because fe-core's barrel imports itself.
const core = vi.hoisted(() => ({
  graphql: vi.fn((payload, type, meta) => ({ payload, type, meta })),
  graphqlWithVariables: vi.fn((operation, variables, type, meta) => ({
    operation, variables, type, meta,
  })),
}));

vi.mock("@openimis/fe-core", async () => ({
  ...(await vi.importActual("@openimis/fe-core/helpers/api")),
  ...core,
}));

const actions = await import("./actions");
const { globalId } = await import("@openimis/fe-core/testing");
const { formatGQLString } = await import("@openimis/fe-core/helpers/api");

const modulesManager = { getProjection: (key) => `{${key}}` };
const query = (result) => result.payload.replace(/\s+/g, " ");
const types = (success) => ["CONTRACT_MUTATION_REQ", success, "CONTRACT_MUTATION_ERR"];

const CONTRACT_UUID = "3f2a8b1c-0d4e-4f5a-9b6c-7d8e9f0a1b2c";
const PH_UUID = "a1b2c3d4-0000-4000-8000-000000000001";

describe("contract actions", () => {
  describe("queries", () => {
    it.each([
      ["contracts", "fetchContracts", "CONTRACT_CONTRACTS", "contract"],
      ["contract details", "fetchContractDetails", "CONTRACT_CONTRACTDETAILS", "contractDetails"],
      ["contribution details", "fetchContractContributionDetails", "CONTRACT_CONTRACTCONTRIBUTIONDETAILS",
        "contractContributionPlanDetails"],
      ["insuree policies", "fetchInsureePolicies", "CONTRACT_INSUREEPOLICIES", "insureePolicy"],
    ])("asks for a counted page of %s", (_label, creator, type, entity) => {
      const result = actions[creator](modulesManager, ["first: 10"]);

      expect(result.type).toBe(type);
      expect(query(result)).toContain(`${entity}(first: 10) { totalCount`);
    });

    it("projects the policy holder the way the policy holder picker declares", () => {
      expect(query(actions.fetchContracts(modulesManager, [])))
        .toContain("policyHolder{policyHolder.PolicyHolderPicker.projection}");
    });

    it("nests the contract detail projection inside the contribution details", () => {
      const text = query(actions.fetchContractContributionDetails(modulesManager, []));

      expect(text).toContain("contractDetails{id,jsonExt,contract{id},insuree{insuree.InsureePicker.projection}");
      expect(text).toContain("contributionPlan{contributionPlan.ContributionPlanPicker.projection}");
    });

    it("asks for one contract without counting", () => {
      const result = actions.fetchContract(modulesManager, [`id: "${CONTRACT_UUID}"`]);

      expect(result.type).toBe("CONTRACT_CONTRACT");
      expect(query(result)).toContain(`contract(id: "${CONTRACT_UUID}")`);
      expect(query(result)).not.toContain("totalCount");
    });

    it("asks the picker for codes only", () => {
      const result = actions.fetchPickerContracts(["isDeleted: false"]);

      expect(result.type).toBe("CONTRACT_CONTRACTS");
      expect(query(result)).toContain("contract(isDeleted: false)");
      expect(query(result)).toContain("node { id,code }");
    });

    it("validates a contract code through variables", () => {
      const result = actions.contractCodeValidation(modulesManager, { contractCode: "CT-1" });

      expect(result.type).toBe("CONTRACT_CODE_FIELDS_VALIDATION");
      expect(result.variables).toEqual({ contractCode: "CT-1" });
      expect(result.operation.replace(/\s+/g, " ")).toContain("validateContractCode(contractCode: $contractCode)");
    });

    it.each([
      ["clearContract", "CONTRACT_CONTRACT_CLEAR"],
      ["contractCodeSetValid", "CONTRACT_CODE_FIELDS_VALIDATION_SET_VALID"],
      ["contractCodeClear", "CONTRACT_CODE_FIELDS_VALIDATION_CLEAR"],
    ])("%s dispatches %s", (creator, type) => {
      const dispatch = vi.fn();

      actions[creator]()(dispatch);

      expect(dispatch).toHaveBeenCalledWith({ type });
    });
  });

  describe("saving a contract", () => {
    const contract = (fields = {}) => ({
      id: globalId("ContractGQLType", CONTRACT_UUID),
      code: "CT-1",
      policyHolder: { id: globalId("PolicyHolderGQLType", PH_UUID) },
      dateApproved: "2026-01-15T10:00:00",
      datePaymentDue: "2026-02-01",
      paymentReference: "REF/1",
      dateValidFrom: "2026-01-01T00:00:00",
      dateValidTo: "2026-12-31T00:00:00",
      ...fields,
    });

    it("creates a contract with its label", () => {
      const result = actions.createContract(contract({ id: undefined }), "Create contract");

      expect(result.type).toEqual(types("CONTRACT_CREATE_CONTRACT_RESP"));
      expect(result.meta).toMatchObject({ clientMutationLabel: "Create contract" });
      expect(query(result)).toContain(`clientMutationId: "${result.meta.clientMutationId}"`);
      expect(query(result)).toContain("createContract( input: {");
      expect(query(result)).not.toContain(" id: ");
    });

    it("decodes the ids, escapes the text and trims the validity dates to days", () => {
      const text = query(actions.updateContract(
        contract({ code: 'CT "1"', paymentReference: "REF\n1" }),
        "Update contract",
      ));

      expect(text).toContain(`id: "${CONTRACT_UUID}"`);
      expect(text).toContain(`policyHolderId: "${PH_UUID}"`);
      expect(text).toContain(`code: "${formatGQLString('CT "1"')}"`);
      expect(text).toContain(`paymentReference: "${formatGQLString("REF\n1")}"`);
      expect(text).toContain('dateApproved: "2026-01-15T10:00:00"');
      expect(text).toContain('datePaymentDue: "2026-02-01"');
      expect(text).toContain('dateValidFrom: "2026-01-01"');
      expect(text).toContain('dateValidTo: "2026-12-31"');
    });

    it("sends a policy holder uuid as it is", () => {
      const text = query(actions.createContract(contract({ policyHolder: { id: PH_UUID } }), "Create contract"));

      expect(text).toContain(`policyHolderId: "${PH_UUID}"`);
    });

    it("leaves out the fields the form holds read-only", () => {
      const result = actions.updateContract(contract(), "Update contract", ["code", "policyHolder", "dateValidFrom"]);

      expect(result.type).toEqual(types("CONTRACT_UPDATE_CONTRACT_RESP"));
      expect(query(result)).toContain(`id: "${CONTRACT_UUID}"`);
      expect(query(result)).not.toContain("code:");
      expect(query(result)).not.toContain("policyHolderId");
      expect(query(result)).not.toContain("dateValidFrom");
      expect(query(result)).toContain('dateValidTo: "2026-12-31"');
    });
  });

  describe("state changes on one contract", () => {
    it.each([
      ["submitContract", "submitContract", "CONTRACT_SUBMIT_CONTRACT_RESP"],
      ["approveContract", "approveContract", "CONTRACT_APPROVE_CONTRACT_RESP"],
      ["counterContract", "counterContract", "CONTRACT_COUNTER_CONTRACT_RESP"],
      ["amendContract", "amendContract", "CONTRACT_AMEND_CONTRACT_RESP"],
    ])("%s sends the decoded contract id", (creator, service, success) => {
      const result = actions[creator]({ id: globalId("ContractGQLType", CONTRACT_UUID) }, "Label");

      expect(result.type).toEqual(types(success));
      expect(result.meta).toMatchObject({ clientMutationLabel: "Label" });
      expect(query(result)).toContain(`${service}( input: {`);
      expect(query(result)).toContain(`id: "${CONTRACT_UUID}"`);
    });

    it.each([
      ["deleteContract", "deleteContract", "CONTRACT_DELETE_CONTRACT_RESP"],
      ["deleteContractDetails", "deleteContractDetails", "CONTRACT_DELETE_CONTRACTDETAILS_RESP"],
    ])("%s sends the decoded uuid in a list", (creator, service, success) => {
      const result = actions[creator]({ id: globalId("Type", CONTRACT_UUID) }, "Delete", ["CT-1"]);

      expect(result.type).toEqual(types(success));
      expect(query(result)).toContain(`${service}( input: {`);
      expect(query(result)).toContain(`uuids: ["${CONTRACT_UUID}"]`);
      expect(query(result)).toContain('clientMutationDetails: ["CT-1"]');
    });
  });

  describe("bulk approval and countering", () => {
    const selection = () => [
      { id: globalId("ContractGQLType", "uuid-1"), code: "CT-1" },
      { id: globalId("ContractGQLType", "uuid-2"), code: "CT-2" },
    ];

    it.each([
      ["approveContractBulk", "approveBulkContract", "CONTRACT_APPROVE_CONTRACT_BULK_RESP"],
      ["counterContractBulk", "counterBulkContract", "CONTRACT_COUNTER_CONTRACT_BULK_RESP"],
    ])("%s sends the decoded uuids of the selection", (creator, service, success) => {
      const result = actions[creator](selection(), "Bulk", ["CT-1", "CT-2"]);

      expect(result.type).toEqual(types(success));
      expect(query(result)).toContain(`${service}( input: {`);
      expect(query(result)).toContain('contractUuids: ["uuid-1","uuid-2"]');
      expect(result.meta.clientMutationDetails).toBe('["CT-1","CT-2"]');
    });

    it.each([
      ["approveContractAll", "approveBulkContract", "CONTRACT_APPROVE_CONTRACT_BULK_RESP"],
      ["counterContractAll", "counterBulkContract", "CONTRACT_COUNTER_CONTRACT_BULK_RESP"],
    ])("%s sends the searcher's filters as a JSON string", (creator, service, success) => {
      const result = actions[creator](
        ['code_Icontains: "CT"', "isDeleted: false", "applyDefaultValidityFilter: true", "state: 4"],
        "All",
      );

      expect(result.type).toEqual(types(success));
      expect(query(result)).toContain(`${service}( input: {`);
      expect(query(result)).toContain("contractUuids: []");
      expect(query(result)).toContain(
        'extendedFilters: "{\\"code_Icontains\\": \\"CT\\",\\"isDeleted\\": \\"False\\",\\"state\\": \\"4\\"}"',
      );
    });

    // Currently fails: each filter is split on every colon and only the second piece is
    // kept, so "CT:2026" reaches the server as "CT" and the bulk action matches more
    // contracts than the searcher showed.
    it.fails("keeps a filter value that contains a colon", () => {
      const result = actions.approveContractAll(['code_Icontains: "CT:2026"'], "All");

      expect(result.payload).toContain('\\"code_Icontains\\": \\"CT:2026\\"');
    });
  });

  describe("contract details", () => {
    const details = (fields = {}) => ({
      contract: { id: globalId("ContractGQLType", CONTRACT_UUID) },
      insuree: { id: globalId("InsureeGQLType", "42") },
      contributionPlanBundle: { id: globalId("ContributionPlanBundleGQLType", "bundle-1") },
      jsonExt: '{"calculation":{"rate":5}}',
      ...fields,
    });

    it("creates details with decoded ids and the extension as a JSON string", () => {
      const result = actions.createContractDetails(details(), "Add insuree");

      expect(result.type).toEqual(types("CONTRACT_CREATE_CONTRACTDETAILS_RESP"));
      expect(result.payload).toContain("createContractDetails(");
      expect(result.payload).toContain(`contractId: "${CONTRACT_UUID}"`);
      expect(result.payload).toContain("insureeId: 42");
      expect(result.payload).toContain('contributionPlanBundleId: "bundle-1"');
      expect(result.payload).toContain('jsonExt: "{\\"calculation\\":{\\"rate\\":5}}"');
    });

    it("updates details by their decoded id", () => {
      const result = actions.updateContractDetails(
        details({ id: globalId("ContractDetailsGQLType", "details-1"), jsonExt: null }),
        "Update insuree",
      );

      expect(result.type).toEqual(types("CONTRACT_UPDATE_CONTRACTDETAILS_RESP"));
      expect(result.payload).toContain("updateContractDetails(");
      expect(result.payload).toContain('id: "details-1"');
      expect(result.payload).not.toContain("jsonExt");
    });
  });
});
