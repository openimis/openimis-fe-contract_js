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
import { UPDATABLE_STATES, APPROVABLE_STATES, TERMINATED_STATE } from "../constants"
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
                !!this.state.contract.id ? [`id: "${decodeId(this.state.contract.id)}"`] : [`clientMutationId: "${this.props.mutation.clientMutationId}"`]
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

    canSave = () => !this.isMandatoryFieldsEmpty();

    save = contract => this.props.save(contract, this.state.readOnlyFields);

    onEditedChanged = contract => this.setState({ contract })

    titleParams = () => this.props.titleParams(this.state.contract);

    isContractStateNotNull = () => !!this.state.contract && !!this.state.contract.state;

    isUpdatable = () =>  this.isContractStateNotNull() && this.updatableStates.includes(this.state.contract.state);

    isApprovable = () => this.isContractStateNotNull() && this.approvableStates.includes(this.state.contract.state);

    isTerminated = () => this.isContractStateNotNull() && this.state.contract.state === TERMINATED_STATE;

    setReadOnlyFields = readOnlyFields => this.setState({ readOnlyFields });

    fab = () => {
        if (this.isUpdatable()) {
            return <OpenInBrowserIcon/>;
        } else if (this.isApprovable()) {
            return <CheckIcon/>;
        } else if (!this.isUpdatable() && !this.isApprovable() && !this.isTerminated()) {
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

    render() {
        const { intl, rights, classes, contract, back } = this.props;
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
                    fabAction={() => null}
                    reset={this.state.reset}
                />
                {this.isApprovable() && !!this.fab() && (
                    <Tooltip title={formatMessage(intl, "contract", "counterButton.tooltip")} placement="left">
                        <div className={classes.counterFab}>
                            <Fab color="primary" size="small">
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
    submittingMutation: state.contract.submittingMutation,
    mutation: state.contract.mutation
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchContract, journalize }, dispatch);
};

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(ContractForm)))));
