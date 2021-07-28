import React, { Component } from "react";
import { Tab } from "@material-ui/core";
import { formatMessage, PublishedComponent } from "@openimis/fe-core";
import {
    RIGHT_POLICYHOLDERCONTRACT_UPDATE,
    RIGHT_POLICYHOLDERCONTRACT_APPROVE,
    CONTRACTCONTRIBUTIONDETAILS_TAB_VALUE,
    RIGHT_PORTALPOLICYHOLDERCONTRACT_UPDATE,
    RIGHT_PORTALPOLICYHOLDERCONTRACT_SUBMIT,
    RIGHT_PORTALPOLICYHOLDERCONTRACT_AMEND
} from "../constants";
import ContractContributionDetailsSearcher from "./ContractContributionDetailsSearcher";

class ContractContributionDetailsTabLabel extends Component {
    render() {
        const { intl, rights, onChange, disabled, tabStyle, isSelected, isUpdatable, isApprovable } = this.props;
        return (
            [
                RIGHT_POLICYHOLDERCONTRACT_UPDATE,
                RIGHT_POLICYHOLDERCONTRACT_APPROVE,
                RIGHT_PORTALPOLICYHOLDERCONTRACT_UPDATE,
                RIGHT_PORTALPOLICYHOLDERCONTRACT_SUBMIT,
                RIGHT_PORTALPOLICYHOLDERCONTRACT_AMEND
            ].some(right => rights.includes(right)) &&
            !isUpdatable &&
            !isApprovable &&
            !disabled && (
                <Tab
                    onChange={onChange}
                    className={tabStyle(CONTRACTCONTRIBUTIONDETAILS_TAB_VALUE)}
                    selected={isSelected(CONTRACTCONTRIBUTIONDETAILS_TAB_VALUE)}
                    value={CONTRACTCONTRIBUTIONDETAILS_TAB_VALUE}
                    label={formatMessage(intl, "contract", "contractContributionDetails.label")}
                    wrapped
                />
            )
        );
    }
}

class ContractContributionDetailsTabPanel extends Component {
    render() {
        const { rights, value, isTabsEnabled, contract, isUpdatable, isApprovable } = this.props;
        return (
            [
                RIGHT_POLICYHOLDERCONTRACT_UPDATE,
                RIGHT_POLICYHOLDERCONTRACT_APPROVE,
                RIGHT_PORTALPOLICYHOLDERCONTRACT_UPDATE,
                RIGHT_PORTALPOLICYHOLDERCONTRACT_SUBMIT,
                RIGHT_PORTALPOLICYHOLDERCONTRACT_AMEND
            ].some(right => rights.includes(right)) &&
            !isUpdatable &&
            !isApprovable && (
                <PublishedComponent
                    pubRef="policyHolder.TabPanel"
                    module="contract"
                    index={CONTRACTCONTRIBUTIONDETAILS_TAB_VALUE}
                    value={value}
                >
                    {isTabsEnabled && (
                        <ContractContributionDetailsSearcher
                            contract={contract}
                            rights={rights}
                        />
                    )}
                </PublishedComponent>
            )
        );
    }
}

export {
    ContractContributionDetailsTabLabel,
    ContractContributionDetailsTabPanel
}
