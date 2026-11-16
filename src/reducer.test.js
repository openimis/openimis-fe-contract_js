import { describe, expect, it, vi } from "vitest";

// The fe-core barrel cannot be loaded on its own from a test: only what the reducer reads.
vi.mock("@openimis/fe-core", () => ({
  formatServerError: (e) => e,
  formatGraphQLError: (e) => e,
  parseData: (d) => d?.edges?.map((e) => e.node) ?? [],
  pageInfo: () => ({}),
  dispatchMutationReq: (state) => ({ ...state, submittingMutation: true }),
  dispatchMutationResp: (state) => ({ ...state, submittingMutation: false }),
  dispatchMutationErr: (state) => ({ ...state, submittingMutation: false }),
}));

const { default: reducer } = await import("./reducer");

const edited = { id: "Q0Q6MQ==", jsonExt: '{"calculation_rule": {"income": 1000}}' };
const other = { id: "Q0Q6Mg==", jsonExt: null };

describe("contract reducer", () => {
  // fe-core's Searcher reads a page again once the journal shows the mutation of one of
  // its rows done, and it knows a row's mutation by the clientMutationId the row carries.
  // UAT OCM-264: edited contract details kept their old income in the list.
  it("stamps the contract details under mutation with the mutation's id", () => {
    const loaded = { ...reducer(undefined, { type: "@@INIT" }), contractDetails: [edited, other] };

    const next = reducer(loaded, {
      type: "CONTRACT_MUTATION_REQ",
      meta: { clientMutationId: "mutation-1", uuids: [edited.id] },
    });

    expect(next.contractDetails[0].clientMutationId).toBe("mutation-1");
    expect(next.contractDetails[1].clientMutationId).toBeUndefined();
    // On copies: the loaded rows are not written in place.
    expect(edited.clientMutationId).toBeUndefined();
  });

  it("leaves the rows alone for a mutation that names none", () => {
    const loaded = { ...reducer(undefined, { type: "@@INIT" }), contractDetails: [edited] };

    const next = reducer(loaded, { type: "CONTRACT_MUTATION_REQ", meta: { clientMutationId: "mutation-1" } });

    expect(next.contractDetails[0]).toBe(edited);
  });
});
