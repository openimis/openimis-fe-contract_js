import React, { Component } from "react"
import { withModulesManager, withHistory, historyPush, formatMessage, formatMessageWithValues, coreConfirm } from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { createContract, updateContract, submitContract } from "../actions"
import { RIGHT_POLICYHOLDERCONTRACT_CREATE, RIGHT_POLICYHOLDERCONTRACT_UPDATE, RIGHT_POLICYHOLDERCONTRACT_APPROVE } from "../constants"
import ContractForm from "../components/ContractForm";

const styles = theme => ({
    page: theme.page
});

class ContractPage extends Component {
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.confirmed !== this.props.confirmed && !!this.props.confirmed && !!this.state.confirmedAction) {
            this.state.confirmedAction();
        }
    }

    setConfirmedAction = (confirm, confirmedAction) => this.setState({ confirmedAction }, confirm);

    back = () => {
        historyPush(this.props.modulesManager, this.props.history, "contract.route.contracts")
    }

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

    submit = contract => {
        const { intl, coreConfirm, submitContract } = this.props;
        let confirm = () => coreConfirm(
            formatMessage(intl, "contract", "submitContract.confirm.title"),
            formatMessageWithValues(intl, "contract", "submitContract.confirm.message", this.titleParams(contract))
        );
        let confirmedAction = () => submitContract(
            contract,
            formatMessageWithValues(intl, "contract", "SubmitContract.mutationLabel", this.titleParams(contract))
        );
        this.setConfirmedAction(confirm, confirmedAction);
    }

    titleParams = contract => ({ label: !!contract.code ? contract.code : null });

    render() {
        const { classes, rights, contractId } = this.props;
        return (
            rights.includes(RIGHT_POLICYHOLDERCONTRACT_CREATE) && (
                rights.includes(RIGHT_POLICYHOLDERCONTRACT_UPDATE)  || rights.includes(RIGHT_POLICYHOLDERCONTRACT_APPROVE)) && (
                <div className={classes.page}>
                    <ContractForm
                        contractId={contractId}
                        back={this.back}
                        save={this.save}
                        submit={this.submit}
                        titleParams={this.titleParams}
                        rights={rights}
                        setConfirmedAction={this.setConfirmedAction}
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
    return bindActionCreators({ createContract, updateContract, submitContract, coreConfirm }, dispatch);
};

export default withHistory(withModulesManager(injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(ContractPage))))));
