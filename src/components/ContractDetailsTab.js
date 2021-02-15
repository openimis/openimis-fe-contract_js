import React, { Component, Fragment } from "react";
import { Tab, Grid, Typography } from "@material-ui/core";
import { formatMessage, PublishedComponent, FormattedMessage } from "@openimis/fe-core";
import { RIGHT_POLICYHOLDERCONTRACT_UPDATE, RIGHT_POLICYHOLDERCONTRACT_APPROVE, CONTRACTDETAILS_TAB_VALUE } from "../constants"
import ContractDetailsSearcher from "./ContractDetailsSearcher";
import CreateContractDetailsDialog from "../dialogs/CreateContractDetailsDialog"

class ContractDetailsTabLabel extends Component {
    render() {
        const { intl, rights, onChange, disabled, tabStyle, isSelected } = this.props;
        return (
            (rights.includes(RIGHT_POLICYHOLDERCONTRACT_UPDATE) || rights.includes(RIGHT_POLICYHOLDERCONTRACT_APPROVE)) &&
                <Tab
                    onChange={onChange}
                    disabled={disabled}
                    className={tabStyle(CONTRACTDETAILS_TAB_VALUE)}
                    selected={isSelected(CONTRACTDETAILS_TAB_VALUE)}
                    value={CONTRACTDETAILS_TAB_VALUE}
                    label={formatMessage(intl, "contract", "contractDetails.label")}
                />
        )
    }
}

class ContractDetailsTabPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            reset: 0
        }
    }

    onSave = () => {
        this.setState(state => ({
            reset: state.reset + 1
        }));
    }

    isActionEnabled = () => {
        const { rights, isUpdatable, isApprovable } = this.props;
        if (rights.includes(RIGHT_POLICYHOLDERCONTRACT_APPROVE)) {
            return isUpdatable || isApprovable;
        } else if (rights.includes(RIGHT_POLICYHOLDERCONTRACT_UPDATE)) {
            return isUpdatable;
        }
        return false;
    }

    render() {
        const { rights, value, isTabsEnabled, contract, setConfirmedAction } = this.props;
        return (
            (rights.includes(RIGHT_POLICYHOLDERCONTRACT_UPDATE) || rights.includes(RIGHT_POLICYHOLDERCONTRACT_APPROVE)) &&
                <PublishedComponent
                    pubRef="policyHolder.TabPanel"
                    module="contract"
                    index={CONTRACTDETAILS_TAB_VALUE}
                    value={value}
                >
                    {isTabsEnabled ? (
                        <Fragment>
                            <Grid container justify="flex-end" alignItems="center" spacing={1}>
                                <Grid item>
                                    <Typography>
                                        <FormattedMessage module="contract" id="contractDetails.createContractDetails" />
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <CreateContractDetailsDialog
                                        contract={contract}
                                        onSave={this.onSave}
                                        setConfirmedAction={setConfirmedAction}
                                        disabled={!this.isActionEnabled()}
                                    />
                                </Grid>
                            </Grid>
                            <ContractDetailsSearcher
                                contract={contract}
                                rights={rights}
                                reset={this.state.reset}
                                onSave={this.onSave}
                                setConfirmedAction={setConfirmedAction}
                                isActionEnabled={this.isActionEnabled()}
                            />
                        </Fragment>
                    ) : (
                        <FormattedMessage module="contract" id="contractDetails.tabDisabledError" />
                    )}
                </PublishedComponent>
        )
    }
}

export {
    ContractDetailsTabLabel,
    ContractDetailsTabPanel
}
