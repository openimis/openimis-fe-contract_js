import React, { Component, Fragment } from "react"
import { injectIntl } from 'react-intl';
import { withModulesManager, formatMessageWithValues, Searcher, PublishedComponent, decodeId } from "@openimis/fe-core";
import { fetchContractDetails } from "../actions"
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { DEFAULT_PAGE_SIZE, ROWS_PER_PAGE_OPTIONS } from "../constants"
import ContractDetailsFilter from "../components/ContractDetailsFilter";

const DEFAULT_ORDER_BY = "insuree";

class ContractDetailsSearcher extends Component {
    constructor(props) {
        super(props);
        this.state = {
            queryParams: null
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.reset !== this.props.reset) {
            this.refetch();
        }
    }

    fetch = params => this.props.fetchContractDetails(this.props.modulesManager, params);

    refetch = () => this.fetch(this.state.queryParams);

    filtersToQueryParams = state => {
        let params = Object.keys(state.filters)
            .filter(f => !!state.filters[f]['filter'])
            .map(f => state.filters[f]['filter']);
        params.push(`first: ${state.pageSize}`);
        if (!state.filters.hasOwnProperty('isDeleted')) {
            params.push("isDeleted: false");
        }
        if (!!state.afterCursor) {
            params.push(`after: "${state.afterCursor}"`);
        }
        if (!!state.beforeCursor) {
            params.push(`before: "${state.beforeCursor}"`);
        }
        if (!!state.orderBy) {
            params.push(`orderBy: ["${state.orderBy}"]`);
        }
        this.setState({ queryParams: params });
        return params;
    }

    headers = () => [
        "contract.insuree",
        "contract.contributionPlanBundle",
        "contract.calculation"
    ];

    itemFormatters = () => [
        contractDetails => !!contractDetails.insuree
            ? <PublishedComponent
                pubRef="policyHolder.PolicyHolderInsureePicker"
                value={contractDetails.insuree}
                withLabel={false}
                policyHolderId={!!this.props.contract.policyHolder && decodeId(this.props.contract.policyHolder.id)}
                readOnly/>
            : "",
        contractDetails => !!contractDetails.contributionPlanBundle
            ? <PublishedComponent
                pubRef="policyHolder.PolicyHolderContributionPlanBundlePicker"
                value={contractDetails.contributionPlanBundle}
                withLabel={false}
                policyHolderId={!!this.props.contract.policyHolder && decodeId(this.props.contract.policyHolder.id)}
                readOnly/>
            : "",
        contractDetails => !!contractDetails.jsonParam ? contractDetails.jsonParam : ""
    ];

    sorts = () => {
        return [
            ['insuree', true],
            ['contributionPlanBundle', true],
            null
        ]
    }

    defaultFilters = () => {
        const { contract } = this.props;
        let filters = {
            contract_Id: {
                value: decodeId(contract.id),
                filter: `contract_Id: "${decodeId(contract.id)}"`
            }
        };
        if (!!contract.policyHolder) {
            filters.policyHolder_Id = {
                value: decodeId(contract.policyHolder.id),
                filter: `contract_PolicyHolder_Id: "${decodeId(contract.policyHolder.id)}"`
            };
        }
        return filters;
    }

    render() {
        const { intl, fetchingContractDetails, fetchedContractDetails, errorContractDetails, 
            contractDetails, contractDetailsPageInfo, contractDetailsTotalCount } = this.props;
        return (
            <Fragment>
                <Searcher
                    module="contract"
                    FilterPane={ContractDetailsFilter}
                    fetch={this.fetch}
                    items={contractDetails}
                    itemsPageInfo={contractDetailsPageInfo}
                    fetchingItems={fetchingContractDetails}
                    fetchedItems={fetchedContractDetails}
                    errorItems={errorContractDetails}
                    tableTitle={formatMessageWithValues(intl, "contract", "contractDetails.searcher.title", { contractDetailsTotalCount })}
                    headers={this.headers}
                    itemFormatters={this.itemFormatters}
                    filtersToQueryParams={this.filtersToQueryParams}
                    sorts={this.sorts}
                    rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                    defaultPageSize={DEFAULT_PAGE_SIZE}
                    defaultOrderBy={DEFAULT_ORDER_BY}
                    rowLocked={this.isRowDisabled}
                    rowDisabled={this.isRowDisabled}
                    defaultFilters={this.defaultFilters()}
                />
            </Fragment>
        )
    }
}

const mapStateToProps = state => ({
    fetchingContractDetails: state.contract.fetchingContractDetails,
    fetchedContractDetails: state.contract.fetchedContractDetails,
    errorContractDetails: state.contract.errorContractDetails,
    contractDetails: state.contract.contractDetails,
    contractDetailsPageInfo: state.contract.contractDetailsPageInfo,
    contractDetailsTotalCount: state.contract.contractDetailsTotalCount
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchContractDetails }, dispatch);
};

export default withModulesManager(injectIntl(connect(mapStateToProps, mapDispatchToProps)(ContractDetailsSearcher)));
