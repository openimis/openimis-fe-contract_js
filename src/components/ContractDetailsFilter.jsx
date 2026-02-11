import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import {
  withModulesManager,
  formatMessage,
  TextInput,
  PublishedComponent,
  decodeId,
  GRID_RESPONSIVE_STANDARD,
} from "@openimis/fe-core";
import { Grid } from "@mui/material";
import { styled } from "@mui/material/styles";
import { STARTS_WITH_LOOKUP } from "../constants";

// Styled component
const StyledGrid = styled(Grid)(({ theme }) => ({
  '&.form': {
    padding: 0,
  },
  '& .item': {
    padding: theme.spacing(1),
  },
}));

class ContractDetailsFilter extends Component {
  _filterValue = (key) => {
    const { filters } = this.props;
    return filters?.[key]?.value ?? null;
  };

  _filterTextFieldValue = (key) => {
    const { filters } = this.props;
    return filters?.[key]?.value ?? "";
  };

  render() {
    const { intl, onChangeFilters, policyHolder } = this.props;

    return (
      <StyledGrid container className="form">
        <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
          <TextInput
            module="contract"
            label="insureeChfId"
            value={this._filterTextFieldValue("insuree_ChfId")}
            onChange={(v) =>
              onChangeFilters([
                {
                  id: "insuree_ChfId",
                  value: v,
                  filter: `insuree_ChfId_${STARTS_WITH_LOOKUP}: "${v}"`,
                },
              ])
            }
          />
        </Grid>

        <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
          <PublishedComponent
            pubRef="policyHolder.PolicyHolderContributionPlanBundlePicker"
            withNull
            nullLabel={formatMessage(intl, "contract", "any")}
            policyHolderId={policyHolder ? decodeId(policyHolder.id) : null}
            value={this._filterValue("contributionPlanBundle_Id")}
            onChange={(v) =>
              onChangeFilters([
                {
                  id: "contributionPlanBundle_Id",
                  value: v,
                  filter: `contributionPlanBundle_Id: "${v ? decodeId(v.id) : ""}"`,
                },
              ])
            }
          />
        </Grid>
      </StyledGrid>
    );
  }
}

const mapStateToProps = (state) => ({
  policyHolder: state.contract?.contract?.policyHolder ?? null,
});

export { StyledGrid };
export { ContractDetailsFilter };
export default withModulesManager(
  injectIntl(connect(mapStateToProps)(ContractDetailsFilter))
);
