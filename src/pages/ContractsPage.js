import React, { Component } from "react";
import { withModulesManager, formatMessage } from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import { RIGHT_POLICYHOLDERCONTRACT_SEARCH } from "../constants"
import ContractSearcher from "../components/ContractSearcher";

const styles = theme => ({
    page: theme.page
})

class ContractsPage extends Component {
    componentDidMount() {
        document.title = formatMessage(this.props.intl, "contract", "contracts.page.title");
    }

    render() {
        const { classes, rights } = this.props;
        return (
            rights.includes(RIGHT_POLICYHOLDERCONTRACT_SEARCH) && (
                <div className={classes.page}>
                    <ContractSearcher />
                </div>
            )
        )
    }
}

const mapStateToProps = state => ({
    rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : []
});

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, null)(ContractsPage)))));
