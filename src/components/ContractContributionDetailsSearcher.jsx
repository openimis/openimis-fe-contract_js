import React, { Component, Fragment } from "react"
import { injectIntl } from 'react-intl';
import { withModulesManager, formatMessageWithValues, Searcher, PublishedComponent, decodeId } from "@openimis/fe-core";
import { fetchContractContributionDetails } from "../actions"
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { DEFAULT_PAGE_SIZE, ROWS_PER_PAGE_OPTIONS } from "../constants"
import ContractContributionDetailsFilter from "./ContractContributionDetailsFilter";

const DEFAULT_ORDER_BY = "contractDetails_Insuree_Uuid";

class ContractContributionDetailsSearcher extends Component {
    fetch = params => this.props.fetchContractContributionDetails(this.props.modulesManager, params);

    headers = () => [
        "contract.insuree",
        "contract.contributionPlan",
        "contract.calculation"
    ];

    itemFormatters = () => [
        contractContributionDetails => !!contractContributionDetails.contractDetails && !!contractContributionDetails.contractDetails.insuree
            ? <PublishedComponent
                pubRef="policyHolder.PolicyHolderInsureePicker"
                value={contractContributionDetails.contractDetails.insuree}
                withLabel={false}
                policyHolderId={this.props.contract?.policyHolder?.id}
                readOnly/>
            : "",
        contractContributionDetails => !!contractContributionDetails.contributionPlan
            ? <PublishedComponent
                pubRef="contributionPlan.ContributionPlanPicker"
                value={contractContributionDetails.contributionPlan}
                withLabel={false}
                readOnly/>
            : "",
        contractContributionDetails => !!contractContributionDetails.jsonExt ? contractContributionDetails.jsonExt : "",
    ];

    sorts = () => {
        return [
            ['contractDetails_Insuree_Uuid', true],
            ['contributionPlan', true],
            ['jsonExt', true]
        ]
    }

    defaultFilters = () => {
        return {
            contractDetails_Contract_Id: {
                value: decodeId(this.props.contract.id),
                filter: `contractDetails_Contract_Id: "${decodeId(this.props.contract.id)}"`
            },
            isDeleted: {
                value: false,
                filter: "isDeleted: false"
            }
        };
    }

    render() {
        const { intl, fetchingContractContributionDetails, fetchedContractContributionDetails, errorContractContributionDetails, 
            contractContributionDetails, contractContributionDetailsPageInfo, contractContributionDetailsTotalCount } = this.props;
        return (
            <Fragment>
                <Searcher
                    module="contract"
                    FilterPane={ContractContributionDetailsFilter}
                    fetch={this.fetch}
                    items={contractContributionDetails}
                    itemsPageInfo={contractContributionDetailsPageInfo}
                    fetchingItems={fetchingContractContributionDetails}
                    fetchedItems={fetchedContractContributionDetails}
                    errorItems={errorContractContributionDetails}
                    tableTitle={formatMessageWithValues(intl, "contract", "contractContributionDetails.searcher.title", { contractContributionDetailsTotalCount })}
                    headers={this.headers}
                    itemFormatters={this.itemFormatters}
                    sorts={this.sorts}
                    rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                    defaultPageSize={DEFAULT_PAGE_SIZE}
                    defaultOrderBy={DEFAULT_ORDER_BY}
                    defaultFilters={this.defaultFilters()}
                />
            </Fragment>
        )
    }
}

const mapStateToProps = state => ({
    fetchingContractContributionDetails: state.contract.fetchingContractContributionDetails,
    fetchedContractContributionDetails: state.contract.fetchedContractContributionDetails,
    errorContractContributionDetails: state.contract.errorContractContributionDetails,
    contractContributionDetails: state.contract.contractContributionDetails,
    contractContributionDetailsPageInfo: state.contract.contractContributionDetailsPageInfo,
    contractContributionDetailsTotalCount: state.contract.contractContributionDetailsTotalCount
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchContractContributionDetails }, dispatch);
};

export default withModulesManager(injectIntl(connect(mapStateToProps, mapDispatchToProps)(ContractContributionDetailsSearcher)));
