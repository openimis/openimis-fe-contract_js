import React, { Component } from "react"
import { injectIntl } from 'react-intl';
import { connect } from "react-redux";
import { formatMessage, TextInput, PublishedComponent, decodeId, GRID_RESPONSIVE_STANDARD } from "@openimis/fe-core";
import { Grid } from "@mui/material";
import { useTheme, styled } from "@mui/material/styles";
import { STARTS_WITH_LOOKUP } from "../constants"

const StyledGrid = styled(Grid)(({ theme }) => ({
    '& .form': {
        padding: 0
    },
    '& .item': {
        padding: theme.spacing(1)
    }
}));

class ContractContributionDetailsFilter extends Component {
    _filterValue = k => {
        const { filters } = this.props;
        return !!filters[k] ? filters[k].value : null;
    }

    _filterTextFieldValue = (key) => {
        const { filters } = this.props;
        return !!filters[key] ? filters[key].value : "";
    }

    render() {
        const { intl, onChangeFilters, policyHolder } = this.props;
        return (
            <StyledGrid container className="form">
                <StyledGrid size={GRID_RESPONSIVE_STANDARD} className="item">
                    <TextInput
                        module="contract" 
                        label="insureeChfId"
                        value={this._filterTextFieldValue('contractDetails_Insuree_ChfId')}
                        onChange={v => onChangeFilters([{
                            id: 'contractDetails_Insuree_ChfId',
                            value: v,
                            filter: `contractDetails_Insuree_ChfId_${STARTS_WITH_LOOKUP}: "${v}"`
                        }])}
                    />
                </StyledGrid>
                <StyledGrid size={GRID_RESPONSIVE_STANDARD} className="item">
                    <PublishedComponent
                        pubRef="policyHolder.PolicyHolderContributionPlanBundlePicker"
                        withNull
                        nullLabel={formatMessage(intl, "contract", "any")}
                        policyHolderId={!!policyHolder && decodeId(policyHolder.id)}
                        value={this._filterValue('contractDetails_ContributionPlanBundle_Id')}
                        onChange={v => onChangeFilters([{
                            id: 'contractDetails_ContributionPlanBundle_Id',
                            value: v,
                            filter: `contractDetails_ContributionPlanBundle_Id: "${!!v && decodeId(v.id)}"`
                        }])}
                    />
                </StyledGrid>
                <StyledGrid size={GRID_RESPONSIVE_STANDARD} className="item">
                    <PublishedComponent
                        pubRef="contributionPlan.ContributionPlanPicker"
                        withNull
                        nullLabel={formatMessage(intl, "contract", "any")}
                        value={this._filterValue('contributionPlan_Id')}
                        onChange={v => onChangeFilters([{
                            id: 'contributionPlan_Id',
                            value: v,
                            filter: `contributionPlan_Id: "${!!v && decodeId(v.id)}"`
                        }])}
                    />
                </StyledGrid>
                <StyledGrid size={GRID_RESPONSIVE_STANDARD} className="item">
                    <PublishedComponent
                        pubRef="product.ProductPicker"
                        withNull={true}
                        label={formatMessage(intl, "contract", "benefitPlan")}
                        value={this._filterValue('contributionPlan_BenefitPlan_Id')}
                        onChange={v => onChangeFilters([{
                            id: 'contributionPlan_BenefitPlan_Id',
                            value: v,
                            filter: `contributionPlan_BenefitPlan_Id: ${!!v && decodeId(v.id)}`
                        }])}
                    />
                </StyledGrid>
            </StyledGrid>
        )
    }
}

const mapStateToProps = state => ({
    policyHolder: !!state.contract.contract ? state.contract.contract.policyHolder : null
});

export { StyledGrid };
export default injectIntl(connect(mapStateToProps, null)((ContractContributionDetailsFilter)));
