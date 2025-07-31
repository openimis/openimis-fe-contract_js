import React, { Component } from "react"
import { injectIntl } from 'react-intl';
import { withModulesManager, formatMessage, TextInput, NumberInput, PublishedComponent } from "@openimis/fe-core";
import { Grid, FormControlLabel, Checkbox } from "@mui/material";
import { useTheme, styled } from "@mui/material/styles";
import { DATE_TO_DATETIME_SUFFIX, GREATER_OR_EQUAL_LOOKUP, LESS_OR_EQUAL_LOOKUP, CONTAINS_LOOKUP, MIN_AMENDMENT_VALUE } from "../constants"
import ContractStatePicker from "../pickers/ContractStatePicker";

const StyledGrid = styled(Grid)(({ theme }) => ({
    '& .form': {
        padding: 0
    },
    '& .item': {
        padding: theme.spacing(1)
    }
}));

class ContractFilter extends Component {
    componentDidMount() {
        /**
         * @see FilterExt prop can pass @see PolicyHolder entity
         * to disable filtering by @see PolicyHolder if only @see Contract entities
         * with a specific @see PolicyHolder assigned are to be displayed
         */
        this.isFilteredByDefaultPolicyHolder = !!this.props.FilterExt && !!this.props.FilterExt.id;
    }

    _filterValue = k => {
        const { filters } = this.props;
        return !!filters[k] ? filters[k].value : null;
    }

    _filterTextFieldValue = (key) => {
        const { filters } = this.props;
        return !!filters[key] ? filters[key].value : "";
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
        const { intl, onChangeFilters } = this.props;
        return (
            <StyledGrid container className="form">
                <StyledGrid item xs={2} className="item">
                    <TextInput
                        module="contract"
                        label="code"
                        value={this._filterTextFieldValue('code')}
                        onChange={v => this._onChangeStringFilter('code', v, CONTAINS_LOOKUP)}
                    />
                </StyledGrid>
                {!this.isFilteredByDefaultPolicyHolder && (
                    <StyledGrid item xs={2} className="item">
                        <PublishedComponent
                            pubRef="policyHolder.PolicyHolderPicker"
                            module="contract"
                            withNull
                            nullLabel={formatMessage(intl, "contract", "any")}
                            value={this._filterValue('policyHolder_Id')}
                            onChange={v => onChangeFilters([{
                                id: 'policyHolder_Id',
                                value: v,
                                filter: `policyHolder_Id: "${!!v && v.id}"`
                            }])}
                        />
                    </StyledGrid>
                )}
                <StyledGrid item xs={2} className="item">
                    <NumberInput
                        module="contract"
                        label="amountFrom"
                        value={this._filterValue('amountFrom')}
                        onChange={v => onChangeFilters([{
                            id: 'amountFrom',
                            value: !!v ? v : null,
                            filter: `amountFrom: "${v}"`
                        }])}
                    />
                </StyledGrid>
                <StyledGrid item xs={2} className="item">
                    <NumberInput
                        module="contract"
                        label="amountTo"
                        value={this._filterValue('amountTo')}
                        onChange={v => onChangeFilters([{
                            id: 'amountTo',
                            value: !!v ? v : null,
                            filter: `amountTo: "${v}"`
                        }])}
                    />
                </StyledGrid>
                <StyledGrid item xs={2} className="item">
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
                </StyledGrid>
                <StyledGrid item xs={2} className="item">
                    <ContractStatePicker
                        module="contract"
                        label="state"
                        value={this._filterValue('state')}
                        onChange={v => this._onChangeFilter('state', v)}
                        withNull
                        nullLabel={formatMessage(intl, "contract", "any")}
                    />
                </StyledGrid>
                <StyledGrid item xs={2} className="item">
                    <TextInput
                        module="contract"
                        label="paymentReference"
                        value={this._filterTextFieldValue('paymentReference')}
                        onChange={v => this._onChangeStringFilter('paymentReference', v, CONTAINS_LOOKUP)}
                    />
                </StyledGrid>
                <StyledGrid item xs={2} className="item">
                    <NumberInput
                        module="contract"
                        label="amendment"
                        min={MIN_AMENDMENT_VALUE}
                        value={this._filterValue('amendment')}
                        onChange={v => this._onChangeFilter('amendment', !!v ? v : null)}
                    />
                </StyledGrid>
                <StyledGrid item xs={2} className="item">
                    <PublishedComponent
                        pubRef="core.DatePicker"
                        module="contract"
                        label="dateValidFrom"
                        value={this._filterValue('dateValidFrom')}
                        onChange={v => this._onChangeDateFilter('dateValidFrom', v, GREATER_OR_EQUAL_LOOKUP)}
                    />
                </StyledGrid>
                <StyledGrid item xs={2} className="item">
                    <PublishedComponent
                        pubRef="core.DatePicker"
                        module="contract"
                        label="dateValidTo"
                        value={this._filterValue('dateValidTo')}
                        onChange={v => this._onChangeDateFilter('dateValidTo', v, LESS_OR_EQUAL_LOOKUP)}
                    />
                </StyledGrid>
                <StyledGrid item xs={2} className="item">
                    <FormControlLabel
                        control={<Checkbox 
                            checked={!!this._filterValue('isDeleted')}
                            onChange={event => this._onChangeFilter('isDeleted', event.target.checked)}
                            name="isDeleted" 
                        />}
                        label={formatMessage(intl, "contract", "isDeleted")}
                    />
                </StyledGrid>
            </StyledGrid>
        )
    }
}

export default withModulesManager(injectIntl(ContractFilter));
