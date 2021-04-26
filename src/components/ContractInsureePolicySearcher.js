import React, { Component } from "react";
import { injectIntl } from "react-intl";
import {
    withModulesManager,
    formatMessageWithValues,
    Searcher,
    PublishedComponent,
    decodeId,
} from "@openimis/fe-core";
import { fetchInsureePolicies } from "../actions";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import {
    DEFAULT_PAGE_SIZE,
    ROWS_PER_PAGE_OPTIONS,
} from "../constants";
import ContractInsureePolicyFilter from "./ContractInsureePolicyFilter";

const DEFAULT_ORDER_BY = "insuree";

class ContractInsureePolicySearcher extends Component {
    fetch = params => this.props.fetchInsureePolicies(this.props.modulesManager, params);

    headers = () => ["contract.insuree"];

    itemFormatters = () => [
        insureePolicy => !!insureePolicy.insuree
            ? <PublishedComponent
                pubRef="insuree.InsureePicker"
                value={insureePolicy.insuree}
                withLabel={false}
                readOnly/>
            : ""
    ];

    sorts = () => [["insuree", true]];

    defaultFilters = () => {
        const additionalFilter = JSON.stringify({
            contract: decodeId(this.props.contract.id)
        });
        return {
            additionalFilter: {
                value: additionalFilter,
                filter: `additionalFilter: ${JSON.stringify(additionalFilter)}`
            }
        };
    }

    render() {
        const {
            intl,
            fetchingInsureePolicies,
            fetchedInsureePolicies,
            errorInsureePolicies,
            insureePolicies,
            insureePoliciesPageInfo,
            insureePoliciesTotalCount,
        } = this.props;
        return (
            <Searcher
                module="contract"
                FilterPane={ContractInsureePolicyFilter}
                fetch={this.fetch}
                items={insureePolicies}
                itemsPageInfo={insureePoliciesPageInfo}
                fetchingItems={fetchingInsureePolicies}
                fetchedItems={fetchedInsureePolicies}
                errorItems={errorInsureePolicies}
                tableTitle={formatMessageWithValues(intl, "contract", "insureePolicy.searcher.title", {
                    insureePoliciesTotalCount,
                })}
                headers={this.headers}
                itemFormatters={this.itemFormatters}
                sorts={this.sorts}
                rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                defaultPageSize={DEFAULT_PAGE_SIZE}
                defaultOrderBy={DEFAULT_ORDER_BY}
                defaultFilters={this.defaultFilters()}
            />
        );
    }
}

const mapStateToProps = state => ({
    fetchingInsureePolicies: state.contract.fetchingInsureePolicies,
    errorInsureePolicies: state.contract.errorInsureePolicies,
    fetchedInsureePolicies: state.contract.fetchedInsureePolicies,
    insureePolicies: state.contract.insureePolicies,
    insureePoliciesPageInfo: state.contract.insureePoliciesPageInfo,
    insureePoliciesTotalCount: state.contract.insureePoliciesTotalCount
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchInsureePolicies }, dispatch);
};

export default withModulesManager(injectIntl(connect(mapStateToProps, mapDispatchToProps)(ContractInsureePolicySearcher)));
