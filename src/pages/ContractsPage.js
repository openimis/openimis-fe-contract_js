import React, { Component } from "react";
import { withModulesManager, formatMessage, withTooltip, historyPush } from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import { RIGHT_POLICYHOLDERCONTRACT_SEARCH, RIGHT_POLICYHOLDERCONTRACT_CREATE } from "../constants"
import ContractSearcher from "../components/ContractSearcher";
import { Fab } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";

const styles = theme => ({
    page: theme.page,
    fab: theme.fab
})

class ContractsPage extends Component {
    componentDidMount() {
        document.title = formatMessage(this.props.intl, "contract", "contracts.page.title");
    }

    onAdd = () => historyPush(this.props.modulesManager, this.props.history, "contract.route.contract");

    render() {
        const { intl, classes, rights } = this.props;
        return (
            rights.includes(RIGHT_POLICYHOLDERCONTRACT_SEARCH) && (
                <div className={classes.page}>
                    <ContractSearcher />
                    {rights.includes(RIGHT_POLICYHOLDERCONTRACT_CREATE) && withTooltip(
                        <div className={classes.fab} >
                            <Fab color="primary" onClick={this.onAdd}>
                                <AddIcon />
                            </Fab>
                        </div>,
                        formatMessage(intl, "contract", "createButton.tooltip")
                    )}
                </div>
            )
        )
    }
}

const mapStateToProps = state => ({
    rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : []
});

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, null)(ContractsPage)))));
