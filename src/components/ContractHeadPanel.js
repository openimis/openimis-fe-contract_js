import React, { Fragment } from "react";
import { Grid, Divider, Typography } from "@material-ui/core";
import { withModulesManager, formatMessage, FormPanel, TextInput,
    FormattedMessage, PublishedComponent, NumberInput } from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { MAX_CODE_LENGTH, MAX_PAYMENT_REFERENCE_LENGTH, MIN_AMOUNT_VALUE, MIN_AMENDMENT_VALUE, DEFAULT_STATE_VALUE,
    DEFAULT_AMENDMENT_VALUE, RIGHT_POLICYHOLDERCONTRACT_APPROVE, RIGHT_POLICYHOLDERCONTRACT_UPDATE, DATE_TO_DATETIME_SUFFIX } from "../constants"
import ContractStatePicker from "../pickers/ContractStatePicker";

const styles = theme => ({
    tableTitle: theme.table.title,
    item: theme.paper.item,
    fullHeight: {
        height: "100%"
    }
});

class ContractHeadPanel extends FormPanel {
    constructor(props) {
        super(props);
        this.state = {
            isPolicyHolderSet: false
        };
        this.updatableFields = ['code', 'policyHolder', 'dateApproved',
            'datePaymentDue', 'paymentReference', 'dateValidFrom', 'dateValidTo'];
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this._componentDidUpdate(prevProps, prevState, snapshot);
        if (prevProps.savedContract !== this.props.savedContract && !!this.props.savedContract) {
            this.setState(
                (_, props) => ({ isPolicyHolderSet: !!props.savedContract.policyHolder }),
                () => this.setReadOnlyFields()
            );
        }
    }

    setReadOnlyFields = () => this.props.setReadOnlyFields([...this.updatableFields.filter(f => this.isReadOnly(f))]);

    isReadOnly = field => {
        const { rights, isUpdatable, isApprovable } = this.props;
        switch (field) {
            case 'policyHolder':
                return this.state.isPolicyHolderSet;
            case 'code':
            case 'dateValidFrom':
            case 'dateValidTo':
                if (rights.includes(RIGHT_POLICYHOLDERCONTRACT_APPROVE)) {
                    return isApprovable ? true : !isUpdatable;
                } else return true;
            default:
                if (rights.includes(RIGHT_POLICYHOLDERCONTRACT_UPDATE) || rights.includes(RIGHT_POLICYHOLDERCONTRACT_APPROVE)) {
                    return isApprovable ? false : !isUpdatable;
                } else return true;
        }
    }

    render() {
        const { intl, classes, edited, mandatoryFieldsEmpty, readOnlyFields, isAmendment } = this.props;
        return (
            <Fragment>
                <Grid container className={classes.tableTitle}>
                    <Grid item>
                        <Grid container align="center" justify="center" direction="column" className={classes.fullHeight}>
                            <Grid item>
                                <Typography>
                                    <FormattedMessage module="contract" id="headPanel.title" />
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                <Divider />
                {mandatoryFieldsEmpty &&
                    <Fragment>
                        <div className={classes.item}>
                            <FormattedMessage module="contract" id="mandatoryFieldsEmptyError" />
                        </div>
                        <Divider />
                    </Fragment>
                }
                <Grid container className={classes.item}>
                    <Grid item xs={2} className={classes.item}>
                        <TextInput
                            module="contract"
                            label="code"
                            required
                            inputProps={{ maxLength: MAX_CODE_LENGTH }}
                            value={!!edited && !!edited.code ? edited.code : ""}
                            onChange={v => this.updateAttribute('code', v)}
                            readOnly={readOnlyFields.includes('code') || isAmendment}
                        />
                    </Grid>
                    <Grid item xs={2} className={classes.item}>
                        <PublishedComponent
                            pubRef="policyHolder.PolicyHolderPicker"
                            module="contract"
                            withNull
                            nullLabel={formatMessage(intl, "contract", "emptyLabel")}
                            value={!!edited && !!edited.policyHolder && edited.policyHolder}
                            onChange={v => this.updateAttribute('policyHolder', v)}
                            readOnly={readOnlyFields.includes('policyHolder') || isAmendment}
                        />
                    </Grid>
                    <Grid item xs={2} className={classes.item}>
                        <NumberInput
                            module="contract"
                            label="amountNotified"
                            min={MIN_AMOUNT_VALUE}
                            displayZero
                            value={!!edited && !!edited.amountNotified && edited.amountNotified}
                            readOnly
                        />
                    </Grid>
                    <Grid item xs={2} className={classes.item}>
                        <NumberInput
                            module="contract"
                            label="amountRectified"
                            min={MIN_AMOUNT_VALUE}
                            displayZero
                            value={!!edited && !!edited.amountRectified && edited.amountRectified}
                            readOnly
                        />
                    </Grid>
                    <Grid item xs={2} className={classes.item}>
                        <NumberInput
                            module="contract"
                            label="amountDue"
                            min={MIN_AMOUNT_VALUE}
                            displayZero
                            value={!!edited && !!edited.amountDue && edited.amountDue}
                            readOnly
                        />
                    </Grid>
                    <Grid item xs={2} className={classes.item}>
                        <PublishedComponent
                            pubRef="core.DatePicker"
                            module="contract"
                            label="dateApproved"
                            value={!!edited && !!edited.dateApproved && edited.dateApproved}
                            onChange={v => this.updateAttribute('dateApproved', `${v}${DATE_TO_DATETIME_SUFFIX}`)}
                            readOnly={readOnlyFields.includes('dateApproved')}
                        />
                    </Grid>
                    <Grid item xs={2} className={classes.item}>
                        <PublishedComponent
                            pubRef="core.DatePicker"
                            module="contract"
                            label="datePaymentDue"
                            value={!!edited && !!edited.datePaymentDue && edited.datePaymentDue}
                            onChange={v => this.updateAttribute('datePaymentDue', v)}
                            readOnly={readOnlyFields.includes('datePaymentDue')}
                        />
                    </Grid>
                    <Grid item xs={2} className={classes.item}>
                        <ContractStatePicker
                            module="contract"
                            label="state"
                            value={!!edited && !!edited.state ? edited.state : DEFAULT_STATE_VALUE}
                            readOnly
                        />
                    </Grid>
                    <Grid item xs={2} className={classes.item}>
                        <TextInput
                            module="contract"
                            label="paymentReference"
                            inputProps={{ maxLength: MAX_PAYMENT_REFERENCE_LENGTH }}
                            value={!!edited && !!edited.paymentReference && edited.paymentReference}
                            onChange={v => this.updateAttribute('paymentReference', v)}
                            readOnly={readOnlyFields.includes('paymentReference')}
                        />
                    </Grid>
                    <Grid item xs={2} className={classes.item}>
                        <NumberInput
                            module="contract"
                            label="amendment"
                            min={MIN_AMENDMENT_VALUE}
                            displayZero
                            value={!!edited && !!edited.amendment ? edited.amendment : DEFAULT_AMENDMENT_VALUE}
                            readOnly
                        />
                    </Grid>
                    <Grid item xs={2} className={classes.item}>
                        <PublishedComponent
                            pubRef="core.DatePicker"
                            module="contract"
                            label="dateValidFrom"
                            required
                            value={!!edited && !!edited.dateValidFrom && edited.dateValidFrom}
                            onChange={v => this.updateAttribute('dateValidFrom', v)}
                            readOnly={readOnlyFields.includes('dateValidFrom') || isAmendment}
                        />
                    </Grid>
                    <Grid item xs={2} className={classes.item}>
                        <PublishedComponent
                            pubRef="core.DatePicker"
                            module="contract"
                            label="dateValidTo"
                            required
                            value={!!edited && !!edited.dateValidTo && edited.dateValidTo}
                            onChange={v => this.updateAttribute('dateValidTo', v)}
                            readOnly={readOnlyFields.includes('dateValidTo')}
                        />
                    </Grid>
                </Grid>
            </Fragment>
        )
    }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(ContractHeadPanel))))
