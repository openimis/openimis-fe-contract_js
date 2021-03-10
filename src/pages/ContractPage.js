import React, { Component } from "react";
import {
    withModulesManager,
    withHistory,
    formatMessage,
    formatMessageWithValues,
    coreConfirm
} from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
    createContract,
    updateContract,
    submitContract,
    approveContract,
    counterContract,
    amendContract
} from "../actions";
import {
    RIGHT_POLICYHOLDERCONTRACT_CREATE,
    RIGHT_POLICYHOLDERCONTRACT_UPDATE,
    RIGHT_POLICYHOLDERCONTRACT_APPROVE,
    QUERY_STRING_POLICYHOLDER
} from "../constants";
import ContractForm from "../components/ContractForm";

const AMENDMENT_INCREMENT = 1;

const styles = theme => ({
    page: theme.page
});

class ContractPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            amendConfirmed: false
        }
        this.predefinedPolicyHolderId = !!props.contractId
            ? null
            : new URLSearchParams(this.props.location.search).get(QUERY_STRING_POLICYHOLDER);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.confirmed !== this.props.confirmed && !!this.props.confirmed && !!this.state.confirmedAction) {
            this.state.confirmedAction();
        }
    }

    setConfirmedAction = (confirm, confirmedAction) => this.setState({ confirmedAction }, confirm);

    back = () => this.props.history.goBack();

    save = (contract, readOnlyFields) => {
        const { intl, createContract, updateContract } = this.props;
        if (!!contract.id) {
            updateContract(
                contract,
                formatMessageWithValues(intl, "contract", "UpdateContract.mutationLabel", this.titleParams(contract)),
                readOnlyFields
            );
        } else {
            createContract(
                contract,
                formatMessageWithValues(intl, "contract", "CreateContract.mutationLabel", this.titleParams(contract))
            );
        }
    }

    action = (contract, action, label) => {
        const { intl, coreConfirm } = this.props;
        let confirm = () => coreConfirm(
            formatMessage(intl, "contract", `${label}.confirm.title`),
            formatMessageWithValues(intl, "contract", `${label}.confirm.message`, this.titleParams(contract))
        );
        let confirmedAction = () => action(
            contract,
            formatMessageWithValues(intl, "contract", `${label}.mutationLabel`, this.titleParams(contract))
        );
        this.setConfirmedAction(confirm, confirmedAction);
    }

    amend = contract => {
        const { intl, coreConfirm, amendContract } = this.props;
        let confirm = () => coreConfirm(
            formatMessage(intl, "contract", "amendContract.confirm.title"),
            formatMessageWithValues(intl, "contract", "amendContract.confirm.message", this.titleParams(contract))
        );
        let confirmedAction = () => {
            amendContract(
                contract,
                formatMessageWithValues(intl, "contract", "amendContract.mutationLabel", { 
                    amendment: contract.amendment + AMENDMENT_INCREMENT,
                    contract: contract.code
                })
            );
            this.toggleAmendConfirmed();
        }
        this.setConfirmedAction(confirm, confirmedAction);
    }

    toggleAmendConfirmed = () => this.setState(state => ({ amendConfirmed: !state.amendConfirmed }));

    titleParams = contract => ({ label: !!contract.code ? contract.code : null });

    render() {
        const { classes, rights, contractId, submitContract, approveContract, counterContract } = this.props;
        return (
            rights.includes(RIGHT_POLICYHOLDERCONTRACT_CREATE) && (
                rights.includes(RIGHT_POLICYHOLDERCONTRACT_UPDATE)  || rights.includes(RIGHT_POLICYHOLDERCONTRACT_APPROVE)) && (
                <div className={classes.page}>
                    <ContractForm
                        contractId={contractId}
                        back={this.back}
                        save={this.save}
                        submit={contract => this.action(contract, submitContract, "submitContract")}
                        approve={contract => this.action(contract, approveContract, "approveContract")}
                        counter={contract => this.action(contract, counterContract, "counterContract")}
                        amend={contract => this.amend(contract)}
                        titleParams={this.titleParams}
                        rights={rights}
                        setConfirmedAction={this.setConfirmedAction}
                        amendConfirmed={this.state.amendConfirmed}
                        toggleAmendConfirmed={this.toggleAmendConfirmed}
                        predefinedPolicyHolderId={this.predefinedPolicyHolderId}
                    />
                </div>
            )
        )
    }
}

const mapStateToProps = (state, props) => ({
    rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
    contractId: props.match.params.contract_id,
    confirmed: state.core.confirmed
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ createContract, updateContract, submitContract, approveContract, counterContract, amendContract, coreConfirm }, dispatch);
};

export default withHistory(withModulesManager(injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(ContractPage))))));
