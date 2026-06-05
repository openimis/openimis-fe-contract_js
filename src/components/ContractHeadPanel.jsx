import React, { Fragment } from "react";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";

import { Grid, Divider, Typography } from "@mui/material";
import { useTheme, styled } from "@mui/material/styles";

import {
  withModulesManager,
  formatMessage,
  FormPanel,
  TextInput,
  FormattedMessage,
  PublishedComponent,
  NumberInput,
  ValidatedTextInput,
} from "@openimis/fe-core";
import {
  contractCodeValidation,
  contractCodeSetValid,
  contractCodeClear,
} from "../actions";
import {
  MAX_CODE_LENGTH,
  MAX_PAYMENT_REFERENCE_LENGTH,
  MIN_AMOUNT_VALUE,
  MIN_AMENDMENT_VALUE,
  DEFAULT_STATE_VALUE,
  DEFAULT_AMENDMENT_VALUE,
  RIGHT_POLICYHOLDERCONTRACT_APPROVE,
  RIGHT_POLICYHOLDERCONTRACT_UPDATE,
  RIGHT_PORTALPOLICYHOLDERCONTRACT_UPDATE,
} from "../constants";
import ContractStatePicker from "../pickers/ContractStatePicker";

const StyledGrid = styled(Grid)(({ theme }) => ({
  '& .tableTitle': theme.table?.title ?? {},
  '& .item': theme.paper?.item ?? {},
  '& .fullHeight': {
    height: "100%",
  },
}));

class ContractHeadPanel extends FormPanel {
  constructor(props) {
    super(props);
    this.state = {
      isPolicyHolderSet: false,
    };
    this.updatableFields = [
      "code",
      "policyHolder",
      "paymentReference",
      "dateValidFrom",
      "dateValidTo",
    ];
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this._componentDidUpdate(prevProps, prevState, snapshot);
    if (
      prevProps.savedContract !== this.props.savedContract &&
      !!this.props.savedContract
    ) {
      this.setState(
        (_, props) => ({
          isPolicyHolderSet: !!props.savedContract.policyHolder,
        }),
        () => this.setReadOnlyFields()
      );
    }
  }

  setReadOnlyFields = () =>
    this.props.setReadOnlyFields([
      ...this.updatableFields.filter((f) => this.isReadOnly(f)),
    ]);

  isReadOnly = (field) => {
    const { rights, isUpdatable, isApprovable } = this.props;
    switch (field) {
      case "policyHolder":
        return this.state.isPolicyHolderSet;
      case "code":
      case "dateValidFrom":
      case "dateValidTo":
        if (rights.includes(RIGHT_POLICYHOLDERCONTRACT_APPROVE)) {
          return isApprovable ? true : !isUpdatable;
        } else return true;
      default:
        if (
          [
            RIGHT_POLICYHOLDERCONTRACT_UPDATE,
            RIGHT_POLICYHOLDERCONTRACT_APPROVE,
            RIGHT_PORTALPOLICYHOLDERCONTRACT_UPDATE,
          ].some((right) => rights.includes(right))
        ) {
          return isApprovable ? false : !isUpdatable;
        } else return true;
    }
  };

  shouldValidate = (input) => {
    const { savedContractCode } = this.props;
    return input !== savedContractCode;
  };

  render() {
    const {
      intl,
      edited,
      mandatoryFieldsEmpty,
      readOnlyFields,
      isAmendment,
      isPolicyHolderPredefined,
      isCodeValid,
      isCodeValidating,
      codeValidationError,
    } = this.props;
    return (
      <Fragment>
        <StyledGrid container className="tableTitle">
          <Grid>
            <Grid
              container
              align="center"
              justify="center"
              direction="column"
              className="fullHeight"
            >
              <Grid>
                <Typography>
                  <FormattedMessage module="contract" id="headPanel.title" />
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </StyledGrid>
        <Divider />
        {mandatoryFieldsEmpty && (
          <Fragment>
            <div className="item">
              <FormattedMessage
                module="contract"
                id="mandatoryFieldsEmptyError"
              />
            </div>
            <Divider />
          </Fragment>
        )}
        <StyledGrid container className="item">
          <Grid size={2} className="item">
            <ValidatedTextInput
              itemQueryIdentifier="contractCode"
              codeTakenLabel="contract.codeTaken"
              shouldValidate={this.shouldValidate}
              isValid={isCodeValid}
              isValidating={isCodeValidating}
              validationError={codeValidationError}
              action={contractCodeValidation}
              clearAction={contractCodeClear}
              setValidAction={contractCodeSetValid}
              module="contract"
              required={true}
              label="code"
              value={!!edited && !!edited.code ? edited.code : ""}
              inputProps={{ maxLength: MAX_CODE_LENGTH }}
              onChange={(v) => this.updateAttribute("code", v)}
              readOnly={readOnlyFields.includes("code") || isAmendment}
            />
          </Grid>
          <Grid size={2} className="item">
            <PublishedComponent
              pubRef="policyHolder.PolicyHolderPicker"
              module="contract"
              withNull={false}
              value={!!edited && !!edited.policyHolder && edited.policyHolder}
              onChange={(v) => this.updateAttribute("policyHolder", v)}
              required
              readOnly={
                readOnlyFields.includes("policyHolder") ||
                isAmendment ||
                isPolicyHolderPredefined
              }
            />
          </Grid>
          <Grid size={2} className="item">
            <NumberInput
              module="contract"
              label="amountNotified"
              min={MIN_AMOUNT_VALUE}
              displayZero
              value={
                !!edited && !!edited.amountNotified && edited.amountNotified
              }
              readOnly
            />
          </Grid>
          <Grid size={2} className="item">
            <NumberInput
              module="contract"
              label="amountRectified"
              min={MIN_AMOUNT_VALUE}
              displayZero
              value={
                !!edited && !!edited.amountRectified && edited.amountRectified
              }
              readOnly
            />
          </Grid>
          <Grid size={2} className="item">
            <NumberInput
              module="contract"
              label="amountDue"
              min={MIN_AMOUNT_VALUE}
              displayZero
              value={!!edited && !!edited.amountDue && edited.amountDue}
              readOnly
            />
          </Grid>
          <Grid size={2} className="item">
            <PublishedComponent
              pubRef="core.DatePicker"
              module="contract"
              label="dateApproved"
              value={!!edited && !!edited.dateApproved && edited.dateApproved}
              readOnly
            />
          </Grid>
          <Grid size={2} className="item">
            <PublishedComponent
              pubRef="core.DatePicker"
              module="contract"
              label="datePaymentDue"
              value={
                !!edited && !!edited.datePaymentDue && edited.datePaymentDue
              }
              readOnly
            />
          </Grid>
          <Grid size={2} className="item">
            <ContractStatePicker
              module="contract"
              label="state"
              value={
                !!edited && !!edited.state ? edited.state : DEFAULT_STATE_VALUE
              }
              readOnly
            />
          </Grid>
          <Grid size={2} className="item">
            <TextInput
              module="contract"
              label="paymentReference"
              inputProps={{ maxLength: MAX_PAYMENT_REFERENCE_LENGTH }}
              value={
                !!edited && !!edited.paymentReference && edited.paymentReference
              }
              onChange={(v) => this.updateAttribute("paymentReference", v)}
              readOnly={readOnlyFields.includes("paymentReference")}
            />
          </Grid>
          <Grid size={2} className="item">
            <NumberInput
              module="contract"
              label="amendment"
              min={MIN_AMENDMENT_VALUE}
              displayZero
              value={
                !!edited && !!edited.amendment
                  ? edited.amendment
                  : DEFAULT_AMENDMENT_VALUE
              }
              readOnly
            />
          </Grid>
          <Grid size={2} className="item">
            <PublishedComponent
              pubRef="core.DatePicker"
              module="contract"
              label="dateValidFrom"
              required
              value={!!edited && !!edited.dateValidFrom && edited.dateValidFrom}
              onChange={(v) => this.updateAttribute("dateValidFrom", v)}
              readOnly={readOnlyFields.includes("dateValidFrom") || isAmendment}
              // NOTE: maxDate cannot be passed if dateValidTo does not exist.
              // Passing any other falsy value will block months manipulation.
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...(edited.dateValidTo ? { maxDate: edited.dateValidTo } : null)}
            />
          </Grid>
          <Grid size={2} className="item">
            <PublishedComponent
              pubRef="core.DatePicker"
              module="contract"
              label="dateValidTo"
              required
              value={!!edited && !!edited.dateValidTo && edited.dateValidTo}
              onChange={(v) => this.updateAttribute("dateValidTo", v)}
              readOnly={readOnlyFields.includes("dateValidTo")}
              // NOTE: minDate cannot be passed if dateValidFrom does not exist.
              // Passing any other falsy value will block months manipulation.
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...(edited.dateValidFrom ? { minDate: edited.dateValidFrom } : null)}
            />
          </Grid>
        </StyledGrid>
      </Fragment>
    );
  }
}

const mapStateToProps = (store) => ({
  isCodeValid: store.contract.validationFields?.contractCode?.isValid,
  isCodeValidating: store.contract.validationFields?.contractCode?.isValidating,
  codeValidationError:
    store.contract.validationFields?.contractCode?.validationError,
  savedContractCode: store.contract.contract?.code,
});

export { StyledGrid };
export { ContractHeadPanel };
export default withModulesManager(
  injectIntl(
    connect(mapStateToProps)(ContractHeadPanel)
  )
);
