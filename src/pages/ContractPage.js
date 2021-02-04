import React, { Component } from "react"
import { withModulesManager, withHistory, historyPush, formatMessageWithValues } from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { createContract, updateContract } from "../actions"
import { RIGHT_POLICYHOLDERCONTRACT_CREATE, RIGHT_POLICYHOLDERCONTRACT_UPDATE, RIGHT_POLICYHOLDERCONTRACT_APPROVE } from "../constants"
import ContractForm from "../components/ContractForm";

const styles = theme => ({
    page: theme.page
});

class ContractPage extends Component {
    back = () => {
        historyPush(this.props.modulesManager, this.props.history, "contract.route.contracts")
    }

    save = (contract, readOnlyFields) => {
        if (!!contract.id) {
            this.props.updateContract(
                contract,
                formatMessageWithValues(
                    this.props.intl,
                    "contract",
                    "UpdateContract.mutationLabel",
                    this.titleParams(contract)
                ),
                readOnlyFields
            );
        } else {
            this.props.createContract(
                contract,
                formatMessageWithValues(
                    this.props.intl,
                    "contract",
                    "CreateContract.mutationLabel",
                    this.titleParams(contract)
                )
            );
        }
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
                        titleParams={this.titleParams}
                        rights={rights}
                    />
                </div>
            )
        )
    }
}

const mapStateToProps = (state, props) => ({
    rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
    contractId: props.match.params.contract_id
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ createContract, updateContract }, dispatch);
};

export default withHistory(withModulesManager(injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(ContractPage))))));
