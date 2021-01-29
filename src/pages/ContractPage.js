import React, { Component } from "react"
import { withModulesManager, withHistory, historyPush, formatMessageWithValues } from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { createContract } from "../actions"
import { RIGHT_POLICYHOLDERCONTRACT_CREATE } from "../constants"
import ContractForm from "../components/ContractForm";

const styles = theme => ({
    page: theme.page,
});

class ContractPage extends Component {
    back = () => {
        historyPush(this.props.modulesManager, this.props.history, "contract.route.contracts")
    }

    save = contract => {
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

    titleParams = contract => ({ label: !!contract.code ? contract.code : null });

    render() {
        const { classes, rights } = this.props;
        return (
            rights.includes(RIGHT_POLICYHOLDERCONTRACT_CREATE) && (
                <div className={classes.page}>
                    <ContractForm
                        back={this.back}
                        save={this.save}
                        titleParams={this.titleParams}
                    />
                </div>
            )
        )
    }
}

const mapStateToProps = (state, props) => ({
    rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : []
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ createContract }, dispatch);
};

export default withHistory(withModulesManager(injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(ContractPage))))));
