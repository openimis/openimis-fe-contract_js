import React, { Component, Fragment } from "react";
import { Form, withModulesManager, formatMessage, formatMessageWithValues, journalize, decodeId } from "@openimis/fe-core";
import { Fab, Tooltip } from "@material-ui/core";
import { injectIntl } from "react-intl";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { fetchContract } from "../actions"
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import ContractHeadPanel from "./ContractHeadPanel";
import { UPDATABLE_STATES, APPROVABLE_STATES, TERMINATED_STATE, RIGHT_POLICYHOLDERCONTRACT_SUBMIT,
    RIGHT_POLICYHOLDERCONTRACT_APPROVE, RIGHT_POLICYHOLDERCONTRACT_AMEND, MIN_AMENDMENT_VALUE } from "../constants"
import ContractTabPanel from "./ContractTabPanel";

const styles = theme => ({
    fab: theme.fab,
    counterFab: {
        position: 'fixed',
        bottom: theme.spacing(11),
        right: theme.spacing(2),
        zIndex: 1200
    }
});

class ContractForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            contract: {},
            reset: 0,
            readOnlyFields: ['amountNotified', 'amountRectified', 'amountDue', 'state', 'amendment'],
            isDirty: false,
            createMutationId: null
        };
        this.updatableStates = props.modulesManager.getConf("fe-contract", "contractForm.updatable", UPDATABLE_STATES);
        this.approvableStates = props.modulesManager.getConf("fe-contract", "contractForm.approvable", APPROVABLE_STATES);
    }

    componentDidMount() {
        document.title = formatMessageWithValues(this.props.intl, "contract", "page.title", this.titleParams());
        if (!!this.props.contractId) {
            this.props.fetchContract(this.props.modulesManager, [`id: "${this.props.contractId}"`]);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.fetchedContract !== this.props.fetchedContract && !!this.props.fetchedContract) {
            this.setState(
                (state, props) => ({ contract: props.contract, reset: state.reset + 1, isDirty: false }),
                () => document.title = formatMessageWithValues(this.props.intl, "contract", "page.title", this.titleParams())
            );
        } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
            this.props.journalize(this.props.mutation);
            if (!!this.state.contract.id && !this.props.amendConfirmed) {
                this.props.fetchContract(this.props.modulesManager, [`id: "${decodeId(this.state.contract.id)}"`]);
            } else if (!!this.state.createMutationId) {
                this.props.fetchContract(this.props.modulesManager, [`clientMutationId: "${this.state.createMutationId}"`]);
                this.props.toggleAmendConfirmed();
            } else {
                this.props.fetchContract(this.props.modulesManager, [`clientMutationId: "${this.props.mutation.clientMutationId}"`]);
                this.setState((_, props) => ({ createMutationId: props.mutation.clientMutationId }));
            }
        } else if (prevProps.policyHolders !== this.props.policyHolders) {
            this.setState((state, props) => ({
                contract: {
                    ...state.contract,
                    policyHolder: props.policyHolders.find((v) => decodeId(v.id) === props.predefinedPolicyHolderId)
                }
            }));
        }
    }

    isMandatoryFieldsEmpty = () => {
        const { contract } = this.state;
        if (!!contract.code && !!contract.dateValidFrom && !!contract.dateValidTo) {
            return false;
        }
        return true;
    }

    canSave = () => !this.isMandatoryFieldsEmpty();

    save = contract => this.props.save(contract, this.state.readOnlyFields);

    onEditedChanged = contract => this.setState({ contract, isDirty: true })

    titleParams = () => this.props.titleParams(this.state.contract);

    isContractStateNotNull = () => !!this.state.contract && !!this.state.contract.state;

    isUpdatable = () =>  this.isContractStateNotNull() && this.updatableStates.includes(this.state.contract.state);

    isApprovable = () => this.isContractStateNotNull() && this.approvableStates.includes(this.state.contract.state);

    isTerminated = () => this.isContractStateNotNull() && this.state.contract.state === TERMINATED_STATE;

    setReadOnlyFields = readOnlyFields => this.setState({ readOnlyFields });

    isAmendment = () => !!this.state.contract.amendment && this.state.contract.amendment > MIN_AMENDMENT_VALUE;

    fab = () => {
        const { rights } = this.props;
        if (rights.includes(RIGHT_POLICYHOLDERCONTRACT_SUBMIT) && this.isUpdatable()) {
            return <OpenInBrowserIcon/>;
        } else if (rights.includes(RIGHT_POLICYHOLDERCONTRACT_APPROVE) && this.isApprovable()) {
            return <CheckIcon/>;
        } else if (rights.includes(RIGHT_POLICYHOLDERCONTRACT_AMEND) && !this.isUpdatable() && !this.isApprovable() && !this.isTerminated()) {
            return <NoteAddIcon/>;
        } else return null;
    }

    fabTooltip = () => {
        if (this.isUpdatable()) {
            return formatMessage(this.props.intl, "contract", "submitButton.tooltip");
        } else if (this.isApprovable()) {
            return formatMessage(this.props.intl, "contract", "approveButton.tooltip");
        } else if (!this.isUpdatable() && !this.isApprovable() && !this.isTerminated()) {
            return formatMessage(this.props.intl, "contract", "amendButton.tooltip");
        } else return null;
    }

    fabAction = () => {
        if (this.isUpdatable()) {
            return this.props.submit;
        } else if (this.isApprovable()) {
            return this.props.approve;
        } else if (!this.isUpdatable() && !this.isApprovable() && !this.isTerminated()) {
            return this.props.amend;
        } else return () => null;
    }

    render() {
        const { intl, rights, classes, contract, back, setConfirmedAction, counter, predefinedPolicyHolderId } = this.props;
        return (
            <Fragment>
                <Form
                    module="contract"
                    title="contract.page.title"
                    titleParams={this.titleParams()}
                    edited={this.state.contract}
                    back={back}
                    canSave={this.canSave}
                    save={this.save}
                    onEditedChanged={this.onEditedChanged}
                    HeadPanel={ContractHeadPanel}
                    Panels={[ContractTabPanel]}
                    mandatoryFieldsEmpty={this.isMandatoryFieldsEmpty()}
                    saveTooltip={formatMessage(intl, "contract", `saveButton.tooltip.${this.canSave() ? 'enabled' : 'disabled'}`)}
                    rights={rights}
                    savedContract={contract}
                    isUpdatable={this.isUpdatable()}
                    isApprovable={this.isApprovable()}
                    setReadOnlyFields={this.setReadOnlyFields}
                    readOnlyFields={this.state.readOnlyFields}
                    fab={!!this.state.contract.id && this.fab()}
                    fabTooltip={this.fabTooltip()}
                    fabAction={this.fabAction()}
                    reset={this.state.reset}
                    setConfirmedAction={setConfirmedAction}
                    isAmendment={this.isAmendment()}
                    isPolicyHolderPredefined={!!predefinedPolicyHolderId}
                />
                {rights.includes(RIGHT_POLICYHOLDERCONTRACT_APPROVE) && this.isApprovable() && !this.state.isDirty && (
                    <Tooltip title={formatMessage(intl, "contract", "counterButton.tooltip")} placement="left">
                        <div className={classes.counterFab}>
                            <Fab color="primary" size="small" onClick={() => counter(this.state.contract)}>
                                <CloseIcon/>
                            </Fab>
                        </div>
                    </Tooltip>
                )}
            </Fragment>
        )
    }
}

const mapStateToProps = state => ({
    fetchingContract: state.contract.fetchingContract,
    fetchedContract: state.contract.fetchedContract,
    contract: state.contract.contract,
    errorContract: state.contract.errorContract,
    policyHolders: state.policyHolder.policyHolders,
    submittingMutation: state.contract.submittingMutation,
    mutation: state.contract.mutation
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchContract, journalize }, dispatch);
};

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(ContractForm)))));
