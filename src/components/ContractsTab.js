import React, { Component, Fragment } from "react";
import { Tab, Grid, Typography, Fab } from "@material-ui/core";
import { PublishedComponent, FormattedMessage, withModulesManager, formatMessage,
    historyPush, decodeId, withHistory } from "@openimis/fe-core";
import AddIcon from '@material-ui/icons/Add';
import { RIGHT_POLICYHOLDERCONTRACT_UPDATE, RIGHT_POLICYHOLDERCONTRACT_APPROVE, CONTRACTS_TAB_VALUE } from "../constants"
import ContractSearcher from "./ContractSearcher";

class ContractsTabLabel extends Component {
    render() {
        const { intl, rights, onChange, disabled, tabStyle, isSelected } = this.props;
        return (
            (rights.includes(RIGHT_POLICYHOLDERCONTRACT_UPDATE) || rights.includes(RIGHT_POLICYHOLDERCONTRACT_APPROVE)) &&
                <Tab
                    onChange={onChange}
                    disabled={disabled}
                    className={tabStyle(CONTRACTS_TAB_VALUE)}
                    selected={isSelected(CONTRACTS_TAB_VALUE)}
                    value={CONTRACTS_TAB_VALUE}
                    label={formatMessage(intl, "contract", "contracts.page.title")}
                />
        )
    }
}

class RawContractsTabPanel extends Component {
    onAdd = () => historyPush(this.props.modulesManager, this.props.history, "contract.route.contract");

    contractPageLink = contract =>
        `${process.env.PUBLIC_URL || ""}${"/" + this.props.modulesManager.getRef("contract.route.contract")}${"/" + decodeId(contract.id)}`;

    onDoubleClick = (contract, newTab = false) => {
        const { rights, modulesManager, history } = this.props;
        if (rights.includes(RIGHT_POLICYHOLDERCONTRACT_UPDATE) || rights.includes(RIGHT_POLICYHOLDERCONTRACT_APPROVE)) {
            historyPush(modulesManager, history, "contract.route.contract", [decodeId(contract.id)], newTab);
        }
    };

    render() {
        const { rights, value, isTabsEnabled, policyHolder } = this.props;
        return (
            (rights.includes(RIGHT_POLICYHOLDERCONTRACT_UPDATE) || rights.includes(RIGHT_POLICYHOLDERCONTRACT_APPROVE)) && (
                <PublishedComponent pubRef="policyHolder.TabPanel" module="contract" index={CONTRACTS_TAB_VALUE} value={value}>
                    {isTabsEnabled && (
                        <Fragment>
                            <Grid container justify="flex-end" alignItems="center" spacing={1}>
                                <Grid item>
                                    <Typography>
                                        <FormattedMessage module="contract" id="createButton.tooltip" />
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <Fab size="small" color="primary" onClick={this.onAdd}>
                                        <AddIcon />
                                    </Fab>
                                </Grid>
                            </Grid>
                            <ContractSearcher
                                onDoubleClick={this.onDoubleClick}
                                contractPageLink={this.contractPageLink}
                                rights={rights}
                                policyHolder={policyHolder}
                            />
                        </Fragment>
                    )}
                </PublishedComponent>
            )
        );
    }
}

const ContractsTabPanel = withHistory(withModulesManager(RawContractsTabPanel));

export {
    ContractsTabLabel,
    ContractsTabPanel
}
