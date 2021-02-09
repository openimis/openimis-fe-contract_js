import React from "react";
import { Paper, Grid } from "@material-ui/core";
import { withModulesManager, FormPanel, Contributions } from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import {  } from "../actions"
import { withTheme, withStyles } from "@material-ui/core/styles";
import { RIGHT_POLICYHOLDERCONTRACT_UPDATE, RIGHT_POLICYHOLDERCONTRACT_APPROVE, CONTRACTDETAILS_TAB_VALUE } from "../constants"

const styles = theme => ({
    paper: theme.paper.paper,
    tableTitle: theme.table.title,
    tabs: {
        padding: 0
    },
    selectedTab: {
        borderBottom: "4px solid white"
    },
    unselectedTab: {
        borderBottom: "4px solid transparent"
    }
});

const CONTRACT_TABS_PANEL_CONTRIBUTION_KEY = "contract.TabPanel.panel";
const CONTRACT_TABS_LABEL_CONTRIBUTION_KEY = "contract.TabPanel.label";

class ContractTabPanel extends FormPanel {
    constructor(props) {
        super(props);
        this.state = {
            value: props.rights.includes(RIGHT_POLICYHOLDERCONTRACT_UPDATE) || props.rights.includes(RIGHT_POLICYHOLDERCONTRACT_APPROVE)
                ? CONTRACTDETAILS_TAB_VALUE
                : undefined
        }
    }

    isSelected = value => value === this.state.value;

    tabStyle = value => this.isSelected(value) ? this.props.classes.selectedTab : this.props.classes.unselectedTab;

    handleChange = (_, value) => this.setState({ value });

    render() {
        const { intl, rights, classes, edited, mandatoryFieldsEmpty } = this.props;
        const { value } = this.state;
        const isTabsEnabled = !!edited && !!edited.id && !mandatoryFieldsEmpty;
        return (
            <Paper className={classes.paper}>
                <Grid container className={`${classes.tableTitle} ${classes.tabs}`}>
                    <Contributions
                        contributionKey={CONTRACT_TABS_LABEL_CONTRIBUTION_KEY}
                        intl={intl}
                        rights={rights}
                        value={value}
                        onChange={this.handleChange}
                        isSelected={this.isSelected}
                        tabStyle={this.tabStyle}
                        disabled={!isTabsEnabled}
                    />
                </Grid>
                <Contributions
                    contributionKey={CONTRACT_TABS_PANEL_CONTRIBUTION_KEY}
                    rights={rights}
                    value={value}
                    isTabsEnabled={isTabsEnabled}
                    contract={edited}
                />
            </Paper>
        )
    }
}

const mapDispatchToProps = dispatch => {
    return bindActionCreators({  }, dispatch);
};

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(connect(null, mapDispatchToProps)(ContractTabPanel)))));
