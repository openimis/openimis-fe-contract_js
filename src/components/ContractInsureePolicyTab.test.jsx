import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen } from "@openimis/fe-core/testing";
import { CONTRACTINSUREEPOLICY_TAB_VALUE, RIGHT_INSUREEPOLICY_SEARCH } from "../constants";
import { ContractInsureePolicyTabPanel } from "./ContractInsureePolicyTab";

// A modules manager with fe-core's refs only: PolicyHolderModule is not installed,
// so policyHolder.TabPanel is not registered.
const { refs } = vi.hoisted(() => ({ refs: {} }));

vi.mock("@openimis/fe-core", async () => {
    const ReactActual = (await import("react")).default;
    refs["core.TabPanel"] = ({ value, index, children }) =>
        value === index ? ReactActual.createElement("div", { "data-testid": "core-tab-panel" }, children) : null;
    return {
        formatMessage: (intl, module, id) => id,
        PublishedComponent: ({ pubRef, ...props }) => {
            const Component = refs[pubRef];
            return Component ? ReactActual.createElement(Component, props) : null;
        },
    };
});

vi.mock("./ContractInsureePolicySearcher", () => ({
    default: ({ contract }) => <div data-testid="insuree-policy-searcher">{contract.id}</div>,
}));

describe("ContractInsureePolicyTabPanel", () => {
    it("renders its content through core.TabPanel without PolicyHolderModule", () => {
        renderWithProviders(
            <ContractInsureePolicyTabPanel
                value={CONTRACTINSUREEPOLICY_TAB_VALUE}
                rights={[RIGHT_INSUREEPOLICY_SEARCH]}
                isTabsEnabled
                contract={{ id: "c-1" }}
            />,
        );

        expect(screen.getByTestId("insuree-policy-searcher")).toHaveTextContent("c-1");
    });
});
