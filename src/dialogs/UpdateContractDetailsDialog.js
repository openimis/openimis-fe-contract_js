import React, { Component, Fragment } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import EditIcon from "@material-ui/icons/Edit";
import {
    FormattedMessage,
    formatMessage,
    formatMessageWithValues,
    PublishedComponent,
    decodeId,
    coreConfirm,
    Contributions
} from "@openimis/fe-core";
import { Grid, IconButton, Tooltip } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { updateContractDetails } from "../actions";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
    CONTRACTDETAILS_CALCULATION_CONTRIBUTION_KEY,
    CONTRACTDETAILS_CLASSNAME,
    RIGHT_CALCULATION_UPDATE
} from "../constants";

const styles = theme => ({
    item: theme.paper.item
});

class CreateContractDetailsDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            contractDetails: {},
            jsonExtValid: true
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.contractDetails !== this.state.contractDetails && prevState.contractDetails.insuree !== this.state.contractDetails.insuree) {
            this.setPolicyHolderContributionPlanBundle();
        }
    }

    handleOpen = () => {
        this.setState((_, props) => ({
            open: true,
            contractDetails: {
                ...props.contractDetails,
                contract: props.contract
            },
            jsonExtValid: true
        }));
    };

    handleClose = () => {
        this.setState({ open: false, contractDetails: {} });
    };

    handleSave = () => {
        const { intl, contract, coreConfirm, onSave, updateContractDetails, setConfirmedAction } = this.props;
        const { contractDetails } = this.state;
        let confirm = () => coreConfirm(
            formatMessage(intl, "contract", "contractDetails.editContractDetails.confirm.title"),
            formatMessageWithValues(
                intl,
                "contract",
                "contractDetails.editContractDetails.confirm.message",
                {
                    insuree: decodeId(contractDetails.insuree.id),
                    contributionPlanBundle: contractDetails.contributionPlanBundle.code
                })
        );
        let confirmedAction = () => {
            updateContractDetails(
                contractDetails,
                formatMessageWithValues(
                    intl,
                    "contract",
                    "UpdateContractDetails.mutationLabel",
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
        setConfirmedAction(confirm, confirmedAction);
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
        const { contractDetails, jsonExtValid } = this.state;
        return !!contractDetails.contract &&
            !!contractDetails.insuree &&
            !!contractDetails.contributionPlanBundle &&
            !!jsonExtValid;
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

    setJsonExtValid = (valid) => this.setState({ jsonExtValid: !!valid });

    render() {
        const { intl, classes, contract, disabled } = this.props;
        const { open, contractDetails } = this.state;
        return (
            <Fragment>
                <Tooltip title={formatMessage(intl, "contract", "editButton.tooltip")}>
                    <div>
                        <IconButton
                            onClick={this.handleOpen}
                            disabled={disabled}>
                            <EditIcon/>
                        </IconButton>
                    </div>
                </Tooltip>
                <Dialog open={open} onClose={this.handleClose}>
                    <DialogTitle>
                        <FormattedMessage module="contract" id="contractDetails.editContractDetails" />
                    </DialogTitle>
                    <DialogContent>
                        <Grid container direction="column" className={classes.item}>
                            <Grid item className={classes.item}>
                                <PublishedComponent
                                    pubRef="policyHolder.PolicyHolderInsureePicker"
                                    required
                                    withNull={false}
                                    policyHolderId={contract?.policyHolder?.id}
                                    value={!!contractDetails.insuree && contractDetails.insuree}
                                    readOnly
                                />
                            </Grid>
                            <Grid item className={classes.item}>
                                <PublishedComponent
                                    pubRef="policyHolder.PolicyHolderContributionPlanBundlePicker"
                                    withNull={false}
                                    nullLabel={formatMessage(intl, "contract", "emptyLabel")}
                                    policyHolderId={contract?.policyHolder?.id}
                                    value={!!contractDetails.contributionPlanBundle && contractDetails.contributionPlanBundle}
                                    readOnly
                                />
                            </Grid>
                            <Contributions
                                contributionKey={CONTRACTDETAILS_CALCULATION_CONTRIBUTION_KEY}
                                intl={intl}
                                className={CONTRACTDETAILS_CLASSNAME}
                                entity={contractDetails}
                                requiredRights={[RIGHT_CALCULATION_UPDATE]}
                                value={!!contractDetails.jsonExt && contractDetails.jsonExt}
                                onChange={this.updateAttribute}
                                gridItemStyle={classes.item}
                                setJsonExtValid={this.setJsonExtValid}
                            />
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} variant="outlined">
                            <FormattedMessage module="contract" id="dialog.cancel" />
                        </Button>
                        <Button onClick={this.handleSave} disabled={!this.canSave()} variant="contained" color="primary" autoFocus>
                            <FormattedMessage module="contract" id="dialog.update" />
                        </Button>
                    </DialogActions>
                </Dialog>
            </Fragment>
        );
    }
}

const mapStateToProps = state => ({
    pickerPolicyHolderInsurees: state.policyHolder.pickerPolicyHolderInsurees
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ updateContractDetails, coreConfirm }, dispatch);
};

export default injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(CreateContractDetailsDialog))));
