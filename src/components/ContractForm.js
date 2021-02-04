import React, { Component, Fragment } from "react";
import { Form, withModulesManager, formatMessage, formatMessageWithValues, journalize } from "@openimis/fe-core";
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
import { UPDATABLE_STATES, APPROVABLE_STATES, TERMINATED_STATE } from "../constants"

const styles = theme => ({
    fab: theme.fab,
    approveFab: {
        position: 'fixed',
        bottom: theme.spacing(11),
        right: theme.spacing(2),
        zIndex: 1200
    },
    counterFab: {
        position: 'fixed',
        bottom: theme.spacing(17),
        right: theme.spacing(2),
        zIndex: 1200
    },
    amendFab: {
        position: 'fixed',
        bottom: theme.spacing(23),
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
            readOnlyFields: ['amountNotified', 'amountRectified', 'amountDue', 'state', 'amendment']
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
                (state, props) => ({ contract: props.contract, reset: state.reset + 1 }),
                () => document.title = formatMessageWithValues(this.props.intl, "contract", "page.title", this.titleParams())
            );
        }
        if (prevProps.submittingMutation && !this.props.submittingMutation) {
            this.props.journalize(this.props.mutation);
            this.props.fetchContract(
                this.props.modulesManager,
                !!this.props.contractId ? [`id: "${this.props.contractId}"`] : [`clientMutationId: "${this.props.mutation.clientMutationId}"`]
            );
        }
    }

    isMandatoryFieldsEmpty = () => {
        const { contract } = this.state;
        if (!!contract.code && !!contract.dateValidFrom && !!contract.dateValidTo) {
            return false;
        }
        return true;
    }

    isDirty = () => this.props.contract !== this.state.contract;

    canSave = () => !this.isMandatoryFieldsEmpty();

    save = contract => this.props.save(contract, this.state.readOnlyFields);

    onEditedChanged = contract => this.setState({ contract })

    titleParams = () => this.props.titleParams(this.state.contract);

    isContractStateNotNull = () => !!this.props.contractId && !!this.props.contract && !!this.props.contract.state;

    isUpdatable = () =>  this.isContractStateNotNull() && this.updatableStates.includes(this.props.contract.state);

    isApprovable = () => this.isContractStateNotNull() && this.approvableStates.includes(this.props.contract.state);

    isTerminated = () => this.isContractStateNotNull() && this.props.contract.state === TERMINATED_STATE;

    setReadOnlyFields = readOnlyFields => this.setState({ readOnlyFields });

    render() {
        const { intl, rights, classes, contract, contractId, back } = this.props;
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
                    mandatoryFieldsEmpty={this.isMandatoryFieldsEmpty()}
                    saveTooltip={formatMessage(intl, "contract", `saveButton.tooltip.${this.canSave() ? 'enabled' : 'disabled'}`)}
                    rights={rights}
                    savedContract={contract}
                    isUpdatable={this.isUpdatable()}
                    isApprovable={this.isApprovable()}
                    setReadOnlyFields={this.setReadOnlyFields}
                    readOnlyFields={this.state.readOnlyFields}
                    fab={this.isUpdatable() && <OpenInBrowserIcon/>}
                    fabTooltip={formatMessage(intl, "contract", "submitButton.tooltip")}
                    reset={this.state.reset}
                />
                {!!contractId && (
                    <Fragment>
                        {/**
                         * Disabled 'submit' @see Fab is displayed, because @see Form does not support
                         * disabling the icon passed in @see fab parameter
                         */}
                        {!this.isUpdatable() && !this.isDirty() && (
                            <Tooltip title={formatMessage(intl, "contract", "submitButton.tooltip")} placement="left">
                                <div className={classes.fab}>
                                    <Fab color="primary" disabled>
                                        <OpenInBrowserIcon/>
                                    </Fab>
                                </div>
                            </Tooltip>
                        )}
                        <Tooltip title={formatMessage(intl, "contract", "approveButton.tooltip")} placement="left">
                            <div className={classes.approveFab}>
                                <Fab
                                    color="primary"
                                    size="small"
                                    disabled={!this.isApprovable() || this.isDirty()}>
                                    <CheckIcon/>
                                </Fab>
                            </div>
                        </Tooltip>
                        <Tooltip title={formatMessage(intl, "contract", "counterButton.tooltip")} placement="left">
                            <div className={classes.counterFab}>
                                <Fab
                                    color="primary"
                                    size="small"
                                    disabled={!this.isApprovable() || this.isDirty()}>
                                    <CloseIcon/>
                                </Fab>
                            </div>
                        </Tooltip>
                        <Tooltip title={formatMessage(intl, "contract", "amendButton.tooltip")} placement="left">
                            <div className={classes.amendFab}>
                                <Fab
                                    color="primary"
                                    size="small"
                                    disabled={this.isUpdatable() || this.isApprovable() || this.isTerminated() || this.isDirty()}>
                                    <NoteAddIcon/>
                                </Fab>
                            </div>
                        </Tooltip>
                    </Fragment>
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
    submittingMutation: state.contract.submittingMutation,
    mutation: state.contract.mutation
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchContract, journalize }, dispatch);
};

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(ContractForm)))));
