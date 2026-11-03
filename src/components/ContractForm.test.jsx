import React from "react";
import { describe, expect, it, vi } from "vitest";
import {
  renderWithProviders,
  makeStore,
  screen,
  act,
  within,
} from "@openimis/fe-core/testing";

import {
  RIGHT_POLICYHOLDERCONTRACT_SUBMIT,
  RIGHT_POLICYHOLDERCONTRACT_APPROVE,
  RIGHT_POLICYHOLDERCONTRACT_AMEND,
} from "../constants";

// The fe-core barrel cannot be loaded from a test. Form is reduced to its FAB stack, built
// with fe-core Form's own conditions (Form.jsx): additionalTooltips by their own condition,
// Save when (dirty || openDirty) && save, the state action (fab) when (dirty || openDirty) && fab.
// Nothing is edited here, so dirty stays false and openDirty decides.
vi.mock("@openimis/fe-core", async () => {
  const h = (await import("react")).createElement;
  return {
    GetIconComponent: (name) => () => h("span", null, name),
    Form: ({
      save,
      saveTooltip,
      openDirty,
      fab,
      fabTooltip,
      additionalTooltips,
    }) =>
      h(
        "div",
        { "data-testid": "form-fab-stack" },
        ...(additionalTooltips || [])
          .filter((t) => t.condition)
          .map((t) =>
            h("span", { key: t.tooltip, "aria-label": t.tooltip }, t.content)
          ),
        !!openDirty && !!save
          ? h("button", { type: "button", "aria-label": saveTooltip }, "save")
          : null,
        !!openDirty && !!fab
          ? h("button", { type: "button", "aria-label": fabTooltip }, fab)
          : null
      ),
    withModulesManager: (Component) => (props) =>
      h(Component, {
        ...props,
        modulesManager: {
          getConf: (module, key, defaultValue) => defaultValue,
        },
      }),
    formatMessage: (intl, module, id) => `${module}.${id}`,
    formatMessageWithValues: (intl, module, id) => `${module}.${id}`,
    journalize: () => ({ type: "TEST_NOOP" }),
    decodeId: (id) => id,
    Helmet: () => null,
  };
});
vi.mock("../actions", () => ({
  fetchContract: () => ({ type: "TEST_NOOP" }),
  clearContract: () => ({ type: "TEST_NOOP" }),
}));
// The panels pull pickers and searchers this test does not need.
vi.mock("./ContractHeadPanel", () => ({ default: () => null }));
vi.mock("./ContractTabPanel", () => ({ default: () => null }));

const { default: ContractForm } = await import("./ContractForm");

const RIGHTS = [
  RIGHT_POLICYHOLDERCONTRACT_SUBMIT,
  RIGHT_POLICYHOLDERCONTRACT_APPROVE,
  RIGHT_POLICYHOLDERCONTRACT_AMEND,
];
const SAVE = /contract\.saveButton\.tooltip/;
const SUBMIT = "contract.submitButton.tooltip";
const APPROVE = "contract.approveButton.tooltip";
const COUNTER = "contract.counterButton.tooltip";

// The slice of state.contract ContractForm reads; the contract arrives as a fetch delivers it.
const contractSlice = (
  state = {
    contract: null,
    fetchedContract: false,
    validationFields: { contractCode: { isValid: true } },
  },
  action
) =>
  action.type === "TEST_CONTRACT_FETCHED"
    ? { ...state, contract: action.contract, fetchedContract: true }
    : state;

const renderContract = (contractState) => {
  const store = makeStore({
    reducers: {
      contract: contractSlice,
      policyHolder: (state = { policyHolders: [] }) => state,
    },
  });
  renderWithProviders(
    <ContractForm
      rights={RIGHTS}
      back={vi.fn()}
      save={vi.fn()}
      submit={vi.fn()}
      approve={vi.fn()}
      counter={vi.fn()}
      amend={vi.fn()}
      setConfirmedAction={vi.fn()}
      titleParams={() => ({})}
    />,
    { store }
  );
  act(() => {
    store.dispatch({
      type: "TEST_CONTRACT_FETCHED",
      contract: { id: "1", code: "C1", state: contractState, amendment: 0 },
    });
  });
};

describe("ContractForm action buttons (OP-3248)", () => {
  it("stacks Save, Approve and Counter together on a submitted contract", () => {
    renderContract(4); // Negotiable: submitted, waiting for approval
    // Save stays: in Negotiable the approver may change the contract ("approve / ask for
    // change"). Counter must sit in Form's FAB stack, not at a fixed spot of its own,
    // where it covered the Approve FAB.
    const stack = screen.getByTestId("form-fab-stack");
    expect(within(stack).getByLabelText(SAVE)).toBeInTheDocument();
    expect(within(stack).getByLabelText(APPROVE)).toBeInTheDocument();
    expect(within(stack).getByLabelText(COUNTER)).toBeInTheDocument();
  });

  it("offers Save and Submit on a draft contract", () => {
    renderContract(2); // Draft
    expect(screen.getByLabelText(SAVE)).toBeInTheDocument();
    expect(screen.getByLabelText(SUBMIT)).toBeInTheDocument();
    expect(screen.queryByLabelText(APPROVE)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(COUNTER)).not.toBeInTheDocument();
  });
});
