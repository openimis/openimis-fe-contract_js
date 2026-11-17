import { describe, expect, it, vi } from "vitest";

// The fe-core barrel cannot be loaded from a test: only what the dialog reads when it loads.
vi.mock("@openimis/fe-core", () => ({
  GetIconComponent: () => () => null,
  FormattedMessage: () => null,
  formatMessage: () => "",
  formatMessageWithValues: () => "",
  PublishedComponent: () => null,
  decodeId: (id) => id,
  coreConfirm: vi.fn(),
  Contributions: () => null,
}));
vi.mock("../actions", () => ({ updateContractDetails: vi.fn() }));

const { UpdateContractDetailsDialog } = await import("./UpdateContractDetailsDialog");

const insuree = { id: "SW5zOjQzMw==", lastName: "Brightwater", otherNames: "Alden" };
const bundle = { id: "Q2I6MQ==", code: "CB001", name: "UAT bundle" };
const contract = { id: "contract-1", code: "C1", policyHolder: { id: "ph-1" } };

// Mounts the dialog's lifecycle on a plain instance: setState applies at once.
const dialog = (props) => {
  const component = new UpdateContractDetailsDialog(props);
  component.props = props;
  component.setState = (update) => {
    const prevState = component.state;
    const patch = typeof update === "function" ? update(component.state, component.props) : update;
    component.state = { ...component.state, ...patch };
    component.componentDidUpdate(component.props, prevState);
  };
  return component;
};

describe("UpdateContractDetailsDialog", () => {
  // UAT OCM-264: the dialog opened without the Income field. The insuree picker it renders
  // refetches the policy holder's insurees on mount, so the list is empty when the dialog
  // opens: looking the bundle up there blanked it, and the calculation rule of the bundle
  // (which brings Income) was never read.
  it("keeps the contract details' own bundle when it opens", () => {
    const component = dialog({ contract, contractDetails: { id: "cd-1", insuree, contributionPlanBundle: bundle }, pickerPolicyHolderInsurees: [] });

    component.handleOpen();

    expect(component.state.contractDetails.contributionPlanBundle).toEqual(bundle);
  });

  it("takes the bundle of the policy holder insuree when the details have none", () => {
    const component = dialog({
      contract,
      contractDetails: { id: "cd-1", insuree },
      pickerPolicyHolderInsurees: [{ insuree, contributionPlanBundle: bundle }],
    });

    component.handleOpen();

    expect(component.state.contractDetails.contributionPlanBundle).toEqual(bundle);
  });
});
