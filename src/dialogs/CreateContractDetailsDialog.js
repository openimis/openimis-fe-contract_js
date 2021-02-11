import React, { Component, Fragment } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import AddIcon from '@material-ui/icons/Add';
import { FormattedMessage, formatMessage, formatMessageWithValues, PublishedComponent,
    TextInput, decodeId, coreConfirm } from "@openimis/fe-core";
import { Fab, Grid } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { createContractDetails } from "../actions";
import { injectIntl } from 'react-intl';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

const styles = theme => ({
    item: theme.paper.item
});

class CreateContractDetailsDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            contractDetails: {}
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.contractDetails !== this.state.contractDetails && prevState.contractDetails.insuree !== this.state.contractDetails.insuree) {
            this.setPolicyHolderContributionPlanBundle();
        } else if (prevProps.confirmed !== this.props.confirmed && !!this.props.confirmed && !!this.state.confirmedAction) {
            this.state.confirmedAction();
        }
    }

    handleOpen = () => {
        this.setState((_, props) => ({
            open: true,
            contractDetails: {
                contract: props.contract
            }
        }));
    };

    handleClose = () => {
        this.setState({ open: false, contractDetails: {} });
    };

    handleSave = () => {
        const { intl, contract, coreConfirm, onSave, createContractDetails } = this.props;
        const { contractDetails } = this.state;
        let confirm = () => coreConfirm(
            formatMessage(intl, "contract", "contractDetails.createContractDetails.confirm.title"),
            formatMessage(intl, "contract", "contractDetails.createContractDetails.confirm.message")
        );
        let confirmedAction = () => {
            createContractDetails(
                contractDetails,
                formatMessageWithValues(
                    intl,
                    "contract",
                    "CreateContractDetails.mutationLabel",
                    {
                        insuree: decodeId(contractDetails.insuree.id),
                        contributionPlanBundle: contractDetails.contributionPlanBundle.code,
                        contract: contract.code
                    }
                )
            );
            this.handleClose();
            onSave();
        }
        this.setState(
            { confirmedAction },
            confirm
        )
    };

    updateAttribute = (attribute, value) => {
        this.setState(state => ({
            contractDetails: {
                ...state.contractDetails,
                [attribute]: value
            }
        }));
    }

    canSave = () => {
        const { contractDetails } = this.state;
        return !!contractDetails.contract
            && !!contractDetails.insuree
            && !!contractDetails.contributionPlanBundle;
    }

    setPolicyHolderContributionPlanBundle = () => {
        const { pickerPolicyHolderInsurees } = this.props;
        const { contractDetails } = this.state;
        if (!!pickerPolicyHolderInsurees && !!contractDetails.insuree) {
            let policyHolderInsuree = pickerPolicyHolderInsurees.find(i => i.insuree.id === contractDetails.insuree.id);
            this.updateAttribute('contributionPlanBundle', !!policyHolderInsuree && !!policyHolderInsuree.contributionPlanBundle ? policyHolderInsuree.contributionPlanBundle : null);
        } else {
            this.updateAttribute('contributionPlanBundle', null);
        }
    }

    render() {
        const { intl, classes, contract } = this.props;
        const { open, contractDetails } = this.state;
        return (
            <Fragment>
                <Fab
                    size="small"
                    color="primary"
                    onClick={this.handleOpen}>
                    <AddIcon/>
                </Fab>
                <Dialog open={open} onClose={this.handleClose}>
                    <DialogTitle>
                        <FormattedMessage module="contract" id="contractDetails.createContractDetails" />
                    </DialogTitle>
                    <DialogContent>
                        <Grid container direction="column" className={classes.item}>
                            <Grid item className={classes.item}>
                                <PublishedComponent
                                    pubRef="policyHolder.PolicyHolderInsureePicker"
                                    required
                                    withNull
                                    policyHolderId={!!contract.policyHolder && decodeId(contract.policyHolder.id)}
                                    value={!!contractDetails.insuree && contractDetails.insuree}
                                    onChange={v => this.updateAttribute('insuree', v)}
                                />
                            </Grid>
                            <Grid item className={classes.item}>
                                <PublishedComponent
                                    pubRef="policyHolder.PolicyHolderContributionPlanBundlePicker"
                                    withNull
                                    nullLabel={formatMessage(intl, "contract", "emptyLabel")}
                                    policyHolderId={!!contract.policyHolder && decodeId(contract.policyHolder.id)}
                                    value={!!contractDetails.contributionPlanBundle && contractDetails.contributionPlanBundle}
                                    readOnly
                                />
                            </Grid>
                            <Grid item className={classes.item}>
                                <TextInput
                                    module="contract"
                                    label="calculation"
                                    value={!!contractDetails.jsonExt && contractDetails.jsonExt}
                                    onChange={v => this.updateAttribute('jsonExt', v)}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} variant="outlined">
                            <FormattedMessage module="contract" id="dialog.cancel" />
                        </Button>
                        <Button onClick={this.handleSave} disabled={!this.canSave()} variant="contained" color="primary" autoFocus>
                            <FormattedMessage module="contract" id="dialog.create" />
                        </Button>
                    </DialogActions>
                </Dialog>
            </Fragment>
        );
    }
}

const mapStateToProps = state => ({
    pickerPolicyHolderInsurees: state.policyHolder.pickerPolicyHolderInsurees,
    confirmed: state.core.confirmed
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ createContractDetails, coreConfirm }, dispatch);
};

export default injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(CreateContractDetailsDialog))));
