import React, { Component } from "react";
import { Tab } from "@material-ui/core";
import { formatMessage, PublishedComponent } from "@openimis/fe-core";
import {
    CONTRACTINSUREEPOLICY_TAB_VALUE,
    RIGHT_INSUREEPOLICY_SEARCH,
    RIGHT_PORTALINSUREEPOLICY_SEARCH,
} from "../constants";
import ContractInsureePolicySearcher from "./ContractInsureePolicySearcher";

class ContractInsureePolicyTabLabel extends Component {
    render() {
        const { intl, rights, onChange, disabled, tabStyle, isSelected } = this.props;
        return (
            [
                RIGHT_INSUREEPOLICY_SEARCH,
                RIGHT_PORTALINSUREEPOLICY_SEARCH
            ].some(right => rights.includes(right)) && (
                <Tab
                    onChange={onChange}
                    disabled={disabled}
                    className={tabStyle(CONTRACTINSUREEPOLICY_TAB_VALUE)}
                    selected={isSelected(CONTRACTINSUREEPOLICY_TAB_VALUE)}
                    value={CONTRACTINSUREEPOLICY_TAB_VALUE}
                    label={formatMessage(intl, "contract", "insureePolicy.label")}
                />
            )
        )
    }
}

class ContractInsureePolicyTabPanel extends Component {
    render() {
        const { rights, value, isTabsEnabled, contract } = this.props;
        return (
            [
                RIGHT_INSUREEPOLICY_SEARCH,
                RIGHT_PORTALINSUREEPOLICY_SEARCH
            ].some(right => rights.includes(right)) && (
                <PublishedComponent
                    pubRef="policyHolder.TabPanel"
                    module="contract"
                    index={CONTRACTINSUREEPOLICY_TAB_VALUE}
                    value={value}
                >
                    {isTabsEnabled && (
                        <ContractInsureePolicySearcher
                            contract={contract}
                            rights={rights}
                        />
                    )}
                </PublishedComponent>
            )
        )
    }
}

export {
    ContractInsureePolicyTabLabel,
    ContractInsureePolicyTabPanel
}
