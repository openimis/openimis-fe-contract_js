import React, { Component } from "react"
import { injectIntl } from 'react-intl';
import { withModulesManager, formatMessage, TextInput, NumberInput, PublishedComponent, decodeId } from "@openimis/fe-core";
import { Grid, FormControlLabel, Checkbox } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { DATE_TO_DATETIME_SUFFIX, GREATER_OR_EQUAL_LOOKUP, LESS_OR_EQUAL_LOOKUP, CONTAINS_LOOKUP, MIN_AMENDMENT_VALUE } from "../constants"
import ContractStatePicker from "../pickers/ContractStatePicker";

const styles = theme => ({
    form: {
        padding: 0
    },
    item: {
        padding: theme.spacing(1)
    }
});

class ContractFilter extends Component {
    _filterValue = k => {
        const { filters } = this.props;
        return !!filters[k] ? filters[k].value : null
    }

    _onChangeFilter = (k, v) => {
        this.props.onChangeFilters([
            {
                id: k,
                value: v,
                filter: `${k}: ${v}`
            }
        ])
    }

    _onChangeStringFilter = (k, v, lookup) => {
        this.props.onChangeFilters([
            {
                id: k,
                value: v,
                filter: `${k}_${lookup}: "${v}"`
            }
        ])
    }

    _onChangeDateFilter = (k, v, lookup) => {
        this.props.onChangeFilters([
            {
                id: k,
                value: v,
                filter: `${k}_${lookup}: "${v}${DATE_TO_DATETIME_SUFFIX}"`
            }
        ])
    }

    render() {
        const { intl, classes, onChangeFilters } = this.props;
        return (
            <Grid container className={classes.form}>
                <Grid item xs={2} className={classes.item}>
                    <TextInput
                        module="contract"
                        label="code"
                        value={this._filterValue('code')}
                        onChange={v => this._onChangeStringFilter('code', v, CONTAINS_LOOKUP)}
                    />
                </Grid>
                <Grid item xs={2} className={classes.item}>
                    <PublishedComponent
                        pubRef="policyHolder.PolicyHolderPicker"
                        module="contract"
                        withNull
                        nullLabel={formatMessage(intl, "contract", "any")}
                        value={this._filterValue('policyHolder_Id')}
                        onChange={v => onChangeFilters([{
                            id: 'policyHolder_Id',
                            value: v,
                            filter: `policyHolder_Id: "${!!v && decodeId(v.id)}"`
                        }])}
                    />
                </Grid>
                <Grid item xs={2} className={classes.item}>
                    <NumberInput
                        module="contract"
                        label="amountFrom"
                        value={this._filterValue('amountFrom')}
                        onChange={v => onChangeFilters([{
                            id: 'amountFrom',
                            value: v,
                            filter: `amountDue_${GREATER_OR_EQUAL_LOOKUP}: ${v}`
                        }])}
                    />
                </Grid>
                <Grid item xs={2} className={classes.item}>
                    <NumberInput
                        module="contract"
                        label="amountTo"
                        value={this._filterValue('amountTo')}
                        onChange={v => onChangeFilters([{
                            id: 'amountTo',
                            value: v,
                            filter: `amountDue_${LESS_OR_EQUAL_LOOKUP}: ${v}`
                        }])}
                    />
                </Grid>
                <Grid item xs={2} className={classes.item}>
                    <PublishedComponent
                        pubRef="core.DatePicker"
                        module="contract"
                        label="datePaymentDue"
                        value={this._filterValue('datePaymentDue')}
                        onChange={v => onChangeFilters([{
                            id: 'datePaymentDue',
                            value: v,
                            filter: `datePaymentDue: "${v}"`
                        }])}
                    />
                </Grid>
                <Grid item xs={2} className={classes.item}>
                    <ContractStatePicker
                        module="contract"
                        label="state"
                        value={this._filterValue('state')}
                        onChange={v => this._onChangeFilter('state', v)}
                        withNull
                        nullLabel={formatMessage(intl, "contract", "any")}
                    />
                </Grid>
                <Grid item xs={2} className={classes.item}>
                    <TextInput
                        module="contract"
                        label="paymentReference"
                        value={this._filterValue('paymentReference')}
                        onChange={v => this._onChangeStringFilter('paymentReference', v, CONTAINS_LOOKUP)}
                    />
                </Grid>
                <Grid item xs={2} className={classes.item}>
                    <NumberInput
                        module="contract"
                        label="amendment"
                        min={MIN_AMENDMENT_VALUE}
                        value={this._filterValue('amendment')}
                        onChange={v => this._onChangeFilter('amendment', !!v ? v : null)}
                    />
                </Grid>
                <Grid item xs={2} className={classes.item}>
                    <PublishedComponent
                        pubRef="core.DatePicker"
                        module="contract"
                        label="dateValidFrom"
                        value={this._filterValue('dateValidFrom')}
                        onChange={v => this._onChangeDateFilter('dateValidFrom', v, GREATER_OR_EQUAL_LOOKUP)}
                    />
                </Grid>
                <Grid item xs={2} className={classes.item}>
                    <PublishedComponent
                        pubRef="core.DatePicker"
                        module="contract"
                        label="dateValidTo"
                        value={this._filterValue('dateValidTo')}
                        onChange={v => this._onChangeDateFilter('dateValidTo', v, LESS_OR_EQUAL_LOOKUP)}
                    />
                </Grid>
                <Grid item xs={2} className={classes.item}>
                    <FormControlLabel
                        control={<Checkbox 
                            checked={!!this._filterValue('isDeleted')}
                            onChange={event => this._onChangeFilter('isDeleted', event.target.checked)}
                            name="isDeleted" 
                        />}
                        label={formatMessage(intl, "contract", "isDeleted")}
                    />
                </Grid>
            </Grid>
        )
    }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(ContractFilter))));
