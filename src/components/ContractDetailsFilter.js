import React, { Component } from "react"
import { injectIntl } from 'react-intl';
import { withModulesManager, formatMessage, TextInput, PublishedComponent, decodeId } from "@openimis/fe-core";
import { Grid } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { STARTS_WITH_LOOKUP } from "../constants"

const styles = theme => ({
    form: {
        padding: 0
    },
    item: {
        padding: theme.spacing(1)
    }
});

class ContractDetailsFilter extends Component {
    _filterValue = k => {
        const { filters } = this.props;
        return !!filters[k] ? filters[k].value : null
    }

    render() {
        const { intl, classes, filters, onChangeFilters } = this.props;
        return (
            <Grid container className={classes.form}>
                <Grid item xs={3} className={classes.item}>
                    <TextInput
                        module="contract" 
                        label="insureeChfId"
                        value={this._filterValue('insuree_ChfId')}
                        onChange={v => onChangeFilters([{
                            id: 'insuree_ChfId',
                            value: v,
                            filter: `insuree_ChfId_${STARTS_WITH_LOOKUP}: "${v}"`
                        }])}
                    />
                </Grid>
                <Grid item xs={3} className={classes.item}>
                    <PublishedComponent
                        pubRef="policyHolder.PolicyHolderContributionPlanBundlePicker"
                        withNull
                        nullLabel={formatMessage(intl, "contract", "any")}
                        policyHolderId={!!filters['policyHolder_Id'] && filters['policyHolder_Id'].value}
                        value={this._filterValue('contributionPlanBundle_Id')}
                        onChange={v => onChangeFilters([{
                            id: 'contributionPlanBundle_Id',
                            value: v,
                            filter: `contributionPlanBundle_Id: "${!!v && decodeId(v.id)}"`
                        }])}
                    />
                </Grid>
            </Grid>
        )
    }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(ContractDetailsFilter))));
